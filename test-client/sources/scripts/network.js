// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import networkConfiguration from '../resources/data/network'

function HttpClient(http) {
    this.http = http;
}


// Testing results
HttpClient.prototype.getAllTestingResults = function() {
    return this.http.get(`${networkConfiguration.databaseServer.address}/testing`)
        .then(response => response.body);
};

HttpClient.prototype.runNewTesting = function() {
    return this.http.post(`${networkConfiguration.databaseServer.address}/testing`)
        .then(response => response.body);
};

HttpClient.prototype.changeTestStatus = function(testingID, testID, status) {
    return this.http.put(`${networkConfiguration.databaseServer.address}/testing/${testingID}`, { testID: testID, status: status })
        .then(response => response.body);
};

HttpClient.prototype.removeTestingResultByID = function(testingResultID) {
    return this.http.delete(`${networkConfiguration.databaseServer.address}/testing/${testingResultID}`)
        .then(response => response.body.result);
};


// Tests
HttpClient.prototype.getTestByTestID = function(testID) {
    return Promise.all([this.getGoldRequestByTestID(testID), this.getGoldResponseByTestID(testID)])
        .then(([goldRequest, goldResponse]) => ({ goldRequest: goldRequest, goldResponse: goldResponse }));
};

HttpClient.prototype.getAllTestsID = function() {
    return this.http.get(`${networkConfiguration.databaseServer.address}/nesting`)
        .then(response => response.body);
};

HttpClient.prototype.createNewTest = function() {
    return this.http.post(`${networkConfiguration.databaseServer.address}/nesting`)
        .then(response => response.body);
};

HttpClient.prototype.changeTestAlias = function(testID, newAlias) {
    return this.http.put(`${networkConfiguration.databaseServer.address}/nesting/${testID}`, { alias: newAlias })
        .then(response => response.body.result);
};

HttpClient.prototype.removeTestByID = function(testID) {
    return this.http.delete(`${networkConfiguration.databaseServer.address}/nesting/${testID}`)
        .then(response => response.body.result);
};


// Gold requests
HttpClient.prototype.getGoldRequestByTestID = function(testID) {
    return this.http.get(`${networkConfiguration.databaseServer.address}/goldRequests/${testID}`)
        .then(response => response.body);
};

HttpClient.prototype.joinGoldRequestToTest = function(goldRequest, testID) {
    return this.http.post(`${networkConfiguration.databaseServer.address}/goldRequests/${testID}`, goldRequest)
        .then(response => response.body);
};


// Gold responses
HttpClient.prototype.getGoldResponseByTestID = function(testID) {
    return this.http.get(`${networkConfiguration.databaseServer.address}/goldResponses/${testID}`)
        .then(response => response.body);
};

HttpClient.prototype.joinGoldResponseToTest = function(goldResponse, testID) {
    return this.http.post(`${networkConfiguration.databaseServer.address}/goldResponses/${testID}`, goldResponse)
        .then(response => response.body);
};


export default HttpClient;