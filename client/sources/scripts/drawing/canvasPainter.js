//import configuration from '../../resources/data/configuration'

module.exports.drawNestingOptimizationSheet = (canvas, context, sheetID, jsonNestingRequest, jsonNestingResponse) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 0;//configuration.canvasLineWidth;

    const sheet = getSheetById(jsonNestingRequest, sheetID);
    const sheetHeight = sheet.height;
    const sheetWidth = sheet.length;

    const blockHeight = canvas.height / sheetHeight;
    const blockWidth = canvas.width / sheetWidth;

    const nesting = getNestingBySheetId(jsonNestingResponse, sheetID);
    nesting.nested_parts.forEach((part) => {
        const xPos = part.position[0];
        const yPos = part.position[1];
        context.moveTo(xPos * blockWidth, yPos * blockHeight);
        const color = getRandomColor();
        context.strokeStyle = color;
        context.fillStyle = color;
        context.beginPath();
        const geometry = getGeometryById(jsonNestingRequest, part.id);
        geometry.geometry.forEach((vertices) => {
            vertices.forEach((vertex) => {
               const xPos = vertex[0];
               const yPos = vertex[1];
               context.lineTo(xPos * blockWidth, yPos * blockHeight);
            });
        });
        context.fill();
        context.closePath();
    });

    context.stroke();
};

function getSheetById(nestingRequest, id) {
    return nestingRequest.sheets.find((sheet) => {
        if (sheet.id === id) {
            return sheet;
        }
    });
}

function getGeometryById(nestingRequest, id) {
    return nestingRequest.parts.find((part) => {
        if (isExistInstanceInPartWithId(part, id)) {
            return part.geometry;
        }
    });
}

function isExistInstanceInPartWithId(part, id) {
    return part.instances.find((instance) => {
        if (instance.id === id) {
            return true;
        }
    });
}

function getNestingBySheetId(nestingResponse, id) {
    return nestingResponse.nestings.find((nesting) => {
        if (nesting.sheet === id) {
            return nesting;
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDE';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}
