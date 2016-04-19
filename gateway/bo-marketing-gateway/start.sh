if [ -z "$NODE_ENV" ]; then export NODE_ENV=dev; fi

# If the output is terminal we pipe it to jsonTail
if [ -t 1 ] ; then
	node api-host/server.js -c api-host/config/dev.json | node node_modules/open-api-gateway-core/node_modules/logger/bin/jsonTail.js
else
	node api-host/server.js -c api-host/config/dev.json
fi
exit 0
