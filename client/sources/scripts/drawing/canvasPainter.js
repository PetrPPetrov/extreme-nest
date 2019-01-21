module.exports.drawNestingOptimization = (canvas, context, jsonPrimitivesStructure) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;
    // Wall
    context.strokeRect(32.5, 70, 75, 55);

    // Door
    context.fillRect(65, 95, 20, 30);

    // Roof
    context.moveTo(25, 70);
    context.lineTo(75, 30);
    context.lineTo(125, 70);
    context.closePath();
    context.stroke();
};

function getSheetById(nestingRequest, id) {
    return nestingRequest.sheets.find((sheet) => {
        if (sheet.id === id) {
            return sheet;
        }
    });
}

function getFirstNestingSheetId(nestingResult) {
    if (!nestingResult.nestings.length) {
        throw Error("Nesting Result Processing Error: No Nestings");
    }
    console.log('getFirstNestingSheetId: ' + nestingResult.nestings[0].sheet)
    return nestingResult.nestings[0].sheet;
}

function drawFirstSheet(nestingRequest, nestingResult, context) {
    console.log('drawFirstSheet');
    console.log('nestingRequest' + nestingRequest);
    console.log('nestingResult' + nestingResult);
    getFirstNestingSheetId(nestingResult);
}

