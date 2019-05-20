// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

let blockSize = 0;

const drawCanvas = (canvas, nestingRequest, nestingResponse, canvasBlockSize) => {
    blockSize = canvasBlockSize;
    const openedSheetID = requestParser.getAllSheetsId(nestingRequest)[0];
    const sheet = requestParser.getSheetById(nestingRequest, openedSheetID);
    canvas.add(createSheetBorder(sheet.length * blockSize, sheet.height * blockSize));
    if (sheet.defects) {
        sheet.defects.forEach(defect => canvas.add(createDefect(defect)));
    }

    const nesting = responseParser.getNestingBySheetId(nestingResponse, openedSheetID);
    nesting.nested_parts.forEach(part => {
        const instanceID = part.id;
        const rotationAngle = part.angle;
        const position = part.position;
        const xPos = position[0];
        const yPos = position[1];

        const geometry = requestParser.getGeometryById(nestingRequest, instanceID);
        if (geometry) {
            const color = generateColor();
            canvas.add(createLocalCoordinateSystem(position, rotationAngle, color));
            geometry.geometry.forEach(vertices => {
                const [xAlignment, yAlignment] = getAlignment(vertices, rotationAngle);
                canvas.add(new fabric.Path(createCoordinates(vertices), {
                    top: yPos * blockSize + (yAlignment * blockSize),
                    left: xPos * blockSize + (xAlignment * blockSize),
                    angle: rotationAngle,
                    fill: color
                }));
            });
        }
    });

    canvas.renderAll();
};

function getAlignment(vertices, angle) {
    let maxXAlignment = 0.0;
    let maxYAlignment = 0.0;
    vertices.forEach(vertex => {
        if (parseFloat(vertex[0]) < maxXAlignment) {
            maxXAlignment = vertex[0];
        }
        if (parseFloat(vertex[1]) < maxYAlignment) {
            maxYAlignment = vertex[1];
        }
    });

    if (angle === 180) {
        return [-maxXAlignment, -maxYAlignment]
    } else {
        return [maxXAlignment, maxYAlignment]
    }
}

function createSheetBorder(width, height) {
    return new fabric.Path(`M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0`, {
        fill: 'white',
        stroke: 'black'
    });
}

function createDefect(defect) {
    return new fabric.Path(`M ${defect[0][0]*blockSize} ${defect[0][1]*blockSize} 
        L ${defect[1][0]*blockSize} ${defect[1][1]*blockSize}
        L ${defect[2][0]*blockSize} ${defect[2][1]*blockSize} 
        L ${defect[3][0]*blockSize} ${defect[3][1]*blockSize} 
        L ${defect[0][0]*blockSize} ${defect[0][1]*blockSize}`, {
            fill: 'white',
            stroke: 'black'
    });
}

function createCoordinates(vertices){
    let startPosition = [`M 0 0 L 0 0 M ${vertices[0][0] * blockSize} ${vertices[0][1] * blockSize}`];
    return [startPosition, vertices.map(vertex => ` L ${vertex[0] * blockSize} ${vertex[1] * blockSize}`)].join('');
}

function createLocalCoordinateSystem(vertex, angle, color) {
    let coordinates = ` M 0 0 L ${blockSize} 0 M 0 0 L 0 ${blockSize}`;
    return new fabric.Path(coordinates, {
        strokeDashArray: [2, 2],
        stroke: color,
        top: vertex[1] * blockSize,
        left: vertex[0] * blockSize,
        angle: angle
    });
}

function generateColor() {
    const hexValues = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e"];
    let newColor = "#";
    for (let i = 0; i < 6; i++ ) {
        newColor += hexValues[Math.round( Math.random() * 14 )];
    }
    return newColor;
}

export default drawCanvas