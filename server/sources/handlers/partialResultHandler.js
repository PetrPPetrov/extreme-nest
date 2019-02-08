// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const common = require('./common');
const nesting = require('./nestingRequest');
const httpStatusCodes = require('../httpStatusCodes');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports.onPartialRequest = (request, response) => {
    log.debug(`onPartialRequest(request, response), OrderID ${request.params.id}`);

    const id = parseInt(request.params.id);
    if (!nesting.nestingOrders.has(id)) {
        log.debug(`OrderID ${id} does not exist`);
        common.sendAbsenceNestingOrder(response);
        return;
    }

    const order = nesting.nestingOrders.get(id);

    if (order.error) {
        log.debug(`OrderID ${id} caused some error, error = ${order.fullResult}`);
        common.sendErrorObjects(response, order.fullResult);
        return;
    }

    if (!order.ready) {
        log.debug(`OrderOD ${id} is still computing`);
        common.sendStillComputing(response);
        return;
    }

    let partialResult = JSON.parse(JSON.stringify(order.fullResult));
    for(let i=0; i<partialResult.nestings.length; i++) {
        for(let j=0; j<partialResult.nestings[i].nested_parts.length; j++) {
            delete partialResult.nestings[i].nested_parts[j]["position"];
            delete partialResult.nestings[i].nested_parts[j]["angle"];
            delete partialResult.nestings[i].nested_parts[j]["flip"];
        }
    }

    response
        .status(httpStatusCodes.OK)
        .set({'Content-Type': 'application/json; charset=utf-8'})
        .send(partialResult);
};
