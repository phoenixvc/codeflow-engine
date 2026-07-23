# CodeFlow Monorepo

This repository now serves as the consolidated home for the CodeFlow ecosystem. The Python engine and the additional product repositories all live in dedicated subdirectories with preserved history.

## Monorepo Layout

- `engine/` - Core Python engine project
- `desktop/` - Tauri + React desktop application
- `website/` - Next.js marketing and documentation website
- `orchestration/` - Shared infrastructure, bootstrap assets, and release orchestration
- `vscode-extension/` - VS Code extension
- `docs/` - Shared project documentation
- `tools/` - Shared tooling and helper scripts

## Migration Status

The first monorepo migration phase is complete:

1. Imported `codeflow-desktop`
2. Imported `codeflow-website`
3. Imported `codeflow-orchestration`
4. Imported `codeflow-vscode-extension`
5. Added shared migration planning and CI scaffolding

The next phase is standardizing tooling, dependency management, release automation, and archival of the legacy split repositories.

## Working with the Repository

### Engine

The Python engine now builds from [engine](engine):

- [engine/pyproject.toml](engine/pyproject.toml)
- [engine/setup.py](engine/setup.py)
- [engine/codeflow_engine](engine/codeflow_engine)

### Imported Applications

Each imported application can still be developed independently from its subdirectory using its existing package manager and build scripts.

### Infrastructure

Product-specific infrastructure now lives in this monorepo under [orchestration/infrastructure](orchestration/infrastructure).
The first live Terraform stack is [orchestration/infrastructure/terraform/website](orchestration/infrastructure/terraform/website), which
creates the Azure Static Web App for `codeflow.phoenixvc.tech`.

DNS records for `phoenixvc.tech` stay in the org control plane at `org-meta/infra/org-dns/phoenixvc-tech`.
The old `codeflow-infrastructure` split repo is legacy reference material until it is archived.

## Legacy Repository Redirects

Archive and redirect guidance for the old split repositories is in [docs/LEGACY_REPO_REDIRECTS.md](docs/LEGACY_REPO_REDIRECTS.md).

## Migration Documentation

- [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the component-specific guides inside each imported project.

## License

See [LICENSE](LICENSE).

