<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block import-form">
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
        name: "importBlockTemplate",
        data: function () {
            return {
                availableServers: configuration.availableServers,
                selectedAvailableServer: 'Not selected',
                nestingRequest: '',
                isRunningSendingRequest : false,
                message: '...'
            }
        },
        methods: {

            onClickSendNestingRequest: function() {
                if (this.nestingRequest.length === 0) {
                    this.message = 'Error. Nesting request is empty.';
                    return;
                }

                if ( (this.selectedAvailableServer.length === 0) ||
                     (this.selectedAvailableServer === 'Not selected') ) {
                    this.message = 'Error. Did not select available server.';
                    return;
                }

                if (!isValidJSONText(this.nestingRequest)) {
                    this.message = 'Error. Nesting request is incorrect.'
                } else {
                    this.message = 'Request are handling...';
                    this.isRunningSendingRequest = true;
                    const address = this.selectedAvailableServer + '/new';
                    sendNestingRequest(address, this.nestingRequest)
                        .then((data) => {
                            alert(data);
                        }).catch((error) => {
                            this.message = 'Error. Connection with selected server was not set.';
                        });
                    this.isRunningSendingRequest = false;
                    this.message = "Nesting order was handled successfuly."
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

    function sendNestingRequest(address, nestingRequest) {
        return new Promise((resolve, reject) => {
            axios({
                method : 'post',
                url : "http://127.0.0.1:8080/new",
                data : address,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type',
                    'Accept': 'application/json; charset=utf-8',
                    'Content-type': 'application/json; charset=utf-8'
                },
            }).then(response => {
                resolve(response.data);
            }).catch(error => {
                reject(false);
            });
        });
    }

</script>

<style scoped>

    .import-form div {
        display: inline-block;
    }

</style>