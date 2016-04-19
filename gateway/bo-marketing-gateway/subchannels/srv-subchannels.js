var cx = require('./srv-cellxpert.js');


exports.init = function() {
	console.log('init subchannels, auto_sync = ', AUTO_SYNC);
	if (AUTO_SYNC) exports.syncAffiliates();
};

exports.syncAffiliates = function () {
	clearInterval(updateTimer);
	cx.getAllAffiliates(checkForUpdates);
};

function checkForUpdates(errorCode, data){
	console.log(errorCode);
	if (errorCode == 'OK') {
		for (var i=0; i<data.length; i++){
			getSCFromCouchByID(data[i]);
		}
	}
	if (AUTO_SYNC) updateTimer = setInterval(exports.syncAffiliates, UPDATE_INTERVAL);
}

