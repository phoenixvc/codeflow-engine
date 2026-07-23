# Codeflow Runtime Terraform

This stack owns the Azure Container Apps runtime for Codeflow Engine.

Names follow the ADR-0027-style convention used for live Codeflow resources:

- Resource group: `pvc-prod-codeflow-rg`
- Container App: `pvc-prod-codeflow-api`
- Container Apps Environment: `pvc-prod-codeflow-cae`
- Log Analytics Workspace: `pvc-prod-codeflow-law`
- Container Registry: `pvcprodcodeflowacr`

The stack expects the Codeflow image to exist in ACR. For a first-time bootstrap before the image is
available, override `initial_image` with a temporary public image, then switch it back to the ACR
image after the first build.
