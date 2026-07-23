variable "subscription_id" {
  description = "Azure subscription ID for Codeflow website infrastructure."
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID for Codeflow website infrastructure."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group for Codeflow website hosting."
  type        = string
  default     = "prod-rg-san-codeflow"
}

variable "location" {
  description = "Azure region for the Static Web App. Static Web Apps support a limited region set."
  type        = string
  default     = "eastus2"
}

variable "static_web_app_name" {
  description = "Azure Static Web App resource name."
  type        = string
  default     = "prod-stapp-san-codeflow"
}

variable "custom_domain" {
  description = "Temporary Codeflow launch domain. DNS CNAME is owned by org-meta."
  type        = string
  default     = "codeflow.phoenixvc.tech"
}

variable "enable_custom_domain" {
  description = "Enable only after org-meta has created the CNAME to the Static Web App default hostname."
  type        = bool
  default     = false
}

variable "sku_tier" {
  description = "Static Web App SKU tier."
  type        = string
  default     = "Standard"
}

variable "sku_size" {
  description = "Static Web App SKU size."
  type        = string
  default     = "Standard"
}

variable "tags" {
  description = "Tags applied to website resources."
  type        = map(string)
  default = {
    Environment = "Production"
    Product     = "Codeflow"
    Owner       = "phoenixvc"
    ManagedBy   = "Terraform"
  }
}
