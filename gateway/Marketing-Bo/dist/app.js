(function () {
	angular.module('Marketing',['angularUtils.directives.dirPagination','ui.bootstrap', 'angularjs-dropdown-multiselect']);

	angular.module('Marketing').constant('config', (function() {
		return {
			APP_NAME: 'uBinary Marketing',
			SERVER_URL: '/',
			API_SERVER_URL: 'http://api.ubinary.com'
		}
	})());
})();


(function () {
    function LeadUpload() {
        return {
            restrict: 'E',
            templateUrl: 'file/src/LeadUpload/LeadsUpload.html',
            controller: 'LeadUploadController',
            controllerAs: 'LeadUploadCtrl',
            link: function (scope, el, attrs) {
            }
        };
    }

    angular.module('Marketing').directive('leadUpload', [LeadUpload]);

    function uploadFile() {
        return {
            restrict: 'E',
            templateUrl: "file/src/LeadUpload/uploadFile.html",
            controller: 'LeadUploadController',
            controllerAs: 'LeadUploadCtrl'
        }
    };

    angular.module('Marketing').directive('uploadFile', [uploadFile]);


    function alertMessage() {
        return {
            restrict: 'E',
            templateUrl: "file/src/LeadUpload/alertMessage.html",
            controller: 'LeadUploadController',
            controllerAs: 'LeadUploadCtrl'
        }
    };

    angular.module('Marketing').directive('alertMessage', [alertMessage]);

    angular.module('Marketing').controller('LeadUploadController', ['$rootScope', '$scope', '$window', 'parseFileService', 'sendToServerService', 'exportToXlsService',
        function LeadUploadController($rootScope, $scope, $window, parseFileService, sendToServerService, exportToXlsService) {
            var that = this;
            this.data = 77;
            this.partners = [];
            this.clearArr = false;

            this.selectedPartner;
            this.selectedBu;
            this.selectedUg;
            this.tmppath = '';
            this.uploadedLeads = [];

            this.collapseItemsNum = 0;
            this.leadCount = 0;
            this.fileName = '';
            this.progressBarWidth = 0;
            this.leadSuccessStatus = 0;
            this.leadSuccessFail = 0;
            this.index = 0;

            this.abortedLEadsTotal = 0;
            this.abortedSuccessLeads = 0;
            this.TotalFileName = 0;
            this.alertMsgDirective = '';
            this.alertTitleDirective = '';


            this.leadsData = {};
            this.languages = [
                {"code": "En", "name": "English"},
                {"code": "Ar", "name": "Arabic"},
                {"code": "Ru", "name": "Russian"},
                {"code": "Fr", "name": "French"},
                {"code": "De", "name": "Dutch"},
                {"code": "Es", "name": "Spanish"},
                {"code": "Cn", "name": "Chinese"}
            ];
            this.leadsData.lang = this.languages[0];
            this.leadsData.uploadAs = 'lead';

            this.fileStatuses = {WAITING: 0, IN_PROGRESS: 1, DONE: 2};
            this.fileStatus = -1;

            $scope.abortFile = function (file, $index) {
                try {
                    var message = sendToServerService.abortFile('abort', file);
                    file[0].progressData.status = "Aborted";
                    file[0].progressData.statusStyle = {orange: false, green: false, red: false, grey: true};

                    that.abortedLEadsTotal = file[0].progressData.leadCount;
                    that.abortedSuccessLeads = file[0].progressData.leadSuccessFail;
                    that.TotalFileName = file[0].progressData.fileName;

                    that.alertMsgDirective = that.TotalFileName +  ' was aborted. ' +  that.abortedSuccessLeads +  ' leads were '
                    + 'uploaded out of ' + that.abortedLEadsTotal +  ' .Summary of uploaded leads is avaliable in the history page';
                    that.alertTitleDirective = 'Aborted File';
                }

                catch (err) {
                }
            }

            $scope.checkIfVisible = function ($event, $index) {
                var prefix = $index;
                var id = '' + '#span' + prefix;
                if ($event.target.className.indexOf("btn") > -1) {

                    if (angular.element(id).attr('class').indexOf("plus") > -1) {
                        angular.element(id).attr("class", "glyphicon glyphicon-minus");
                    }
                    else {
                        angular.element(id).attr("class", "glyphicon glyphicon-plus");
                    }
                }

                else {

                    if ($event.target.className.indexOf("plus") > -1) {
                        $event.target.setAttribute("class", "glyphicon glyphicon-minus");
                    }
                    else {
                        $event.target.setAttribute("class", "glyphicon glyphicon-plus");
                    }
                }


                if ($event.target.closest(".copllapse-btn")) {
                    $scope.glyphicon = "glyphicon-plus";
                }
                else {
                    $scope.glyphicon = "glyphicon-minus";
                }
            }

            $scope.index = 0;
            var sockets = io.connect();
            sockets.on('lead', function (data) {
                // This section prepares the UI for each file, the condition makes sure that each file gets only one initilization
                if ((typeof $scope[data.fileId] == 'undefined')) {
                    $scope[data.fileId] = [];
                    $scope[data.fileId]['progressData'] = {};
                    $scope.index++;
                    $scope[data.fileId]['progressData'].index = $scope.index;
                    that.collapseItemsNum++;

                    // This loop handles the pending files.
                    // If new leads have arrived from a pending files, start uploading leads.
                    for (var i = 0; i < $scope.fileArr.length; i++) {
                        var length = $scope.fileArr[i].length - 1;
                        if ($scope.fileArr[i][0].progressData.status == "pending") {
                            $scope.fileArr[i] = [];
                            $scope[data.fileId]['progressData'].index = i;
                            $scope.index = i;
                            break;
                        }
                    }
                    // Prepare the general information for each lead
                    $scope[data.fileId]['progressData'].fileName = data.fileName;
                    $scope[data.fileId]['progressData'].leadSuccessFail = 0;
                    $scope[data.fileId]['progressData'].leadSuccessStatus = 0;
                    $scope[data.fileId]['progressData'].status = "In progress";
                    $scope[data.fileId]['progressData'].partner = data.partner;
                    $scope[data.fileId]['progressData'].statusStyle = {orange: true, green: false, red: false};


                    if (typeof $scope[data.fileId]['progressData'].leadCount === 'undefined') {
                        $scope[data.fileId]['progressData'].leadCount = that.leadCount;
                    }
                }


                var index = $scope[data.fileId]['progressData'].index;
                $scope[data.fileId].push(data);
                if (typeof $scope.fileArr[index] === 'undefined') {
                    $scope.fileArr[index] = [];
                }
                $scope.fileArr[index].push($scope[data.fileId]);

                // Calculate the presentages of the progress bar
                $scope[data.fileId]['progressData'].progressBarWidth = 100 * ($scope[data.fileId].length / $scope[data.fileId]['progressData'].leadCount) + '%';

                if (data.status == 'RC_OK') {
                    that.leadSuccessStatus++;
                    $scope[data.fileId]['progressData'].leadSuccessStatus++;
                }
                else {
                    that.leadSuccessFail++;
                    $scope[data.fileId]['progressData'].leadSuccessFail += 1;
                }

                // When file is done
                if ($scope[data.fileId]['progressData'].progressBarWidth == '100%') {
                    $scope[data.fileId]['progressData'].status = "Done";
                    $scope[data.fileId]['progressData'].statusStyle = {orange: false, green: true, red: false};
                    $scope[data.fileId] = [];
                }
                $scope.$apply();
            });

            sockets.on('connected', function (data) {
                that.socketId = data;
            });
            sockets.on('fileStatus', function (data) {
                that.fileStatus = data;
                $scope.$apply();
            });


            // Call sendToServerService with the spacific urk that will trigger the loadPartners function in the server
            sendToServerService.loadPartners("loadPartners", updatePartners);

            // this callback updates the partners
            function updatePartners(res) {
                that.partners = res.partners;
                that.selectedPartner = that.partners[0];
                that.selectedBu = that.selectedPartner.businessUnits[0];
                that.selectedUg = that.selectedBu.userGroups[0];
            }

            $scope.fileSelected = function (event) {
                that.tmppath = URL.createObjectURL(event.target.files[0]);
            };

            $scope.fileArr = [];
            this.parseFile = function () {
                that.fileName = document.getElementById("fileSelect").value;
                that.fileName = that.fileName.split("\\")[that.fileName.split("\\").length - 1];
                if (($scope.form.$valid) && $scope.checkFile(that.fileName)) {
                    parseFileService.handleFile(that.tmppath, that.prepareData, that.alertMsgDirective, that.alertTitleDirective);
                    var arr = [];
                    arr[0] = [];
                    arr['progressData'] = {
                        status: "pending",
                        statusStyle: {orange: false, green: false, red: true},
                        fileName: that.fileName
                    };
                    var length = $scope.fileArr.length;
                    $scope.fileArr[length] = [];
                    $scope.fileArr[length].push(arr);
                }
            };

            this.prepareData = function (leads) {
                var obj = {
                    socketId: that.socketId,
                    site: that.selectedPartner.partner_site,
                    ugid: that.selectedUg.ug_id,
                    lang: that.leadsData.lang.code,
                    affId: that.leadsData.affID,
                    tlid: that.leadsData.tlid,
                    ctag: that.leadsData.cTag,
                    adData: that.leadsData.adData,
                    leads: leads,
                    isUser: that.leadsData.uploadAs == 'user',
                    fileName: that.fileName.split("\\")[that.fileName.split("\\").length - 1]
                };

                sendToServerService.sendToServer('POST', 'upload', obj, that.updateLeadCount);

                // Clear the file field
                angular.element("#fileSelect").val('');
            };
            this.updateLeadCount = function (data) {
                that.leadCount = data.leadCount;
            };

            this.updateSelectedPartner = function (partner) {
                that.selectedBu = partner.businessUnits[0];
                that.selectedUg = partner.businessUnits[0].userGroups[0];
            };
            this.updateSelectedBU = function (bu) {
                that.selectedUg = bu.userGroups[0];
            };
            $scope.checkFile = function (file) {
                if (file != '') {
                    var fileExt = file.substr(file.length - 3);
                    if (fileExt != 'txt') {
                        alert('File type not supported. Please insert a unicode formatted txt file');
                    }
                    return (fileExt == 'txt')
                } else {
                    alert('Please insert a unicode formatted txt file');
                    return false;
                }
            };
            this.openHowTo = function () {
                window.open("file/getAffiliateData.html", "_blank", "height=940,width=1530")
            };
            $scope.exportData = function (arr) {
                var fileName = that.fileName.split("\\")[that.fileName.split("\\").length - 1].split('.txt')[0];
                console.log('file ', fileName);
                var obj = {leads: arr, fileName: fileName};
                sendToServerService.sendToServer('POST', 'getFile', obj, that.getTempFile);
            };

            this.getTempFile = function (data) {
                console.log(data.fileName);
                $window.open('/temp/' + data.fileName, "_self");
            }
        }]);
})();

(function () {
    function parseFileService($rootScope) {
        this.handleFile = function (file, callback, msg, title) {
            var data;
            $.get(file, function (d) {
                data = d;
                data = data.split(/\r?\n/);
                var lines = [];
                for (var i = 0; i < data.length; i++) {
                    lines.push(data[i].split(/[\t]+/));
                }
                createJson(lines, callback);
            });
        };


        function createJson(linesArr, callback, msg, title) {
            var keys = linesArr[0];
            var leads = [];
            try {
                for (var i = 1; i < linesArr.length; i++) {
                    if (linesArr[i][0] != '') {
                        var tmp = {};
                        for (var j = 0; j < keys.length; j++) {
                            tmp[keys[j]] = linesArr[i][j] ? linesArr[i][j].trim().replace(/['"]+/g, '') : linesArr[i][j];
                            if (keys[j] == 'PrimaryEmail') {
                                tmp[keys[j]] = linesArr[i][j].trim().replace(/\s/g, '').replace(/['"]+/g, '');
                            }
                        }
                        leads.push(tmp);
                    }
                }
            }
            catch (error) {

            }
            callback(leads);
        }
    }

    angular.module('Marketing')
        .service('parseFileService', ['$rootScope', parseFileService]);
})
();


(function () {
    function scContact () {
        return {
            restrict: 'E',
            templateUrl: 'file/src/Subchannels/scContact.html',
            link: function (scope, el, attrs) {
            }
        };
    }
    function scPayments () {
        return {
            restrict: 'E',
            templateUrl: 'file/src/Subchannels/scPayments.html',
            link: function (scope, el, attrs) {
            }
        };
    }
    function scPermissions () {
        return {
            restrict: 'E',
            templateUrl: 'file/src/Subchannels/scPermissions.html',
            link: function (scope, el, attrs) {
            }
        };
    }
    function scConfig () {
        return {
            restrict: 'E',
            templateUrl: 'file/src/Subchannels/scConfig.html',
            link: function (scope, el, attrs) {
            }
        };
    }

    angular.module('Marketing').directive('scContact', [scContact]);
    angular.module('Marketing').directive('scPayments', [scPayments]);
    angular.module('Marketing').directive('scPermissions', [scPermissions]);
    angular.module('Marketing').directive('scConfig', [scConfig]);
})();
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
(function () {
	function testPermissionWindow () {
		return {
			restrict: 'E',
			templateUrl: 'file/src/Subchannels/testPermissionWindow.html',
			controller: testPermController,
			controllerAs: 'PermCtrl',
			scope: {
				scId: '=',
				permission: '='
			},
			link: function (scope, el, attrs) {
			}
		};
	}

	angular.module('Marketing').directive('testPermissionWindow', [testPermissionWindow]);

	function testPermController ($scope, $element, $filter, sendToServerService) {
		var that = this;



		function createFieldsInputs () {
			{
				var fields = {};
				var lines = $scope.permission.url.split('[@');
				for (var c = 1; c < lines.length; c++) {
					var index = lines[c].indexOf(']');
					var key = lines[c].slice(0, index);
					fields[key] = createField(key);
				}
				return fields;
			}
		}
		function createField (key){
			var ans = {};
			ans.title = camelcaseToSpaces(key);
			ans.isDisplay = true;
			switch (key) {
				case 'affiliateId':
					//ans.value = 101;

					ans.value = $scope.scId;
					ans.isDisplay = false;
					break;
				case 'fromDate':
					ans.type = 'date';
					ans.value = createDate(7);
					break;
				case 'toDate':
					ans.type = 'date';
					ans.max = $filter('date')(ans.value, "yyyy-MM-dd");
					ans.value = createDate(0);
					break;
				case 'PagingIndex':
				case 'cardTypeId':
					ans.type = 'number';
					ans.min = 1;
					ans.value = 1;
					break;
				case 'email':
					ans.type = 'email';
					ans.value = 'test@test.com';
					break;
				case 'firstName':
				case 'lastName':
					ans.type = 'text';
					ans.value = 'Test';
					break;
				case 'cardHolderName':
					ans.type = 'text';
					ans.value = 'Test Test';
					break;
				case 'phoneNumber':
					ans.type = 'text';
					ans.value = '123456';
					break;
				case 'tlid':
					ans.type = 'text';
					ans.value = '111111';
					break;
				case 'countryCode':
					ans.type = 'text';
					ans.value = 'GB';
					break;
				case 'password':
					ans.type = 'text';
					ans.value = '123456';
					break;
				case 'userId':
				case 'stake':
				case 'depositAmount':
					ans.type = 'number';
					break;
				case 'aboveBelow':
					ans.type = 'select';
					ans.options = ['Above', 'Below'];
					ans.value = ans.options[0];
					break;
				case 'default':
					ans.type = 'select';
					ans.options = ['0', '1'];
					ans.value = ans.options[1];
					break;
			}
			return ans;
		}

		function camelcaseToSpaces (str) {
			return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase();})
		}

		function createDate (daysToReduce) {
			var d = new Date();
			if (daysToReduce)
				d.setDate(d.getDate()-daysToReduce);
			return d;

		}
		function createDateString (d) {
			return $filter('date')(d, "yyyy-MM-dd 00:00:00");

		}
		this.closePopup = function() {
			$element.remove();

		};

		this.parsePermissionUrl = function () {
			var separators = ['\\\[', '\\\]'];
			var p = $scope.permission.url.split(new RegExp(separators.join('|'), 'g'));
			for (var i in p) {
				if (p[i].indexOf('@') == 0) {
					if (typeof (that.allParams[p[i].substr(1)].value) == 'object' && that.allParams[p[i].substr(1)].value instanceof Date) {
						p[i] = createDateString(that.allParams[p[i].substr(1)].value);
					} else {
						p[i] = that.allParams[p[i].substr(1)].value;
					}

				}
			}
			that.testURL = angular.toJson(p.join(''),true).replace(/"/g, '').replace(/'/g, '"');

		};

		this.validateFields = function (){
			sendRequest();
		};

		function sendRequest() {
			that.response = '';
			var response = sendToServerService.sendToAPISerer(that.testURL);
			response.then(function (response) {
				that.response = angular.toJson(response.data,true);
			});
		}

		function init() {
			that.scId = $scope.scId;
			that.allParams = createFieldsInputs();
			that.parsePermissionUrl();
			that.response = '';
		}

		init();

	}
	angular.module('Marketing').controller('testPermissionWindow', ['$scope', '$element', '$filter', 'sendToServerService', testPermController]);
})();


(function() {
	function exportToXlsService () {
		this.JSONToCSVConvertor = function (JSONData, ReportTitle, ShowLabel) {
			//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
			var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

			var CSV = '';
			//This condition will generate the Label/Header
			if (ShowLabel) {
				var row = "";

				//This loop will extract the label from 1st index of on array
				for (var index in arrData[0]) {

					//Now convert each value to string and comma-seprated
					row += index + ',';
				}

				row = row.slice(0, -1);

				//append Label row with line break
				CSV += row + '\r\n';
			}

			//1st loop is to extract each row
			for (var i = 0; i < arrData.length; i++) {
				var row = "";

				//2nd loop will extract each column and convert it in string comma-seprated
				for (var index in arrData[i]) {
					row += '"' + arrData[i][index] + '",';
				}

				row.slice(0, row.length - 1);

				//add a line break after each row
				CSV += row + '\r\n';
			}

			if (CSV == '') {
				alert("Invalid data");
				return;
			}

			//Generate a file name
			var fileName = "";
			//this will remove the blank-spaces from the title and replace it with an underscore
			fileName += ReportTitle.replace(/ /g,"_");

			//Initialize file format you want csv or xls
			var uri = 'data:text/xls;charset=utf-8,' + escape(CSV);

			// Now the little tricky part.
			// you can use either>> window.open(uri);
			// but this will not work in some browsers
			// or you will not get the correct file extension

			//this trick will generate a temp <a /> tag
			var link = document.createElement("a");
			link.href = uri;

			//set the visibility hidden so it will not effect on your web-layout
			link.style = "visibility:hidden";
			link.download = fileName + ".csv";

			//this part will append the anchor tag and remove it after automatic click
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
	angular.module('Marketing')
		.service('exportToXlsService', [exportToXlsService]);
})();

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
(function () {
    function sendToServerService($http, config) {
        this.sendToServer = function (method, url, data, callback, additionalData) {
            if (method == 'GET') {
                var url = config.SERVER_URL + url;
                $http.get(url).success(function (data) {
                    additionalData ? callback(data, additionalData) : callback(data);
                })
            } else {
                var url = config.SERVER_URL + url;
                $http.post(url, data).success(function (data) {
                    additionalData ? callback(data, additionalData) : callback(data);
                })
            }
        };

        this.abortFile = function (url, data) {
            var fileId = data[0][0];
            $http.post(url, fileId).success(function () {
            });
        }

        this.loadPartners = function (url, updatePartners) {
            $http.get(url).success(function (res) {
                updatePartners(res);
            });
        }

        this.sendToAPISerer = function (url) {
            return $http.get(config.API_SERVER_URL + url);
        }

        this.loadPartners = function (url, updatePartners) {
            $http.get(url).success(function (res) {
                updatePartners(res);
            });
        }
    }

    angular.module('Marketing').service('sendToServerService', ['$http', 'config', sendToServerService]);
})();

//define(['app', 'angular', 'ngMock'], [], function(){
//
//    return function init(sandbox){
//        var app, application = app = sandbox.app
//            , globals = sandbox.globals;
//
//        return {
//            some: 'module'
//        };
//    };
//
//});define(['app', 'angular', 'ngMock'], [], function(){
//
//    return function init(sandbox){
//        var app, application = app = sandbox.app
//            , globals = sandbox.globals;
//
//        return {
//            some: 'module'
//        };
//    };
//
//});
(function() {
	function collectionDirective () {

		return {
			restrict: "E",
			replace: true,
			scope: {
				collection: '=',
				parent: '=',
				sc: '='
			},
			templateUrl: "file/src/tree/treeCollection.html"
		};
	}

	angular.module('Marketing').directive('collection', collectionDirective);

	function memberDirective ($compile) {
		return {
			restrict: "E",
			replace: true,
			scope: {
				member: '=',
				parent: '=',
				sc:'='
			},
			controller: function ($scope, $element) {
				$scope.checkedChanged = function (m) {
					if ((!m.isAllowed && m.children)) {
						for (c in m.children) {
							m.children[c].isAllowed = m.isAllowed;
							$scope.checkedChanged(m.children[c]);
						}
					}
				};
				$scope.openTestWindow = function () {
					/*console.log($scope.sc);
					console.log($scope.member);*/
					$element.append("<test-permission-window sc-id='sc.id' permission='member'></test-permission-window>");
					$compile($element.contents())($scope);
				}
			},
			templateUrl: "file/src/tree/treeMember.html", link: function (scope, element, attrs) {
				if ((scope.member.children)) {
					element.append("<collection collection='member.children' parent='member' sc='sc'></collection>");
					$compile(element.contents())(scope);
				}
			}
		};
	}

	angular.module('Marketing').directive('member', ['$compile', memberDirective]);
})();
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