// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore';
import networkConfiguration from '../resources/data/network'

function HttpClient(http) {
    this.http = http;
}

HttpClient.prototype.runNewTesting = function() {
    return this.http.post(`${networkConfiguration.databaseServer.address}/testing`)
        .then(response => response.body)
};

HttpClient.prototype.getAllTestsID = function() {
    return this.http.get(`${networkConfiguration.databaseServer.address}/nesting`)
        .then(response => response.body)
};

HttpClient.prototype.getAllTestingResults = function() {
    return this.http.get(`${networkConfiguration.databaseServer.address}/testing`)
        .then(response => response.body)
};

HttpClient.prototype.getTestByTestID = function(testID) {
    return Promise.all([this.getGoldRequestByTestID(testID), this.getGoldResponseByTestID(testID)])
        .then(([goldRequest, goldResponse]) => ({ goldRequest: goldRequest, goldResponse: goldResponse }))
};

HttpClient.prototype.removeTestByID = function(testID) {
    return this.http.delete(`${networkConfiguration.databaseServer.address}/nesting/${testID}`)
        .then(response => response.body.result)
};

HttpClient.prototype.removeTestingResultByID = function(testingResultID) {
    return this.http.delete(`${networkConfiguration.databaseServer.address}/testing/${testingResultID}`)
        .then(response => response.body.result)
};

HttpClient.prototype.getGoldRequestByTestID = function(testID) {
    return this.http.get(`${networkConfiguration.databaseServer.address}/goldRequests/${testID}`)
        .then(response => response.body)
};

HttpClient.prototype.getGoldResponseByTestID = function(testID) {
    return this.http.get(`${networkConfiguration.databaseServer.address}/goldResponses/${testID}`)
        .then(response => response.body)
};

export default HttpClient;