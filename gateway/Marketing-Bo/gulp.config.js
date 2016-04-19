module.exports = function () {
    var server = './src/server/';

    var config = {
        // all js to vet
        alljs: [
            'src/Marketing.module.js',
            'src/LeadUpload/*.js',
            'src/Subchannels/*.js',
            'src/*.js',
            'src/**/*.js'
        ],

        index: './index.html',

        js: [
            'dist/app.js',
        ],

        jsBower: [
            './bower_components/**/*.js'
        ],

        server: server,

        bower: {
            json: require('./bower.json'),
            cdw: 'file/bower_components/',
            ignorePath: '../..'
        },

        // Node settings
        defaultPort: 3000,
        nodeServer: './src/server/app.js'

    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        }
        return options;
    };
    return config;
}
