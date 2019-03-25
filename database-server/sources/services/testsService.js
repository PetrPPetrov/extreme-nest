// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const testsDAO = require('../dao/testsDAO');

module.exports = {

    createTestAsync: () => {
        return new Promise((resolve, reject) => {
            testsDAO.createAsync()
                .then(id => resolve({id: id}))
                .catch(id => reject({id: id}));
        });
    },

    getAllTestsIDAsync: () => {
        return new Promise((resolve, reject) => {
            testsDAO.getAllAsync()
                .then(tests => resolve(tests.map(test => test._id)))
                .catch(() => reject([]));
        });
    },

    removeTestByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            testsDAO.removeByIDAsync(id)
                .then(() => resolve({ result : true}))
                .catch(() => reject({ result: false }));
        });
    }

};