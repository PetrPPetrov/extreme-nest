<template>

    <div class="row">
        <div class="col-md-2 col-lg-2 block-wrapper">
            <navigation-block-template></navigation-block-template>
        </div>
        <div class="col-md-6 col-lg-6 block-wrapper">
            <visualization-block-template></visualization-block-template>
        </div>
        <div class="col-md-4 col-lg-4 block-wrapper">
            <information-block-template></information-block-template>
        </div>
    </div>

</template>

<script>

    import navigationBlockTemplate from './navigationBlockTemplate'
    import visualizationBlockTemplate from './visualizationBlockTemplate'
    import informationBlockTemplate from './informationBlockTemplate'

    export default {
        name: "testingTemplate",
        components: {
            navigationBlockTemplate: navigationBlockTemplate,
            visualizationBlockTemplate: visualizationBlockTemplate,
            informationBlockTemplate: informationBlockTemplate
        }
    }

</script>

<style scoped>

</style>