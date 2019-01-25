<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block import-form" v-show="$root.$data.isOpenedImportForms">
        <p class="block-title">Creating nesting order</p>
        <textarea class="block-textarea" placeholder="Nesting request only in JSON format..." v-model="nestingRequest"></textarea>
        <select v-model="selectedAvailableServer" class="block-select">
            <option v-for="server in availableServers">{{ server.name }}</option>
        </select>
        <button class="block-button"
                @click="onClickSendNestingRequest"
                :class="{'disabled-block-button' : isRunningSendingRequest}"
                :disabled="isRunningSendingRequest">
            Send Nesting Request
        </button>
        <div>
            <p class="log-message">{{ message }}</p>
        </div>
    </div>

</template>

<script>

    import axios from 'axios'

    import configuration from '../resources/data/configuration'

    export default {
        name: 'importBlockTemplate',
        data: function () {
            return {
                availableServers: configuration.availableServers,
                selectedAvailableServer: getDefaultServerName(configuration.availableServers),
                nestingRequest: JSON.stringify(configuration.defaultNestingRequest, null, 4),
                isRunningSendingRequest : false,
                message: 'Unknown status.'
            }
        },
        methods: {

            onClickSendNestingRequest: function() {
                if (this.nestingRequest.length === 0) {
                    this.message = 'Error. Nesting request is empty';
                    return;
                }

                if ( (this.selectedAvailableServer.length === 0) ||
                     (this.selectedAvailableServer === 'Not selected') ) {
                    this.message = 'Error. Did not select available server';
                    return;
                }

                if (!isValidJSONText(this.nestingRequest)) {
                    this.message = 'Error. Nesting request is incorrect'
                } else {
                    this.$root.$data.nestingRequest = JSON.parse(this.nestingRequest);
                    this.message = 'Request is handling...';
                    this.isRunningSendingRequest = true;
                    const address = getServerAddress(this.availableServers, this.selectedAvailableServer);
                    this.$root.$data.serverAddress = address;
                    sendNestingRequest(address, this.nestingRequest)
                        .then((data) => {
                            this.isRunningSendingRequest = false;
                            this.handleNestingResponse(data);
                        }).catch((error) => {
                            this.isRunningSendingRequest = false;
                            this.message = 'Error. Can not connect to the selected server';
                        });
                }
            },

            handleNestingResponse: function(responseBody) {
                const componentName = 'nesting_order_id';
                if (componentName in responseBody){
                    this.message = 'Nesting order was handled successfully';
                    this.$root.$data.nestingOrderID = responseBody[componentName];
                    this.$root.$data.isOpenedImportForms = false;
                } else {
                    this.message = 'Nesting order was not processed. Try again';
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

    function getDefaultServerName(availableServers) {
        return availableServers.find((server) => {
            if (server.default) {
                return server.name;
            }
        }).name;
    }
    
    function getServerAddress(availableServers, selectedServer) {
        return availableServers.find((server) => {
            if (server.name === selectedServer) {
                return server.address;
            }
        }).address;
    }

    function sendNestingRequest(address, nestingRequest) {
        return new Promise((resolve, reject) => {
            axios({
                method : 'post',
                url : address + '/new',
                data : nestingRequest,
                headers: {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-type': 'application/json; charset=utf-8'
                },
            })
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }

</script>

<style scoped>

    .import-form div {
        display: inline-block;
    }

</style>