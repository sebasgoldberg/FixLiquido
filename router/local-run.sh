#!/usr/bin/env bash
cd ..
. cf-local-export-vcap-services.sh router
cd router
export destinations=`cat destinations.json`
npm start