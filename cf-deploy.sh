cf create-service xsuaa application uaa_FixLiquido -c xs-security.json 
cf create-service destination lite dest_FixLiquido
cf create-service application-logs lite logsFixLiquido
cd daemon
cf push
cd ../router
cf push
