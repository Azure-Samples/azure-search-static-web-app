metadata description = 'Provisions resources for a web application with containerized services using Azure Container Apps.'

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

@description('Flag to determine if custom container images should be used. If false, uses hello world containers.')
param useCustomContainerImages bool = false

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

module containerRegistry 'br/public:avm/res/container-registry/registry:0.9.1' = {
  name: 'container-registry'
  params: {
    name: 'reg${resourceToken}'
    location: location
    tags: tags
    acrAdminUserEnabled: false
    anonymousPullEnabled: false
    publicNetworkAccess: 'Enabled'
    acrSku: 'Standard'
    roleAssignments: [
      {
        principalId: managedIdentity.outputs.principalId
        roleDefinitionIdOrName: '7f951dda-4ed3-4680-a7ca-43fe172d538d' // AcrPull
      }
      {
        principalId: deploymentUserPrincipalId
        roleDefinitionIdOrName: '8311e382-0749-4cb8-b61a-304f252e45ec' // AcrPush
      }
    ]
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

module containerAppsEnvironment 'br/public:avm/res/app/managed-environment:0.11.0' = {
  name: 'container-apps-env'
  params: {
    name: 'container-env-${resourceToken}'
    location: location
    tags: tags
    zoneRedundant: false
    publicNetworkAccess: 'Enabled'
  }
}

module clientContainerApp 'br/public:avm/res/app/container-app:0.9.0' = {
  name: 'client'
  params: {
    name: 'client'
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
    registries: [
      {
        server: containerRegistry.outputs.loginServer
        identity: managedIdentity.outputs.resourceId
      }
    ]
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
        // Use parameter to control which image to use
        image: useCustomContainerImages
          ? '${containerRegistry.outputs.loginServer}/client:latest'
          : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'client'
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
    name: 'server'
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
    registries: [
      {
        server: containerRegistry.outputs.loginServer
        identity: managedIdentity.outputs.resourceId
      }
    ]
    containers: [
      {
        // Use parameter to control which image to use
        image: useCustomContainerImages
          ? '${containerRegistry.outputs.loginServer}/server:latest'
          : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'server'
        resources: {
          cpu: '0.25'
          memory: '.5Gi'
        }
        env: [
          {
            name: 'SEARCH_SERVICE_NAME'
            value: searchService.outputs.name
          }
          {
            name: 'SEARCH_INDEX_NAME'
            value: 'good-books'
          }
        ]
      }
    ]
  }
}

module searchService 'br/public:avm/res/search/search-service:0.9.2' = {
  name: 'searchServiceDeployment'
  params: {
    name: 'search${resourceToken}'
    authOptions: {
      aadOrApiKey: {
        aadAuthFailureMode: 'http401WithBearerChallenge'
      }
    }
    disableLocalAuth: false
    location: location
    partitionCount: 1
    replicaCount: 1
    sku: 'basic'
    tags: tags
    managedIdentities: {
      systemAssigned: true
      userAssignedResourceIds: [
        managedIdentity.outputs.resourceId
      ]
    }
    roleAssignments: [
      {
        name: '73ec30e0-2e25-475f-beec-d90cab332eb7'
        principalId: managedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Owner'
      }
      {
        name: '1407120a-92aa-4202-b7e9-c0e197c71c8f'
        principalId: managedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Search Index Data Contributor'
      }
      {
        name: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
        principalId: managedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Search Service Contributor'
      }
      {
        name: '73ec30e0-2e25-475f-beec-d90cab332eb7'
        principalId: deploymentUserPrincipalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Owner'
      }
      {
        name: '1407120a-92aa-4202-b7e9-c0e197c71c8f'
        principalId: deploymentUserPrincipalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Search Index Data Contributor'
      }
      {
        name: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
        principalId: deploymentUserPrincipalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: 'Search Service Contributor'
      }
    ]
  }
}

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_SERVER_URL string = serverContainerApp.outputs.fqdn
output AZURE_CLIENT_URL string = clientContainerApp.outputs.fqdn
output SEARCH_SERVICE_NAME string = searchService.outputs.name
