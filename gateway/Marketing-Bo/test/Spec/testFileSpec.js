
describe("Marketing", function () {
    beforeEach(module('Marketing'));
    describe("LeadUploadController", function () {
        var parseFileService = {};
        var scope;
        var movieData = {};
        var $httpBackend;
        beforeEach(inject(function ($rootScope, $controller, _parseFileService_) {
            scope = $rootScope.$new();
            $controller('LeadUploadController', {
                $scope: scope,
            });
            parseFileService = _parseFileService_;
        }));


        it("checkFile function should return true", function () {
            expect(scope.checkFile("test.txt")).toBe(true);
        });

        it("Check if handle file was called", function () {
            spyOn(parseFileService, 'handleFile').and.callThrough();
            parseFileService.handleFile();
            expect(parseFileService.handleFile).toHaveBeenCalled();
        });

        it("Abort file", function () {
            var file = [];
            file[0] = {};
            file[0]['progressData'] = {
                "index": 1,
                "fileName": "file1.txt",
                "leadSuccessFail": 2,
                "leadSuccessStatus": 0,
                "status": "In progress",
                "partner": "uBinary",
                "statusStyle": {"orange": true, "green": false, "red": false},
                "leadCount": 13,
                "progressBarWidth": "15.384615384615385%"
            };
            expect(scope.abortFile).not.toThrow();
        });
    });
});


//define(['app', 'angular', 'ngMock'], function () {
//    beforeEach(module('Marketing'));
//    describe("LeadUploadController", function () {
//        var parseFileService = {};
//        var scope;
//        var movieData = {};
//        var $httpBackend;
//        beforeEach(inject(function ($rootScope, $controller, _parseFileService_) {
//            scope = $rootScope.$new();
//            $controller('LeadUploadController', {
//                $scope: scope,
//            });
//            parseFileService = _parseFileService_;
//        }));
//
//
//        it("checkFile function should return true", function () {
//            expect(scope.checkFile("test.txt")).toBe(true);
//        });
//
//        it("Check if handle file was called", function () {
//            spyOn(parseFileService, 'handleFile').and.callThrough();
//            parseFileService.handleFile();
//            expect(parseFileService.handleFile).toHaveBeenCalled();
//        });
//
//        it("Abort file", function () {
//            var file = [];
//            file[0] = {};
//            file[0]['progressData'] = {
//                "index": 1,
//                "fileName": "file1.txt",
//                "leadSuccessFail": 2,
//                "leadSuccessStatus": 0,
//                "status": "In progress",
//                "partner": "uBinary",
//                "statusStyle": {"orange": true, "green": false, "red": false},
//                "leadCount": 13,
//                "progressBarWidth": "15.384615384615385%"
//            };
//            expect(scope.abortFile).not.toThrow();
//        });
//    });
//
//    it("checkFile function should return true", function () {
//        expect(1).toBe(1);
//    });
//});