// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

const generateRandomNestingRequestForServerAsync = async (countFigures, sheetWidth, sheetHeight, nestingTime) => {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = nestingTime;

    const sheetID = 55; // TODO: need to generate id
    nestingRequest.sheets.push({
        'height': sheetHeight,
        'length': sheetWidth,
        'id': sheetID
    });

    const figureID = 11; //TODO: need to generate id
    const rectangleHeight = (sheetHeight / countFigures) * 2;
    const rectangleWidth = sheetWidth / 2;
    nestingRequest.parts.push({
        'geometry': [[
            [0, 0],
            [rectangleWidth, 0],
            [rectangleWidth, rectangleHeight],
            [0, rectangleWidth]
        ]],
        'instances': [{
            'quantity': countFigures,
            'id': figureID
        }]
    });

    return nestingRequest;
};

export default generateRandomNestingRequestForServerAsync