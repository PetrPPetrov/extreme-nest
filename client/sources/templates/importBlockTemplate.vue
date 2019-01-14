<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block import-form">
        <p class="block-title">Creating nesting order</p>
        <textarea class="block-textarea" placeholder="Nesting request only in JSON format..." v-model="nestingRequest"></textarea>
        <select class="block-select" v-model="availableServers">
            <option v-for="server in availableServers">{{ server.name }}</option>
        </select>
        <button class="block-button" @click="onClickSendNestingRequest">Send Nesting Request</button>
    </div>

</template>

<script>

    import configuration from '../resources/data/configuration'

    export default {
        name: "importBlockTemplate",
        data: function () {
            return {
                availableServers: configuration.availableServers,
                nestingRequest: ''
            }
        },
        methods: {

            onClickSendNestingRequest: () => {
                if (!isValidJSONText(this.nestingRequest)) {
                    alert("Nesting request is incorrect.");
                }
            }

        }
    }
    
    function isValidJSONText(jsonText) {
        try {
            JSON.parse(jsonText);
        } catch (error) {
            return false;
        }
        return true;
    }

</script>

<style scoped>

</style>