// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const creationHandler = require('./handlers/creationHandler');
const receivingHandler = require('./handlers/receivingHandler');
const deletingHandler = require('./handlers/deletingHandler');

const ResponseSender = require('./responseSender');
const requestsService = require('./services/requestsService');
const responsesService = require('./services/responsesService');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports.route = server => {

    server.post('/nesting', (request, response) => creationHandler.onNestingCreation(request, response));

    server.post('/testing', (request, response) => creationHandler.onTestingCreation(request, response));

    server.post('/goldRequests/:id', (request, response) => {
        log.trace('Request on: request creation');
        const responseSender = new ResponseSender(response);
        requestsService.createRequestAsync(request.body, request.params.id)
            .then(result => responseSender.sendCreated(result))
            .catch(result => responseSender.sendBadRequest(result));
    });

    server.post('/goldResponses/:id', (request, response) => {
        log.trace('Request on: response creation');
        const responseSender = new ResponseSender(response);
        responsesService.createResponseAsync(request.body, request.params.id)
            .then(result => responseSender.sendCreated(result))
            .catch(result => responseSender.sendBadRequest(result));
    });

    server.get('/nesting/', (request, response) => receivingHandler.onNestingReceiving(request, response));

    server.get('/testing/', (request, response) => receivingHandler.onAllTestingReceiving(request, response));

    server.get('/testing/:id', (request, response) => receivingHandler.onTestingReceivingByID(request, response));

    server.get('/goldRequests/:id', (request, response) => {
        log.trace('Request on: getting request');
        const responseSender = new ResponseSender(response);
        requestsService.getRequestByIDAsync(request.params.id)
            .then(result => responseSender.sendOK(result))
            .catch(result => responseSender.sendNotFound(result));
    });

    server.get('/goldResponses/:id', (request, response) => {
        log.trace('Request on: getting response');
        const responseSender = new ResponseSender(response);
        responsesService.getResponseByIDAsync(request.params.id)
            .then(result => responseSender.sendOK(result))
            .catch(result => responseSender.sendNotFound(result));
    });

    server.delete('/nesting/:id', (request, response) => deletingHandler.onDeletingNesting(request, response));

    server.delete('/testing/:id', (request, response) => deletingHandler.onDeletingTesting(request, response));

};