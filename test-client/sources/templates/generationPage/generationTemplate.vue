<template>

    <div class="row">
        <div class="col-md-2 col-lg-2 block-wrapper">
            <parameters-block-template></parameters-block-template>
        </div>
        <div class="col-md-6 col-lg-6 block-wrapper">
            <visualization-block-template></visualization-block-template>
        </div>
        <div class="col-md-4 col-lg-4 block-wrapper">
            <export-block-template></export-block-template>
        </div>
    </div>

</template>

<script>

    import parametersBlockTemplate from './parametersBlockTemplate'
    import visualizationBlockTemplate from './visualizationBlockTemplate'
    import exportBlockTemplate from './exportBlockTemplate'

    export default {
        name: "generationTemplate",
        components : {
            parametersBlockTemplate: parametersBlockTemplate,
            visualizationBlockTemplate: visualizationBlockTemplate,
            exportBlockTemplate: exportBlockTemplate
        }
    }

</script>

<style scoped>

</style>