(function () {
	function Subchannels () {
		return {
			restrict: 'E',
			templateUrl: 'file/src/Subchannels/Subchannels.html',
			controller: SubchannelsController,
			controllerAs: 'SubchannelsCtrl',
			link: function (scope, el, attrs) {
			}
		};
	}

	angular.module('Marketing').directive('subchannels', [Subchannels]);

	function SubchannelsController ($scope, sendToServerService) {
		var that = this;

		this.allSubchannels = [];
		this.allManagers = [];

		this.tableRowExpanded = false;
		this.tableRowIndexExpandedCurr = "";
		this.tableRowIndexExpandedPrev = "";
		this.scIDExpanded = "";
		this.currentSC = "";
		this.countries = [];
		this.extraPropforCountries = {displayProp: 'country_name', idProp: 'country_code',externalIdProp: '', scrollable:true, enableSearch:true};
		this.eventsForCountriesSelector = {onItemSelect: function(item) {that.checkIfConfigNeedsSave(that.currentSC,'blockedCountries');},onItemDeselect: function(item) {that.checkIfConfigNeedsSave(that.currentSC,'blockedCountries');}};
		getAllCountries();

		$scope.ipErrorClass = '';
		$scope.timeSpanErrorClass = '';

		this.getAllSubchannelsList = function () {
			that.allSubchannels = [];
			sendToServerService.sendToServer('GET','getSubchannels', null, that.updateSubchannelsList)
		};

		this.updateSubchannelsList = function(data) {
			if (data.errorCode == 'OK') {
				for (sc in data.subchannels) {
					data.subchannels[sc].moreInfo='';
					data.subchannels[sc].blockedCountries=[];
				}
				that.allSubchannels = data.subchannels;
			} else {
				openDialog('Error', "We've encountered an error. Please try again in few minutes.");
			}
		};

		this.getAllManagersList = function () {
			that.allManagers = [];
			sendToServerService.sendToServer('GET','getAllAffiliateManagers', null, that.updateAllManagersList)
		};

		this.updateAllManagersList = function(data) {
			if (data.errorCode == 'OK') {
				that.allManagers = data.managers;
			} else {
				openDialog('Error', "We've encountered an error. Please try again in few minutes.");
			}
		};

		this.scDataCollapseFn = function () {
			that.scDataCollapse = [];
			for (var i = 0; i < that.allSubchannels.length; i++) {
				that.scDataCollapse.push(false);
			}
		};

		this.selectSubchannel = function (index, sc, requestedInfo) {
			if (requestedInfo == 'contact' && !sc.contactInfo) {
				getSubchannelData(sc);
			} else if (requestedInfo == 'payments' && !sc.paymentInfo) {
				getSubchannelPaymentData(sc);
			} else if (requestedInfo == 'permissions') {
				getSubchannelPermissions(sc);
			} else if (requestedInfo == 'config') {
				getSubchannelConfig(sc);
			}
			if (that.tableRowExpanded) {
				if (that.currentSC.config && that.currentSC.savedConfig.isSaveNeeded.length > 0) {
					confirmChangeSC(index, sc, requestedInfo);
				} else {
					if (index == that.tableRowIndexExpandedCurr) {
						if (requestedInfo == sc.moreInfo || requestedInfo == '') {
							selectTableRow(index, sc.id);
							sc.moreInfo = '';
						} else {
							sc.moreInfo = requestedInfo;
						}
					} else {
						that.currentSC.moreInfo = '';
						selectTableRow(index, sc.id);
						that.currentSC = sc;
						sc.moreInfo = requestedInfo;
					}
				}
			} else {
				selectTableRow(index, sc.id);
				that.currentSC = sc;
				sc.moreInfo = requestedInfo;
			}

			function confirmChangeSC () {
				if (confirm("You've made changes to the " + that.currentSC.UserName +" subchannel config. Are you sure you want to close it without saving?") == true) {
					that.currentSC.savedConfig.isSaveNeeded = [];
					that.selectSubchannel(index, sc, requestedInfo);
				}
			}
		};

		function getSubchannelData (subchannel) {
			sendToServerService.sendToServer('GET','getSubchannelData/' + subchannel.id, null, saveSubchannelData, subchannel)
		}
		function saveSubchannelData (data, subchannel) {
			subchannel.contactInfo = data.data;
		}

		function getSubchannelPaymentData (subchannel) {
			sendToServerService.sendToServer('GET','getSubchannelPaymentData/' + subchannel.id, null, saveSubchannelPaymentData, subchannel)
		}

		function saveSubchannelPaymentData (data, subchannel) {
			subchannel.paymentInfo = data.data;
		}

		function getSubchannelPermissions (subchannel) {
			sendToServerService.sendToServer('GET','getSubchannelPermissions/' + subchannel.id, null, saveSubchannelPermissions, subchannel);
		}

		function saveSubchannelPermissions (data, subchannel) {
			subchannel.permissions = data.data;
		}

		function getSubchannelConfig (subchannel) {
			sendToServerService.sendToServer('GET','getSubchannelConfig/' + subchannel.id, null, saveSubchannelConfig, subchannel);
		}

		function saveSubchannelConfig (data, subchannel) {
			if (data.data) {
				subchannel.savedConfig = angular.copy(data.data);
				subchannel.config = angular.copy(data.data);
			} else {
				subchannel.savedConfig = {};
				subchannel.config = {};
			}
			if (!subchannel.config.blockedCountries) {
				subchannel.config.blockedCountries = [];
			} else {
				subchannel.blockedCountries = subchannel.config.blockedCountries;
			}
			subchannel.config.blockedCountries = subchannel.blockedCountries;
			subchannel.savedConfig.isSaveNeeded = [];
		}

		function selectTableRow (index, scId) {
			if (typeof that.scDataCollapse === 'undefined') {
				that.scDataCollapseFn();
			}
			if (that.tableRowExpanded === false && that.tableRowIndexExpandedCurr === "" && that.scIDExpanded === "") {
				that.tableRowIndexExpandedPrev = "";
				that.tableRowExpanded = true;
				that.tableRowIndexExpandedCurr = index;
				that.scIDExpanded = scId;
				that.scDataCollapse[index] = true;
			} else if (that.tableRowExpanded === true) {
				if (that.tableRowIndexExpandedCurr === index && that.scIDExpanded === scId) {
					that.tableRowExpanded = false;
					that.tableRowIndexExpandedCurr = "";
					that.scIDExpanded = "";
					that.scDataCollapse[index] = false;
				} else {
					that.tableRowIndexExpandedPrev = that.tableRowIndexExpandedCurr;
					that.tableRowIndexExpandedCurr = index;
					that.scIDExpanded = scId;
					that.scDataCollapse[that.tableRowIndexExpandedPrev] = false;
					that.scDataCollapse[that.tableRowIndexExpandedCurr] = true;
				}
			}

		}

		this.pageChanged = function() {
			that.scDataCollapseFn();
			that.tableRowExpanded = false;
			that.tableRowIndexExpandedCurr = "";
			that.scIDExpanded = "";
		};

		this.beforePageChange = function() {
			selectTableRow(that.tableRowIndexExpandedCurr, that.scIDExpanded);
		};

		this.savePermissions = function (sc) {
			sendToServerService.sendToServer('POST','updateSubchannelPermissions/' + sc.id, sc.permissions, updateSubchannelPermissionsDone);
		};

		function updateSubchannelPermissionsDone (data) {
			if (!data.err) {
				openDialog('OK', "Permissions Saved.");
			} else {
				openDialog('Error', "Error Saving Data. Please try again later.");
			}
		}

		this.saveConfig = function (sc) {
			if (($scope.ipErrorClass != 'has-error') && ($scope.timeSpanErrorClass != 'has-error')) {
				sendToServerService.sendToServer('POST', 'updateSubchannelConfig/' + sc.id, sc.config, updateSubchannelConfigDone, sc);
			} else {
				openDialog('Error', "You have entered invalid values. Please change it and try again.");
			}
		};

		function updateSubchannelConfigDone (data, sc) {
			if (!data.err) {
				openDialog('OK', "Config Saved.");
				sc.savedConfig.isSaveNeeded = [];
			} else {
				openDialog('Error', "Error Saving Data. Please try again later.");
			}
		}

		this.checkIp = function (IPToAdd) {
			var ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			if (!ipRegex.test(IPToAdd)) {
				$scope.ipErrorClass = 'has-error';
			} else {
				$scope.ipErrorClass = 'has-success';
			}
		};

		this.checkTimeSpan = function (sc, str) {
			var regex = /^(([0|1][0-9])|([2][0-3])):([0-5][0-9]):([0-5][0-9])$/;
			if (!regex.test(str)) {
				$scope.timeSpanErrorClass = 'has-error';
			} else {
				$scope.timeSpanErrorClass = 'has-success';
			}
			that.checkIfConfigNeedsSave(sc,'SessionExpirationSpan');
		};

		this.addIP = function (sc, IPToAdd) {
			if (!sc.config.WhiteIps)
				sc.config.WhiteIps=[];
			if ($scope.ipErrorClass == 'has-success') {
				sc.config.WhiteIps.push(IPToAdd);
				sc.savedConfig.isSaveNeeded.push('WhiteIps');
			}
		};

		this.removeIP = function (sc, IPToRemove) {
			var index = sc.config.WhiteIps.indexOf(IPToRemove);
			if (index != -1) {
				sc.config.WhiteIps.splice(index, 1);
				sc.savedConfig.isSaveNeeded.push('WhiteIps');
			}
		};

		this.checkIfConfigNeedsSave = function (sc, name) {
			console.log(name);
			if (sc.savedConfig[name] != sc.config[name] && String(sc.config[name]) != '') {
				if (sc.savedConfig.isSaveNeeded.indexOf(name) == -1) {
					sc.savedConfig.isSaveNeeded.push(name);
				}
			} else {
				var index = sc.savedConfig.isSaveNeeded.indexOf(name);
				if (index != -1) {
					sc.savedConfig.isSaveNeeded.splice(index, 1);
				}
			}

		};

		function init() {
			that.getAllSubchannelsList();
			that.getAllManagersList();
		}

		function openDialog(title, message) {
			BootstrapDialog.show({
				title: title,
				message: message,
				type:BootstrapDialog.TYPE_DEFAULT,
				buttons: [{
					label: 'Close',
					action: function(dialog) {
						dialog.close();
					}
				}]
			});
		}

		function getAllCountries() {
			sendToServerService.sendToServer('GET', 'getAllCountries', '', function (data) {
				that.countries = data.data;
			});
		}

		init();

	}
	angular.module('Marketing').controller('SubchannelsController', ['$scope', 'sendToServerService', SubchannelsController]);
})();