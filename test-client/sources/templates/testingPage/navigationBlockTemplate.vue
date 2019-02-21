<template>

    <div id="navigation-block" class="block">
        <p class="block-title">Tests</p>

        <hr>
        <button class="button" @click="onClickGenerate">Run tests</button>
    </div>

</template>

<script>
    export default {
        name: "navigationBlockTemplate"
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