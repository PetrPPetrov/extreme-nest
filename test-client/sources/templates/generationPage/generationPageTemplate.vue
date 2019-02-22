<template>

    <div class="row">
        <div class="col-md-2 col-lg-2 block-wrapper">
            <parameters-block-template></parameters-block-template>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <gold-visualization-canvas-template></gold-visualization-canvas-template>
                <hr>
                <p class="log-message">{{ $store.getters.goldVisualizationLog }}</p>
                <random-visualization-canvas-template></random-visualization-canvas-template>
                <hr>
                <p class="log-message">{{ $store.getters.randomVisualizationLog }}</p>
            </div>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <export-block-template></export-block-template>
        </div>
    </div>

</template>

<script>

    import parametersBlockTemplate from './parametersBlockTemplate'
    import goldVisualizationCanvasTemplate from './goldVisualizationCanvasTemplate'
    import randomVisualizationCanvasTemplate from './randomVisualizationCanvasTemplate'
    import exportBlockTemplate from './exportBlockTemplate'

    export default {
        name: "generationTemplate",
        components : {
            parametersBlockTemplate: parametersBlockTemplate,
            goldVisualizationCanvasTemplate: goldVisualizationCanvasTemplate,
            randomVisualizationCanvasTemplate: randomVisualizationCanvasTemplate,
            exportBlockTemplate: exportBlockTemplate
        }
    }

</script>

<style scoped>

    #visualization-block {
        width: calc(100% + 15px);
    }

    @media(max-width: 768px) {

        #visualization-block {
            width: 80%;
        }

    }

</style>