(function () {

	function LeadUploadHistory() {
		return {
			restrict: 'E',
			templateUrl: 'file/src/LeadUpload/LeadUploadHistory/LeadUploadHistory.html',
			controller: leadUploadHistoryCtrl,
			controllerAs: 'HistoryCtrl',
			link: function (scope, el, attrs) {
			}
		};
	}
	angular.module('Marketing').directive('leadUploadHistory', [LeadUploadHistory]);

	function  leadUploadHistoryCtrl (sendToServerService, exportToXlsService, $rootScope, $window) {
		var that = this;

		that.allFiles = [];

		$rootScope.$on('stateChanged',function (ev, args) {
			if (args.data == 2) {
				that.getAllFilesList();
			}
		});
		this.getAllFilesList = function () {
			that.allFiles = [];
			sendToServerService.sendToServer('GET','history', null, that.updateFilesList)
		};

		this.updateFilesList = function(data) {
			if (data.errorCode == 'OK') {
				that.allFiles = data.files;
			} else {
				alert("We've encountered an error loading the file list. Please try again in few minutes.")
			}

		};

		this.getLeadsByFileID = function (file) {
			//sendToServerService.sendToServer('GET','getLeads/' + file.fileId, null, that.downloadLeadsFile, file.fileName)
			$window.open('/getLeads/' + file.fileId, "_self");
		};

		this.downloadLeadsFile = function (data, fileName) {
			if (data.errorCode == 'OK') {
				exportToXlsService.JSONToCSVConvertor(data.data[0].value, fileName + '_Leads', true);
			}else {
				alert("We've encountered an error loading the leads. Please try again in few minutes.")
			}
		};

		this.getAllFilesList();
	}
	angular.module('Marketing').controller('leadUploadHistoryCtrl', ['sendToServerService', 'exportToXlsService', '$rootScope', '$window', leadUploadHistoryCtrl]);
})();