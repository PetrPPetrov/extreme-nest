// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const ResponseSender = require('./responseSender');
const testService = require('./services/testsService');
const testingsService = require('./services/testing/testingService');
const requestsService = require('./services/requestsService');
const responsesService = require('./services/responsesService');

const log4js = require('log4js');
const log = log4js.getLogger(__filename);
log.level = 'trace';

module.exports.route = (server) => {

    server.post('/nesting', (request, response) => {
        log.trace('Request on: creation test');
        const responseSender = new ResponseSender(response);
        testService.createTestAsync()
            .then(result => responseSender.sendCreatedSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.post('/testing', (request, response) => {
        log.trace('Request on: creation testing');
        const responseSender = new ResponseSender(response);
        testingsService.createTestingAsync()
            .then(result => responseSender.sendCreatedSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.post('/goldRequests/:id', (request, response) => {
        log.trace('Request on: request creation');
        const responseSender = new ResponseSender(response);
        requestsService.createRequestAsync(request.body, request.params.id)
            .then(result => responseSender.sendCreatedSync(result))
            .catch(result => responseSender.sendBadRequestSync(result));
    });

    server.post('/goldResponses/:id', (request, response) => {
        log.trace('Request on: response creation');
        const responseSender = new ResponseSender(response);
        responsesService.createResponseAsync(request.body, request.params.id)
            .then(result => responseSender.sendCreatedSync(result))
            .catch(result => responseSender.sendBadRequestSync(result));
    });

    server.get('/nesting/', (request, response) => {
        log.trace('Request on: getting all tests');
        const responseSender = new ResponseSender(response);
        testService.getAllTestsIDAsync(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.get('/testing/', (request, response) => {
        log.trace('Request on: getting all testings');
        const responseSender = new ResponseSender(response);
        testingsService.getAllTestingAsync()
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.get('/testing/:id', (request, response) => {
        log.trace('Request on: getting all testing');
        const responseSender = new ResponseSender(response);
        testingsService.getTestingByID(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.get('/goldRequests/:id', (request, response) => {
        log.trace('Request on: getting request');
        const responseSender = new ResponseSender(response);
        requestsService.getRequestByIDAsync(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.get('/goldResponses/:id', (request, response) => {
        log.trace('Request on: getting response');
        const responseSender = new ResponseSender(response);
        responsesService.getResponseByIDAsync(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendNotFoundSync(result));
    });

    server.delete('/nesting/:id', (request, response) => {
        log.trace('Request on: deleting test');
        const responseSender = new ResponseSender(response);
        testService.removeTestByIDAsync(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendBadRequestSync(result));
    });

    server.delete('/testing/:id', (request, response) => {
        log.trace('Request on: deleting testing');
        const responseSender = new ResponseSender(response);
        testingsService.removeTestingByID(request.params.id)
            .then(result => responseSender.sendOKSync(result))
            .catch(result => responseSender.sendBadRequestSync(result));
    });

};