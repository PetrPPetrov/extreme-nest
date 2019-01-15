<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block export-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Get Full Nesting Result</p>
        <textarea disabled class="block-textarea" placeholder="Full nesting result will be here..." v-model="nestingRequest"></textarea>
        <button class="block-button">Get Nesting Result</button>
        <button class="block-button"
                :class="{'disabled-block-button' : !isSuccessfulOrder}"
                :disabled="!isSuccessfulOrder">
            Visualize
        </button>
        <button class="block-button"
                :class="{'disabled-block-button' : !isSuccessfulOrder}"
                :disabled="!isSuccessfulOrder">
            Download
        </button>
        <div>
            <p class="log-message">{{ message }}</p>
        </div>
    </div>

</template>

<script>

    export default {
        name: "exportBlockTemplate",
        data: function () {
            return {
                isSuccessfulOrder : false,
                message : '...'
            }
        }
    }

</script>

<style scoped>

    .block-button:nth-of-type(1) {
        margin-left: 0;
        width: 48%;
    }

    .block-button:nth-of-type(2) {
        width: 25%;
    }

    .block-button:nth-of-type(3) {
        width: 25%;
    }

</style>