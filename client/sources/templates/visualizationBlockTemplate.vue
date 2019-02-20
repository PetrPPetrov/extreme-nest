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
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas || $store.getters.nestingRequest.sheets.length <= 1}"
                :disabled="$root.$data.isEmptyCanvas || $store.getters.nestingRequest.sheets.length <= 1"><</button>
        <button class="block-button"
                @click="onClickNextSheet"
                :class="{'disabled-block-button' :$root.$data.isEmptyCanvas || $store.getters.nestingRequest.sheets.length <= 1}"
                :disabled="$root.$data.isEmptyCanvas || $store.getters.nestingRequest.sheets.length <= 1">></button>
        <button class='block-button'
                @click="onClickDown"
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas}"
                :disabled="$root.$data.isEmptyCanvas">+</button>
        <button class="block-button"
                @click="onClickUp"
                :class="{'disabled-block-button' : $root.$data.isEmptyCanvas}"
                :disabled="$root.$data.isEmptyCanvas">-</button>
        <p class="log-message">
            Count sheets: {{ $store.getters.nestingRequest.sheets.length }}
            Current sheet: {{ openedSheetIndex + 1 }} ID: {{ $store.getters.openedSheetNumber }}
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
                openedSheetIndex: 0,
                baseScale: 1,
                width: 0,
                height: 0,
                transX: 0,
                transY: 0,
                scale: 1,
                mouseDown: false,
                oldPageX : 0,
                oldPageY : 0
            }
        },
        methods : {

            onMouseMoveInCanvas: function(event){
                if (this.mouseDown) {
                    this.transX -= (this.oldPageX - event.pageX) / this.scale;
                    this.transY -= (this.oldPageY - event.pageY) / this.scale;
                    this.applyTransform();
                    this.oldPageX = event.pageX;
                    this.oldPageY = event.pageY;
                }
            },

            onMouseDownInCanvas: function(event) {
                this.mouseDown = true;
                this.oldPageX = event.pageX;
                this.oldPageY = event.pageY;
            },

            omMouseUpInCanvas: function(){
                this.mouseDown = false;
            },

            onMouseWheelInCanvas: function(event){
                const canvas = document.getElementById('canvas');
                const offset = canvas.getBoundingClientRect();
                const centerX = event.pageX - offset.left;
                const centerY = event.pageY - offset.top;
                const zoomStep = event.deltaY * 0.001;
                this.setScale(this.scale - zoomStep, centerX, centerY);
            },

            setScale : function (scaleToSet, anchorX, anchorY) {
                const zoomMax = 10;
                const zoomMin = 1;
                if (scaleToSet > zoomMax * this.baseScale) {
                    scaleToSet = zoomMax * this.baseScale;
                } else if (scaleToSet < zoomMin * this.baseScale) {
                    scaleToSet = zoomMin * this.baseScale;
                }

                if (typeof anchorX != 'undefined' && typeof anchorY != 'undefined') {
                    const zoomStep = scaleToSet / this.scale;
                    this.transX -= (zoomStep - 1) / scaleToSet * anchorX;
                    this.transY -= (zoomStep - 1) / scaleToSet * anchorY;
                }

                this.scale = scaleToSet;
                this.applyTransform();
            },

            applyTransform: function () {
                let group = new fabric.Group(this.$store.getters.canvas.getObjects());
                group.scaleX = this.scale / this.$store.getters.canvas.scale;
                group.scaleY = this.scale / this.$store.getters.canvas.scale;
                group.left = group.width / 2 + this.transX * this.scale;
                group.top = group.height / 2 + this.transY * this.scale;
                group.destroy();

                this.$store.getters.canvas.scale = this.scale;
                this.$store.getters.canvas.renderAll();
            },

            onClickPrevSheet : function () {
                const nestingRequest = this.$store.getters.nestingRequest;
                const nestingResponse = this.$store.getters.nestingResponse;
                const sheetsId = nestingRequestParser.getAllSheetsId(nestingRequest);
                if (sheetsId[this.openedSheetIndex - 1] !== undefined) {
                    const sheetId = sheetsId[--this.openedSheetIndex];
                    this.$store.dispatch('openedSheetNumber', sheetId);
                    canvasPainter.draw(this.$store.getters.canvas, sheetId, nestingRequest, nestingResponse);
                }
            },

            onClickNextSheet : function() {
                const nestingRequest = this.$store.getters.nestingRequest;
                const nestingResponse = this.$store.getters.nestingResponse;
                const sheetsId = nestingRequestParser.getAllSheetsId(nestingRequest);
                if (sheetsId[this.openedSheetIndex + 1] !== undefined) {
                    const sheetId = sheetsId[++this.openedSheetIndex];
                    this.$store.dispatch('openedSheetNumber', sheetId);
                    canvasPainter.draw(this.$store.getters.canvas, sheetId, nestingRequest, nestingResponse);
                }
            },

            onClickDown : function() {
                const canvas = document.getElementById('canvas');
                const offset = canvas.getBoundingClientRect();
                const centerX = event.pageX - offset.left;
                const centerY = event.pageY - offset.top;
                this.setScale(this.scale + 0.125, centerX, centerY);
                this.setScale(this.scale + 0.125, centerX, centerY);
            },

            onClickUp : function () {
                const canvas = document.getElementById('canvas');
                const offset = canvas.getBoundingClientRect();
                const centerX = event.pageX - offset.left;
                const centerY = event.pageY - offset.top;
                this.setScale(this.scale - 0.125, centerX, centerY);
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