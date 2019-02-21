<template>

    <div id="parameters-block" class="block">
        <p class="block-title">Parameters</p>
        <label for="input-count-figures">Count figures:</label>
        <input id="input-count-figures" type="number" v-model="countFigures">
        <label for="input-sheet-width">Sheet width:</label>
        <input id="input-sheet-width" type="number" v-model="sheetWidth">
        <label for="input-sheet-height">Sheet height:</label>
        <input id="input-sheet-height" type="number" v-model="sheetHeight">
        <hr>
        <button class="button" @click="onClickGenerate">Generate</button>
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
                if (this.isValidParametersForm()){
                    this.$store.dispatch('visualizationLog', 'Generating in progress...');
                    const canvasGoldGeneration = this.$store.getters.canvasGoldGeneration;
                    generateGoldNestingAsync(this.countFigures, this.sheetWidth, this.sheetHeight)
                        .then(nestingRequest => {
                            drawCanvas(canvasGoldGeneration, nestingRequest)
                        })
                        .catch(error => {
                            this.$store.dispatch('visualizationLog', 'Gold generation was generated incorrectly.');
                        });
                }
            },
            isValidParametersForm() {
                if (parseInt(this.countFigures) <= 0 || this.countFigures === '') {
                    this.$store.dispatch('visualizationLog', 'Count figures must be more than 1.');
                    return false;
                } else if (parseInt(this.sheetWidth) <= 0  || this.sheetWidth === '') {
                    this.$store.dispatch('visualizationLog', 'Sheet width must be more than 1.');
                    return false;
                } else if (parseInt(this.sheetHeight) <= 0  || this.sheetHeight === '') {
                    this.$store.dispatch('visualizationLog', 'Sheet height must be more than 1.');
                    return false;
                } else {
                    return true;
                }
            },
            onClickExport() {

            },
            onClickSaveTest() {
                
            }
        }
    }

</script>

<style scoped>

    #parameters-block{
        width: calc(100% + 15px);
    }

</style>