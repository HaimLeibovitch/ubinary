var util = require('util')
MESSAGES = require('../return-types.js').MessageTypes,
    ServiceBase = require('open-api-gateway-core/services/service-base.js'),
    ServiceResponse = require('open-api-gateway-core/services/service-response.js'),
    logger = require('open-api-gateway-core/common/logger.js').useContext('gw/services/marketing'),
    marketingDataProvider = require('../../data-providers/marketing-data-provider/marketing-data-provider.js'),
    configuration = require('open-api-gateway-core/common/config.js');

var CellexpertJob = require('../../job-server/jobs/cellxpert-job.js'),
     jobServer = require('../../job-server/job-server.js');

/**
 * Creates a new instance of MarketingService
 * @constructor {MarketingService}
 */

//var config = configuration.getConfigSection('apiHost/assets');

config = {
    "assetsStatsQueryInterval": 5000 // 1 Minute
}

if (isNaN(config.assetsStatsQueryInterval)) {
    throw ERRORS.SystemErrors.ERR_INVALID_CONFIG.formatMessage('services/assets config must have a, assetsStatsQueryInterval numeric values');
}

function MarketingService() {
    ServiceBase.call(this, logger);

    // Create the assets info job
    this.cellexpertJob = new CellexpertJob(config.assetsStatsQueryInterval);
    jobServer.add(this.cellexpertJob, true);
}


//noinspection JSCheckFunctionSignatures
util.inherits(MarketingService, ServiceBase);

//<editor-fold desc="// MarketingService Impl {...}">

/**
 * Get user's financial information
 * @param {ServiceRequest} args - A service request object
 * @param {function(ServiceResponse)    } cb - A response callback function
 */
MarketingService.prototype.getSubchannelData = function (id, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getSubchannelData(id, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.getSubchannelPaymentData = function (id, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getSubchannelPaymentData(id, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.getAllAffiliateManagers = function (args, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getAllAffiliateManagers(function (err, res) {
        response.message.data = {subChannel: res};
        cb(response);
    });
};


MarketingService.prototype.getSubchannelPermissions = function (id, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getSubchannelPermissions(id, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.getSubchannelConfig = function (id, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getSubchannelConfig(id, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.updateSubchannelPermissions = function (data, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.updateSubchannelPermissions(data, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};


MarketingService.prototype.getSubChannels = function (args, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    //if (!this.onEntry(this.metadata.methods.getSubChannels, args, response, cb)) { return; }

    //var subChannelId = args.data.id;
    //logger.trace('Calling getSubChannels on user data provider with args: %s, subChannelId: %d', args);
    marketingDataProvider.getSubChannels(function (err, res) {
        response.message.data = {subChannel: res};
        cb(response);
    });
};

MarketingService.prototype.updateSubchannelConfig = function (data, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.updateSubchannelConfig(data, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.getAllCountries = function (data, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getAllCountries(data, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};

MarketingService.prototype.getPermissionsConfig = function (data, cb) {
    var response = new ServiceResponse(MESSAGES.GetSubChannelsResponse);
    marketingDataProvider.getPermissionsConfig(data, function (err, res) {
        response.message.data = res;
        cb(response);
    });
};


MarketingService.prototype.metadata = {
    name: 'marketing',
    version: 'v1',
    methods: {
        getSubChannels: {
            persistentConnection: false,
            allowGuest: true,
            params: [
                {name: 'id', type: 'int', required: true}
            ]
        }
    }
};

module.exports = MarketingService;

