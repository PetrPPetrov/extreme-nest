// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const log4js = require('log4js');

const nesting = require('../nesting/nesting');
const errorHandler = require('./errorHandler');
const httpStatusCodes = require('../httpStatusCodes');

module.exports.onRequest = (request, response) => {
    const log = log4js.getLogger(__filename);
    log.level = 'debug';
    log.debug('Request was came to the nesting handler');

    let requestBody = getRequestBody(request);
    if (!requestBody) {
        log.debug("Request body is incorrect.");
        errorHandler.onRequest(request, response, httpStatusCodes.NOT_ACCEPTABLE);
    }

    const nestingResult = nesting.optimizeNesting(requestBody);
    if (nestingResult) {
        log.debug("Successful nesting optimization.");
        sendNestingOrderID(response, nestingResult);
    } else {
        log.debug("Incorrect nesting optimization.");
        sendErrorNestingOptimization(response)
    }
};

function getRequestBody(request) {
    try {
        return request.body;
    } catch(e) {
        return null;
    }
}

function sendNestingOrderID(response, result){
    response.status(httpStatusCodes.CREATED).send(JSON.stringify({
        message : "Nesting order submitted.",
        nesting_order_id : result
    }));
}

function sendErrorNestingOptimization(response) {
    response.status(httpStatusCodes.BAD_REQUEST).send(JSON.stringify({
        message : "An error occured.",
        errors : [
            {
                path : ["parts", 0, "instances", 0, "orientations"],
                message : "[] is too short",
                error_code : -3000
            }
        ]
    }));
}