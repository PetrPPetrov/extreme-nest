// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const log4js = require('log4js');
const ObjectId = require('mongodb').ObjectId;

const log = log4js.getLogger(__filename);
log.level = 'debug';

const testingTableName = 'testing';

module.exports = {

    createNewTesting: (database) => {
        const today = new Date();
        const date = `${today.getDate()}.${(today.getMonth()+1)}.${today.getFullYear()}`;
        const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        return new Promise((resolve, reject) => {
            database.collection(testingTableName).insertOne({ date: date, time: time })
                .then(result => {
                    const newTesting = result.ops[0];
                    log.debug(`New testing was created. ID: ${newTesting._id}`);
                    resolve(newTesting);
                })
                .catch(error => {
                    log.warn(`New testing was not created. Cause: ${error}`);
                    reject('New testing was not creating')
                });
        });
    },

    getAllTestings: (database) => {
        return new Promise((resolve, reject) => {
            database.collection(testingTableName).find({}).toArray()
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

    getTestingByID: (database, testingID) => {
        return new Promise((resolve, reject) => {
            database.collection(testingTableName).findOne(ObjectId(testingID))
                .then(testing => {
                    log.debug(`Testing was found by ID: ${testingID}`);
                    resolve(testing);
                })
                .catch(error => {
                    log.warn(`Testing was not found by ID: ${testingID}. Cause: ${error}`);
                    reject(`Testing was not found`)
                });
        });
    },

    removeTestingByID: (database, testID) => {
        return new Promise((resolve, reject) => {
            database.collection(testingTableName).deleteOne({"_id": ObjectId(testID)})
                .then(() => {
                    log.debug(`Testing was deleted by ID: ${testID}`);
                    resolve();
                })
                .catch(error => {
                    log.warn(`Testing was not deleted by ID: ${testID}. Cause: ${error}`);
                    reject(`Testing was not deleted`)
                });
        });
    }

};
