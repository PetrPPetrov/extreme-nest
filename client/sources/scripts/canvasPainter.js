// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const functional = require('./functionalUtils');
const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

module.exports.drawNestingOptimizationSheet = (canvas, context, sheetID, jsonNestingRequest, jsonNestingResponse, scaling, alignmentX, alignmentY) => {
    const sheet = requestParser.getSheetById(jsonNestingRequest, sheetID);
    canvas.height = sheet.height * 30;
    canvas.width = sheet.length * 30;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 0;
    context.scale(1, 1);
    context.transform(1, 0, 0, -1, 0, canvas.height);
    context.translate(alignmentX, alignmentY);

    drawSheetBorder(context, sheet.length * scaling, sheet.height * scaling);
    responseParser.getNestingBySheetId(jsonNestingResponse, sheetID).nested_parts.forEach((part) => {
        const geometry = requestParser.getGeometryById(jsonNestingRequest, part.id);
        functional.doIf(geometry !== undefined, () => {
            drawGeometry(context, geometry.geometry, part.angle, {
                scaling: scaling,
                xPartPosition: part.position[0],
                yPartPosition: part.position[1]
            });
        });

        const holes = requestParser.getHolesById(jsonNestingRequest, part.id);
        functional.doIf(holes !== undefined, () =>
            drawHoles(context, holes.holes, part.angle, {
                scaling: scaling,
                xPartPosition: part.position[0],
                yPartPosition: part.position[1]
            })
        );
    });
};

function drawSheetBorder(context, canvasWidth, canvasHeight) {
    context.strokeStyle = '#000';
    context.fillStyle = '#000';

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0 , canvasHeight);
    context.lineTo(canvasWidth, canvasHeight);
    context.lineTo(canvasWidth, 0);
    context.lineTo(0, 0);
    context.stroke();
    context.closePath();
}

function drawGeometry(context, geometry, angle, dimension) {
    const color = generateColorByPosition(
        dimension.xPartPosition,
        dimension.yPartPosition
    );
    context.strokeStyle = color;
    context.fillStyle = color;

    geometry.forEach((vertices) => {
        context.save();
        context.translate(
            dimension.xPartPosition * dimension.scaling,
            dimension.yPartPosition * dimension.scaling
        );
        functional.doIf(angle !== 0, () => context.rotate(angle * Math.PI / 180.0));
        drawLocalCoordinateSystem(context, dimension.scaling);
        context.beginPath();
        context.moveTo(
            vertices[0][0] * dimension.scaling,
            vertices[0][1] * dimension.scaling
        );
        vertices.forEach((vertex) => {
            context.lineTo(
                vertex[0] * dimension.scaling,
                vertex[1] * dimension.scaling
            );
        });
        context.fill();
        context.closePath();
        context.restore();
    });
}

function drawLocalCoordinateSystem(context, scaling) {
    context.beginPath();
    context.setLineDash([3, 3]);
    context.moveTo(0, 0);
    context.lineTo(scaling , 0);
    context.moveTo(0, 0);
    context.lineTo(0, scaling);
    context.stroke();
    context.closePath();
}

function drawHoles(context, holes, angle, dimension){
    context.strokeStyle = '#FFF';
    context.fillStyle = '#FFF';

    holes.forEach((vertices) => {
        context.save();
        context.translate(
            dimension.xPartPosition * dimension.scaling,
            dimension.yPartPosition * dimension.scaling
        );
        functional.doIf(angle !== 0, () => context.rotate(angle * Math.PI / 180.0));
        context.beginPath();
        context.moveTo(
            vertices[0][0] * dimension.scaling,
            vertices[0][1] * dimension.scaling
        );
        vertices.forEach((vertex) => {
            context.lineTo(
                vertex[0] * dimension.scaling,
                vertex[1] * dimension.scaling
            );
        });
        context.fill();
        context.closePath();
        context.restore();
    });
}

function generateColorByPosition(xPos, yPos) {
    const x = ((xPos + 17) * 23).toString(16).padStart(3, 0);
    const y = ((yPos + 13) * 31).toString(16).padStart(3, 0);
    return `#${x}${y}`.slice(0, 7);
}

function generateColor() {
    const letters = '0123456789ABCDE';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}
