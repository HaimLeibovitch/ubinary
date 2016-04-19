### Connecting to the Gateway
Here will go an explanation on the different ways to connect to the gateway

### Request Message Format
Here will go an explanation on the gateway requests message format

### Response Message Format
Here will go an explanation on the gateway response message format 

### General Error Codes
Each service will have its own error codes, here is a list of all the general error codes:

* INTERNAL_ERROR - Internal error: `A description of the internal error`
* SERVICE_ERROR - Service error: `A description of the service error`
* UNSUPPORTED_CONNECTION - Please use a persistent connection (i.e socket.io) 
* METHOD_NOT_AVAILABLE_FOR_GUEST - Guest user can not call this method
* MISSING_ARGUMENT - Missing argument `The missing argument name`
* INVALID_ARGUMENT - Invalid argument `Detailed explanation`
* INVALID_ARGUMENT_TYPE - Invalid argument `argument name`. Expecting type: `argument expected type`, instead got: `argument type received`
* MISSING_QUALIFIER - Request message missing a qualifier
* INVALID_QUALIFIER - Invalid qualifier: `Detailed explanation`
* INVALID_REQUEST - Invalid request
* INVALID_TOKEN - The authentication token is invalid
