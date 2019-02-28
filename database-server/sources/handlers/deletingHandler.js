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

    onDeletingNesting: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('nesting').findOne(ObjectId(request.params.id))
                    .then(nesting => {
                        database.collection('goldRequests').deleteOne({"_id": ObjectId(nesting.goldRequestID)});
                        database.collection('goldResponses').deleteOne({"_id": ObjectId(nesting.goldResponseID)});
                        database.collection('serverRequests').deleteOne({"_id": ObjectId(nesting.serverRequestID)});
                    });
                database.collection('nesting').deleteOne({"_id": ObjectId(request.params.id)})
                .then(() => sendOk(response, `Nesting: ${request.params.id} was deleted`))
                .finally(() => connection.close())
            })
            .catch(error => sendBadRequest(response, `Nesting: ${request.params.id} was not deleted. Cause: ${error}`));
    },

    onDeletingTesting: (request, response) => {
        databaseConnector.connect()
            .then(connection => testingDAO.removeTestingByID(databaseConnector.getDatabase(connection), request.params.id))
            .then(() => response.status(200).set({'Content-Type': 'application/json'}).send({ result: true }))
            .catch(error => response.status(400).set({'Content-Type': 'application/json'}).send({ message: error }))
    }

};

function sendBadRequest(response, debugMessage){
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendOk(response, debugMessage) {
    functional.doIf(debugMessage, () => log.debug(debugMessage));
    response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Ok' });
}
