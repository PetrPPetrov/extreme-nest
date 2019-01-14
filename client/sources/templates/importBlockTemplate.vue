<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block import-form">
        <p class="block-title">Creating nesting order</p>
        <textarea class="block-textarea" placeholder="Nesting request only in JSON format..."></textarea>
        <select class="block-select">
            <option>localhost:8080</option>
        </select>
        <button class="block-button">Send Nesting Request</button>
    </div>

</template>

<script>
    export default {
        name: "importBlockTemplate"
    }
</script>

<style scoped>

</style>