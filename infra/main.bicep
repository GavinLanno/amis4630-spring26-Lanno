targetScope = 'subscription'

@description('Environment name (dev, prod).')
@allowed([ 'dev', 'prod' ])
param environmentName string

@description('Short workload name used in resource naming.')
@minLength(2)
@maxLength(10)
param workloadName string = 'buckeye'

@description('Primary Azure region for all resources.')
param location string = 'eastus2'

var tags = {
  environment: environmentName
  workload: workloadName
  'managed-by': 'bicep'
}

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${workloadName}-${environmentName}'
  location: location
  tags: tags
}

module workload 'modules/workload.bicep' = {
  name: 'workload-${environmentName}'
  scope: rg
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    tags: tags
  }
}

output resourceGroupName string = rg.name
output appServiceName string = workload.outputs.appServiceName
output appServiceDefaultHostName string = workload.outputs.appServiceDefaultHostName
output appServiceApiBaseUrl string = workload.outputs.appServiceApiBaseUrl
output staticWebAppName string = workload.outputs.staticWebAppName
output staticWebAppDefaultHostName string = workload.outputs.staticWebAppDefaultHostName
output applicationInsightsConnectionString string = workload.outputs.applicationInsightsConnectionString
