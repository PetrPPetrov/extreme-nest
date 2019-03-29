<template>

    <div class="row">
        <div class="col-md-3 col-lg-3 block-wrapper">
            <export-form></export-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <visualization-block title="Visualization of imported nesting:" :log-message="$store.getters.goldVisualizationLog"
                    event="draw-gold-nesting-canvas"></visualization-block>
            </div>
        </div>
        <div class="col-md-4 col-lg-4 block-wrapper">
            <div class="block">
                <p class="block-title">Imported nesting</p>
                <information-block title="Imported nesting request:" :data="$store.getters.importNestingRequest" height="200"></information-block>
                <information-block title="Imported nesting response:" :data="$store.getters.importNestingResponse" height="200"></information-block>
            </div>
        </div>
    </div>

</template>

<script>

    import exportForm from '../forms/import-form'
    import informationBlock from '../components/information-block'
    import visualizationBlock from '../components/visualization-block'

    export default {
        components: {
            exportForm: exportForm,
            informationBlock: informationBlock,
            visualizationBlock: visualizationBlock
        }
    }

</script>

<style scoped lang="sass">

    #visualization-block
        width: calc(100% + 15px)

</style>