// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const fs = require('fs');
const { spawn } = require('child_process');

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
        ready: false,
        fullResult: null
    });
    nestingRequest.orderID = orderID;

    const nestingRequestFileName = `./run_area/${orderID}.json`;
    // TODO: check if file exists and remove it if required
    const nestingRequestAsString = JSON.stringify(nestingRequest);
    fs.writeFile(nestingRequestFileName, nestingRequestAsString, (error) => {
        if (error) {
            console.log(error);
        }else {
            const process = spawn('./bin/extreme_nest', [nestingRequestFileName]);

            process.stdout.on('data', (data) => {
                nestingOrders.get(orderID).fullResult = JSON.parse(data);
                nestingOrders.get(orderID).ready = true;
            });

            process.stderr.on('data', (data) => {
                nestingOrders.get(orderID).error = true;
                log.debug(`Error in working process, text = ${data}`);
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    nestingOrders.get(orderID).error = true;
                    log.debug(`Nesting process failed, orderID ${orderID}, exit code ${code}`);
                }
                log.debug(`Nesting process finished, orderID ${orderID}`);
            });
        }
    });

    return orderID;
};

function getNewOrderID() {
    // return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return nestingOrders.size + 1;
}
