// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const log4js = require('log4js');

const httpStatusCodes = require('../httpStatusCodes');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onRequest = (request, response, status) => {
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
    response
        .status(httpStatusCodes.BAD_REQUEST)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "messgae" : "An error occured."
        });
}

function onUnauthorized(request, response) {
    response
        .status(httpStatusCodes.UNAUTHORIZED)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message" : "Incorrect authentication."
        });
}

function onNotFound(request, response) {
    response
        .status(httpStatusCodes.NOT_FOUND)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message" : "This nesting order does not exist."
        });
}

function onNotAcceptable(request, response) {
    response
        .status(httpStatusCodes.NOT_ACCEPTABLE)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            "message" : "This API requests json format."
        });
}