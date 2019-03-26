// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ObjectId = require('mongodb').ObjectId;
const databaseConnector = require('../databaseConnector');

const log = log4js.getLogger(__filename);
log.level = 'debug';

const INCORRECT_ID = 0;
const TABLE_NAME = 'goldRequests';

module.exports = {

    createAsync: (goldRequest) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).insertOne(goldRequest)
                    .then(request => {
                        log.debug(`New request was created. ID: ${request.ops[0]._id}`);
                        resolve(request.ops[0]._id);
                    })
                    .catch(error => {
                        log.warn(`New request was not created. Cause: ${error}`);
                        reject(INCORRECT_ID);
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    },

    getByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).findOne(ObjectId(id))
                    .then(goldRequest => {
                        log.debug(`Request with ID: ${id} was found`);
                        resolve(goldRequest);
                    })
                    .catch(error => {
                        log.warn(`Request with ID: ${id} was not found. Cause: ${error}`);
                        reject({})
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    },

    removeByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).deleteOne({"_id": ObjectId(id)})
                    .then(() => {
                        log.debug(`Request was deleted by ID: ${id}`);
                        resolve(true);
                    })
                    .catch(error => {
                        log.warn(`Request was not deleted by ID: ${id}. Cause: ${error}`);
                        reject(false)
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    }

};