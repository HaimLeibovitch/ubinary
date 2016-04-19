var ERRORS = require('open-api-gateway-core/common/error-codes.js').SystemErrors,
    logger = require('open-api-gateway-core/common/logger.js').useContext('gw/jobs/assets-info'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    JobBase = require('./job-base.js'),
    TradingInfoModel = require('../../models/trading-info-model.js'),
    parseString = require('xml2js').parseString,
    util = require('util'),
    cellxpertUserName = 'naama',
    cellxpertPass = 'naama123',
    cellxpertAffiliateListCommand = 'affiliatelistext',
    cellxpertBaseUrl = 'http://go.binaryoptions.partners/api/admin/?username=' + cellxpertUserName + '&password=' + cellxpertPass + '&command=',
    tradingInfoDataProvider = require('../../data-providers/marketing-data-provider/marketing-data-provider.js');

//<editor-fold desc="// Private functions {...}">

/**
 * Check for symbol changed on country dictionary
 * @param {string} countryCode - The checked country code
 * @param {string} symbol - The checked symbol
 * @param {TradingInfoModel.AssetsStatisticsDict} oldAssetsStats - Raw old assets info for this partner
 * @param {TradingInfoModel.AssetsStatisticsDict} newAssetsStats - Raw new assets info for this partner
 * @@returns (boolean) Is symbol changed on country dictionary
 * @private
 */

function AssetsInfoJob(interval) {
    // Call the base class ctor and set it as a "background" task.
    JobBase.call(this, interval, 5000);

    /**
     * The key is a partnerId, the value is the number of connections related to this partner
     * @type {object.<number, number>}
     */
    this.partnersSubscriptions = {};

    /**
     * Holds the latest assets stats we got per partner
     * @type {object.<number, TradingInfoModel.AssetsStatisticsDict>}
     *
     */
    this.latestAssetsStats = {};

    /**
     * Holds subscription info per subscriber id
     * @type {object.<string, TradingInfoModel.AssetsSubscription>}
     */
    this.subscriptions = {};
}
util.inherits(AssetsInfoJob, JobBase);

AssetsInfoJob.Events = {
    AssetsStatsUpdate: 'AssetsStatsUpdate'
};

/***
 * Overrides the JobBase doWork method, this will run only once as we are a background job
 * @param done A function reference to call when we are done with doWork (this will reset the job interval).
 * @protected
 */
AssetsInfoJob.prototype.doWork = function (done) {
    this.getAllAffiliates(this.checkForUpdates);
    done();
};



AssetsInfoJob.prototype.checkForUpdates = function (errorCode, parsedSubchannels) {
    tradingInfoDataProvider.cellxpert(errorCode, parsedSubchannels);
};


AssetsInfoJob.prototype.getAllAffiliates = function (callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            if(xmlhttp.status == 200){
                var xml = xmlhttp.responseText;
                parseString(xml, function (err, result) {
                    var parsedSubchannels = handleAffiliates(result.ResultSet.Affiliate);
                    callback ('OK', parsedSubchannels);
                });
            }
            else if(xmlhttp.status == 400) {
                console.log('There was an error 400')
            }
            else {
                console.log('something else other than 200 was returned', xmlhttp.status)
            }
        }
    };

    xmlhttp.open("GET", cellxpertBaseUrl + cellxpertAffiliateListCommand, true);
    xmlhttp.send();
};

handleAffiliates = function(affiliates) {
    var allSubchannels = [];
    for (var aff in affiliates) {
        var sc = {
            _id: affiliates[aff].AffiliateID[0],
            UserName:affiliates[aff].UserName[0],
            FirstName:affiliates[aff].FirstName[0],
            LastName:affiliates[aff].LastName[0],
            Email:affiliates[aff].Email[0],
            Phone:affiliates[aff].Phone[0],
            Country:affiliates[aff].Country[0],
            AffiliateManager:affiliates[aff].AffiliateManager[0],
            FixedCPA:parseFloat(affiliates[aff].CPA_amount[0])
        };
        allSubchannels.push(sc);
    }
    return allSubchannels;
}

module.exports = AssetsInfoJob;
