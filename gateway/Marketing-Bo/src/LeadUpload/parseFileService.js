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

