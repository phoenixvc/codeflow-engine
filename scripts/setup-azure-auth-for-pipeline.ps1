param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$TenantId,

    [string]$IdentityResourceGroup = "pvc-prod-codeflow-identity-rg",

    [string]$DeploymentResourceGroup = "pvc-prod-codeflow-rg",

    [string]$ContainerRegistryName = "pvcprodcodeflowacr",

    [string]$Location = "southafricanorth",

    [string]$IdentityName = "pvc-prod-codeflow-github-mi",

    [string]$GitHubOwner = "phoenixvc",

    [string]$GitHubRepository = "codeflow-engine",

    [string]$GitHubEnvironment = "production"
)

$ErrorActionPreference = "Stop"

function Invoke-Az {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$AzArgs
    )

    $output = & az @AzArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI failed: az $($AzArgs -join ' ')"
    }

    return $output
}

Invoke-Az account set --subscription $SubscriptionId | Out-Null

$selectedTenantId = Invoke-Az account show --query tenantId --output tsv
if ($selectedTenantId -ne $TenantId) {
    throw "Selected subscription tenant '$selectedTenantId' does not match requested tenant '$TenantId'."
}

Invoke-Az group create `
    --name $IdentityResourceGroup `
    --location $Location `
    --tags workload=codeflow purpose=github-actions-auth environment=production | Out-Null

$identity = Invoke-Az identity create `
    --name $IdentityName `
    --resource-group $IdentityResourceGroup `
    --location $Location `
    --query "{clientId:clientId, principalId:principalId, id:id}" `
    --output json | ConvertFrom-Json

$deploymentRgId = Invoke-Az group show `
    --name $DeploymentResourceGroup `
    --query id `
    --output tsv

$containerRegistryId = Invoke-Az acr show `
    --name $ContainerRegistryName `
    --resource-group $DeploymentResourceGroup `
    --query id `
    --output tsv

Invoke-Az role assignment create `
    --assignee-object-id $identity.principalId `
    --assignee-principal-type ServicePrincipal `
    --role Contributor `
    --scope $deploymentRgId | Out-Null

Invoke-Az role assignment create `
    --assignee-object-id $identity.principalId `
    --assignee-principal-type ServicePrincipal `
    --role AcrPush `
    --scope $containerRegistryId | Out-Null

$subject = "repo:${GitHubOwner}/${GitHubRepository}:environment:${GitHubEnvironment}"

Invoke-Az identity federated-credential create `
    --name "$GitHubEnvironment-github-actions" `
    --identity-name $IdentityName `
    --resource-group $IdentityResourceGroup `
    --issuer "https://token.actions.githubusercontent.com" `
    --subject $subject `
    --audiences "api://AzureADTokenExchange" | Out-Null

[PSCustomObject]@{
    AZURE_CLIENT_ID       = $identity.clientId
    AZURE_TENANT_ID       = $selectedTenantId
    AZURE_SUBSCRIPTION_ID = $SubscriptionId
    AZURE_RESOURCE_GROUP  = $DeploymentResourceGroup
    AZURE_CONTAINER_APP   = "pvc-prod-codeflow-api"
    AZURE_CONTAINER_REGISTRY = $ContainerRegistryName
} | Format-List
