var util = require('util'),
	APIKeyProviderBase = require('open-api-gateway-core/frontend/lib/apikey-provider-base.js'),
	apikeyProvider = require('../../data-providers/apikey-data-provider/apikey-data-provider.js');

function APIKeyProvider() {
	APIKeyProviderBase.call(this);
}
//noinspection JSCheckFunctionSignatures
util.inherits(APIKeyProvider, APIKeyProviderBase);

/**
 * Fetches apikey
 * @param {string} apikey - The api key
 * @param {function(GatewayError=, APIKey=)} cb - A response callback
 */
APIKeyProvider.prototype.fetch = function(apikey, cb) {
	apikeyProvider.fetch(apikey, cb);
};

module.exports = APIKeyProvider;
