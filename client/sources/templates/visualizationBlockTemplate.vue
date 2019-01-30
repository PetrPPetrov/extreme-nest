<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 visualization-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Visualization area</p>
        <canvas
                @mousemove="onMouseMoveInCanvas"
                @mousedown="onMouseDownInCanvas"
                @mouseup="omMouseUpInCanvas"
                @wheel="onMouseWheelInCanvas"
                id="canvas"></canvas>
        <button class='block-button'
                @click="onClickPrevSheet"
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas || $root.$data.nestingRequest.sheets.length <= 1}"
                :disabled="$root.$data.isEmptyCanvas || $root.$data.nestingRequest.sheets.length <= 1"><</button>
        <button class="block-button"
                @click="onClickNextSheet"
                :class="{'disabled-block-button' :$root.$data.isEmptyCanvas || $root.$data.nestingRequest.sheets.length <= 1}"
                :disabled="$root.$data.isEmptyCanvas || $root.$data.nestingRequest.sheets.length <= 1">></button>
        <button class='block-button'
                @click="onClickDown"
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas}"
                :disabled="$root.$data.isEmptyCanvas">+</button>
        <button class="block-button"
                @click="onClickUp"
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas}"
                :disabled="$root.$data.isEmptyCanvas">-</button>
        <p class="log-message">
            Count sheets: {{ $root.$data.nestingRequest.sheets.length }}
            Current sheet: {{ openedSheetIndex + 1 }} ID: {{ openedSheetNumber }}
        </p>
    </div>

</template>

<script>

    import image from '../resources/images/visualization-icon.png'

    const canvasPainter = require('../scripts/canvasPainter');
    const nestingRequestParser = require('../scripts/nestingRequestParser');

    export default {
        name: 'visualizationBlockTemplate',
        data: function () {
            return {
                image: image,
                isSingleSheet: true,
                openedSheetIndex: 0,
                openedSheetNumber: 0,
                currentScaling: 25,
                minScaling: 10,
                maxScaling: 100,
                alignmentX: 0,
                alignmentY: 0,
                isMousePressed: false,
                mousePressedXPos: 0,
                mousePressedYPos: 0
            }
        },
        methods : {

            onMouseMoveInCanvas: function(event){
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                const sheetId = nestingRequestParser.getAllSheetsId(nestingRequest)[this.openedSheetIndex];
                if (this.isMousePressed) {
                    const currentXPos = event.pageX;
                    const currentYPos = event.pageY;
                    this.alignmentX = currentXPos - this.mousePressedXPos;
                    this.alignmentY = this.mousePressedYPos - currentYPos;
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse,
                        this.currentScaling, this.alignmentX, this.alignmentY);
                }
            },

            onMouseDownInCanvas: function(event) {
                this.mousePressedXPos = event.pageX;
                this.mousePressedYPos = event.pageY;
                this.isMousePressed = true;
            },

            omMouseUpInCanvas: function(event){
                this.isMousePressed = false;
            },

            onMouseWheelInCanvas: function(event){
                if (event.deltaY < 0) {
                    this.onClickDown();
                } else {
                    this.onClickUp();
                }
            },

            onClickPrevSheet : function () {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                const sheetsId = nestingRequestParser.getAllSheetsId(nestingRequest);
                if (sheetsId[this.openedSheetIndex - 1] !== undefined) {
                    const sheetId = sheetsId[--this.openedSheetIndex];
                    this.openedSheetNumber = sheetId;
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse,
                        this.currentScaling, this.alignmentX, this.alignmentY);
                }
            },

            onClickNextSheet : function() {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                const sheetsId = nestingRequestParser.getAllSheetsId(nestingRequest);
                if (sheetsId[this.openedSheetIndex + 1] !== undefined) {
                    const sheetId = sheetsId[++this.openedSheetIndex];
                    this.openedSheetNumber = sheetId;
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse,
                        this.currentScaling, this.alignmentX, this.alignmentY);
                }
            },

            onClickDown : function() {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                if (this.currentScaling + 5 <= this.maxScaling) {
                    this.currentScaling += 5;
                    const sheetId = nestingRequestParser.getAllSheetsId(nestingRequest)[this.openedSheetIndex];
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse,
                        this.currentScaling, this.alignmentX, this.alignmentY);
                }
            },

            onClickUp : function () {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                if (this.currentScaling - 5 >= this.minScaling) {
                    this.currentScaling -= 5;
                    const sheetId = nestingRequestParser.getAllSheetsId(nestingRequest)[this.openedSheetIndex];
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse,
                        this.currentScaling, this.alignmentX, this.alignmentY);
                }
            }
            
        }
    }

</script>

<style scoped>

    .block-button {
        width: 24%;
    }
    
    canvas {
        cursor: move;
        width: 100%;
        height: 405px;
        border-radius: 5px;
        background-color: white;
    }

    .visualization-form {
        text-align: center;
        margin-top: 13%;
    }

    img {
        width: 100px;
        height: auto;
        margin-top: 25%;
    }

    .log-message{
        display: inline-block;
    }

</style>