var ClientContextBase = require('open-api-gateway-core/frontend/handlers/request/client-context.js'),
	util = require('util');

/**
 * Creates a new instance of gateway client context
 * @param {object} client - The context object parsed from the client request.
 * @constructor
 * @augments {ClientContext}
 */
function GatewayClientContext(client) {
	ClientContextBase.call(this, client);

	this.siteId = '';
	this.partnerId = 0;
	this.brandName = '';
	this.userGUID = '';
	this.accountGUID = '';
}
//noinspection JSCheckFunctionSignatures
util.inherits(GatewayClientContext, ClientContextBase);

GatewayClientContext.prototype.clone = function() {
	// Passing `this` to the ctor will copy the values from the ClientContext
	var res = new GatewayClientContext(this);

	// Now copy the GatewayClientContext values
	res.siteId = this.siteId;
	res.partnerId = this.partnerId;
	res.brandName = this.brandName;
	res.userGUID = this.userGUID;
	res.accountGUID = this.accountGUID;

	return res;
};

module.exports = GatewayClientContext;
