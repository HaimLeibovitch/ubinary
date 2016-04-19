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

