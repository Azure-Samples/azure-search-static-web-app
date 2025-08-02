metadata description = 'Provisions resources for a web application that uses Azure SDK for Rust to connect to Azure Cosmos DB for NoSQL.'

targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention.')
param environmentName string

@minLength(1)
@description('Primary location for all resources.')
param location string

@description('Id of the principal to assign database and application roles.')
param deploymentUserPrincipalId string = ''

var resourceToken = toLower(uniqueString(resourceGroup().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
}

module managedIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.0' = {
  name: 'user-assigned-identity'
  params: {
    name: 'managed-identity-${resourceToken}'
    location: location
    tags: tags
  }
}

module containerRegistry 'br/public:avm/res/container-registry/registry:0.5.1' = {
  name: 'container-registry'
  params: {
    name: 'containerreg${resourceToken}'
    location: location
    tags: tags
    acrAdminUserEnabled: false
    anonymousPullEnabled: true
    publicNetworkAccess: 'Enabled'
    acrSku: 'Standard'
  }
}

var containerRegistryRole = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '8311e382-0749-4cb8-b61a-304f252e45ec'
) // AcrPush built-in role

module registryUserAssignment 'br/public:avm/ptn/authorization/resource-role-assignment:0.1.1' = if (!empty(deploymentUserPrincipalId)) {
  name: 'container-registry-role-assignment-push-user'
  params: {
    principalId: deploymentUserPrincipalId
    resourceId: containerRegistry.outputs.resourceId
    roleDefinitionId: containerRegistryRole
  }
}

module logAnalyticsWorkspace 'br/public:avm/res/operational-insights/workspace:0.7.0' = {
  name: 'log-analytics-workspace'
  params: {
    name: 'log-analytics-${resourceToken}'
    location: location
    tags: tags
  }
}

module containerAppsEnvironment 'br/public:avm/res/app/managed-environment:0.8.0' = {
  name: 'container-apps-env'
  params: {
    name: 'container-env-${resourceToken}'
    location: location
    tags: tags
    logAnalyticsWorkspaceResourceId: logAnalyticsWorkspace.outputs.resourceId
    zoneRedundant: false
  }
}

module clientContainerApp 'br/public:avm/res/app/container-app:0.9.0' = {
  name: 'client'
  params: {
    name: 'client-container-${resourceToken}'
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'client' })
    ingressTargetPort: 3000
    ingressExternal: true
    ingressTransport: 'auto'
    stickySessionsAffinity: 'sticky'
    scaleMaxReplicas: 1
    scaleMinReplicas: 1
    corsPolicy: {
      allowCredentials: true
      allowedOrigins: [
        '*'
      ]
    }
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [
        managedIdentity.outputs.resourceId
      ]
    }
    secrets: {
      secureList: [
        {
          name: 'azure-backend-url'
          value: serverContainerApp.outputs.fqdn
        }
      ]
    }
    containers: [
      {
        image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'web-front-end'
        resources: {
          cpu: '0.25'
          memory: '.5Gi'
        }
        env: [
          {
            name: 'AZURE_BACKEND_URL'
            secretRef: 'azure-backend-url'
          }
        ]
      }
    ]
  }
}

module serverContainerApp 'br/public:avm/res/app/container-app:0.9.0' = {
  name: 'server'
  params: {
    name: 'server-container-${resourceToken}'
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'server' })
    ingressTargetPort: 80
    ingressExternal: true
    ingressTransport: 'auto'
    stickySessionsAffinity: 'sticky'
    scaleMaxReplicas: 1
    scaleMinReplicas: 1
    corsPolicy: {
      allowCredentials: true
      allowedOrigins: [
        '*' // Start with allowing all origins
      ]
    }
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [
        managedIdentity.outputs.resourceId
      ]
    }
    containers: [
      {
        image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'web-front-end'
        resources: {
          cpu: '0.25'
          memory: '.5Gi'
        }
      }
    ]
  }
}

module containerAppRoleAssignment 'br/public:avm/ptn/authorization/resource-role-assignment:0.1.1' = {
  name: 'container-app-role-assignment'
  params: {
    principalId: managedIdentity.outputs.principalId
    resourceId: resourceGroup().id
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Contributor
  }
}

module storageForDeploymentScript 'br/public:avm/res/storage/storage-account:0.9.1' = {
  name: 'storageAccountDeployment'
  params: {
    // Required parameters
    name: 'stor${resourceToken}'
    // Non-required parameters
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
    }
    roleAssignments: [
      {
        principalId: managedIdentity.outputs.principalId 
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Owner' // Owner role for full management plane control
      }
      {
        principalId: managedIdentity.outputs.principalId 
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'b24988ac-6180-42a0-ab88-20f7382dd24c' // Contributor role (management plane)
      }
      {
        principalId: managedIdentity.outputs.principalId 
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b' // Storage Blob Data Owner role (data plane)
      }
      {
        principalId: managedIdentity.outputs.principalId 
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe' // Storage Blob Data Contributor role (data plane)
      }
    ]
  }
}

module updateServerCorsPolicy 'br/public:avm/res/resources/deployment-script:0.5.1' = {
  name: 'update-server-cors-policy'
  params: {
    // Required parameters
    kind: 'AzureCLI'
    name: 'script${resourceToken}'
    // Non-required parameters
    azCliVersion: '2.52.0'
    environmentVariables: [
      {
        name: 'SERVER_APP_NAME'
        value: serverContainerApp.name
      }
      {
        name: 'RESOURCE_GROUP'
        value: resourceGroup().name
      }
      {
        name: 'CLIENT_FQDN'
        value: clientContainerApp.outputs.fqdn
      }
    ]
    location: location
    managedIdentities: {
      userAssignedResourceIds: [
        managedIdentity.outputs.resourceId
      ]
    }
    retentionInterval: 'P1D'
    scriptContent: '''
      #!/bin/bash
      set -e
      
      # Get the current container app configuration
      az containerapp show --name $SERVER_APP_NAME --resource-group $RESOURCE_GROUP > app.json
      
      # Update the CORS policy to allow only the client FQDN
      # This is a simplified example - in production you'd want to use jq for proper JSON manipulation
      az containerapp update --name $SERVER_APP_NAME --resource-group $RESOURCE_GROUP \
        --cors-allow-credentials true \
        --cors-allowed-origins "https://$CLIENT_FQDN" \
        --cors-allowed-methods "GET POST PUT DELETE OPTIONS PATCH" \
        --cors-allowed-headers "*" \
        --cors-expose-headers "*" \
        --cors-max-age 600
        
      echo "Updated CORS policy for $SERVER_APP_NAME to only allow https://$CLIENT_FQDN"
    '''
    storageAccountResourceId: storageForDeploymentScript.outputs.resourceId
  }
  
}

output AZURE_SERVER_URL string = serverContainerApp.outputs.fqdn
output AZURE_CLIENT_URL string = clientContainerApp.outputs.fqdn
