<template>

    <div id="parameters-block" class="block">
        <p class="block-title">Parameters</p>
        <label for="input-count-figures">Count figures:</label>
        <input id="input-count-figures" v-model="countFigures">
        <label for="input-sheet-width">Sheet width:</label>
        <input id="input-sheet-width" v-model="sheetWidth">
        <label for="input-sheet-height">Sheet height:</label>
        <input id="input-sheet-height" v-model="sheetHeight">
        <hr>
        <button class="button">Generate</button>
        <button class="button" disabled>Export</button>
    </div>

</template>

<script>

    export default {
        name: "parametersBlockTemplate",
        data: function () {
            return {
                countFigures: '',
                sheetWidth: '',
                sheetHeight: ''
            }
        }
    }

</script>

<style scoped>

    #parameters-block{
        width: calc(100% + 15px);
    }

</style>