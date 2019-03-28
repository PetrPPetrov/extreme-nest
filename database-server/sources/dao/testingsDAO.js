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
const TABLE_NAME = 'testing';

module.exports = {

    createAsync: (newTesting) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).insertOne(newTesting)
                    .then(testing => {
                        log.debug(`New testing was created. ID: ${testing.ops[0]._id}`);
                        resolve(testing.ops[0]);
                    })
                    .catch(error => {
                        log.warn(`New testing was not created. Cause: ${error}`);
                        reject(INCORRECT_ID)
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    },

    getAllAsync: () => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).find({}).toArray()
                    .then(testings => {
                        log.debug(`All the testings were found.`);
                        resolve(testings);
                    })
                    .catch(error => {
                        log.warn(`All the testings were found. Cause: ${error}`);
                        reject([])
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
                .then(testing => {
                        log.debug(`Testing was found by ID: ${id}`);
                        resolve(testing);
                    })
                    .catch(error => {
                        log.warn(`Testing was not found by ID: ${id}. Cause: ${error}`);
                        reject({})
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    },

    updateByIDAsync: (id, properties) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).updateOne({"_id": ObjectId(id)}, {"$set": properties})
                    .then(() => {

                        log.debug(`Testing with ID: ${id} was changed`);
                        resolve({});
                    })
                    .catch(error => {
                        log.warn(`Testing with ID: ${id} was not changed. Cause: ${error}`);
                        reject({});
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    },

    updateByQueryAsync: (query, properties) => {
        return new Promise((resolve, reject) => {
            databaseConnector.connect().then(connection => {
                const database = databaseConnector.getDatabase(connection);
                database.collection(TABLE_NAME).updateOne(query, {"$set": properties})
                    .then(() => {
                        log.debug(`Testing was changed`);
                        resolve({});
                    })
                    .catch(error => {
                        log.warn(`Testing  was not changed. Cause: ${error}`);
                        reject({});
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
                        log.debug(`Testing was deleted by ID: ${id}`);
                        resolve();
                    })
                    .catch(error => {
                        log.warn(`Testing was not deleted by ID: ${id}. Cause: ${error}`);
                        reject(`Testing was not deleted`)
                    })
                    .finally(() => {
                        connection.close();
                    });
            });
        });
    }

};
