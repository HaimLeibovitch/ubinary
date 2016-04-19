
/* **************** HOW COME THE DEFAULT (Karma-generated) CONFIGURATION DOES ***NOT WORK???
 var allTestFiles = [];
 var TEST_REGEXP = /(spec|test)\.js$/i;

 var pathToModule = function(path) {
 return path.replace(/^\/base\//, '').replace(/\.js$/, '');
 };

 Object.keys(window.__karma__.files).forEach(function(file) {
 if (TEST_REGEXP.test(file)) {
 // Normalize paths to RequireJS module names.
 allTestFiles.push(pathToModule(file));
 }
 });
 */

//var tests = [];
//for (var file in window.__karma__.files) {
//    if (/Spec\.js$/.test(file)) {
//        tests.push(file);
//    }
//}
//
//require.config({
//    // Karma serves files under /base, which is the basePath from your config file
//    baseUrl: '/base',
//
//    paths: {
//
//        angular: '../bower_components/angular/angular',
//        ngMock: '../bower_components/angular-mocks/angular-mocks',
//        jquery: '../bower_components/jquery/dist/jquery',
//        app: '../dist/app',
//        models: 'models',
//        controllers: 'controllers',
//        globals: 'globals',
//        routeMap: 'routeMap'
//    },
//    shim: {
//        angular: {
//            exports: 'angular'
//        },
//        ngMock: {
//            exports: 'ngMock'
//        },
//        app: {
//            exports: 'app'
//        }
//    },
//
//    // dynamically load all test files
//    //deps: allTestFiles,
//    //
//    deps: tests,
//
//    // we have to kickoff jasmine, as it is asynchronous
//    callback: window.__karma__.start
//});