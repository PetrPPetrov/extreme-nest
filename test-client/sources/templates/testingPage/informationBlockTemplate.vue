<template>

    <div id="information-block" class="block">
        <p class="block-title">Information</p>
        <label for="textarea-gold-nesting-request">Nesting request:</label>
        <textarea id="textarea-gold-nesting-request" disabled></textarea>
        <label for="textarea-gold-nesting-response">Gold nesting optimization response:</label>
        <textarea id="textarea-gold-nesting-response" disabled></textarea>
        <label for="textarea-server-nesting-response">Nesting optimization response from server:</label>
        <textarea id="textarea-server-nesting-response" disabled></textarea>
    </div>

</template>

<script>

    export default {
        name: "informationBlockTemplate"
    }

</script>

<style scoped>

    textarea {
        height: 188px;
    }

</style>