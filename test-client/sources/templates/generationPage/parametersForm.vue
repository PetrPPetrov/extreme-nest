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
        <button id="generation-button" class="button" @click="onClickGenerate" :disabled="(countFigures <= 0 || countFigures === '') ||
            (sheetWidth <= 0 || sheetWidth === '') || (sheetHeight <= 0 || sheetHeight === '') || (nestingTime <= 0 || nestingTime === '') ||
            (canvasBlockSize <= 0 || canvasBlockSize === '') || this.$store.getters.generationInProgress">Generate</button>
        <saving-test-block></saving-test-block>
        <hr>
        <deleting-test-block></deleting-test-block>
        <hr>
        <p class="log-message">{{ $store.getters.networkLog }}</p>
    </div>

</template>

<script>

    import savingTestBlock from './savingTestBlock'
    import deletingTestBlock from './deletingTestsBlock'

    import drawCanvas from '../../scripts/canvasPainter'
    import networkConfiguration from '../../resources/data/network'
    import generateNestingAsync from '../../scripts/nestingGenerator'

    export default {
        data() {
            return {
                countFigures: 13,
                sheetWidth: 8,
                sheetHeight: 4,
                nestingTime: 5,
                canvasBlockSize: 20,
            }
        },
        components: {
            savingTestBlock: savingTestBlock,
            deletingTestBlock: deletingTestBlock
        },
        methods: {

             async onClickGenerate() {
                this.$store.dispatch('generationInProgress', true);
                this.$store.dispatch('clearCanvases');
                const [nestingRequest, nestingResponse] = await generateNestingAsync(
                    Math.floor(this.countFigures), this.sheetWidth, this.sheetHeight, this.nestingTime
                );
                this.generateGoldNesting(nestingRequest, nestingResponse);
                this.generateRandomNestingOnServer(nestingRequest);
            },

            generateGoldNesting(nestingRequest, nestingResponse){
                let canvas = this.$store.getters.canvasGoldGeneration;
                this.$store.dispatch('goldVisualizationLog', 'Gold nesting generation in progress...');
                drawCanvas(canvas, nestingRequest, nestingResponse, this.canvasBlockSize);
                this.$store.dispatch('goldNestingRequest', JSON.stringify(nestingRequest, null, 4));
                this.$store.dispatch('goldNestingResponse', JSON.stringify(nestingResponse, null, 4));
                this.$store.dispatch('goldVisualizationLog', 'Gold nesting generated successfully');
            },

            generateRandomNestingOnServer(nestingRequest){
                this.$store.dispatch('randomVisualizationLog', 'Server generation in progress...');
                this.$http.post(`${networkConfiguration.nestingServer.address}/new`, nestingRequest)
                    .then(response =>
                        setTimeout(() => {
                            const nestingID = response.body.nesting_order_id;
                            this.receiveNestingResponseFromServer(nestingRequest, nestingID);
                        }, nestingRequest.time * 1000)
                    )
                    .catch(() => {
                        this.$store.dispatch('generationInProgress', false);
                        this.$store.dispatch('randomVisualizationLog', 'Server was not generated nesting')
                    });
            },

            receiveNestingResponseFromServer(nestingRequest, nestingID){
                let canvas = this.$store.getters.canvasRandomGeneration;
                this.$http.get(`${networkConfiguration.nestingServer.address}/result/${nestingID}/full`)
                    .then(response => {
                        if (!response.body.nestings) {
                            setTimeout(() => this.receiveNestingResponseFromServer(nestingRequest, nestingID), nestingRequest.time * 1000)
                        } else {
                            const nestingResponse = response.body;
                            drawCanvas(canvas, nestingRequest, nestingResponse, this.canvasBlockSize);
                            this.$store.dispatch('randomNestingRequest', JSON.stringify(nestingRequest, null, 4));
                            this.$store.dispatch('randomNestingResponse', JSON.stringify(nestingResponse, null, 4));
                            this.$store.dispatch('randomVisualizationLog', 'Server generated nesting successfully');
                            this.$store.dispatch('generationInProgress', false);
                        }
                    })
                    .catch(() => {
                        this.$store.dispatch('generationInProgress', false);
                        this.$store.dispatch('randomVisualizationLog', 'Nesting was not generated on the server');
                    });
            }

        }
    }

</script>

<style scoped>

    #parameters-block {
        width: calc(100% + 15px);
    }

    #generation-button {
        margin-top: 10px;
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

</style>