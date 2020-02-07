cf create-service xsuaa application uaa_FixLiquido -c xs-security.json 
cf create-service destination lite dest_FixLiquido
cd daemon
cf push
cd ../router
cf push
