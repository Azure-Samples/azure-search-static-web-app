using './main.bicep'

param environmentName = readEnvironmentVariable('AZURE_ENV_NAME', 'development')
param location = readEnvironmentVariable('AZURE_LOCATION', 'westus')
param deploymentUserPrincipalId = readEnvironmentVariable('AZURE_PRINCIPAL_ID', '')
param useKeylessAuth = readEnvironmentVariable('USE_KEYLESS_AUTH', 'true') == 'true'
