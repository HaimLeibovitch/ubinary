// Set the BASE_DIR env (we use it in default.json config).
var path = require('path');
process.env.BASE_DIR = path.resolve(__dirname, '../');

// Load the gateway default config, we must add it as first argument so if the user specified a file it will override the default
var defaultConfig = path.resolve(__dirname, './config/default.json');
process.argv.splice(2, 0, '-c', defaultConfig);


require('open-api-gateway-core/api-host/server.js');

