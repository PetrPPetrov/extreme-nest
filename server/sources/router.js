// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const errorHandler = require('./handlers/errorHandler');
const authorizationHandler = require('./handlers/authorizationHandler');
const nestingHandler = require('./handlers/nestingHandler');
const fetchingHandler = require('./handlers/fetchingHandler');
const httpStatusCodes = require('./httpStatusCodes');

module.exports.route = (server) => {

    // server.get('/authorization', (request, response) => {
    //     authorizationHandler.onRequest(request, response);
    // });
    server.post('/new', (request, response) => {
        addedAdditionalHeadersForResponse(response);
        nestingHandler.onRequest(request, response);
    });

    server.get('/result/:id', (request, response) => {
        addedAdditionalHeadersForResponse(response);
        fetchingHandler.onRequest(request, response);
    });

    server.get('*', (request, response) => {
        addedAdditionalHeadersForResponse(response);
        errorHandler.onRequest(request, response, httpStatusCodes.BAD_REQUEST);
    });

};

function addedAdditionalHeadersForResponse(response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    response.header("Access-Control-Allow-Headers", "Content-Type");
}