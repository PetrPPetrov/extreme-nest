// Copyright (c) 2018 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Gkm-World project.
// This software is intellectual property of GkmSoft.

const log4js = require('log4js');

const httpStatusCodes = require('../httpStatusCodes');

module.exports.onRequest = (request, response, status) => {
    const log = log4js.getLogger(__filename);
    log.level = 'debug';

    switch (status) {
        case httpStatusCodes.BAD_REQUEST:
            log.debug('Request came to the error handler with status ' + httpStatusCodes.BAD_REQUEST);
            return onBadRequest(request, response);
        case httpStatusCodes.UNAUTHORIZED:
            log.debug('Request came to the error handler with status ' + httpStatusCodes.UNAUTHORIZED);
            return onUnauthorized(request, response);
        case httpStatusCodes.NOT_FOUND:
            log.debug('Request came to the error handler with status ' + httpStatusCodes.NOT_FOUND);
            return onNotFound(request, response);
        case httpStatusCodes.NOT_ACCEPTABLE:
            log.debug('Request came to the error handler with status ' + httpStatusCodes.NOT_ACCEPTABLE);
            return onNotAcceptable(request, response);
    }
};

function onBadRequest(request, response) {
    response.status(httpStatusCodes.BAD_REQUEST).send("An error occured.");
}

function onUnauthorized(request, response) {
    response.status(httpStatusCodes.UNAUTHORIZED).send("Incorrect authentication.");
}

function onNotFound(request, response) {
    response.status(httpStatusCodes.NOT_FOUND).send("This nesting order does not exist.");
}

function onNotAcceptable(request, response) {
    response.status(httpStatusCodes.NOT_ACCEPTABLE).send("This API requests json format.");
}