<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 visualization-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Visualization area</p>
        <p class="description">
            You can see result of nesting optimization right here. For it
            you need get full nesting result and click on <b>Visualize</b> button.
            Also yo can download this image, for it click on button <b>Download</b>.
        </p>
        <button class='block-button' @click="onClickPrevSheet"><</button>
        <button class="block-button" @click="onClickNextSheet">></button>
        <button class='block-button' @click="onClickDown">+</button>
        <button class="block-button" @click="onClickUp">-</button>
        <canvas id="canvas"></canvas>
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
                currentScaling: 1,
                minScaling: 1,
                maxScaling: 5,
            }
        },
        methods : {

            onClickPrevSheet : function () {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                const sheetsId = nestingRequestParser.getAllSheetsId(nestingRequest);
                if (sheetsId[this.openedSheetIndex - 1] !== undefined) {
                    const sheetId = sheetsId[--this.openedSheetIndex];
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse, this.currentScaling);
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
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse, this.currentScaling);
                }
            },

            onClickDown : function() {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                if (this.currentScaling + 1 <= this.maxScaling) {
                    this.currentScaling++;
                    const sheetId = nestingRequestParser.getAllSheetsId(nestingRequest)[this.openedSheetIndex];
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse, this.currentScaling);
                }
            },

            onClickUp : function () {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const nestingRequest = this.$root.$data.nestingRequest;
                const nestingResponse = this.$root.$data.nestingResponse;
                if (this.currentScaling - 1 >= this.minScaling) {
                    this.currentScaling--;
                    const sheetId = nestingRequestParser.getAllSheetsId(nestingRequest)[this.openedSheetIndex];
                    canvasPainter.drawNestingOptimizationSheet(canvas, context, sheetId, nestingRequest, nestingResponse, this.currentScaling);
                }
            }
            
        }
    }

</script>

<style scoped>

    .block-button {
        margin-top: 5px;
        width: 15%;
    }

    canvas {
        width: 100%;
        height: 375px;
        border-radius: 5px;
        margin-top: 8px;
        background-color: white;
    }

    .visualization-form {
        text-align: center;
        margin-top: 13%;
        height: 500%;
    }

    img {
        width: 100px;
        height: auto;
        margin-top: 25%;
    }

    .description {
        margin-left: 0;
    }

</style>