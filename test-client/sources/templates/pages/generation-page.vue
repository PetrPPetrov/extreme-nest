<template>

    <div class="row">
        <div class="col-md-2 col-lg-2 block-wrapper">
            <parameters-form></parameters-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <visualization-block title="Visualization of generated nesting:" :log-message="$store.getters.goldVisualizationLog"
                    event="draw-gold-nesting-canvas"></visualization-block>
                <visualization-block title="Visualization of nesting from server:" :log-message="$store.getters.serverVisualizationLog"
                    event="draw-server-nesting-canvas"></visualization-block>
            </div>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <request-response-info-form></request-response-info-form>
        </div>
    </div>

</template>

<script>

    import parametersForm from '../forms/parameters-form'
    import visualizationBlock from '../components/visualization-block'
    import requestResponseInfoForm from '../forms/request-response-info-form'

    export default {
        components : {
            parametersForm: parametersForm,
            visualizationBlock: visualizationBlock,
            requestResponseInfoForm: requestResponseInfoForm
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