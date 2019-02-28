// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ObjectId = require('mongodb').ObjectId;
const functional = require('../functionalUtils');
const databaseConnector = require('../databaseConnector');

const testingDAO = require('../dao/testing');

const log = log4js.getLogger(__filename);
log.level = 'debug';

module.exports = {

    onNestingCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').insertOne({})
                    .then((result) => sendCreatedWithData(response, 'Nesting was created', { id: result.ops[0]._id }))
                    .finally(() => connection.close())
            })
            .catch(error => sendBadRequest(response, `Connection with database was not set. Cause: ${error}`));
    },

    onTestingCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => testingDAO.createNewTesting(databaseConnector.getDatabase(connection)))
            .then(newTesting => response.status(201).set({'Content-Type': 'application/json'}).send(newTesting))
            .catch(error => response.status(400).set({'Content-Type': 'application/json'}).send({ message: error }))
    },

    onGoldRequestCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('goldRequests').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"goldRequestID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Gold request was joined to nesting: ${request.params.id}`))
                            .finally(() => connection.close())
                    )
            })
            .catch(error => sendBadRequest(response, `Gold request was not joined to nesting: ${request.params.id}. Cause: ${error}`))
    },

    onServerRequestCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('serverRequests').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"serverRequestID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Server request was joined to nesting: ${request.params.id}`))
                            .finally(() => connection.close())
                    )
            })
            .catch(error => sendBadRequest(response, `Server request was not joined to nesting: ${request.params.id}. Cause: ${error}`))
    },

    onGoldResponseCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('goldResponses').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"goldResponseID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Gold response  was joined to nesting: ${request.params.id}`))
                            .finally(() => connection.close())
                    )
            })
            .catch(error => sendBadRequest(response, `Gold response was not joined to nesting: ${request.params.id}. Cause: ${error}`))
    },

};

function sendBadRequest(response, debugMessage){
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendInternalServerError(response, debugMessage) {
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(500).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Internal server error' });
}

function sendCreated(response, debugMessage) {
    functional.doIf(debugMessage, () => log.debug(debugMessage));
    response.status(201).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Created' });
}

function sendCreatedWithData(response, debugMessage, data) {
    functional.doIf(debugMessage, () => log.debug(debugMessage));
    response.status(201).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
}
