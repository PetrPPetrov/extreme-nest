// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of deep-nest-rest project.
// This software is intellectual property of GkmSoft.

const requestParser = require('./nestingRequestParser');
const responseParser = require('./nestingResponseParser');

module.exports.drawNestingOptimizationSheet = (canvas, context, sheetID, jsonNestingRequest, jsonNestingResponse) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 0;//configuration.canvasLineWidth;

    const sheet = requestParser.getSheetById(jsonNestingRequest, sheetID);
    const blockHeight = canvas.height / sheet.height;
    const blockWidth = canvas.width / sheet.length;

    const nesting = responseParser.getNestingBySheetId(jsonNestingResponse, sheetID);
    nesting.nested_parts.forEach((part) => {
        const xPartPosition = part.position[0];
        const yPartPosition = part.position[1];
        const color = generateColor();
        context.strokeStyle = color;
        context.fillStyle = color;
        context.beginPath();
        if (part.angle !== 0) {
            context.save();
            context.translate(xPartPosition * blockWidth, yPartPosition * blockHeight);
            context.rotate(part.angle * Math.PI / 180.0);
            context.moveTo(0, 0);
        } else {
            context.moveTo(xPartPosition * blockWidth, yPartPosition * blockHeight);
        }
        const geometry = requestParser.getGeometryById(jsonNestingRequest, part.id);
        geometry.geometry.forEach((vertices) => {
            vertices.forEach((vertex) => {
                const xVertexPosition = vertex[0];
                const yVertexPosition = vertex[1];
                if (part.angle !== 0) {
                    context.lineTo(
                        xVertexPosition * blockWidth,
                        yVertexPosition * blockHeight
                    );
                } else {
                    context.lineTo(
                        (xVertexPosition + xPartPosition) * blockWidth,
                        (yVertexPosition + yPartPosition) * blockHeight
                    );
                }
            });
        });
        if (part.angle !== 0) {
            context.restore();
        }
        context.fill();
        context.closePath();
    });
};

function generateColor() {
    const letters = '0123456789ABCDE';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}
