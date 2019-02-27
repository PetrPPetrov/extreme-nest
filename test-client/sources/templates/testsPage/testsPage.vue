<template>

    <div class="row">
        <div class="col-md-3 col-lg-3 block-wrapper">
            <navigation-tests-form></navigation-tests-form>
        </div>
        <div class="col-md-5 col-lg-5 block-wrapper">
            <div id="visualization-block" class="block">
                <p class="block-title">Visualization</p>
                <gold-visualization-block></gold-visualization-block>
            </div>
        </div>
    </div>

</template>

<script>

    import navigationTestsForm from './navigationTestsForm'
    import goldVisualizationBlock from '../goldVisualizationBlock'
    import serverVisualizationBlock from '../serverVisualizationBlock'
    import requestResponseInfoForm from '../requestResponseInfoForm'

    export default {
        components: {
            navigationTestsForm: navigationTestsForm,
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