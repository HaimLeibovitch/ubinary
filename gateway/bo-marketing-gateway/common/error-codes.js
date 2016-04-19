var ApplicationError = require('open-api-gateway-core/common/error.js').ApplicationError,
	SystemError = require('open-api-gateway-core/common/error.js').SystemError;

module.exports.SystemErrors = require('open-api-gateway-core/common/error-codes.js').SystemErrors;
module.exports.ApplicationErrors = require('open-api-gateway-core/common/error-codes.js').ApplicationErrors;

/**
 * Backward compatibility.
 * @type {Object.<string, ApplicationError>}
 * @deprecated Use `ApplicationErrors` instead.
 */
module.exports.GatewayErrors = module.exports.ApplicationErrors;

// Extend core's system errors
Object.defineProperties(module.exports.SystemErrors, {
	// Service Related
	ERR_PLATFORM_ERROR: {get: function GET_ERR_PLATFORM_ERROR() { return new SystemError(10000, 'Platform returned error, service: %s, code: %s, message: %s, params:', GET_ERR_PLATFORM_ERROR); }},
	ERR_UPLOAD_ERROR: {get: function GET_ERR_UPLOAD_ERROR() { return new SystemError(10001, 'Upload error:', GET_ERR_UPLOAD_ERROR); }},
	ERR_HOST_NOT_ALLOWED: {get: function GET_ERR_HOST_NOT_ALLOWED() { return new ApplicationError('ERR_HOST_NOT_ALLOWED', 'Host `%s` is not allowed to:', GET_ERR_HOST_NOT_ALLOWED); }},

	// Trading platform
	ERR_INVALID_QUOTE: {get: function GET_ERR_INVALID_QUOTE() { return new SystemError(20000, 'Received invalid quote: %s', GET_ERR_INVALID_QUOTE); }},

	// BO
	ERR_BO_ERROR: {get: function GET_ERR_BO_ERROR() { return new SystemError(30000, 'Bo returned error, service: %s, code: %s, message: %s, params:', GET_ERR_BO_ERROR); }},

	// Facebook
	ERR_FB_ERROR: {get: function GET_ERR_FB_ERROR() { return new SystemError(40000, 'Facebook returned error, service: %s, code: %s, message: %s, type: %s, fbTraceId: %s, params: %j, batchReqIdx: %s', GET_ERR_FB_ERROR); }}
});

// Extend the core's gateway errors
Object.defineProperties(module.exports.ApplicationErrors, {

});
