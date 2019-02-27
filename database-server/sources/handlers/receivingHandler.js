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

    onGoldRequestReceiving: (request, response) => {
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection('goldRequests').findOne(ObjectId(request.params.id))
                    .then(() => sendOkWithData(response, `Gold request was got`, request.ops[0]))
                    .catch(error => sendBadRequest(response, `Gold request was not got. Cause: ${error}`))
                    .finally(() => connection.close())
            })
            .catch(error => sendInternalServerError(response, `Connection with database was not set. Cause: ${error}`));
    }

};


function sendBadRequest(response, debugMessage){
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(400).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Bad request' });
}

function sendInternalServerError(response, debugMessage) {
    functional.doIf(debugMessage, () => log.warn(debugMessage));
    response.status(500).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Internal server error' });
}

function sendOkWithData(response, debugMessage, data) {
    functional.doIf(debugMessage, () => log.debug(debugMessage));
    response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send(data);
}