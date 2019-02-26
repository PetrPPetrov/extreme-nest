// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const functional = require('../functionalUtils');
const databaseConnector = require('../databaseConnector');

module.exports = {
    onRequestCreation: (request, response) => insertRecordToDatabaseAndSendResponse(request, response, 'requests'),
    onGoldResponseCreation: (request, response) => insertRecordToDatabaseAndSendResponse(request, response, 'goldResponses')
};

function insertRecordToDatabaseAndSendResponse(request, response, tableName) {
    databaseConnector.connect((error, client) => {
        functional.doIf(error, () => sendBadRequest(response));
        const collection = databaseConnector.getDatabase(client).collection(tableName);
        collection.insertOne(request.body, error =>
            functional.doIfElse(error, () => sendBadRequest(response), () => sendCreated(response))
        );
        client.close();
    })
}

function sendBadRequest(response){
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendCreated(response) {
    response.status(201).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Created' });
}