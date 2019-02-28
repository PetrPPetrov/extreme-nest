// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/nesting');
const testingDAO = require('../dao/testing');
const goldRequestsDAO = require('../dao/goldRequests');
const goldResponsesDAO = require('../dao/goldResponses');
const databaseConnector = require('../databaseConnector');

const ResponseSender = require('../responseSender');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports = {

    onNestingReceiving: (request, response) => {
        log.trace('Request on: getting nesting');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => nestingDAO.getAll(databaseConnector.getDatabase(connection)))
            .then(nestings => sender.sendOK(nestings))
            .catch(error => sender.sendNotFound(error))
    },

    onAllTestingReceiving: (request, response) => {
        log.trace('Request on: getting all the testings');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.getAll(databaseConnector.getDatabase(connection)))
            .then(testings => sender.sendOK(testings))
            .catch(error => sender.sendNotFound(error))
    },

    onTestingReceivingByID: (request, response) => {
        log.trace('Request on: getting testing');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => testingDAO.getByID(databaseConnector.getDatabase(connection), request.params.id))
            .then(testing => sender.sendOK(testing))
            .catch(error => sender.sendNotFound(error))
    },

    onGoldRequestReceiving: (request, response) => {
        log.trace('Request on: getting gold request');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                nestingDAO.getByID(database, request.params.id)
                    .then(nesting => goldRequestsDAO.getByID(database, nesting.goldRequestID))
                    .then(goldRequest => sender.sendOK(goldRequest))
            })
            .catch(error => sender.sendNotFound(error));
    },

    onGoldResponseReceiving: (request, response) => {
        log.trace('Request on: getting gold response');
        const sender = new ResponseSender(response);
        databaseConnector.connect()
            .then(connection => {
                const database = databaseConnector.getDatabase(connection);
                nestingDAO.getByID(database, request.params.id)
                    .then(nesting => goldResponsesDAO.getByID(database, nesting.goldResponseID))
                    .then(goldResponse => sender.sendOK(goldResponse))
            })
            .catch(error => sender.sendNotFound(error));
    }

};
