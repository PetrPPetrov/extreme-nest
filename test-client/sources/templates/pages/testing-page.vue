<template>

    <div class="row">
        <div class="col-md-3 col-lg-3 block-wrapper">
            <navigation-form></navigation-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <visualization-block title="Visualization of gold nesting:" :log-message="$store.getters.goldVisualizationLog"
                    event="draw-gold-nesting-canvas"></visualization-block>
                <visualization-block title="Visualization of nesting from server:" :log-message="$store.getters.serverVisualizationLog"
                    event="draw-server-nesting-canvas"></visualization-block>
            </div>
        </div>
        <div class="col-md-4 col-lg-4 block-wrapper">
            <request-response-info-form></request-response-info-form>
        </div>
    </div>

</template>

<script>

    import navigationForm from '../forms/navigation-form'
    import visualizationBlock from '../components/visualization-block'
    import requestResponseInfoForm from '../forms/request-response-info-form'

    export default {
        components: {
            navigationForm: navigationForm,
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