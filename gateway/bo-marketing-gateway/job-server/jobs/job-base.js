var ERRORS = require('open-api-gateway-core/common/error-codes.js').SystemErrors,
	logger = require('open-api-gateway-core/common/logger.js').useContext('gw/jobs/base'),
	metrics = require('open-api-gateway-core/common/metrics.js'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

//<editor-fold desc="// Metrics {...}">

// Metric namespace
// gwapi.qa.qa-gwapi01.1.jobs.<job.constructor.name>
// For example:
// gwapi.qa.qa-gwapi01.1.jobs.TradingInfoJob

var METRICS_BUCKET_NS = 'jobs';

//</editor-fold> // Metrics

/**
 * A handler method to handle the interval work.
 * @param self The "this" reference of the job instance.
 * @param interval The job interval.
 */
function onTimeout(self, interval) {
	// Call the job to do its work.
	self.doWork(function() {
		// If interval is 0 that was a one-time job.
		if (interval === 0) {
			// Check if we should stop this one-time job.
			if (self.autoStop) {
				self.stop();
			}

			return;
		}
		//Ignite timer only if job still running (not ordered to stop)
		if (self.running) {
			// Reset the timer according to the interval.
			self.innerJob = setTimeout(function cbOnTimeout() {onTimeout(self, interval);}, interval);
		}
	});
}

/**
 * Creates a new JobBase instance.
 * @param {number} [interval=0] - The job interval in milliseconds, if 0 it's a one-time job.
 * @param {number} [startIn=100] - The time in milliseconds to wait before starting the job interval.
 * @param {boolean} [autoStop=true] - In case of a one-time job, whether or not to stop the task automatically,
 *                                    if false it means that the job is "allowed" for background work (do work outside the "doWork" method).
 * @param {string} [metricsBucket=''] - The metrics bucket to use for this job (empty string disables the feature).
 * @constructor {JobBase}
 * @abstract
 */
function JobBase(interval, startIn, autoStop, metricsBucket) {
	EventEmitter.call(this);

	// Public vars
	this.id = '';
	this.interval = interval || 0;
	this.startIn = startIn || 100;
	this.autoStop = typeof autoStop === 'boolean' ? autoStop : true;
	this.running = false;
	this.innerJob = null;
	this.metricsBucket = metricsBucket ? METRICS_BUCKET_NS + '.' + metricsBucket : '';
}
util.inherits(JobBase, EventEmitter);

/**
 * Starts the job, if it's already running the job is restarted.
 */
JobBase.prototype.start = function() {
	if (this.running) {
		this.stop();
	}
	this.running = true;

	logger.trace('Starting job, id:', this.id);
	var self = this;
	this.innerJob = setTimeout(function onStartTimeout() { onTimeout(self, self.interval); }, this.startIn);

	// Metrics
	if (this.metricsBucket) {
		if (!metrics.isRegisteredGauge(this.metricsBucket)) {
			metrics.registerGauge(this.metricsBucket);
		}

		metrics.changeGauge(this.metricsBucket, +1);
	}
};

/**
 * Stops the job.
 */
JobBase.prototype.stop = function() {
	if (!this.running) {
		return;
	}

	logger.trace('Stopping job, id:', this.id);

	if (this.innerJob) {
		clearTimeout(this.innerJob);
		this.innerJob = null;
	}

	this.running = false;

	// Metrics
	if (this.metricsBucket && metrics.isRegisteredGauge(this.metricsBucket)) {
		var remaining = metrics.changeGauge(this.metricsBucket, -1);
		if (remaining === 0) {
			metrics.unregisterGauge(this.metricsBucket);
		}
	}
};

/**
 * This is the "work" method that each job will have to implement, it will be run on each interval.
 * @param done A function to call by deriving classes when they finished the job work.
 * @abstract
 */
JobBase.prototype.doWork = function(done) {
	throw ERRORS.ERR_NOT_IMPLEMENTED;
};

module.exports = JobBase;
