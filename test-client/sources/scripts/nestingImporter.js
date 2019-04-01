// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import * as _ from 'underscore'
import converter from 'xml-js'

const convertToJSONNestingRequest = function (xmlNestingRequest) {
    const jsonText = converter.xml2json(xmlNestingRequest, {compact: true, spaces: 4});
    const jsonRequest = JSON.parse(jsonText);

    const jsonProblem = jsonRequest.nesting.problem;
    const boardComponentAttrs = jsonProblem.boards.piece.component._attributes;
    const sheetComponent = {
        id: 111, // TODO: need to add id generation
        polygonID: boardComponentAttrs.idPolygon,
        type: boardComponentAttrs.type,
        xOffset: parseFloat(boardComponentAttrs.xOffset),
        yOffset: parseFloat(boardComponentAttrs.yOffset)
    };

    let pieces = [];
    let uniquePieceID = 1;
    jsonProblem.lot.piece.forEach(piece => {
        const quantity = piece._attributes.quantity;
        const pieceID = piece._attributes.id;
        const pieceComponentAttrs = piece.component._attributes;
        for (let i = 0; i < quantity; i++) {
            pieces.push({
                id: uniquePieceID++,
                pieceID: pieceID,
                polygonID: pieceComponentAttrs.idPolygon,
                type: pieceComponentAttrs.type,
                xOffset: parseFloat(pieceComponentAttrs.xOffset),
                yOffset: parseFloat(pieceComponentAttrs.yOffset)
            });
        }
    });

    let polygons = [];
    jsonRequest.nesting.polygons.polygon.forEach(polygon => {
        const polygonAttrs = polygon._attributes;
        const polygonID = polygonAttrs.id;
        if (polygonID.startsWith('polygon')){
            const countVertices = polygonAttrs.nVertices;
            const lines = polygon.lines.segment.map(segment => ({
                x0: parseFloat(segment._attributes.x0),
                y0: parseFloat(segment._attributes.y0),
                x1: parseFloat(segment._attributes.x1),
                y1: parseFloat(segment._attributes.y1)
            }));
            polygons.push({
                polygonID: polygonID,
                countVertices: countVertices,
                lines: lines
            });
        }
    });

    const solution = _.first(jsonRequest.nesting.solutions.solution);
    if (_.isNull(solution) || _.isUndefined(solution)) {
        throw new Error("Nesting does not contain solution");
    }

    const placements = solution.placement.map(placement => ({
        pieceID: placement._attributes.idPiece,
        angle: parseFloat(placement._attributes.angle),
        xPos: parseFloat(placement._attributes.x),
        yPos: parseFloat(placement._attributes.y)
    }));

    const nestingRequest = convertRequestToPowerNestAPI(sheetComponent, pieces, polygons);
    const nestingResponse = convertResponseToPowerNestAPI(sheetComponent, pieces, placements);
    return [ nestingRequest, nestingResponse ];
};

function convertRequestToPowerNestAPI(sheetComponent, pieces, polygons) {
    const nestingRequest = {};
    nestingRequest.parts = [];
    nestingRequest.sheets = [];
    nestingRequest.time = 120; // TODO

    const polygon = _.find(polygons, polygon => polygon.polygonID === sheetComponent.polygonID);
    const polygonLines = polygon.lines;
    nestingRequest.sheets.push({
        id: sheetComponent.id,
        length: (polygonLines[0].x1 - polygonLines[0].x0),
        height: (polygonLines[1].y1 - polygonLines[1].y0)
    });

    pieces.forEach(piece => {
        const polygon = _.find(polygons, polygon => polygon.polygonID === piece.polygonID);
        const geometry = polygon.lines.map(line => [ parseFloat(line.x0), parseFloat(line.y0) ]);
        nestingRequest.parts.push({
            geometry: [geometry],
            instances: [{
                id: piece.id,
                pieceID: piece.pieceID,
                quantity: 1
            }]
        });
    });

    return nestingRequest;
}

function convertResponseToPowerNestAPI(sheetComponent, pieces, placements) {
    const nestingResponse = {};
    nestingResponse.nestings = [];
    nestingResponse.methods = 'Successfully completed';

    nestingResponse.nestings.push({
        sheet: sheetComponent.id,
        nested_parts: []
    });
    placements.forEach(placement => {
        const piece = _.find(pieces, piece => piece.pieceID === placement.pieceID);
        _.first(nestingResponse.nestings).nested_parts.push({
            id: piece.id,
            pieceID: piece.pieceID,
            flip: false,
            angle: parseFloat(placement.angle),
            position: [ parseFloat(placement.xPos), parseFloat(placement.yPos) ]
        });
    });

    return nestingResponse;
}

export default convertToJSONNestingRequest