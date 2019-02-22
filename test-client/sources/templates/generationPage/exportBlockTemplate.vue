<template>

    <div id="export-block" class="block">
        <p class="block-title">Export</p>
        <label for="textarea-gold-generation">Export of gold generation:</label>
        <textarea id="textarea-gold-generation" disabled v-model="$store.getters.goldNestingRequest"></textarea>
        <label for="textarea-random-generation">Export of random generation:</label>
        <textarea id="textarea-random-generation" disabled v-model="$store.getters.randomNestingRequest"></textarea>
        <hr>
        <p class="log-message">{{ $store.getters.exportLog }}</p>
    </div>

</template>

<script>

    export default {
        name: "exportBlockTemplate"
    }

</script>

<style scoped>

</style>