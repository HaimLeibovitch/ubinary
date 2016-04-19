var ERRORS = require('open-api-gateway-core/common/error-codes.js').SystemErrors,
	logger = require('open-api-gateway-core/common/logger.js').useContext('gw/jobs/server'),
	JobBase = require('./jobs/job-base.js');

logger.info('Starting the JobServer');

var GENERIC_JOB_ID = 'GENERIC_JOB_';
var jobId = 0;

var JobServer = module.exports = {};

JobServer.jobs = {};

/**
 * Gets a job by id
 * @param id The job id
 * @returns {*} The required jop object
 */
JobServer.get = function(id) {
	return JobServer.jobs[id];
};

/**
 * Adds a new job to the job server. If the job has no id a new one will be assigned to it.
 * @param job The job to add.
 * @param [start] Optional. Whether or not start the new job, default is false.
 */
JobServer.add = function(job, start) {
	if (!(job instanceof JobBase)) {
		throw ERRORS.ERR_INVALID_ARGUMENTS('job must be of type JobBase');
	}

	// If this job has no id create a new one, otherwise make sure this id is not used.
	if (!job.id) {
		job.id = GENERIC_JOB_ID + (++jobId);
	} else if (JobServer.jobs[job.id]) {
		throw ERRORS.ERR_JOB_DUPLICATE_ID.formatMessage(job.id);
	}

	JobServer.jobs[job.id] = job;

	if (start) {
		job.start();
	}
};

/**
 * Removes (and stops) the job with the specified id from the job server
 * @param id The jop id.
 */
JobServer.remove = function(id) {
	if (JobServer.jobs[id]) {
		JobServer.jobs[id].stop();
		delete JobServer.jobs[id];
	}
};

/**
 * Checks whether a job with the specified id exists in the job server.
 * @param id The job id to check
 */
JobServer.contains = function(id) {
	return JobServer.jobs.hasOwnProperty(id);
};

/**
 * Starts the job with the specified id
 * @param id The job id
 */
JobServer.start = function(id) {
	var job = this.get(id);
	if (job) {
		job.start();
	}
};

/**
 * Stops the job with the specified id
 * @param id The job id
 */
JobServer.stop = function(id) {
	var job = this.get(id);
	if (job) {
		job.stop();
	}
};
