#!/usr/bin/env bash
cd ..
. cf-local-export-vcap-services.sh daemon
cd daemon
export PORT=3000
npm run debug