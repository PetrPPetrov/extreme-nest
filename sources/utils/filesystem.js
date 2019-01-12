// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const fs = require('fs');
const util = require('util');

module.exports.readFile = async (fileName) => {
    const readFile = util.promisify(fs.readFile);
    return await readFile(fileName);
};