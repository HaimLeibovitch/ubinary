var util = require('util');
var MarketingCouchDataAccess = {};
var ERRORS = require('open-api-gateway-core/common/error-codes.js').SystemErrors
module.exports = MarketingCouchDataAccess;

var Couch = require('open-api-gateway-core/data-access/storage/couch.js');
var couchbase = require("couchbase");
var N1qlQuery = require('couchbase').N1qlQuery;
var myCluster = new couchbase.Cluster('couch-srv');
var myBucket = myCluster.openBucket('subchannels');
var idsArr = [];
var couchInstance = null;
var subChanel_id = '';

/**couchInstance
 * Reports widget impression
 * @param {number} id - client IP
 * @param {function(GatewayError=, number=)} cb - A callback with error if occurred or widget impression guid
 */

MarketingCouchDataAccess.init = function () {
    Couch.connect(function (NewBOCouch) {
        couchInstance = NewBOCouch;
    });
}

MarketingCouchDataAccess.init();

MarketingCouchDataAccess.getSubChannels = function (cb) {
    // Get all ids from subchannels's documents
    var query = N1qlQuery.fromString('SELECT _id FROM subchannels');

    // Get query's result
    myBucket.query(query, function (err, res) {
        if (err) {
            return;
        }
        else {
            for (var i = 0; i < res.length; i++) {
                idsArr.push(res[i]._id);
            }

            couchInstance.getMulti(idsArr, function (err, results) {
                if (err) {
                    return;
                }
                else {
                    cb(null, results);
                }
            });
        }
    });
};


MarketingCouchDataAccess.getSubchannelData = function (id, cb) {
    subChanel_id = id.data.id;
    couchInstance.get(subChanel_id, function (err, results) {
        if (err) {
            return;
        }
        else {
            cb(null, results);
        }
    });
};

MarketingCouchDataAccess.getSubchannelPaymentData = function (id, cb) {
    subChanel_id = id.data.id;
    couchInstance.get(subChanel_id, function (err, results) {
        if (err) {
            return;
        }
        else {
            results = results.value.FixedCPA;
            cb(null, results);
        }
    });
};

MarketingCouchDataAccess.getAllAffiliateManagers = function (cb) {
    // Get all ids from subchannels's documents
    var query = N1qlQuery.fromString('SELECT _id FROM subchannels');

    // Get query's result
    myBucket.query(query, function (err, res) {
        if (err) {
            return;
        }
        else {
            for (var i = 0; i < res.length; i++) {
                idsArr.push(res[i]._id);
            }

            couchInstance.getMulti(idsArr, function (err, results) {
                var affManagerArr = [];

                for (var i = 0; i < idsArr.length; i++) {
                    var id = idsArr[i];
                    affManagerArr.push(results[id].value.AffiliateManager);
                }


                if (err) {
                    return;
                }
                else {
                    cb(null, affManagerArr);
                }
            });
        }
    });
};


MarketingCouchDataAccess.getSubchannelPermissions = function (id, cb) {
    subChanel_id = id.data.id;
    couchInstance.get(subChanel_id, function (err, results) {
        if (err) {
            return;
        }
        else {
            results = results.value.permissions;
            cb(null, results);
        }
    });
};


MarketingCouchDataAccess.getSubchannelConfig = function (id, cb) {
    subChanel_id = id.data.id;
    couchInstance.get(subChanel_id, function (err, results) {
        if (err) {
            return;
        }
        else {
            results = results.value.config;
            cb(null, results);
        }
    });
};

MarketingCouchDataAccess.updateSubchannelPermissions = function (data, cb) {
    var permissions = JSON.parse(data.context.connection.buffer);
    var allowedPermissions = [];
    subChanel_id = data.data.id;
    couchInstance.update(subChanel_id, {}, function (oldData, callback) {
        for (var perm in permissions) {
            checkIfPermAllowed(permissions[perm]);
        }

        function checkIfPermAllowed(perm) {
            if (perm.isAllowed) {
                allowedPermissions.push(perm.id);
            }
            if (perm.children) {
                for (var i in perm.children) {
                    checkIfPermAllowed(perm.children[i]);
                }
            }
        }

        oldData.permissions = allowedPermissions;
        callback(null, oldData);
    });
};

MarketingCouchDataAccess.updateSubchannelConfig = function (data, cb) {
    var config = JSON.parse(data.context.connection.buffer);
    subChanel_id = data.data.id;
    couchInstance.update(subChanel_id, {}, function (oldData, callback) {
        oldData.config = config;
        callback(null, oldData);
    });
};

MarketingCouchDataAccess.getAllCountries = function (data, cb) {
    couchInstance.get('countries', function (err, results) {
        if (err) {
            return;
        }
        else {
            results = results.value.countries_list;
            cb(null, results);
        }
    });
};

MarketingCouchDataAccess.getPermissionsConfig = function (data, cb) {
    couchInstance.get('permissions', function (err, results) {
        if (err) {
            return;
        }
        else {
            results = results.value.permissions;
            cb(null, results);
        }
    });
}

MarketingCouchDataAccess.cellxpert = function (errorCode, data) {
    if (errorCode == 'OK') {
        for (var i = 0; i < data.length; i++) {
            getSCFromCouchByID(data[i]);
        }
    }
}

function getSCFromCouchByID(sc) {
    couchInstance.get(sc._id, function (err, results) {
        if (err) {
            saveSubchannel(sc);
        }
        else {
            var needUpdate = false;
            for (var key in sc) {
                if (key != '_rev' && key != '_id') {
                    if (results.value[key] != sc[key]) {
                        results.value[key] = sc[key];
                        needUpdate = true;
                    }
                }
            }

            if (!results.value.permissions) {
                results.value.permissions = [];
                needUpdate = true;
            }
            if (needUpdate) {
                saveSubchannel(results);
            }

            //results = results.value.permissions;
            //cb(null, results);
        }
    });
}

function saveSubchannel(subCha) {
    var addObj = subCha;
    couchInstance.add(subCha._id, subCha, function (err) {
        if (err) {
            throw ERRORS.SystemErrors.ERR_INVALID_ARGUMENTS.formatMessage('cannot add new document to subchannels bucket');
        }
    });
}