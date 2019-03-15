<template>

    <div class="row">
        <div class="col-md-3 col-lg-3 block-wrapper">
            <export-form></export-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <gold-visualization-block></gold-visualization-block>
            </div>
        </div>
        <div class="col-md-4 col-lg-4 block-wrapper">
            <div class="block">
                <p class="block-title">Exported nesting</p>
                <label for="textarea-export-nesting-request">Nesting request:</label>
                <textarea id="textarea-export-nesting-request" disabled v-model="$store.getters.exportNestingRequest"></textarea>
            </div>
        </div>
    </div>

</template>

<script>

    import exportForm from './exportForm'
    import goldVisualizationBlock from '../goldVisualizationBlock'

    export default {
        components: {
            exportForm: exportForm,
            goldVisualizationBlock: goldVisualizationBlock
        }
    }

</script>

<style scoped>

    #visualization-block {
        width: calc(100% + 15px);
    }


</style>