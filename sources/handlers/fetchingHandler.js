// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const log4js = require('log4js');

module.exports.onRequest = (request, response) => {
    const log = log4js.getLogger(__filename);
    log.level = 'debug';
    log.debug('Request was came to the fetching handler');
    const id = request.params.id;
    response.send("Successfuly completed.");
};