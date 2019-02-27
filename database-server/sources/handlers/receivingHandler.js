// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ObjectId = require('mongodb').ObjectId;
const functional = require('../functionalUtils');
const databaseConnector = require('../databaseConnector');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = {

    onNestingReceiving: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').find({}).toArray()
                    .then(nesting => sendOkWithData(response, `All the nestings were got`, nesting.map(field => field._id)))
                    .finally(() => connection.close())
            })
            .catch(error => sendBadRequest(response, `All the nestings were not got! Cause: ${error}`));
    },

    onGoldRequestReceiving: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').findOne(ObjectId(request.params.id))
                    .then(nesting =>
                        database.collection('goldRequests').findOne(ObjectId(nesting.goldRequestID))
                            .then(goldRequest => sendOkWithData(response, `Gold request: ${request.params.id} was got`, goldRequest))
                    )
                    .finally(() => connection.close())
            })
            .catch(error => sendBadRequest(response, `Gold request: ${request.params.id} was not got. Cause: ${error}`));
    },

    onGoldResponseReceiving: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').findOne(ObjectId(request.params.id))
                    .then(nesting =>
                        database.collection('goldResponses').findOne(ObjectId(nesting.goldResponseID))
                            .then(goldResponse => sendOkWithData(response, `Gold response: ${request.params.id} was got`, goldResponse))
                    )
                    .finally(() => connection.close())
            })
            .catch(error => sendBadRequest(response, `Gold response: ${request.params.id} was not got. Cause: ${error}`));
    }

};


function sendBadRequest(response, debugMessage){
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendOkWithData(response, debugMessage, data) {
    functional.doIf(debugMessage, () => log.debug(debugMessage));
    response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
}