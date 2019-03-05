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
const tableName = 'testing';

module.exports = {

    create: (database, newTesting) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).insertOne(newTesting)
                .then(testing => {
                    log.debug(`New testing was created. ID: ${testing.ops[0]._id}`);
                    resolve(testing.ops[0]);
                })
                .catch(error => {
                    log.warn(`New testing was not created. Cause: ${error}`);
                    reject(incorrectID)
                });
        });
    },

    getAll: (database) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).find({}).toArray()
                .then(testings => {
                    log.debug(`All the testings were found.`);
                    resolve(testings);
                })
                .catch(error => {
                    log.warn(`All the testings were found. Cause: ${error}`);
                    reject(`Testings were not found`)
                });
        });
    },

    getByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).findOne(ObjectId(id))
                .then(testing => {
                    log.debug(`Testing was found by ID: ${id}`);
                    resolve(testing);
                })
                .catch(error => {
                    log.warn(`Testing was not found by ID: ${id}. Cause: ${error}`);
                    reject(`Testing was not found`)
                });
        });
    },

    updateByID: (database, id, properties) => {
        return new Promise((resolve, reject) =>
            database.collection(tableName).updateOne({"_id": ObjectId(id)}, {"$set": properties})
                .then(() => {
                    log.debug(`Testing with ID: ${id} was changed`);
                    resolve({});
                })
                .catch(error => {
                    log.warn(`Testing with ID: ${id} was not changed. Cause: ${error}`);
                    reject({});
                })
        );
    },

    updateByQuery: (database, query, properties) => {
        return new Promise((resolve, reject) =>
            database.collection(tableName).updateOne(query, {"$set": properties})
                .then(() => {
                    log.debug(`Testing was changed`);
                    resolve({});
                })
                .catch(error => {
                    log.warn(`Testing  was not changed. Cause: ${error}`);
                    reject({});
                })
        );
    },

    removeByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).deleteOne({"_id": ObjectId(id)})
                .then(() => {
                    log.debug(`Testing was deleted by ID: ${id}`);
                    resolve();
                })
                .catch(error => {
                    log.warn(`Testing was not deleted by ID: ${id}. Cause: ${error}`);
                    reject(`Testing was not deleted`)
                });
        });
    }

};
