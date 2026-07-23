# Codeflow Website Terraform

This stack owns the Azure resource side of the temporary Codeflow website launch at
`codeflow.phoenixvc.tech`.

Boundary:

- This stack creates the Azure Static Web App and, after DNS exists, the Static Web App custom-domain binding.
- `org-meta/infra/org-dns/phoenixvc-tech` owns the `codeflow.phoenixvc.tech` DNS CNAME.
- `codeflow-engine/website` owns the website source and deploy artifact.

Apply sequence:

0. Configure remote state by copying `backend.tf.example` to `backend.tf` and filling in the approved
   Codeflow state backend.
1. Run `terraform init`, `terraform validate`, and `terraform plan` with `enable_custom_domain=false`.
2. Apply the Static Web App only after reviewing the plan.
3. Copy `static_web_app_default_hostname` into the org-meta DNS stack as `codeflow_static_web_app_hostname`.
4. Plan/apply org-meta DNS so `codeflow.phoenixvc.tech` points to the SWA default hostname.
5. Re-run this stack with `enable_custom_domain=true` to bind the custom domain.
6. Store `static_web_app_api_key` as the website deployment secret used by `codeflow-engine`.

Do not use `codeflow.io` in this stack until domain ownership and brand-collision risk are confirmed.
