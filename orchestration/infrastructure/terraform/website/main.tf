resource "azurerm_resource_group" "website" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

resource "azurerm_static_web_app" "website" {
  name                = var.static_web_app_name
  resource_group_name = azurerm_resource_group.website.name
  location            = azurerm_resource_group.website.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_size

  preview_environments_enabled  = true
  public_network_access_enabled = true

  lifecycle {
    ignore_changes = [
      repository_branch,
      repository_url
    ]
  }

  tags = var.tags
}

resource "azurerm_static_web_app_custom_domain" "website" {
  count             = var.enable_custom_domain ? 1 : 0
  static_web_app_id = azurerm_static_web_app.website.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"
}
