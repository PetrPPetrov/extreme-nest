// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const validator = require('jsonschema');
const common = require('./common');
const httpStatusCodes = require('../httpStatusCodes');
const nesting = require('../nesting/nestingRequest');
const jsonSchema = require('../../resources/job_schema');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onNestingRequest = (request, response) => {
    log.debug('onNestingRequest(request, response)');
    const nestingRequest = common.getRequestBody(request);
    if (!nestingRequest) {
        log.debug('Nesting request is incorrect');
        common.sendRequestParsingError(response);
        return;
    }

    const jsonValidator = new validator.Validator();
    const validationResult = jsonValidator.validate(nestingRequest, jsonSchema);
    if (!validationResult.valid) {
        log.debug('JSON scheme validation failure');
        common.sendRequestValidationError(response, validationResult.errors);
        return;
    }

    const orderID = nesting.processNestingRequest(nestingRequest);
    log.debug('OrderID ' + orderID);
    sendNestingOrderID(response, orderID);
};

function sendNestingOrderID(response, orderID){
    response
        .status(httpStatusCodes.CREATED)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(JSON.stringify({
            message : 'Nesting order submitted',
            nesting_order_id : orderID
        }));
}
