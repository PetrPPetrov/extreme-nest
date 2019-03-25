<template>

    <div id="export-block" class="block">
        <p class="block-title" @click="isOpenedResponses = true" v-bind:class="{'active-nav-button': isOpenedResponses}">Responses</p>
        <p class="block-title">/</p>
        <p class="block-title" @click="isOpenedResponses = false" v-bind:class="{'active-nav-button': !isOpenedResponses}">Requests</p>
        <div v-if="isOpenedResponses">
            <label for="textarea-gold-nesting-response">Gold nesting response:</label>
            <textarea id="textarea-gold-nesting-response" disabled v-model="$store.getters.goldNestingResponse"></textarea>
            <label for="textarea-random-nesting-response">Nesting response from server:</label>
            <textarea id="textarea-random-nesting-response" disabled v-model="$store.getters.randomNestingResponse"></textarea>
        </div>
        <div v-if="!isOpenedResponses">
            <label for="textarea-gold-nesting-request">Gold nesting request:</label>
            <textarea id="textarea-gold-nesting-request" disabled v-model="$store.getters.nestingRequest"></textarea>
            <label for="textarea-random-nesting-request">Nesting request to server:</label>
            <textarea id="textarea-random-nesting-request" disabled v-model="$store.getters.randomNestingRequest"></textarea>
        </div>
    </div>

</template>

<script>

    export default {
        data() {
            return {
                isOpenedResponses: true
            }
        },
    }

</script>

<style scoped>

    .block-title {
        cursor: pointer;
        display: inline-block;
        transition: .5s;
    }

    .block-title:nth-child(2){
        cursor: default;
        pointer-events: none;
    }

    .block-title:hover {
        color: #1B95E0;
    }

    .active-nav-button {
        color: #1B95E0;
    }

</style>