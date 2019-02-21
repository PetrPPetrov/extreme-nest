<template>

    <div id="visualization-block" class="block">
        <p class="block-title">Visualization</p>
        <label for="canvas-gold-generation">Visualization of gold generation:</label>
        <canvas id="canvas-gold-generation"></canvas>
        <label for="canvas-random-generation">Visualization of random generation:</label>
        <canvas id="canvas-random-generation"></canvas>
        <hr>
        <p class="log-message">{{ $store.getters.visualizationLog }}</p>
    </div>

</template>

<script>

    const fabric = require('fabric').fabric;

    export default {
        name: "visualizationBlockTemplate",
        created: function () {
            this.$store.dispatch('canvasGoldGeneration', new fabric.StaticCanvas('canvas-gold-generation', {
                scale: 1,
                selection: false
            }));
            this.$store.dispatch('canvasRandomGeneration', new fabric.StaticCanvas('canvas-random-generation', {
                scale: 1,
                selection: false
            }));
        }
    }

</script>

<style scoped>

    #visualization-block {
        width: calc(100% + 15px);
    }

    @media(max-width: 768px) {

        #visualization-block {
            width: 100%;
        }

    }

</style>