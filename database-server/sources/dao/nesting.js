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
const tableName = 'nesting';

module.exports = {

    create: (database) => {
        return new Promise((resolve, reject) =>
            database.collection(tableName).insertOne({})
                .then(nesting => {
                    log.debug(`New nesting was created ID: ${nesting.ops[0]._id} `);
                    resolve(nesting.ops[0]._id);
                })
                .catch(error => {
                    log.warn(`New nesting was not created. Cause: ${error}`);
                    reject(incorrectID)
                })
        );
    },

    getAll: (database) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).find({}).toArray()
                .then(nestings => {
                    log.debug(`All the nestings were found.`);
                    resolve(nestings);
                })
                .catch(error => {
                    log.warn(`All the nestings were found. Cause: ${error}`);
                    reject([])
                });
        });
    },

    getByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).findOne(ObjectId(id))
                .then(nesting => {
                    log.debug(`Nesting with ID: ${id} was found`);
                    resolve(nesting);
                })
                .catch(error => {
                    log.warn(`Nesting with ID: ${id} was not found. Cause: ${error}`);
                    reject({})
                });
        });
    },

    updateByID: (database, id, properties) => {
        return new Promise((resolve, reject) =>
            database.collection(tableName).updateOne({"_id": ObjectId(id)}, {"$set": properties})
                .then(() => {
                    log.debug(`Nesting with ID: ${id} was changed`);
                    resolve({});
                })
                .catch(error => {
                    log.warn(`Nesting with ID: ${id} was not changed. Cause: ${error}`);
                    reject({});
                })
        );
    },

    removeByID: (database, id) => {
        return new Promise((resolve, reject) => {
            database.collection(tableName).deleteOne({"_id": ObjectId(id)})
                .then(() => {
                    log.debug(`Nesting was deleted by ID: ${id}`);
                    resolve(true);
                })
                .catch(error => {
                    log.warn(`Nesting was not deleted by ID: ${id}. Cause: ${error}`);
                    reject(false)
                });
        });
    }

};