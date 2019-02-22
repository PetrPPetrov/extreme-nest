// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

const generateGoldNestingAsync = async (countFigures, sheetWidth, sheetHeight, nestingTime) => {
    const nesting = generateNesting(countFigures, sheetWidth, sheetHeight, nestingTime);
    const nestingRequest = nesting[0];
    const nestingResponse = nesting[1];
    return [ nestingRequest, nestingResponse ];
};

function generateNesting(countFigures, sheetWidth, sheetHeight, nestingTime) {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = nestingTime;

    const nestingResponse = {};
    nestingResponse.message = 'successfully completed';
    nestingResponse.nestings = [];

    const sheetID = 55; // TODO: need to generate id
    nestingRequest.sheets.push({
        'height': sheetHeight,
        'length': sheetWidth,
        'id': sheetID
    });

    const figureID = 11; //TODO: need to generate id
    const rectangleHeight = sheetHeight / countFigures;
    const rectangleWidth = sheetWidth / countFigures;
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

    nestingResponse.nestings.push({
        'sheet': sheetID,
        'nested_parts': [],
        'quantity': 1,
        'length': sheetWidth,
        'height': sheetHeight
    });

    let currentXPos = 0;
    let currentYPos = 0;
    nestingRequest.parts.forEach(part => {
        part.instances.forEach(instance => {
            for (let i = 0; i < instance.quantity; i++) {
                if (currentXPos > sheetWidth) {
                    currentYPos += rectangleHeight;
                    currentXPos = 0;
                } else {
                    currentXPos += rectangleWidth;
                }
                nestingResponse.nestings[0].nested_parts.push({
                    'id': figureID,
                    'angle': 0,
                    'flip': false,
                    'position': [currentXPos, currentYPos]
                });
            }
        });
    });

    return [ nestingRequest, nestingResponse ];
}

function calc(sheetWidth, sheetHeight, blockWidth, blockHeight) {
    return Math.max(pack(sheetWidth, sheetHeight, blockWidth, blockHeight), pack(sheetWidth, sheetHeight, blockHeight, blockWidth));
    function pack(sheetWidth, sheetHeight, blockWidth, blockHeight) {
        let count = (sheetWidth / blockWidth | 0) * (sheetHeight / blockHeight | 0);
        if (sheetWidth % blockWidth >= blockHeight && sheetHeight >= blockWidth) {
            count += pack(sheetWidth % blockWidth, sheetHeight, blockHeight, blockWidth);
        } else if (sheetHeight % blockHeight >= blockWidth && sheetWidth >= blockHeight) {
            count += pack(sheetWidth, sheetHeight % blockHeight, blockHeight, blockWidth);
        }
        return count;
    }
}

export default generateGoldNestingAsync