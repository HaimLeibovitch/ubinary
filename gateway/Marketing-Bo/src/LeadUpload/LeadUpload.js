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
