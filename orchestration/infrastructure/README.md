# Codeflow Infrastructure

This directory is the canonical home for Codeflow product-specific infrastructure inside the
`codeflow-engine` monorepo.

## Ownership

- Product infrastructure lives here with the application code it deploys.
- Shared org DNS lives in `org-meta/infra/org-dns/phoenixvc-tech`.
- Legacy split repositories such as `codeflow-infrastructure`, `codeflow-website`, and
  `codeflow-plugins` are historical or release-maintenance references, not new live-infra homes.

## Active Stacks

### Website Terraform

Path: `terraform/website`

This stack creates the Azure Static Web App for the temporary launch hostname
`codeflow.phoenixvc.tech`.

Use the sequence documented in [terraform/website/README.md](terraform/website/README.md):

1. Plan/apply the Static Web App with `enable_custom_domain=false`.
2. Pass the Static Web App default hostname to the org-meta DNS stack.
3. Apply the `codeflow.phoenixvc.tech` CNAME in org-meta.
4. Re-plan this stack with `enable_custom_domain=true` for the Azure custom-domain binding.

Do not use `codeflow.io` until domain ownership and brand risk are resolved.

## Legacy Bicep

The `bicep` directory is retained for history and migration reference:

- `bicep/codeflow-engine.bicep` - Container Apps shaped runtime stack.
- `bicep/website.bicep` - legacy Static Web App template.
- `bicep/main.bicep` - older AKS-shaped stack.

Prefer Terraform for new durable live infrastructure unless there is a deliberate Azure-native
exception documented next to the stack.

## Naming

Current Codeflow resource names follow the ADR-0027 style: structured identifiers with no trailing
region suffix. Region remains expressed by the resource group location.

- Resource group: `pvc-prod-codeflow-rg`
- Website Static Web App: `pvc-prod-codeflow-swa`
- Runtime Container App: `pvc-prod-codeflow-api`

Keep future names aligned with `pvc-{env}-codeflow-{type}` unless a provider constraint requires
otherwise. Storage accounts and ACR names omit dashes.
