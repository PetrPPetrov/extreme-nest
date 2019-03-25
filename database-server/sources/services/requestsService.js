// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/nestingDAO');
const requestsDAO = require('../dao/requestsDAO');

module.exports = {

    createRequestAsync: (request, testID) => {
        return new Promise((resolve, reject) => {
            requestsDAO.createAsync(request)
                .then(id => nestingDAO.updateByIDAsync(testID, {"goldRequestID": id}))
                .then(() => resolve({ result: true }))
                .catch(() => reject({ result: false }))
        });
    },

    getRequestByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            nestingDAO.getByIDAsync(id)
                .then(nesting => requestsDAO.getByIDAsync(nesting.goldRequestID))
                .then(request => resolve(request))
                .catch(() => reject({}));
        });
    }

};