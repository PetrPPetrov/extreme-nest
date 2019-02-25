<template>

    <div id="parameters-block" class="block">
        <p class="block-title">Parameters</p>
        <label for="input-count-figures" v-bind:class="{'error-label': (countFigures <= 0 || countFigures === '')}">Count figures:</label>
        <input id="input-count-figures" type="number" v-model="countFigures" v-bind:class="{'error-input': (countFigures <= 0 || countFigures === '')}">
        <label for="input-sheet-width" v-bind:class="{'error-label': (sheetWidth <= 0 || sheetWidth === '')}">Sheet width:</label>
        <input id="input-sheet-width" type="number" v-model="sheetWidth" v-bind:class="{'error-input': (sheetWidth <= 0 || sheetWidth === '')}">
        <label for="input-sheet-height" v-bind:class="{'error-label': (sheetHeight <= 0 || sheetHeight === '')}">Sheet height:</label>
        <input id="input-sheet-height" type="number" v-model="sheetHeight" v-bind:class="{'error-input': (sheetHeight <= 0 || sheetHeight === '')}">
        <label for="input-nesting-time" v-bind:class="{'error-label': (nestingTime <= 0 || nestingTime === '')}">Nesting time in seconds:</label>
        <input id="input-nesting-time" type="number" v-model="nestingTime" v-bind:class="{'error-input': (nestingTime <= 0 || nestingTime === '')}">
        <label for="input-canvas-block-size" v-bind:class="{'error-label': (canvasBlockSize <= 0 || canvasBlockSize === '')}">Block size for canvas:</label>
        <input id="input-canvas-block-size" type="number" v-model="canvasBlockSize" v-bind:class="{'error-input': (canvasBlockSize <= 0 || canvasBlockSize === '')}">
        <hr>
        <button class="button" @click="onClickGenerate"
            :disabled="(countFigures <= 0 || countFigures === '') ||
                       (sheetWidth <= 0 || sheetWidth === '') ||
                       (sheetHeight <= 0 || sheetHeight === '') ||
                       (nestingTime <= 0 || nestingTime === '') ||
                       (canvasBlockSize <= 0 || canvasBlockSize === '')">
            Generate</button>
        <button class="button" disabled @click="onClickSaveTest">Save test</button>
    </div>

</template>

<script>

    import drawCanvas from '../../scripts/canvasPainter'
    import * as functional from '../../scripts/functionalUtils'
    import generateGoldNestingAsync from '../../scripts/goldNestingGenerator'
    import generateRandomNestingRequestForServerAsync from '../../scripts/randomNestingGenerator'

    import networkConfiguration from '../../resources/data/network'

    export default {
        name: "parametersBlockTemplate",
        data() {
            return {
                countFigures: 8,
                sheetWidth: 2,
                sheetHeight: 4,
                nestingTime: 5,
                canvasBlockSize: 20
            }
        },
        methods: {

            onClickGenerate() {
                this.generateGoldNesting();
                this.generateRandomNestingOnServer();
            },

            generateGoldNesting(){
                let canvas = this.$store.getters.canvasGoldGeneration;
                this.$store.dispatch('goldVisualizationLog', 'Gold nesting generation in progress');
                generateGoldNestingAsync(Math.floor(this.countFigures), this.sheetWidth, this.sheetHeight, this.nestingTime)
                    .then(([nestingRequest, nestingResponse]) => {
                        canvas.clear();
                        drawCanvas(canvas, nestingRequest, nestingResponse, this.canvasBlockSize);
                        this.$store.dispatch('goldNestingRequest', JSON.stringify(nestingRequest, null, 4));
                        this.$store.dispatch('goldNestingResponse', JSON.stringify(nestingResponse, null, 4));
                        this.$store.dispatch('goldVisualizationLog', 'Gold nesting generated successfully');
                    })
                    .catch(() => this.$store.dispatch('goldVisualizationLog', 'Gold nesting was not generated'));
            },

            generateRandomNestingOnServer(){
                generateRandomNestingRequestForServerAsync(Math.floor(this.countFigures), this.sheetWidth, this.sheetHeight, this.nestingTime)
                    .then(nestingRequest => this.sendRequestOnNestingToServer(nestingRequest))
                    .catch(() => this.$store.dispatch('randomVisualizationLog', 'Random nesting was not generated: inner error'))
            },

            sendRequestOnNestingToServer(nestingRequest) {
                this.$store.dispatch('randomVisualizationLog', 'Random generating in progress on the server');
                this.$http.post(`${networkConfiguration.nestingServer.address}/new`, nestingRequest)
                    .then(response =>
                        setTimeout(() => {
                            const nestingID = response.body.nesting_order_id;
                            this.receiveNestingResponseFromServer(nestingRequest, nestingID);
                        }, nestingRequest.time * 1000)
                    )
                    .catch(() => this.$store.dispatch('randomVisualizationLog', 'Random nesting was not generated: connection is absent'));
            },

            receiveNestingResponseFromServer(nestingRequest, nestingID){
                let canvas = this.$store.getters.canvasRandomGeneration;
                this.$http.get(`${networkConfiguration.nestingServer.address}/result/${nestingID}/full`)
                    .then(response =>
                        functional.doIfElse((!response.body.nestings),
                            () => {
                                setTimeout(this.receiveNestingResponseFromServer(nestingRequest, nestingID), nestingRequest.time * 1000)
                            },
                            () => {
                                canvas.clear();
                                const nestingResponse = response.body;
                                drawCanvas(canvas, nestingRequest, nestingResponse, this.canvasBlockSize);
                                this.$store.dispatch('randomNestingRequest', JSON.stringify(nestingRequest, null, 4));
                                this.$store.dispatch('randomNestingResponse', JSON.stringify(nestingResponse, null, 4));
                                this.$store.dispatch('randomVisualizationLog', 'Random nesting generated successfully');
                            })
                    )
                    .catch(() => self.$store.dispatch('randomVisualizationLog', 'Random nesting was not generated on the server'));
            },

            onClickSaveTest() {
                
            }

        }
    }

</script>

<style scoped>

    #parameters-block {
        width: calc(100% + 15px);
    }

    @media (max-width: 768px) {

        #parameters-block {
            width: 100%;
        }

    }

    #input-count-figures,
    #input-sheet-height,
    #input-sheet-width,
    #input-nesting-time,
    #input-canvas-block-size {
        width: 100%;
    }

    .error-label {
        color: #FF0000;
    }

    .error-input {
        padding: 6px 15px 6px 15px;
        border: 1px solid #FF0000;
    }

</style>