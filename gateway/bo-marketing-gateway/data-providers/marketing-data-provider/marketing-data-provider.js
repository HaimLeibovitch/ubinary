var ERRORS = require('../../common/error-codes.js').SystemErrors,
	marketingDataAccess = require('./private/marketing-couch-access.js');

var MarketingDataProvider = {};
module.exports = MarketingDataProvider;

/**
 * Reports widget impression
 * @param {number} id - client IP
 * @param {function(GatewayError, number=)} cb - A callback with error if occurred or widget impression guid
 */
MarketingDataProvider.getSubChannels = function(cb) {
	marketingDataAccess.getSubChannels(cb);
};


MarketingDataProvider.getSubchannelData = function(id, cb) {
	marketingDataAccess.getSubchannelData(id, cb);
};

MarketingDataProvider.getSubchannelPaymentData = function(id, cb) {
	marketingDataAccess.getSubchannelPaymentData(id, cb);
};

MarketingDataProvider.getAllAffiliateManagers = function(cb) {
	marketingDataAccess.getAllAffiliateManagers(cb);
};

MarketingDataProvider.getSubchannelPermissions = function(id, cb) {
	marketingDataAccess.getSubchannelPermissions(id, cb);
};

MarketingDataProvider.getSubchannelConfig = function(id, cb) {
	marketingDataAccess.getSubchannelConfig(id, cb);
};

MarketingDataProvider.updateSubchannelPermissions = function(data, cb) {
	marketingDataAccess.updateSubchannelPermissions(data, cb);
};

MarketingDataProvider.updateSubchannelConfig = function(data, cb) {
	marketingDataAccess.updateSubchannelConfig(data, cb);
};

MarketingDataProvider.getAllCountries = function(data,cb) {
	marketingDataAccess.getAllCountries(data, cb);
};

MarketingDataProvider.getPermissionsConfig = function(data,cb) {
	marketingDataAccess.getPermissionsConfig(data, cb);
};

MarketingDataProvider.cellxpert = function(errorCode, parsedSubchannels) {
	marketingDataAccess.cellxpert(errorCode, parsedSubchannels);
};
