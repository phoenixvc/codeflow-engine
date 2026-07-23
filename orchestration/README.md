# CodeFlow Orchestration

This directory contains orchestration scripts, documentation, prompts, and planning for the CodeFlow
monorepo.

---

## Overview

The CodeFlow orchestration directory serves as the central hub for:

- Migration planning and execution
- Cross-repository coordination
- Shared scripts and utilities
- Comprehensive documentation

---

## Quick Links

### Migration Documentation

- [Migration Overview](./MIGRATION.md) - Complete migration status and progress (72% complete)
- [Next Steps](./NEXT_STEPS.md) - **Immediate action items and priorities** ⭐
- [Migration Analysis](./MIGRATION_ANALYSIS.md) - Comprehensive analysis, mistakes, and improvements
- [Migration Phases](./MIGRATION_PHASES.md) - Detailed phase descriptions and goals
- [Wave 4 Execution Plan](./WAVE4_EXECUTION_PLAN.md) - Optimization & Enhancement (in progress)
- [Documentation Index](./docs/README.md) - Central index for all documentation

### Key Documentation

- [Versioning Policy](./docs/VERSIONING_POLICY.md) - Semantic versioning strategy
- [Release Process](./docs/RELEASE_PROCESS.md) - Release automation and process
- [Dependency Management](./docs/DEPENDENCY_MANAGEMENT.md) - Dependency update process
- [Monitoring & Observability](./docs/MONITORING_OBSERVABILITY.md) - Monitoring strategy
- [Full Stack Deployment](./docs/FULL_STACK_DEPLOYMENT.md) - Complete deployment guide
- [Shared Libraries Plan](./docs/SHARED_LIBRARIES_PLAN.md) - Wave 4: Shared libraries strategy
- [Optimization Plan](./docs/OPTIMIZATION_PLAN.md) - Wave 4: Performance and cost optimization
- [Package Publishing Guide](./docs/PACKAGE_PUBLISHING_GUIDE.md) - Publishing shared utility packages
- [Deployment Automation](./docs/DEPLOYMENT_AUTOMATION.md) - Enhanced deployment with rollback and health checks
- [Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION.md) - Performance analysis and optimization strategies
- [Cost Optimization](./docs/COST_OPTIMIZATION.md) - Azure cost analysis and optimization strategies
- [Cost Optimization Implementation](./docs/COST_OPTIMIZATION_IMPLEMENTATION.md) - Cost optimization opportunities and implementation plan
- [Process Automation](./docs/PROCESS_AUTOMATION.md) - Development and deployment process automation
- [Metrics & Alerting Setup](./docs/METRICS_ALERTING_SETUP.md) - Azure metrics and alerting configuration
- [Azure Dashboard Templates](./docs/AZURE_DASHBOARD_TEMPLATES.md) - Dashboard templates and KQL queries
- [Package Publishing Quick Start](./docs/PACKAGE_PUBLISHING_QUICKSTART.md) - Quick-start guide for publishing packages
- [Package Integration Guide](./docs/PACKAGE_INTEGRATION_GUIDE.md) - Guide for integrating utility packages

### Scripts

- [Version Management](./scripts/) - Version check, bump, and sync scripts
- [Migration Scripts](./scripts/) - AutoPR to CodeFlow migration
- [Development Setup](./scripts/) - Local development setup scripts

---

## Migration Progress

### Overall: 72% Complete

#### ✅ Wave 1: Critical Foundation (95%)

- Security fixes
- Naming migration
- CI/CD workflows

#### ✅ Wave 2: Quality & Documentation (92%)

- Comprehensive documentation
- Testing infrastructure
- Quality gates

#### ✅ Wave 3: Operations & Infrastructure (90%)

- Version management
- Release automation
- Monitoring strategy

#### ⏳ Wave 4: Optimization & Enhancement (65%)

- Shared libraries
- Performance optimization
- Process automation

---

## Repository Structure

```
codeflow-orchestration/
├── docs/                    # Documentation
│   ├── VERSIONING_POLICY.md
│   ├── RELEASE_PROCESS.md
│   ├── DEPENDENCY_MANAGEMENT.md
│   ├── MONITORING_OBSERVABILITY.md
│   └── FULL_STACK_DEPLOYMENT.md
├── scripts/                 # Utility scripts
│   ├── check-versions.ps1
│   ├── bump-version.ps1
│   ├── sync-versions.ps1
│   ├── migrate-autopr-to-codeflow.ps1
│   └── dev-setup.ps1
├── MIGRATION.md              # Complete migration status and progress
├── MIGRATION_PHASES.md       # Detailed phase descriptions
├── WAVE4_EXECUTION_PLAN.md   # Wave 4 planning
└── README.md                 # This file
```

---

## Getting Started

### For New Contributors

1. **Read the Documentation**

   - Start with [Migration Overview](./MIGRATION.md)
   - Review [Migration Phases](./MIGRATION_PHASES.md) for detailed information

2. **Set Up Local Environment**

   ```bash
   pwsh scripts/dev-setup.ps1
   ```

3. **Check Versions**

   ```bash
   pwsh scripts/check-versions.ps1
   ```

### For Release Managers

1. **Review Release Process**

   - [Release Process](./docs/RELEASE_PROCESS.md)
   - [Release Coordination](./docs/RELEASE_COORDINATION.md)

2. **Use Version Scripts**

   ```bash
   # Bump version
   pwsh scripts/bump-version.ps1 -Type minor

   # Sync versions
   pwsh scripts/sync-versions.ps1 -Version "1.2.0"
   ```

### For Developers

1. **Check Documentation**

   - Component-specific docs in respective repos
   - [Full Stack Deployment](./docs/FULL_STACK_DEPLOYMENT.md)

2. **Use Development Scripts**

   ```bash
   # Set up development environment
   pwsh scripts/dev-setup.ps1
   ```

---

## Key Scripts

### Version Management

```bash
# Check versions across all repos
pwsh scripts/check-versions.ps1

# Bump version in a repo
pwsh scripts/bump-version.ps1 -Type minor

# Sync versions across repos
pwsh scripts/sync-versions.ps1 -Version "1.2.0"
```

### Migration

```bash
# Migrate AutoPR to CodeFlow (dry run)
pwsh scripts/migrate-autopr-to-codeflow.ps1 -DryRun

# Migrate AutoPR to CodeFlow (execute)
pwsh scripts/migrate-autopr-to-codeflow.ps1
```

### Development

```bash
# Set up local development environment
pwsh scripts/dev-setup.ps1
```

---

## Canonical Locations

- [codeflow-engine](https://github.com/phoenixvc/codeflow-engine) - canonical Codeflow monorepo
- [engine](../engine) - core engine
- [desktop](../desktop) - desktop application
- [vscode-extension](../vscode-extension) - VS Code extension
- [website](../website) - website
- [infrastructure](./infrastructure) - product infrastructure

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

## Support

For questions or issues:

- GitHub Issues: [codeflow-engine/issues](https://github.com/phoenixvc/codeflow-engine/issues)
- Documentation: See [docs/](./docs/) directory

---

## License

MIT License - See [LICENSE](./LICENSE) file for details.

---

**Last Updated:** 2025-01-XX
