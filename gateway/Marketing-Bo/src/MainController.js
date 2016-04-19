(function () {
	function mainController ($rootScope) {
		var that = this;

		this.appStatesList = {
			LEAD_UPLOAD: 1,
			LEAD_UPLOAD_HISTORY: 2,
			SUBCHANNELS: 3
		};

		this.appState = this.appStatesList.LEAD_UPLOAD;
		//this.appState = this.appStatesList.SUBCHANNELS;

		this.changeState = function (state) {
			that.appState = state;
			$rootScope.$broadcast('stateChanged', {data: that.appState});
		}
	}

	angular.module('Marketing').controller('mainController', ['$rootScope', mainController]);
})();