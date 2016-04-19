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