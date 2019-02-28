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
const tableName = 'serverRequests';

module.exports = {

    create: (database, serverRequest) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).insertOne(serverRequest)
                .then(request => {
                    log.debug(`New server request was created. ID: ${request.ops[0]._id}`);
                    resolve(request.ops[0]._id);
                })
                .catch(error => {
                    log.warn(`New server request was not created. Cause: ${error}`);
                    reject(incorrectID)
                });
        });
    },

    removeByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).deleteOne({"_id": ObjectId(id)})
                .then(() => {
                    log.debug(`Server request was deleted by ID: ${id}`);
                    resolve(true);
                })
                .catch(error => {
                    log.warn(`Server request was not deleted by ID: ${id}. Cause: ${error}`);
                    reject(false)
                });
        });
    }

};