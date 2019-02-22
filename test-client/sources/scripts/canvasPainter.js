// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

const functional = require('./functionalUtils');
const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

let blockSize = 0;

const drawCanvas = (canvas, nestingRequest, nestingResponse, canvasBlockSize) => {
    blockSize = canvasBlockSize;
    const openedSheetID = requestParser.getAllSheetsId(nestingRequest)[0];
    const sheet = requestParser.getSheetById(nestingRequest, openedSheetID);
    canvas.add(createSheetBorder(canvas, sheet.length * blockSize, sheet.height * blockSize));
    const nesting = responseParser.getNestingBySheetId(nestingResponse, openedSheetID);

    nesting.nested_parts.forEach(part => {
        const instanceID = part.id;
        const rotationAngle = part.angle;
        const position = part.position;
        const xPos = position[0];
        const yPos = position[1];

        const geometry = requestParser.getGeometryById(nestingRequest, instanceID);
        functional.doIf(geometry, () => {
            const color = generateColorByPosition(position);
            canvas.add(createLocalCoordinateSystem(position, rotationAngle, color));
            geometry.geometry.forEach(vertices =>
                canvas.add(new fabric.Path(createCoordinates(vertices), {
                    top: yPos * blockSize,
                    left: xPos * blockSize,
                    angle: rotationAngle,
                    fill: color
                }))
            )
        });
    });

    canvas.renderAll();
};

function createSheetBorder(canvas, width, height) {
    const borderCoordinates = `M 0 0 L 0 ${height} L ${width} ${height} L ${width} 0 L 0 0`;
    return new fabric.Path(borderCoordinates, {
        fill: 'white',
        stroke: 'black'
    });
}

function createCoordinates(vertices){
    let coordinates = `M 0 0 L 0 0 M ${vertices[0][0] * blockSize} ${vertices[0][1] * blockSize}`;
    vertices.forEach(vertex => coordinates += ` L ${vertex[0] * blockSize} ${vertex[1] * blockSize}`);
    return coordinates;
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

function generateColorByPosition(position) {
    const x = ((position[0] + 17) * 23).toString(16).padStart(3, 0);
    const y = ((position[1] + 13) * 31).toString(16).padStart(3, 0);
    return `#${x}${y}`.slice(0, 7);
}

export default drawCanvas