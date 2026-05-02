@description('App Service Plan name.')
param planName string

@description('App Service (Web App) name.')
param appName string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('App Service Plan SKU. F1 = Free, B1 = Basic.')
@allowed([ 'F1', 'B1' ])
param skuName string = 'B1'

@description('.NET runtime version on Linux (e.g., DOTNETCORE|10.0).')
param linuxFxVersion string = 'DOTNETCORE|10.0'

@description('Application Insights connection string.')
param appInsightsConnectionString string

@description('Allowed CORS origin (e.g., https://<swa>.azurestaticapps.net).')
param allowedCorsOrigin string

var skuTier = skuName == 'F1' ? 'Free' : 'Basic'
// F1 does not support Always On.
var alwaysOn = skuName != 'F1'

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: planName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    reserved: true // Linux
  }
}

resource site 'Microsoft.Web/sites@2024-04-01' = {
  name: appName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    clientAffinityEnabled: false
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: alwaysOn
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/health'
      cors: {
        allowedOrigins: [
          allowedCorsOrigin
        ]
        supportCredentials: true
      }
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
        {
          name: 'ASPNETCORE_FORWARDEDHEADERS_ENABLED'
          value: 'true'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Data Source=/home/BuckeyeMarketplace.db'
        }
        {
          name: 'JWT_SIGNING_KEY'
          value: 'ChangeMe-In-Portal-Or-GitHub-Secret'
        }
        {
          name: 'ADMIN_SEED_USER_ID'
          value: 'admin'
        }
        {
          name: 'ADMIN_SEED_EMAIL'
          value: 'admin@buckeyesublease.local'
        }
        {
          name: 'ADMIN_SEED_PASSWORD'
          value: 'ChangeMe123!'
        }
        {
          name: 'Cors__AllowedOrigins'
          value: allowedCorsOrigin
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
      ]
    }
  }
}

output name string = site.name
output defaultHostName string = site.properties.defaultHostName
output planId string = plan.id
