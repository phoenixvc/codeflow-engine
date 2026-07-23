import * as vscode from 'vscode';
import { CommandService } from './services/commandService';
import { UIService } from './services/uiService';
import { DataService } from './services/dataService';
import { 
    CodeFlowIssuesProvider, 
    CodeFlowMetricsProvider, 
    CodeFlowHistoryProvider 
} from './providers/treeProviders';

export function activate(context: vscode.ExtensionContext) {
    const packageJson = require('../package.json');
    
    // Initialize logging
    const logChannel = vscode.window.createOutputChannel('CodeFlow Logs');
    logChannel.appendLine(`[${new Date().toISOString()}] CodeFlow extension v${packageJson.version} is now active!`);
    
    console.log(`CodeFlow extension v${packageJson.version} is now active!`);
    
    // Set global extension context for data service
    (global as any).extensionContext = context;

    // Initialize services first
    const commandService = new CommandService();
    const uiService = new UIService();
    const dataService = DataService.getInstance();
    
    // Check if CodeFlow has been initialized for this workspace
    const config = vscode.workspace.getConfiguration('codeflow');
    const isInitialized = config.get('initialized', false);
    
    if (!isInitialized) {
        // First time setup - show initialization options
        const initializeAction = 'Initialize CodeFlow';
        const analyzeAction = 'Analyze Now (Skip Setup)';
        const dismissAction = 'Dismiss';
        
        vscode.window.showInformationMessage(
            `CodeFlow v${packageJson.version} - First time setup for this workspace:`,
            initializeAction,
            analyzeAction,
            dismissAction
        ).then(selection => {
            if (selection === initializeAction) {
                // Initialize CodeFlow with workspace setup
                logChannel.appendLine(`[${new Date().toISOString()}] User selected: Initialize CodeFlow`);
                initializeCodeFlow(context, commandService, uiService, dataService);
            } else if (selection === analyzeAction) {
                // Run immediate analysis without full setup
                logChannel.appendLine(`[${new Date().toISOString()}] User selected: Analyze Now (Skip Setup)`);
                runInitialAnalysis(commandService, issuesProvider, metricsProvider, historyProvider);
            } else {
                logChannel.appendLine(`[${new Date().toISOString()}] User dismissed initialization`);
            }
        });
    } else {
        // Already initialized - show quick actions
        const analyzeAction = 'Analyze Now';
        const settingsAction = 'Settings';
        const dismissAction = 'Dismiss';
        
        vscode.window.showInformationMessage(
            `CodeFlow v${packageJson.version} is ready!`,
            analyzeAction,
            settingsAction,
            dismissAction
        ).then(selection => {
            if (selection === analyzeAction) {
                logChannel.appendLine(`[${new Date().toISOString()}] User selected: Analyze Now`);
                runInitialAnalysis(commandService, issuesProvider, metricsProvider, historyProvider);
            } else if (selection === settingsAction) {
                logChannel.appendLine(`[${new Date().toISOString()}] User selected: Settings`);
                vscode.commands.executeCommand('codeflow.showSettings');
            } else {
                logChannel.appendLine(`[${new Date().toISOString()}] User dismissed notification`);
            }
        });
    }
    
    // Try to show the CodeFlow views automatically with editor-specific timing
    const appName = vscode.env.appName || '';
    const delay = appName.toLowerCase().includes('cursor') ? 1500 : 1000; // Cursor might need more time
    
    setTimeout(() => {
        vscode.commands.executeCommand('workbench.view.extension.codeflow').then(() => {
            console.log('CodeFlow: Views shown successfully');
        }, (error: any) => {
            console.log('CodeFlow: Could not show views automatically:', error.message);
        });
    }, delay);

    // Register diagnostic collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('codeflow');
    context.subscriptions.push(diagnosticCollection);

    // Register tree data providers and create tree views
    const issuesProvider = new CodeFlowIssuesProvider();
    const metricsProvider = new CodeFlowMetricsProvider();
    const historyProvider = new CodeFlowHistoryProvider();

    // Register tree data providers first
    vscode.window.registerTreeDataProvider('codeflowIssues', issuesProvider);
    vscode.window.registerTreeDataProvider('codeflowMetrics', metricsProvider);
    vscode.window.registerTreeDataProvider('codeflowHistory', historyProvider);

    // Create tree views
    const issuesView = vscode.window.createTreeView('codeflowIssues', { treeDataProvider: issuesProvider });
    const metricsView = vscode.window.createTreeView('codeflowMetrics', { treeDataProvider: metricsProvider });
    const historyView = vscode.window.createTreeView('codeflowHistory', { treeDataProvider: historyProvider });

    context.subscriptions.push(issuesView, metricsView, historyView);

    // Debug logging
    console.log('Tree views created:', {
        issues: issuesView.visible,
        metrics: metricsView.visible,
        history: historyView.visible
    });

    // Register commands
    const commands = [
        // Quality Check Commands
        vscode.commands.registerCommand('codeflow.qualityCheck', () => {
            commandService.runQualityCheck().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.qualityCheckFile', () => {
            commandService.runQualityCheckFile().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.qualityCheckWorkspace', () => {
            commandService.runQualityCheckWorkspace().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        // File Splitter Commands
        vscode.commands.registerCommand('codeflow.fileSplit', () => {
            commandService.runFileSplit().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        // Auto-Fix Commands
        vscode.commands.registerCommand('codeflow.autoFix', () => {
            commandService.runAutoFix().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        // Specialized Analysis Commands
        vscode.commands.registerCommand('codeflow.performanceCheck', () => {
            commandService.runPerformanceCheck().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.dependencyScan', () => {
            commandService.runDependencyScan().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.securityScan', () => {
            commandService.runSecurityScan().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.complexityAnalysis', () => {
            commandService.runComplexityAnalysis().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('codeflow.documentationCheck', () => {
            commandService.runDocumentationCheck().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
            });
        }),

        // Configuration Commands
        vscode.commands.registerCommand('codeflow.setVolume', () => {
            uiService.showVolumeSettings();
        }),

        vscode.commands.registerCommand('codeflow.toggleTool', () => {
            uiService.showToolToggle();
        }),

        vscode.commands.registerCommand('codeflow.configure', () => {
            uiService.showConfiguration();
        }),

        // Utility Commands
        vscode.commands.registerCommand('codeflow.clearCache', () => {
            commandService.clearCache();
        }),

        vscode.commands.registerCommand('codeflow.exportResults', () => {
            uiService.exportResults();
        }),

        vscode.commands.registerCommand('codeflow.importConfig', () => {
            uiService.importConfiguration();
        }),

        // UI Commands
        vscode.commands.registerCommand('codeflow.showDashboard', () => {
            uiService.showDashboard();
        }),

        vscode.commands.registerCommand('codeflow.learningMemory', () => {
            uiService.showLearningMemory();
        }),

        // Refresh commands for tree views
        vscode.commands.registerCommand('codeflow.refreshIssues', () => {
            issuesProvider.refresh();
        }),

        vscode.commands.registerCommand('codeflow.refreshMetrics', () => {
            metricsProvider.refresh();
        }),

        vscode.commands.registerCommand('codeflow.refreshHistory', () => {
            historyProvider.refresh();
        }),

        vscode.commands.registerCommand('codeflow.showVersion', () => {
            const packageJson = require('../package.json');
            vscode.window.showInformationMessage(`CodeFlow Extension Version: ${packageJson.version}`);
        }),

        vscode.commands.registerCommand('codeflow.refreshAll', () => {
            issuesProvider.refresh();
            metricsProvider.refresh();
            historyProvider.refresh();
            vscode.window.showInformationMessage('All CodeFlow views refreshed!');
        }),

        vscode.commands.registerCommand('codeflow.showViews', () => {
            // Force show the CodeFlow view container
            vscode.commands.executeCommand('workbench.view.extension.codeflow');
            vscode.window.showInformationMessage('CodeFlow views should now be visible!');
        }),

        vscode.commands.registerCommand('codeflow.quickFix', () => {
            commandService.runQuickFix().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
                vscode.window.showInformationMessage('CodeFlow: Quick fixes applied!');
            });
        }),

        vscode.commands.registerCommand('codeflow.analyzeWorkspace', () => {
            commandService.runWorkspaceAnalysis().then(() => {
                issuesProvider.refresh();
                metricsProvider.refresh();
                historyProvider.refresh();
                vscode.window.showInformationMessage('CodeFlow: Workspace analysis complete!');
            });
        }),

        vscode.commands.registerCommand('codeflow.generateReport', () => {
            uiService.generateReport().then(() => {
                vscode.window.showInformationMessage('CodeFlow: Report generated successfully!');
            });
        }),

        vscode.commands.registerCommand('codeflow.toggleAutoMode', () => {
            const config = vscode.workspace.getConfiguration('codeflow');
            const currentMode = config.get('autoMode', false);
            config.update('autoMode', !currentMode, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`CodeFlow: Auto mode ${!currentMode ? 'enabled' : 'disabled'}!`);
        }),

        vscode.commands.registerCommand('codeflow.showSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'codeflow');
        }),

        vscode.commands.registerCommand('codeflow.showHelp', () => {
            vscode.window.showInformationMessage('CodeFlow Help: Visit https://github.com/phoenixvc/codeflow-engine for documentation');
        }),

        vscode.commands.registerCommand('codeflow.checkCompatibility', () => {
            checkEditorCompatibility();
        }),

        vscode.commands.registerCommand('codeflow.showLogs', () => {
            vscode.window.createOutputChannel('CodeFlow Logs').show();
        })
    ];

    // Add all commands to subscriptions
    context.subscriptions.push(...commands);

    // Initialize with sample data for demonstration
    initializeSampleData(dataService);

    console.log('CodeFlow extension activated with modular architecture');
    logChannel.appendLine(`[${new Date().toISOString()}] CodeFlow extension activated with modular architecture`);
    
    // Log editor compatibility
    logEditorCompatibility(logChannel);
}

async function initializeCodeFlow(
    context: vscode.ExtensionContext,
    commandService: CommandService,
    uiService: UIService,
    dataService: DataService
): Promise<void> {
    const outputChannel = vscode.window.createOutputChannel('CodeFlow Initialization');
    outputChannel.show();
    
    outputChannel.appendLine('CodeFlow Initialization');
    outputChannel.appendLine('='.repeat(50));
    outputChannel.appendLine('Setting up CodeFlow for your workspace...');
    
    try {
        // Check workspace structure
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }
        
        outputChannel.appendLine(`Workspace: ${workspaceFolders[0].name}`);
        
        // Detect project type and set up configuration
        const projectType = await detectProjectType(workspaceFolders[0].uri.fsPath);
        outputChannel.appendLine(`Project type detected: ${projectType}`);
        
        // Set up initial configuration
        await setupInitialConfiguration(projectType);
        outputChannel.appendLine('Configuration initialized');
        
        // Initialize data service with workspace context
        dataService.initializeWorkspace(workspaceFolders[0].uri.fsPath);
        outputChannel.appendLine('Data service initialized');
        
        // Show success notification with next steps
        const analyzeAction = 'Run First Analysis';
        const configureAction = 'Configure Settings';
        
        vscode.window.showInformationMessage(
            'CodeFlow initialized successfully! Your workspace is ready for analysis.',
            analyzeAction,
            configureAction
        ).then(selection => {
            if (selection === analyzeAction) {
                vscode.commands.executeCommand('codeflow.analyzeWorkspace');
            } else if (selection === configureAction) {
                vscode.commands.executeCommand('codeflow.showSettings');
            }
        });
        
        outputChannel.appendLine('Initialization completed successfully!');
        
    } catch (error) {
        outputChannel.appendLine(`Error during initialization: ${error}`);
        vscode.window.showErrorMessage(`CodeFlow initialization failed: ${error}`);
    }
}

async function runInitialAnalysis(
    commandService: CommandService,
    issuesProvider: CodeFlowIssuesProvider,
    metricsProvider: CodeFlowMetricsProvider,
    historyProvider: CodeFlowHistoryProvider
): Promise<void> {
    const outputChannel = vscode.window.createOutputChannel('CodeFlow Analysis');
    outputChannel.show();
    
    outputChannel.appendLine('CodeFlow Initial Analysis');
    outputChannel.appendLine('='.repeat(50));
    outputChannel.appendLine('Starting workspace analysis...');
    
    try {
        // Run workspace analysis
        await commandService.runWorkspaceAnalysis();
        
        // Refresh all providers
        issuesProvider.refresh();
        metricsProvider.refresh();
        historyProvider.refresh();
        
        outputChannel.appendLine('Analysis completed successfully!');
        
        // Show results notification
        const viewResultsAction = 'View Results';
        const configureAction = 'Configure Analysis';
        
        vscode.window.showInformationMessage(
            'Initial analysis completed! Issues and metrics are now available.',
            viewResultsAction,
            configureAction
        ).then(selection => {
            if (selection === viewResultsAction) {
                vscode.commands.executeCommand('workbench.view.extension.codeflow');
            } else if (selection === configureAction) {
                vscode.commands.executeCommand('codeflow.showSettings');
            }
        });
        
    } catch (error) {
        outputChannel.appendLine(`Error during analysis: ${error}`);
        vscode.window.showErrorMessage(`Analysis failed: ${error}`);
    }
}

async function detectProjectType(workspacePath: string): Promise<string> {
    // Simple project type detection
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync(path.join(workspacePath, 'pyproject.toml'))) {
        return 'Python (Poetry)';
    } else if (fs.existsSync(path.join(workspacePath, 'requirements.txt'))) {
        return 'Python (pip)';
    } else if (fs.existsSync(path.join(workspacePath, 'package.json'))) {
        return 'Node.js';
    } else if (fs.existsSync(path.join(workspacePath, 'Cargo.toml'))) {
        return 'Rust';
    } else if (fs.existsSync(path.join(workspacePath, 'go.mod'))) {
        return 'Go';
    } else {
        return 'Mixed/Unknown';
    }
}

async function setupInitialConfiguration(projectType: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('codeflow');
    
    // Set project-specific defaults
    if (projectType.includes('Python')) {
        await config.update('qualityMode', 'smart', vscode.ConfigurationTarget.Workspace);
        // Note: tools configuration is handled by the tools object, not individual settings
    } else if (projectType.includes('Node.js')) {
        await config.update('qualityMode', 'fast', vscode.ConfigurationTarget.Workspace);
        // Note: tools configuration is handled by the tools object, not individual settings
    } else {
        await config.update('qualityMode', 'comprehensive', vscode.ConfigurationTarget.Workspace);
    }
    
            // Set general defaults
        await config.update('autoMode', false, vscode.ConfigurationTarget.Workspace);
        await config.update('showNotifications', true, vscode.ConfigurationTarget.Workspace);
        await config.update('notificationLevel', 'warnings', vscode.ConfigurationTarget.Workspace);
        
        // Mark workspace as initialized
        await config.update('initialized', true, vscode.ConfigurationTarget.Workspace);
}

function logEditorCompatibility(logChannel?: vscode.OutputChannel): void {
    const appName = vscode.env.appName || 'Unknown';
    const appVersion = vscode.version || 'Unknown';
    
    const logMessage = `CodeFlow running on: ${appName} v${appVersion}`;
    console.log(logMessage);
    logChannel?.appendLine(`[${new Date().toISOString()}] ${logMessage}`);
    
    // Check for specific editors and log compatibility
    let editorInfo = '';
    if (appName.toLowerCase().includes('cursor')) {
        editorInfo = 'CodeFlow: Cursor editor detected - full compatibility';
    } else if (appName.toLowerCase().includes('windsurf')) {
        editorInfo = 'CodeFlow: Windsurf editor detected - full compatibility';
    } else if (appName.toLowerCase().includes('vscode')) {
        editorInfo = 'CodeFlow: VS Code editor detected - full compatibility';
    } else {
        editorInfo = 'CodeFlow: Unknown editor - testing compatibility';
    }
    
    console.log(editorInfo);
    logChannel?.appendLine(`[${new Date().toISOString()}] ${editorInfo}`);
    
    // Log available features
    console.log('CodeFlow: Available features:');
    logChannel?.appendLine(`[${new Date().toISOString()}] CodeFlow: Available features:`);
    
    const features = [
        { name: 'Tree views', test: () => !!vscode.window.createTreeView },
        { name: 'Status bar', test: () => !!vscode.window.createStatusBarItem },
        { name: 'Output channels', test: () => !!vscode.window.createOutputChannel },
        { name: 'Commands', test: () => !!vscode.commands.registerCommand },
        { name: 'Configuration', test: () => !!vscode.workspace.getConfiguration }
    ];
    
    features.forEach(feature => {
        const available = feature.test();
        const message = `- ${feature.name}: ${available}`;
        console.log(message);
        logChannel?.appendLine(`[${new Date().toISOString()}] ${message}`);
    });
}

function checkEditorCompatibility(): void {
    const appName = vscode.env.appName || 'Unknown';
    const appVersion = vscode.version || 'Unknown';
    
    const outputChannel = vscode.window.createOutputChannel('CodeFlow Compatibility');
    outputChannel.show();
    
    outputChannel.appendLine('CodeFlow Editor Compatibility Check');
    outputChannel.appendLine('='.repeat(50));
    outputChannel.appendLine(`Editor: ${appName}`);
    outputChannel.appendLine(`Version: ${appVersion}`);
    outputChannel.appendLine('');
    
    // Test various features
    const features = [
        { name: 'Tree Views', test: () => !!vscode.window.createTreeView },
        { name: 'Status Bar', test: () => !!vscode.window.createStatusBarItem },
        { name: 'Output Channels', test: () => !!vscode.window.createOutputChannel },
        { name: 'Commands', test: () => !!vscode.commands.registerCommand },
        { name: 'Configuration', test: () => !!vscode.workspace.getConfiguration },
        { name: 'File System', test: () => !!vscode.workspace.fs },
        { name: 'Language Features', test: () => !!vscode.languages.createDiagnosticCollection }
    ];
    
    outputChannel.appendLine('Feature Compatibility:');
    features.forEach(feature => {
        const available = feature.test();
        const status = available ? 'âœ“ Available' : 'âœ— Not Available';
        outputChannel.appendLine(`- ${feature.name}: ${status}`);
    });
    
    outputChannel.appendLine('');
    
    // Editor-specific information
    if (appName.toLowerCase().includes('cursor')) {
        outputChannel.appendLine('Cursor Editor Detected:');
        outputChannel.appendLine('- Full compatibility with CodeFlow features');
        outputChannel.appendLine('- AI-enhanced code analysis supported');
        outputChannel.appendLine('- All tree views and commands available');
    } else if (appName.toLowerCase().includes('windsurf')) {
        outputChannel.appendLine('Windsurf Editor Detected:');
        outputChannel.appendLine('- Full compatibility with CodeFlow features');
        outputChannel.appendLine('- All tree views and commands available');
    } else if (appName.toLowerCase().includes('vscode')) {
        outputChannel.appendLine('VS Code Editor Detected:');
        outputChannel.appendLine('- Full compatibility with CodeFlow features');
        outputChannel.appendLine('- All features supported');
    } else {
        outputChannel.appendLine('Unknown Editor:');
        outputChannel.appendLine('- Testing compatibility with available features');
        outputChannel.appendLine('- Some features may not work as expected');
    }
    
    outputChannel.appendLine('');
    outputChannel.appendLine('CodeFlow is ready to use!');
    
    vscode.window.showInformationMessage(`CodeFlow compatibility check completed. Check the output channel for details.`);
}

function initializeSampleData(dataService: DataService): void {
    // Add some sample issues for demonstration
    const sampleIssues = [
        {
            file: 'src/example.py',
            line: 15,
            column: 5,
            message: 'Unused import "os"',
            severity: 'warning' as const,
            tool: 'ruff',
            code: 'F401',
            fixable: true,
            confidence: 0.95
        },
        {
            file: 'src/example.py',
            line: 25,
            column: 10,
            message: 'Variable "x" is assigned but never used',
            severity: 'warning' as const,
            tool: 'ruff',
            code: 'F841',
            fixable: true,
            confidence: 0.98
        },
        {
            file: 'src/security.py',
            line: 42,
            column: 8,
            message: 'Possible SQL injection vulnerability',
            severity: 'error' as const,
            tool: 'bandit',
            code: 'B608',
            fixable: false,
            confidence: 0.85
        },
        {
            file: 'src/complexity.py',
            line: 78,
            column: 12,
            message: 'Function has high cyclomatic complexity (15)',
            severity: 'info' as const,
            tool: 'radon',
            code: 'C901',
            fixable: false,
            confidence: 0.75
        }
    ];

    dataService.setIssues(sampleIssues);

    // Add sample metrics
    const sampleMetrics = {
        code_quality_score: 85,
        issues_fixed: 12,
        files_analyzed: 45,
        performance_avg: 2300,
        complexity_score: 7.2,
        documentation_coverage: 78,
        security_score: 92
    };

    dataService.setMetrics(sampleMetrics);

    // Add sample performance history
    const sampleHistory = [
        {
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            operation: 'quality_check',
            duration: 2500,
            success: true,
            issues_found: 8,
            issues_fixed: 3
        },
        {
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            operation: 'auto_fix',
            duration: 1800,
            success: true,
            issues_found: 5,
            issues_fixed: 5
        },
        {
            timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
            operation: 'file_split_analysis',
            duration: 3200,
            success: true,
            issues_found: 0,
            issues_fixed: 0
        }
    ];

    sampleHistory.forEach(record => {
        dataService.addPerformanceRecord(record);
    });
}

export function deactivate() {
    console.log('CodeFlow extension is now deactivated!');
}
