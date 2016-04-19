'use strict';
var path = require('path'),
	fs = require('fs');


//<editor-fold desc="// Paths {...}">

// Find the path of open-api-gateway-core (it is not necessarily under node_modules in dev env).
var corePath = '';
var corePossiblePaths = require('module')._resolveLookupPaths('open-api-gateway-core', module);
corePossiblePaths = corePossiblePaths[1];
for (var i = 0; i < corePossiblePaths.length; ++i) {
	corePath = path.resolve(corePossiblePaths[i], 'open-api-gateway-core');
	if (fs.existsSync(corePath)) {
		break;
	}
	corePath = '';
}

var PATHS = {
	CLIENT_CORE_SDK: path.join(corePath, 'frontend', 'client', 'sdk'),
	CLIENT_SDK: path.join('frontend', 'client', 'sdk'),
	CLIENT_BUILD: path.join('frontend', 'client', 'deploy'),
	CLIENT_SOCKET_IO: path.join(corePath, 'node_modules', 'socket.io', 'node_modules', 'socket.io-client', 'dist'),
	JSDOC_BUILD: path.join('frontend', 'client', 'deploy', 'docs')
};

//</editor-fold>

var lintables = [
	'**/*.js',
	'!node_modules/**',
	'!bench/**',
	// Contains 3rd party code
	'!' + path.join(PATHS.CLIENT_BUILD, '**'),
	'!' + path.join(PATHS.JSDOC_BUILD, '**'),
	'!' + path.join(PATHS.CLIENT_CORE_SDK, '**', '*.min.js')
];

var lintablesSDK = [
	path.join(PATHS.CLIENT_CORE_SDK, '**', '*.js'),
	path.join(PATHS.CLIENT_SDK, '**', '*.js'),
	'!' + path.join(PATHS.CLIENT_CORE_SDK, '**', '*.min.js')
];

module.exports = function(grunt) {
	// Bulk load all tasks
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				force: false,
				jshintrc: true
			},
			sdk: lintablesSDK,
			report: {
				options: {
					reporterOutput: 'tmp/jshint.xml'
				},
				files: {
					all: lintables
				}
			}
		},
		jscs: {
			options: {
				force: true,
				config: true
			},
			sdk: lintablesSDK,
			files: {
				src: lintables
			}
		},
		cat: {
			jshint: { file: 'tmp/jshint.xml' }
		},
		clean: {
			options: { 'no-write': false }, // Debugging: Set to true to make the task only tell you what's going to happen.
			conf: [path.join(process.env.GW_CONFIG_DIR || __dirname, process.env.GW_CONFIG_FILE || '.config.json')],  // Delete dynamically created config file (created by us).
			docs: [path.join(PATHS.JSDOC_BUILD, '**', '*')],  // Delete inner structure by 3rd party.
			tmp: [path.join('tmp', '**', '*.*')],
			sdk: [
				path.join(PATHS.CLIENT_BUILD, '**', '*.*'),   // Delete all files recursively, but keep folder structure.
				'!' + path.join(PATHS.JSDOC_BUILD, '**')      // Ignore the JSDoc folder.
			]
		},
		concat: {
			options: {
				separator: grunt.util.linefeed,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */' + grunt.util.linefeed,
				footer: '',
				stripBanners: true,
				process: false
			},

			// Must have sub-tasks.
			all: {
				src: [
					// NOTE Order is important
					path.join(PATHS.CLIENT_SOCKET_IO, 'socket.io.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'index.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'message-types.js'),
					path.join(PATHS.CLIENT_SDK, 'message-types.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'event-emitter.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'sockets', 'socket.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'sockets', '*-socket.js'),
					'!' + path.join(PATHS.CLIENT_CORE_SDK, 'sockets', 'tcp-socket.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'sockets', 'factory.js'),
					path.join(PATHS.CLIENT_CORE_SDK, 'connector.js'),
					path.join(PATHS.CLIENT_SDK, 'services-api.js')
				],
				dest: path.join(PATHS.CLIENT_BUILD, 'gateway.js'),

				// Task options
				nonull: true
			}
		},
		uglify: {
			all: {
				files: [
					{
						expand: true,
						cwd: PATHS.CLIENT_BUILD,
						dest: PATHS.CLIENT_BUILD,
						src: '**.js',
						ext: '.min.js'
					}
				]
			}
		},
		copy: {
			all: {
				files: [
					{
						expand: true,
						flatten: true,
						cwd: PATHS.CLIENT_CORE_SDK,
						src: ['proxy.html', 'xdomain.min.js'],
						dest: PATHS.CLIENT_BUILD
					}
				],

				// Task options
				nonull: true
			}
		},
		jsdoc: {
			all: {
				src: [path.join('docs', '**', '*.jsdoc'), path.join('docs', 'README.md')],
				dest: PATHS.JSDOC_BUILD,
				options: {
					configure: path.join('docs', 'conf.json')
				}
			}
		},
		watch: {
			sdk: {
				files: [path.join(PATHS.CLIENT_CORE_SDK, '**'), path.join(PATHS.CLIENT_SDK, '**')],
				tasks: ['sdk']
			},
			docs: {
				files: [path.join('docs', '**')],
				tasks: ['docs']
			}
		}
	});

	//<editor-fold desc="// Tasks {...}">

	grunt.registerTask('default', ['build']);
	grunt.registerTask('all', ['build']);
	grunt.registerTask('build', ['clean', 'jshint:report', 'cat:jshint', 'concat', 'uglify', 'copy', 'jsdoc']);
	grunt.registerTask('lint', ['jshint', 'cat:jshint']);

	grunt.registerTask('docs', ['clean:docs', 'jsdoc']);
	grunt.registerTask('sdk', ['clean:sdk', 'jshint:sdk', 'concat', 'uglify', 'copy']);

	//</editor-fold>
};
