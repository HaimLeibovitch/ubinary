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
