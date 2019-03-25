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

const incorrectID = 0;
const tableName = 'goldResponses';

module.exports = {

    createAsync: (goldResponse) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(tableName).insertOne(goldResponse)
                    .then(response => {
                        log.debug(`New response was created. ID: ${response.ops[0]._id}`);
                        resolve(response.ops[0]._id);
                    })
                    .catch(error => {
                        log.warn(`New response was not created. Cause: ${error}`);
                        reject(incorrectID)
                    })
                    .finally(() => {
                        connection.close();
                    })
            });
        });
    },

    getByIDAsync: (id) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(tableName).findOne(ObjectId(id))
                    .then(goldResponse => {
                        log.debug(`Response with ID: ${id} was found`);
                        resolve(goldResponse);
                    })
                    .catch(error => {
                        log.warn(`Response with ID: ${id} was not found. Cause: ${error}`);
                        reject({})
                    })
                    .finally(() => {
                        connection.close();
                    })
            });
        });
    },

    removeByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).deleteOne({"_id": ObjectId(id)})
                .then(() => {
                    log.debug(`Response was deleted by ID: ${id}`);
                    resolve(true);
                })
                .catch(error => {
                    log.warn(`Response was not deleted by ID: ${id}. Cause: ${error}`);
                    reject(false)
                });
        });
    }

};