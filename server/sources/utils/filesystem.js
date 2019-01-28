// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

'use strict';

const fs = require('fs');
const util = require('util');

module.exports.readFileAsync = async (fileName) => {
    const readFile = util.promisify(fs.readFile);
    return await readFile(fileName);
};

module.exports.isFileExistsSync = (fileName) => {
    return fs.existsSync(fileName);
};

module.exports.getFileSizeSync = (fileName) => {
    const stats = fs.statSync(fileName);
    return stats['size'];
};