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