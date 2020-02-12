cf d router -f
cf d daemon -f
cf delete-service uaa_FixLiquido -f
cf delete-service dest_FixLiquido -f
cf delete-service logsFixLiquido -f

