// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

module.exports.route = server => {
    server.post('/requests', (request, response) => response.status(201).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Request was saved' }));
    server.post('/goldResponses', (request, response) => response.status(201).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Gold response was saved' }));
    server.get('/requests/:id', (request, response) => response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Request' }));
    server.get('/serverResponses/:id', (request, response) => response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Server response' }));
    server.get('/goldResponses/:id', (request, response) => response.status(200).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Gold response' }));
    server.get('*', (request, response) => response.status(404).set({'Content-Type': 'application/json; charset=utf-8'}).send({ message: 'Unknown HTTP request' }));
};