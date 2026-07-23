# Legacy Repository Redirects

Use this checklist when archiving the split repositories after the monorepo cutover.

Current canonical repository: https://github.com/phoenixvc/codeflow-engine

Do not delete local clones until their local ahead commits, stashes, and useful release artifacts have
either been moved into the monorepo or explicitly discarded.

## Archive Settings Links

- [codeflow-engine settings](https://github.com/phoenixvc/codeflow-engine/settings)
- [codeflow-infrastructure settings](https://github.com/phoenixvc/codeflow-infrastructure/settings) - archived
- [codeflow-website settings](https://github.com/phoenixvc/codeflow-website/settings) - archived
- [codeflow-plugins settings](https://github.com/phoenixvc/codeflow-plugins/settings) - archive target after extension commit reconciliation
- [legacy desktop settings](https://github.com/JustAGhosT/codeflow-desktop/settings) - archived
- [legacy orchestration settings](https://github.com/JustAGhosT/codeflow-orchestration/settings) - archived

GitHub does not expose a separate public archive URL. Use each repository's Settings page and archive it from the Danger Zone.

## Suggested Redirect README

```md
# Repository Archived

This repository has moved into the CodeFlow monorepo.

- Canonical repository: https://github.com/phoenixvc/codeflow-engine
- Component path: https://github.com/phoenixvc/codeflow-engine/tree/master/<component>

This split repository is now read-only and kept only for historical reference.
```

## Component Paths

- Desktop: [monorepo desktop path](https://github.com/phoenixvc/codeflow-engine/tree/master/desktop)
- Website: [monorepo website path](https://github.com/phoenixvc/codeflow-engine/tree/master/website)
- Orchestration: [monorepo orchestration path](https://github.com/phoenixvc/codeflow-engine/tree/master/orchestration)
- Infrastructure: [monorepo infrastructure path](https://github.com/phoenixvc/codeflow-engine/tree/master/orchestration/infrastructure)
- VS Code extension: [monorepo VS Code extension path](https://github.com/phoenixvc/codeflow-engine/tree/master/vscode-extension)
- Engine: [monorepo engine path](https://github.com/phoenixvc/codeflow-engine/tree/master/engine)
