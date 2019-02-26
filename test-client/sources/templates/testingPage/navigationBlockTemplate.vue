<template>

    <div id="navigation-block" class="block">
        <p class="block-title">Tests</p>

        <hr>
        <button class="button" @click="onClickRunTests">Run tests</button>
    </div>

</template>

<script>

    import networkConfiguration from '../../resources/data/network'

    export default {
        name: "navigationBlockTemplate",
        methods: {

            onClickRunTests() {

            }

        }
    }

</script>

<style scoped>

    #navigation-block {
        width: calc(100% + 15px);
    }

    @media (max-width: 768px) {

        #navigation-block {
            width: 100%;
        }

    }

</style>