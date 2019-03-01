// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/nesting');
const testingDAO = require('../dao/testing');
const goldRequestsDAO = require('../dao/goldRequests');
const goldResponsesDAO = require('../dao/goldResponses');
const serverRequestsDAO = require('../dao/serverRequests');
const databaseConnector = require('../databaseConnector');

const testingService = require('../services/testing');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onNestingCreation: (request, response) => {
        log.trace('Request on: nesting creation');
        const sender = new ResponseSender(response);

        databaseConnector.connect()
            .then(connection => nestingDAO.create(databaseConnector.getDatabase(connection)))
            .then(id => sender.sendCreated({ id: id }))
            .catch(errorID => sender.sendBadRequest({ id: errorID }))
    },

    onTestingCreation: (request, response) => {
        log.trace('Request on: testing creation');
        const sender = new ResponseSender(response);
        testingService.createNewTesting()
            .then(testing => sender.sendCreated(testing))
            .catch(error => sender.sendBadRequest(error))
    },

    onGoldRequestCreation: (request, response) => {
        log.trace('Request on: gold request creation');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                goldRequestsDAO.create(database, request.body)
                    .then(id => nestingDAO.updateByID(database, request.params.id, {"goldRequestID": id}))
                    .then(() => sender.sendCreated({ result: true }))
            })
            .catch(() => sender.sendBadRequest({ result: false }))
    },

    onServerRequestCreation: (request, response) => {
        log.trace('Request on: server request creation');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                serverRequestsDAO.create(database, request.body)
                    .then(id => nestingDAO.updateByID(database, request.params.id, {"serverRequestID": id}))
                    .then(() => sender.sendCreated({ result: true }))
            })
            .catch(() => sender.sendBadRequest({ result: false }))
    },

    onGoldResponseCreation: (request, response) => {
        log.trace('Request on: gold response creation');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                goldResponsesDAO.create(database, request.body)
                    .then(id => nestingDAO.updateByID(database, request.params.id, {"goldResponseID": id}))
                    .then(() => sender.sendCreated({ result: true }))
            })
            .catch(() => sender.sendBadRequest({ result: false }))
    },

};
