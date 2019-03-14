// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const _ = require('underscore');
const nestingDAO = require('../dao/nesting');
const testingDAO = require('../dao/testing');
const goldRequestsDAO = require('../dao/goldRequests');
const goldResponsesDAO = require('../dao/goldResponses');
const serverRequestsDAO = require('../dao/serverRequests');
const databaseConnector = require('../databaseConnector');
const testingChecker = require('./testingChecker');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = {

    createNewTesting: async () => {
        const today = new Date();
        const currentDate = `${today.getDate()}.${(today.getMonth()+1)}.${today.getFullYear()}`;
        const currentTime = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        const connection = await databaseConnector.connect();
        const database = databaseConnector.getDatabase(connection);
        return new Promise(async (resolve, reject) =>
            nestingDAO.getAll(database)
                .then(async nestings => {
                    const promisesArray = nestings.map(nesting =>
                        Promise.all([
                            nesting._id,
                            goldRequestsDAO.getByID(database, nesting.goldRequestID),
                            serverRequestsDAO.getByID(database, nesting.serverRequestID),
                            goldResponsesDAO.getByID(database, nesting.goldResponseID)
                        ])
                    );
                    const promisesNestings = await Promise.all(promisesArray);
                    return testingDAO.create(database, { date: currentDate, time: currentTime, nestings: composeNestings(promisesNestings) })
                })
                .then(newTesting => {
                    setTimeout(() => startTesting(newTesting), 0); // For async running
                    resolve(newTesting)
                })
                .catch(() => reject({}))
                .finally(() => connection.close())
        );
    }

};

function composeNestings(promisesNestings) {
    return promisesNestings.map(([id, goldRequest, serverRequest, goldResponse]) => ({
            id: id,
            status: 'progress',
            goldRequest: goldRequest,
            serverRequest: deleteColorsInNestingRequest(serverRequest),
            goldResponse: goldResponse
        })
    );
}

function deleteColorsInNestingRequest(nestingRequest){
    nestingRequest.parts.forEach(part => {
        part.instances.forEach(instance => {
            delete instance.color;
        })
    });
    return nestingRequest;
}

const requestify = require('requestify');
const configuration = require('../../resources/configuration');

async function startTesting(testing) {
    const connection = await databaseConnector.connect();
    const db = databaseConnector.getDatabase(connection);
    testing.nestings.forEach(async (nesting) => {
        const nestingOrderID = await sendNestingRequest(nesting.serverRequest);
        if (nestingOrderID) {
            const delayInSeconds = nesting.serverRequest.time * 1000;
            nesting.serverResponse = await getNestingResponse(nestingOrderID, delayInSeconds);
            nesting.status = testingChecker.checkTest(nesting);
        } else {
            nesting.status = 'failed';
        }
        await testingDAO.updateByQuery(db, {"_id" : testing._id, "nestings.id" : nesting.id}, {"nestings.$" : nesting})
    });
}

function sendNestingRequest(nestingRequest) {
    delete nestingRequest['_id'];
    return requestify.post(`http://${configuration.nestingServerAddress}/new`, nestingRequest)
        .then(response => {
            const nestingID = response.getBody().nesting_order_id;
            log.debug(`Request was accepted for nesting. Nesting ID: ${nestingID}`);
            return nestingID;
        })
        .catch(error => {
            log.warn(`Request was not request was not accepted for nesting. Cause: ${error}`);
            return false;
        });
}

function getNestingResponse(nestingOrderID, delay) {
    return new Promise((resolve,reject) =>
        setTimeout( () =>
            requestify.get(`http://${configuration.nestingServerAddress}/result/${nestingOrderID}/full`)
                .then(async response => {
                    const responseBody = response.getBody();
                    if (_.isUndefined(responseBody.nestings) || _.isNull(responseBody.nestings)){
                        log.trace('Re-receive nesting response');
                        resolve(await getNestingResponse(nestingOrderID, delay));
                    } else {
                        log.debug(`Nesting response was get successfully.`);
                        resolve(responseBody);
                    }
                })
                .catch(error => {
                    log.warn(`Nesting response was not get. Cause: ${error}`);
                    reject({});
                })
        , delay)
    );
}