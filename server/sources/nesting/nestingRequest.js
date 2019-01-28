// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const threads = require('threads');
const config  = threads.config;
const spawn   = threads.spawn;

const log = log4js.getLogger(__filename);
log.level = 'debug';

const nestingOrders = new Map();

module.exports.nestingOrders = nestingOrders;

module.exports.processNestingRequest = (nestingRequest) => {
    let orderID = getNewOrderID();
    while (nestingOrders.has(orderID)) {
        orderID = getNewOrderID();
    }

    nestingOrders.set(orderID, {
        nestingRequest: nestingRequest,
        orderID: orderID,
        error: false,
        errorObject: null,
        ready: false,
        fullResult: null
    });
    nestingRequest.orderID = orderID;

    const thread = spawn('./sources/nesting/nestingOptimization.js');
    thread
        .send(nestingRequest)
        .on('message', (nestingResult) => {
            nestingOrders.get(orderID).ready = true;
            nestingOrders.get(orderID).fullResult = nestingResult;
        })
        .on('error', (error) => {
            log.debug('Error in working thread, text = ' + error);
            let nestingOrder = nestingOrders.get(orderID);
            nestingOrder.error = true;
            nestingOrder.errorObject = error;
        })
        .on('exit', () => {
            log.debug('Nesting thread finished, orderID ' + orderID);
        });

    return orderID;
};

function getNewOrderID() {
    // return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return nestingOrders.size + 1;
}
