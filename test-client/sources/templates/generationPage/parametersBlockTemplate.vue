<template>

    <div id="parameters-block" class="block">
        <p class="block-title">Parameters</p>
        <label for="input-count-figures" v-bind:class="{'error-label': (countFigures <= 0 || countFigures === '')}">Count figures:</label>
        <input id="input-count-figures" type="number" v-model="countFigures" v-bind:class="{'error-input': (countFigures <= 0 || countFigures === '')}">
        <label for="input-sheet-width" v-bind:class="{'error-label': (sheetWidth <= 0 || sheetWidth === '')}">Sheet width:</label>
        <input id="input-sheet-width" type="number" v-model="sheetWidth" v-bind:class="{'error-input': (sheetWidth <= 0 || sheetWidth === '')}">
        <label for="input-sheet-height" v-bind:class="{'error-label': (sheetHeight <= 0 || sheetHeight === '')}">Sheet height:</label>
        <input id="input-sheet-height" type="number" v-model="sheetHeight" v-bind:class="{'error-input': (sheetHeight <= 0 || sheetHeight === '')}">
        <hr>
        <button class="button" @click="onClickGenerate"
            :disabled="(countFigures <= 0 || countFigures === '') || (sheetWidth <= 0 || sheetWidth === '') || (sheetHeight <= 0 || sheetHeight === '')">Generate</button>
        <button class="button" disabled @click="onClickExport">Export</button>
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
                sheetHeight: 10
            }
        },
        methods: {
            onClickGenerate() {
                this.$store.dispatch('visualizationLog', 'Generating in progress...');
                const canvasGoldGeneration = this.$store.getters.canvasGoldGeneration;
                generateGoldNestingAsync(this.countFigures, this.sheetWidth, this.sheetHeight)
                    .then(nestingRequest => {
                        drawCanvas(canvasGoldGeneration, nestingRequest)
                    })
                    .catch(error => {
                        this.$store.dispatch('visualizationLog', 'Gold generation was generated incorrectly.');
                    });
            },
            onClickExport() {

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

    .error-label {
        color: #FF0000;
    }

    .error-input {
        padding: 6px 15px 6px 15px;
        border: 1px solid #FF0000;
    }

</style>