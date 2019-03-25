// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const nestingDAO = require('../dao/nestingDAO');
const responsesDAO = require('../dao/responsesDAO');

module.exports = {

    createResponseAsync: (response, testID) => {
        return new Promise((resolve, reject) => {
            responsesDAO.createAsync(response)
                .then(id => nestingDAO.updateByIDAsync(testID, {"goldResponseID": id}))
                .then(() => resolve({ result: true }))
                .catch(() => reject({ result: false }))
        });
    },

    getResponseByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            nestingDAO.getByIDAsync(id)
                .then(nesting => responsesDAO.getByIDAsync(nesting.goldResponseID))
                .then(response => resolve(response))
                .catch(() => reject({}));
        });
    }

};