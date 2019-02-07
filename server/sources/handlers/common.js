// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const httpStatusCodes = require('../httpStatusCodes');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.getRequestBody = (request) => {
    try {
        return request.body;
    } catch(e) {
        log.debug('Request body is incorrect');
        return false;
    }
};

module.exports.sendRequestParsingError = (response) => {
    response
        .status(httpStatusCodes.NOT_ACCEPTABLE)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            message : 'This API requests json format'
        });
};

module.exports.sendAbsenceNestingOrder = (response) => {
    response
        .status(httpStatusCodes.NOT_FOUND)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            message : 'This nesting order does not exist'
        });
};

module.exports.sendStillComputing = (response) => {
    response
        .status(httpStatusCodes.STILL_COMPUTING)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send({
            message : 'This nesting order is still computing'
        });
};

module.exports.sendRequestValidationError = (response, errors) => {
    response
        .status(httpStatusCodes.BAD_REQUEST)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(JSON.stringify({
            message : 'An error occurred',
            errors : errors
        }));
}

module.exports.sendErrorObjects = (response, errors) => {
    response
        .status(httpStatusCodes.BAD_REQUEST)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(errors);
}
