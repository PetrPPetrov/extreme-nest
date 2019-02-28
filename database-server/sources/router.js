// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const creationHandler = require('./handlers/creationHandler');
const receivingHandler = require('./handlers/receivingHandler');
const deletingHandler = require('./handlers/deletingHandler');

module.exports.route = server => {

    server.post('/nesting', (request, response) => creationHandler.onNestingCreation(request, response));
    server.post('/testing', (request, response) => creationHandler.onTestingCreation(request, response));
    server.post('/goldRequests/:id', (request, response) => creationHandler.onGoldRequestCreation(request, response));
    server.post('/serverRequests/:id', (request, response) => creationHandler.onServerRequestCreation(request, response));
    server.post('/goldResponses/:id', (request, response) => creationHandler.onGoldResponseCreation(request, response));

    server.get('/nesting/', (request, response) => receivingHandler.onNestingReceiving(request, response));
    server.get('/testing/', (request, response) => receivingHandler.onAllTestingReceiving(request, response));
    server.get('/testing/:id', (request, response) => receivingHandler.onTestingReceivingByID(request, response));
    server.get('/goldRequests/:id', (request, response) => receivingHandler.onGoldRequestReceiving(request, response));
    server.get('/goldResponses/:id', (request, response) => receivingHandler.onGoldResponseReceiving(request, response));

    server.delete('/nesting/:id', (request, response) => deletingHandler.onDeletingNesting(request, response));
    server.delete('/testing/:id', (request, response) => deletingHandler.onDeletingTesting(request, response));

};