// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const configuration = require('../../resources/configuration');

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

    if (configuration.nestingEngine === 'extreme-nest') {
        const fs = require('fs');
        const { spawn } = require('child_process');
        const nestingRequestFileName = `./run_area/${orderID}.json`;
        // TODO: check if file exists and remove it if required
        const nestingRequestAsString = JSON.stringify(nestingRequest);
        fs.writeFile(nestingRequestFileName, nestingRequestAsString, (error) => {
            if (error) {
                console.log(error);
            } else {
                const process = spawn('./bin/extreme_nest', [nestingRequestFileName]);
                log.debug(`Started nesting [Extreme-Nest], orderID = ${orderID}`);
                process.stdout.on('data', (data) => {
                    let nestingOrder = nestingOrders.get(orderID);
                    nestingOrder.fullResult = JSON.parse(data);
                    nestingOrder.ready = true;
                });
                process.stderr.on('data', (data) => {
                    log.debug(`Error in nesting process [Extreme-Nest], text = ${data}`);
                    nestingOrders.get(orderID).error = true;
                });
                process.on('close', (code) => {
                    if (code !== 0) {
                        nestingOrders.get(orderID).error = true;
                        log.debug(`Nesting process [Extreme-Nest] failed, orderID ${orderID}, exit code ${code}`);
                    }
                    log.debug(`Done nesting [Extreme-Nest], orderID = ${orderID}`);
                });
            }
        });
    }else {
        const threads = require('threads');
        const config  = threads.config;
        const spawn   = threads.spawn;
        const thread = spawn('./dependencies/deepnest/nestingOptimization.js');
        thread
            .send(nestingRequest)
            .on('message', (nestingResult) => {
                let nestingOrder = nestingOrders.get(orderID);
                nestingOrder.fullResult = nestingResult;
                nestingOrder.ready = true;
            })
            .on('error', (error) => {
                log.debug(`Error in nesting thread [Deep-Nest], text = ${error}`);
                let nestingOrder = nestingOrders.get(orderID);
                nestingOrder.error = true;
                nestingOrder.fullResult = {
                    message: 'An error occurred',
                    errors: [
                        {
                            error_code: -4000,
                            message: JSON.stringify(error)
                        }
                    ]
                };
            })
            .on('exit', () => {});
    }

    return orderID;
};

function getNewOrderID() {
    // return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return nestingOrders.size + 1;
}
