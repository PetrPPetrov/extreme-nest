// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const common = require('./common');
const httpStatusCodes = require('../httpStatusCodes');
const nesting = require('../nesting/nestingRequest');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onFullRequest = (request, response) => {
    log.debug(`onFullRequest(request, response), OrderID ${request.params.id}`);

    const id = parseInt(request.params.id);
    if (!nesting.nestingOrders.has(id)) {
        log.debug(`OrderID ${id} does not exist`);
        common.sendAbsenceNestingOrder(response);
        return;
    }

    const order = nesting.nestingOrders.get(id);

    if (order.error) {
        log.debug(`OrderID ${id} caused some error, error = ${order.errorObject}`);
        common.sendRequestValidationError(response, [order.errorObject.toString()]);
        return;
    }

    if (!order.ready) {
        log.debug(`OrderID ${id} is still computing`);
        common.sendStillComputing(response);
        return;
    }

    response
        .status(httpStatusCodes.OK)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(order.fullResult);
};
