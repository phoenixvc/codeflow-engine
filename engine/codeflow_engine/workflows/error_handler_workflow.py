"""
Error Handler Workflow

A specialized workflow for handling errors in AI linting fixer and other CodeFlow components.
This workflow integrates with the existing workflow system and provides comprehensive
error tracking, categorization, and recovery capabilities.
"""

from dataclasses import asdict
from datetime import datetime
import json
import logging
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from codeflow_engine.actions.ai_linting_fixer.display import DisplayConfig, OutputMode
from codeflow_engine.actions.ai_linting_fixer.error_handler import (
    ErrorHandler,
    ErrorInfo,
    ErrorRecoveryStrategy,
    create_error_context,
)
from codeflow_engine.workflows.base import Workflow


logger = logging.getLogger(__name__)


class ErrorHandlerWorkflowInputs(BaseModel):
    """Inputs for the error handler workflow."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Error information
    exception: Exception | None = None
    error_message: str | None = None
    error_type: str | None = None

    # Context information
    file_path: str | None = None
    line_number: int | None = None
    function_name: str | None = None
    workflow_step: str | None = None
    session_id: str | None = None

    # Additional context
    additional_info: dict[str, Any] = Field(default_factory=dict)

    # Workflow configuration
    enable_recovery: bool = True
    enable_display: bool = True
    enable_export: bool = False
    export_path: str | None = None

    # Recovery settings
    max_retries: int = 3
    retry_delay: float = 1.0


class ErrorHandlerWorkflowOutputs(BaseModel):
    """Outputs from the error handler workflow."""

    # Error processing results
    error_handled: bool
    error_info: ErrorInfo | None = None
    recovery_attempted: bool = False
    recovery_successful: bool = False

    # Error summary
    total_errors_processed: int = 0
    errors_by_category: dict[str, int] = Field(default_factory=dict)
    errors_by_severity: dict[str, int] = Field(default_factory=dict)

    # Export information
    error_report_exported: bool = False
    export_path: str | None = None

    # Workflow status
    success: bool
    summary: str
    error_message: str | None = None


class ErrorHandlerWorkflow(Workflow):
    """
    Specialized workflow for handling errors in CodeFlow components.

    This workflow provides:
    - Error categorization and severity assessment
    - Intelligent recovery strategies
    - Error history tracking and export
    - Integration with existing workflow system
    - Callback support for external notifications
    """

    def __init__(self, config: dict[str, Any] | None = None):
        """Initialize the error handler workflow."""
        super().__init__(
            name="error_handler",
            description="Comprehensive error handling workflow for CodeFlow components",
            version="1.0.0",
        )

        self.config = config or {}
        self.error_handler: ErrorHandler | None = None
        self.display_config: DisplayConfig | None = None
        self.processed_errors: list[ErrorInfo] = []

        # Supported events
        self.supported_events = [
            "error_occurred",
            "recovery_needed",
            "error_summary_requested",
            "error_export_requested",
        ]

    async def initialize(self) -> None:
        """Initialize the error handler workflow."""
        try:
            # Create display configuration
            self.display_config = DisplayConfig(
                mode=(
                    OutputMode.VERBOSE
                    if self.config.get("verbose", False)
                    else OutputMode.NORMAL
                ),
                use_colors=self.config.get("use_colors", True),
                use_emojis=self.config.get("use_emojis", True),
            )

            # Initialize error handler
            self.error_handler = ErrorHandler()

            # Register callbacks if enabled
            if self.config.get("enable_callbacks", True):
                self._register_callbacks()

            logger.info("Error handler workflow initialized successfully")

        except Exception as e:
            logger.exception(f"Failed to initialize error handler workflow: {e}")
            raise

    def _register_callbacks(self) -> None:
        """Register error and recovery callbacks."""
        if not self.error_handler:
            return

        def on_recovery_callback(
            error_info: ErrorInfo, strategy: ErrorRecoveryStrategy
        ) -> None:
            """Callback for recovery attempts."""
            logger.info(
                f"Recovery callback: {strategy.value} for {error_info.error_type}"
            )
            retry_count = self.error_handler.recovery_count if self.error_handler else 0

            # Emit workflow event
            self.emit_event(
                "recovery_attempted",
                {
                    "error_id": self._get_error_identifier(error_info),
                    "strategy": strategy.value,
                    "retry_count": retry_count,
                },
            )

        self.error_handler.add_recovery_callback(on_recovery_callback)

    async def execute(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute the error handler workflow.

        Args:
            context: Execution context containing error information

        Returns:
            Workflow execution result
        """
        try:
            # Parse inputs
            inputs = ErrorHandlerWorkflowInputs(**context.get("inputs", {}))

            # Initialize if not already done
            if not self.error_handler:
                await self.initialize()

            # Process the error
            result = await self._process_error(inputs)

            # Export error report if requested
            if inputs.enable_export:
                result = await self._export_error_report(inputs, result)

            return result.dict()

        except Exception as e:
            logger.exception(f"Error handler workflow execution failed: {e}")
            return {"success": False, "error_message": str(e), "error_handled": False}

    async def _process_error(
        self, inputs: ErrorHandlerWorkflowInputs
    ) -> ErrorHandlerWorkflowOutputs:
        """Process an error with the error handler."""
        if not self.error_handler:
            msg = "Error handler not initialized"
            raise RuntimeError(msg)

        # Create error context
        context = create_error_context(
            file_path=inputs.file_path,
            line_number=inputs.line_number,
            function_name=inputs.function_name,
            workflow_step=inputs.workflow_step,
            session_id=inputs.session_id,
            **inputs.additional_info,
        )

        # Handle different input types
        if inputs.exception:
            error_info = self._build_error_info(inputs.exception, context)
        elif inputs.error_message:
            # Create synthetic exception for error message
            class SyntheticError(Exception):
                pass

            synthetic_exception = SyntheticError(inputs.error_message)
            error_info = self._build_error_info(synthetic_exception, context)
        else:
            # No error to process
            return ErrorHandlerWorkflowOutputs(
                error_handled=False, success=True, summary="No error to process"
            )

        self.processed_errors.append(error_info)
        self.emit_event(
            "error_occurred",
            {
                "error_id": self._get_error_identifier(error_info),
                "error_type": error_info.error_type,
                "category": error_info.category.value,
                "severity": error_info.severity.value,
            },
        )

        # Attempt recovery if enabled
        recovery_attempted = False
        recovery_successful = False

        if inputs.enable_recovery:
            recovery_attempted = True
            strategy = self.error_handler.handle_error(error_info)
            recovery_successful = strategy != ErrorRecoveryStrategy.ABORT

        # Get error summary
        summary = self._get_error_summary_data()

        return ErrorHandlerWorkflowOutputs(
            error_handled=True,
            error_info=error_info,
            recovery_attempted=recovery_attempted,
            recovery_successful=recovery_successful,
            total_errors_processed=summary["total_errors"],
            errors_by_category=summary["error_counts_by_category"],
            errors_by_severity=summary["error_counts_by_severity"],
            success=True,
            summary=f"Processed {summary['total_errors']} errors",
        )

    async def _export_error_report(
        self, inputs: ErrorHandlerWorkflowInputs, result: ErrorHandlerWorkflowOutputs
    ) -> ErrorHandlerWorkflowOutputs:
        """Export error report if requested."""
        if not self.error_handler:
            return result

        try:
            # Determine export path
            if inputs.export_path:
                export_path = inputs.export_path
            else:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                export_path = f"./logs/error_report_{timestamp}.json"

            # Ensure directory exists
            Path(export_path).parent.mkdir(parents=True, exist_ok=True)

            # Export errors
            self._export_errors_to_path(export_path)

            result.error_report_exported = True
            result.export_path = export_path

            logger.info(f"Error report exported to: {export_path}")

        except Exception as e:
            logger.exception(f"Failed to export error report: {e}")
            result.error_message = f"Export failed: {e}"

        return result

    async def get_error_summary(self) -> dict[str, Any]:
        """Get a summary of all processed errors."""
        if not self.error_handler:
            return {"total_errors": 0, "error_counts_by_category": {}}

        return self._get_error_summary_data()

    async def clear_errors(self) -> None:
        """Clear all logged errors."""
        if self.error_handler:
            self.processed_errors.clear()
            self.error_handler = ErrorHandler()
            if self.config.get("enable_callbacks", True):
                self._register_callbacks()

    async def export_errors(self, file_path: str) -> None:
        """Export errors to a file."""
        if self.error_handler:
            self._export_errors_to_path(file_path)

    def emit_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Emit a workflow event."""
        # This would integrate with the existing workflow event system
        logger.debug(f"Error handler workflow event: {event_type} - {data}")

    def _build_error_info(self, exception: Exception, context: Any) -> ErrorInfo:
        """Create an `ErrorInfo` instance from an exception and context."""
        return ErrorInfo(
            error_type=exception.__class__.__name__,
            message=str(exception),
            severity=self._infer_severity(exception),
            category=self._infer_category(exception),
            context=context,
            file_path=context.file_path,
            line_number=context.line_number,
        )

    def _infer_severity(self, exception: Exception) -> Any:
        """Infer severity from exception type."""
        from codeflow_engine.actions.ai_linting_fixer.error_handler import ErrorSeverity

        if isinstance(exception, (SyntaxError, IndentationError)):
            return ErrorSeverity.HIGH
        if isinstance(exception, (PermissionError, MemoryError, RuntimeError)):
            return ErrorSeverity.CRITICAL
        if isinstance(exception, (ValueError, TypeError, KeyError)):
            return ErrorSeverity.MEDIUM
        return ErrorSeverity.LOW

    def _infer_category(self, exception: Exception) -> Any:
        """Infer category from exception type."""
        from codeflow_engine.actions.ai_linting_fixer.error_handler import ErrorCategory

        if isinstance(exception, (SyntaxError, IndentationError)):
            return ErrorCategory.SYNTAX
        if isinstance(exception, (PermissionError, FileNotFoundError)):
            return ErrorCategory.PERMISSION
        if isinstance(exception, (ConnectionError, TimeoutError)):
            return ErrorCategory.NETWORK
        if isinstance(exception, (ValueError, TypeError, KeyError)):
            return ErrorCategory.CONFIGURATION
        if isinstance(exception, RuntimeError):
            return ErrorCategory.RUNTIME
        return ErrorCategory.UNKNOWN

    def _get_error_identifier(self, error_info: ErrorInfo) -> str:
        """Create a stable identifier for an error."""
        index = (
            self.processed_errors.index(error_info) + 1
            if error_info in self.processed_errors
            else len(self.processed_errors) + 1
        )
        return f"{error_info.error_type.lower()}-{index}"

    def _get_error_summary_data(self) -> dict[str, Any]:
        """Summarize processed errors."""
        errors_by_category: dict[str, int] = {}
        errors_by_severity: dict[str, int] = {}

        for error in self.processed_errors:
            category = error.category.value
            severity = error.severity.value
            errors_by_category[category] = errors_by_category.get(category, 0) + 1
            errors_by_severity[severity] = errors_by_severity.get(severity, 0) + 1

        return {
            "total_errors": len(self.processed_errors),
            "error_counts_by_category": errors_by_category,
            "error_counts_by_severity": errors_by_severity,
            "handler_stats": (
                self.error_handler.get_error_stats() if self.error_handler else {}
            ),
        }

    def _export_errors_to_path(self, file_path: str) -> None:
        """Export tracked errors to JSON."""
        export_payload = [asdict(error) for error in self.processed_errors]
        with open(file_path, "w", encoding="utf-8") as export_file:
            json.dump(export_payload, export_file, indent=2, default=str)


# Convenience functions for easy integration
async def create_error_handler_workflow(
    config: dict[str, Any] | None = None,
) -> ErrorHandlerWorkflow:
    """Create and initialize an error handler workflow."""
    workflow = ErrorHandlerWorkflow(config)
    await workflow.initialize()
    return workflow


async def handle_error_with_workflow(
    exception: Exception,
    context: dict[str, Any] | None = None,
    config: dict[str, Any] | None = None,
) -> ErrorHandlerWorkflowOutputs:
    """Convenience function to handle an error using the workflow."""
    workflow = await create_error_handler_workflow(config)

    inputs = ErrorHandlerWorkflowInputs(exception=exception, **(context or {}))

    result = await workflow.execute({"inputs": inputs.dict()})
    return ErrorHandlerWorkflowOutputs(**result)
