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

// Apply CORS settings directly to the server container app after the client is created
module serverContainerAppWithClientCors 'br/public:avm/res/app/container-app:0.9.0' = {
  name: 'serverWithClientCors'
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
    // Update CORS settings with client FQDN directly
    corsPolicy: {
      allowCredentials: true
      allowedOrigins: [
        'https://${clientContainerApp.outputs.fqdn}'
      ]
      allowedMethods: [
        'GET'
        'POST'
        'PUT'
        'DELETE'
        'OPTIONS'
        'PATCH'
      ]
      allowedHeaders: [
        '*'
      ]
      exposeHeaders: [
        '*'
      ]
      maxAge: 600
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

output AZURE_SERVER_URL string = serverContainerAppWithClientCors.outputs.fqdn
output AZURE_CLIENT_URL string = clientContainerApp.outputs.fqdn
