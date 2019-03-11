// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore';

const generateGoldNestingAsync = async (countFigures, sheetWidth, sheetHeight, nestingTime) => {
    return generateNesting(countFigures, sheetWidth, sheetHeight, nestingTime);
};

function Rectangle(width, height, yPosition, xPosition) {
    this.width = width;
    this.height = height;
    this.yPosition = yPosition;
    this.xPosition = xPosition;
}

function divideRectangle(rectangle, countParts, geometry){
    if (countParts === 0) {
        return;
    }
    if (countParts === 1) {
        geometry.push(rectangle);
        return;
    }

    const leftCountParts = Math.floor(countParts / 2);
    const rightCountParts = countParts - leftCountParts;
    let newWidth = rectangle.width;
    let newHeight = rectangle.height;
    if (rectangle.width > rectangle.height)
    {
        newWidth /= 2;
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition), leftCountParts, geometry);
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition + newWidth), rightCountParts, geometry);
    }
    else
    {
        newHeight /= 2;
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition, rectangle.xPosition), leftCountParts, geometry);
        divideRectangle(new Rectangle(newWidth, newHeight, rectangle.yPosition + newHeight, rectangle.xPosition), rightCountParts, geometry);
    }
}

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

    const geometry = [];
    const rootRectangle = new Rectangle(sheetWidth, sheetHeight, 0, 0);
    divideRectangle(rootRectangle, countFigures, geometry);
    console.log(geometry);

    const figureID = 11; //TODO: need to generate id
    const rectangleHeight = (sheetHeight / countFigures) * 2;
    const rectangleWidth = sheetWidth / 2;
    nestingRequest.parts.push({
        'geometry': [[
            [0, 0],
            [rectangleWidth, 0],
            [rectangleWidth, rectangleHeight],
            [0, rectangleHeight]
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
                nestingResponse.nestings[0].nested_parts.push({
                    'id': figureID,
                    'angle': 0,
                    'flip': false,
                    'position': [currentXPos, currentYPos]
                });
                if (currentXPos + rectangleWidth >= sheetWidth) {
                    currentYPos += rectangleHeight;
                    currentXPos = 0;
                } else {
                    currentXPos += rectangleWidth;
                }
            }
        });
    });

    return [ nestingRequest, nestingResponse ];
}

export default generateGoldNestingAsync