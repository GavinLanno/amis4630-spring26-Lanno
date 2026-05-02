targetScope = 'resourceGroup'

@description('Azure region.')
param location string

@description('Environment name.')
param environmentName string

@description('Short workload name.')
param workloadName string

@description('Resource tags.')
param tags object

var abbrs = loadJsonContent('../abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, environmentName))

// Compose names in one place.
var names = {
  logAnalytics: '${abbrs.logAnalyticsWorkspace}${workloadName}-${environmentName}'
  appInsights: '${abbrs.applicationInsights}${workloadName}-${environmentName}'
  appServicePlan: '${abbrs.appServicePlan}${workloadName}-${environmentName}'
  appService: '${abbrs.appService}${workloadName}-${environmentName}-${substring(resourceToken, 0, 6)}'
  staticWebApp: '${abbrs.staticWebApp}${workloadName}-${environmentName}-${substring(resourceToken, 0, 6)}'
}

module logs 'log-analytics.bicep' = {
  name: 'log-analytics'
  params: {
    name: names.logAnalytics
    location: location
    tags: tags
  }
}

module appi 'app-insights.bicep' = {
  name: 'app-insights'
  params: {
    name: names.appInsights
    location: location
    tags: tags
    workspaceId: logs.outputs.workspaceId
  }
}

module app 'app-service.bicep' = {
  name: 'app-service'
  params: {
    planName: names.appServicePlan
    appName: names.appService
    location: location
    tags: tags
    appInsightsConnectionString: appi.outputs.connectionString
    allowedCorsOrigin: 'https://${swa.outputs.defaultHostName}'
  }
}

module swa 'static-web-app.bicep' = {
  name: 'static-web-app'
  params: {
    name: names.staticWebApp
    // SWA Free is only available in a limited set of regions; force one that always works.
    location: 'eastus2'
    tags: tags
  }
}

output appServiceName string = app.outputs.name
output appServiceDefaultHostName string = app.outputs.defaultHostName
output appServiceApiBaseUrl string = 'https://${app.outputs.defaultHostName}/api'
output staticWebAppName string = swa.outputs.name
output staticWebAppDefaultHostName string = swa.outputs.defaultHostName
output applicationInsightsConnectionString string = appi.outputs.connectionString
