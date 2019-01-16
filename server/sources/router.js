// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const errorHandler = require('./handlers/errorHandler');
const nestingHandler = require('./handlers/nestingHandler');
const fetchingHandler = require('./handlers/fetchingHandler');
const httpStatusCodes = require('./httpStatusCodes');

module.exports.route = (server) => {
    server.post('/new', (request, response) => nestingHandler.onRequest(request, response));
    server.get('/result/:id/image', (request, response) => fetchingHandler.onImageRequest(request, response));
    server.get('/result/:id/full', (request, response) => fetchingHandler.onFullRequest(request, response));
    server.get('*', (request, response) => errorHandler.onRequest(request, response, httpStatusCodes.BAD_REQUEST));
};
