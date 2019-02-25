// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const request = require("supertest");

const server = require("../sources/server").server;

describe("Tests for router", () => {

    it("Check query for saving requests", done => {
        request(server).post("/requests").expect(201).end(done)
    });

    it("Check query for saving gold responses", done => {
        request(server).post("/goldResponses").expect(201).end(done)
    });

    it("Check query for sending on incorrect server URL", done => {
        request(server).get("/incorrect_path").expect(404).end(done)
    });

    it("Check query for getting request by id", done => {
        request(server).get("/requests/1").expect(200).end(done)
    });

    it("Check query for getting server response by id", done => {
        request(server).get("/serverResponses/1").expect(200).end(done)
    });

    it("Check query for getting gold response by id", done => {
        request(server).get("/goldResponses/1").expect(200).end(done)
    });

});
