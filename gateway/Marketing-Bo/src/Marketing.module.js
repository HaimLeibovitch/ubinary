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

