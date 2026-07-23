output "container_app_name" {
  description = "Codeflow runtime Container App name."
  value       = azurerm_container_app.api.name
}

output "container_app_fqdn" {
  description = "Codeflow runtime public FQDN."
  value       = azurerm_container_app.api.ingress[0].fqdn
}

output "container_registry_name" {
  description = "Codeflow runtime Azure Container Registry name."
  value       = azurerm_container_registry.runtime.name
}

output "container_registry_login_server" {
  description = "Codeflow runtime Azure Container Registry login server."
  value       = azurerm_container_registry.runtime.login_server
}

output "resource_group_name" {
  description = "Codeflow runtime resource group."
  value       = data.azurerm_resource_group.codeflow.name
}
