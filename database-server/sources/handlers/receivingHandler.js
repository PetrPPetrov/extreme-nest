// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const functional = require('../functionalUtils');
const databaseConnector = require('../databaseConnector');

module.exports = {
    onRequestReceiving: (request, response) => getRecordFromDatabaseAndSendResponse(request, response, 'requests'),
    onServerResponseReceiving: (request, response) => getRecordFromDatabaseAndSendResponse(request, response, 'serverResponses'),
    onGoldResponseReceiving: (request, response) => getRecordFromDatabaseAndSendResponse(request, response, 'goldResponses')
};

function getRecordFromDatabaseAndSendResponse(request, response, tableName) {
    databaseConnector.connect((error, client) => {
        functional.doIf(error, () => sendBadRequest(response));
        const collection = databaseConnector.getDatabase(client).collection(tableName);
        collection.findOne({ 'id' : request.body.id}, (error, data) =>
            functional.doIfElse(error, () => sendBadRequest(response), () => sendDataFromDatabase(response, data))
        );
        client.close();
    })
}

function sendBadRequest(response){
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendDataFromDatabase(response, data) {
    response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
}