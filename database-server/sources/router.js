// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const creationHandler = require('./handlers/creationHandler');
const receivingHandler = require('./handlers/receivingHandler');

module.exports.route = server => {
    server.post('/nesting', (request, response) => creationHandler.onNestingCreation(request, response));
    server.post('/goldRequests/:id', (request, response) => creationHandler.onGoldRequestCreation(request, response));
    server.post('/serverRequests/:id', (request, response) => creationHandler.onServerRequestCreation(request, response));
    server.post('/goldResponses/:id', (request, response) => creationHandler.onGoldResponseCreation(request, response));
    server.post('/serverResponses/:id', (request, response) => creationHandler.onServerResponseCreation(request, response));
    server.get('/requests/:id', (request, response) => receivingHandler.onRequestReceiving(request, response));
    server.get('/serverResponses/:id', (request, response) => receivingHandler.onServerResponseReceiving(request, response));
    server.get('/goldResponses/:id', (request, response) => receivingHandler.onGoldResponseReceiving(request, response));
    server.get('*', (request, response) => response.status(404).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Unknown HTTP request' }));
};