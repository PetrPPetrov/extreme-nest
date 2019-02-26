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

    onNestingCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').insertOne({})
                    .then((result) => sendCreatedWithData(response, 'Nesting field was created', { id: result.ops[0]._id }))
                    .catch(error => sendBadRequest(response, `Nesting field was not created. Cause: ${error}`))
                    .finally(() => connection.close())
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`));
    },

    onGoldRequestCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('goldRequests').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"goldRequestID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Gold request was added: ${result.ops[0]._id}`))
                            .catch(error => sendBadRequest(response, `Gold request was not join to nesting. Cause: ${error}`))
                            .finally(() => connection.close())
                    )
                    .catch(error => sendInternalServerError(response, `Gold request was not added. Cause: ${error}`))
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`))
    },

    onServerRequestCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('serverRequests').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"serverRequestID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Server request was added: ${result.ops[0]._id}`))
                            .catch(error => sendBadRequest(response, `Server request was not jon to nesting. Cause: ${error}`))
                            .finally(() => connection.close())
                    )
                    .catch(error => sendInternalServerError(response, `Server request was not added. Cause: ${error}`))
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`))
    },

    onGoldResponseCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('goldResponses').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"goldResponseID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Gold response was added: ${result.ops[0]._id}`))
                            .catch(error => sendBadRequest(response, `Gold response was not join to nesting. Cause: ${error}`))
                            .finally(() => connection.close())
                    )
                    .catch(error => sendInternalServerError(response, `Gold response was not added. Cause: ${error}`))
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`))
    },

    onServerResponseCreation: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('serverResponses').insertOne(request.body)
                    .then(result =>
                        database.collection('nesting').updateOne({"_id": ObjectId(request.params.id)}, {"$set": {"serverResponseID": result.ops[0]._id}})
                            .then(() => sendCreated(response, `Server response was added: ${result.ops[0]._id}`))
                            .catch(error => sendBadRequest(response, `Server response was not join to nesting. Cause: ${error}`))
                            .finally(() => connection.close())
                    )
                    .catch(error => sendInternalServerError(response, `Server response was not added. Cause: ${error}`))
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`))
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
