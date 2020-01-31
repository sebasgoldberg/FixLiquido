cf unbind-service router uaa_FixLiquido
cf unbind-service daemon uaa_FixLiquido
cf delete-service uaa_FixLiquido -f
cf create-service xsuaa application uaa_FixLiquido -c xs-security.json
cf bind-service router uaa_FixLiquido
cf bind-service daemon uaa_FixLiquido
cf rg daemon
cf rg router
