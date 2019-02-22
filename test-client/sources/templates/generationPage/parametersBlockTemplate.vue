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
        <hr>
        <button class="button" @click="onClickGenerate"
            :disabled="(countFigures <= 0 || countFigures === '') ||
                       (sheetWidth <= 0 || sheetWidth === '') ||
                       (sheetHeight <= 0 || sheetHeight === '') ||
                       (nestingTime <= 0 || nestingTime === '')">
            Generate</button>
        <button class="button" disabled @click="onClickSaveTest">Save test</button>
    </div>

</template>

<script>

    import drawCanvas from '../../scripts/canvasPainter'
    import generateGoldNestingAsync from '../../scripts/goldNestingGenerator'

    export default {
        name: "parametersBlockTemplate",
        data: function () {
            return {
                countFigures: 10,
                sheetWidth: 10,
                sheetHeight: 10,
                nestingTime: 5
            }
        },
        methods: {
            onClickGenerate() {
                this.$store.dispatch('visualizationLog', 'Generating in progress');
                generateGoldNestingAsync(Math.floor(this.countFigures), this.sheetWidth, this.sheetHeight, this.nestingTime)
                    .then(nesting => {
                        const nestingRequest = nesting[0];
                        const nestingResponse = nesting[1];
                        this.$store.dispatch('goldNestingRequest', JSON.stringify(nestingRequest, null, 4));
                        this.$store.dispatch('randomNestingRequest', JSON.stringify(nestingResponse, null, 4));
                        drawCanvas(this.$store.getters.canvasGoldGeneration, nestingRequest, nestingResponse);
                        this.$store.dispatch('visualizationLog', 'Nesting generated successfully');
                    });
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
    #input-nesting-time {
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