// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ObjectId = require('mongodb').ObjectId;

const log = log4js.getLogger(__filename);
log.level = 'debug';

const incorrectID = 0;
const tableName = 'goldRequests';

module.exports = {

    create: (database, goldRequest) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).insertOne(goldRequest)
                .then(request => {
                    log.debug(`New gold request was created. ID: ${request.ops[0]._id}`);
                    resolve(request.ops[0]._id);
                })
                .catch(error => {
                    log.warn(`New gold request was not created. Cause: ${error}`);
                    reject(incorrectID)
                });
        });
    },

    getByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).findOne(ObjectId(id))
                .then(goldRequest => {
                    log.debug(`Gold request with ID: ${id} was found`);
                    resolve(goldRequest);
                })
                .catch(error => {
                    log.warn(`Gold request with ID: ${id} was not found. Cause: ${error}`);
                    reject({})
                });
        });
    },

    removeByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).deleteOne({"_id": ObjectId(id)})
                .then(() => {
                    log.debug(`Gold request was deleted by ID: ${id}`);
                    resolve(true);
                })
                .catch(error => {
                    log.warn(`Gold request was not deleted by ID: ${id}. Cause: ${error}`);
                    reject(false)
                });
        });
    }

};