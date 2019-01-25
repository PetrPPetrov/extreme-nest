// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.
'use strict';

const log4js = require('log4js');
const worker = require('worker_threads');

const log = log4js.getLogger(__filename);
log.level = 'debug';

const nestingOrders = new Map();

module.exports.getNestingOrders = () => {
    return nestingOrders;
};

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
        partiallyReady: false,
        completeReady: false,
        fullResult: null
    });

    const thread = new worker.Worker('./sources/nesting/nestingOptimization.js');
    thread.on('message', (nestingResult) => {
        if (nestingResult.type === 'finished') {
            nestingOrders.get(orderID).completeReady = true;
        }
        else if (nestingResult.type === 'best') {
            nestingOrders.get(orderID).partiallyReady = true;
            nestingOrders.get(orderID).fullResult = nestingResult.result;
        }
    });
    // thread.on('error', (error) => {
    //     log.debug('Error in working thread, text = ' + error);
    //     let nestingOrder = nestingOrders.get(orderID);
    //     nestingOrder.error = true;
    //     nestingOrder.errorObject = error;
    // });
    thread.on('exit', () => {
        log.debug('Nesting thread finished, orderID ' + orderID);
    });
    thread.postMessage(nestingRequest);

    return orderID;
};

function getNewOrderID() {
    // return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return nestingOrders.size + 1;
}
