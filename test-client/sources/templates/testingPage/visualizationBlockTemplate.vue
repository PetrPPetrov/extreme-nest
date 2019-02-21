<template>

    <div id="visualization-block" class="block">
        <p class="block-title">Visualization</p>
        <label for="canvas-gold-nesting">Visualization of gold nesting:</label>
        <canvas id="canvas-gold-nesting"></canvas>
        <label for="canvas-random-nesting">Visualization of nesting from server:</label>
        <canvas id="canvas-random-nesting"></canvas>
        <hr>
        <p class="log-message">...</p>
    </div>

</template>

<script>

    export default {
        name: "visualizationBlockTemplate"
    }

</script>

<style scoped>

    #visualization-block {
        width: calc(100% + 15px);
    }

</style>