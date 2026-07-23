data "azurerm_resource_group" "codeflow" {
  name = var.resource_group_name
}

resource "azurerm_log_analytics_workspace" "runtime" {
  name                = var.log_analytics_workspace_name
  location            = var.location
  resource_group_name = data.azurerm_resource_group.codeflow.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

resource "azurerm_container_registry" "runtime" {
  name                = var.container_registry_name
  location            = var.location
  resource_group_name = data.azurerm_resource_group.codeflow.name
  sku                 = "Basic"
  admin_enabled       = false

  tags = var.tags
}

resource "azurerm_user_assigned_identity" "container_app" {
  name                = var.container_app_identity_name
  location            = var.location
  resource_group_name = data.azurerm_resource_group.codeflow.name

  tags = var.tags
}

resource "azurerm_role_assignment" "container_app_acr_pull" {
  scope                = azurerm_container_registry.runtime.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

resource "azurerm_container_app_environment" "runtime" {
  name                       = var.container_app_environment_name
  location                   = var.location
  resource_group_name        = data.azurerm_resource_group.codeflow.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.runtime.id

  tags = var.tags
}

resource "azurerm_container_app" "api" {
  name                         = var.container_app_name
  container_app_environment_id = azurerm_container_app_environment.runtime.id
  resource_group_name          = data.azurerm_resource_group.codeflow.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  registry {
    server   = azurerm_container_registry.runtime.login_server
    identity = azurerm_user_assigned_identity.container_app.id
  }

  ingress {
    external_enabled = true
    target_port      = 8080

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "codeflow-engine"
      image  = var.initial_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "CODEFLOW_JSON_LOGGING"
        value = "true"
      }

      env {
        name  = "CODEFLOW_LOG_LEVEL"
        value = "INFO"
      }

      env {
        name  = "CODEFLOW_SKIP_DB_INIT"
        value = "1"
      }

      env {
        name  = "CODEFLOW_STORAGE_BACKEND"
        value = "memory"
      }

      env {
        name  = "ENVIRONMENT"
        value = "staging"
      }

      env {
        name  = "PORT"
        value = "8080"
      }
    }
  }

  depends_on = [
    azurerm_role_assignment.container_app_acr_pull
  ]

  tags = var.tags
}
