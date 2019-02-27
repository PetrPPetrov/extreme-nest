<template>

    <div class="row">
        <div class="col-md-2 col-lg-2 block-wrapper">
            <parameters-form></parameters-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <gold-visualization-block></gold-visualization-block>
                <server-visualization-block></server-visualization-block>
            </div>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <request-response-info-form></request-response-info-form>
        </div>
    </div>

</template>

<script>

    import parametersForm from './parametersForm'
    import goldVisualizationBlock from '../goldVisualizationBlock'
    import serverVisualizationBlock from '../serverVisualizationBlock'
    import requestResponseInfoForm from '../requestResponseInfoForm'

    export default {
        components : {
            parametersForm: parametersForm,
            goldVisualizationBlock: goldVisualizationBlock,
            serverVisualizationBlock: serverVisualizationBlock,
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