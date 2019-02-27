<template>

    <div>
        <button class="button" @click="onClickSaveTest">Save test</button>
        <hr>
        <p class="log-message">{{ networkLog }}</p>
    </div>

</template>

<script>

    import networkConfiguration from '../../resources/data/network'

    export default {
        data() {
            return {
                networkLog: '...',
            }
        },
        methods: {

            onClickSaveTest() {
                this.$http.post(`${networkConfiguration.databaseServer.address}/nesting`)
                    .then(response => {
                        const nestingID = response.body.id;
                        this.saveRandomRequestOnServer(nestingID);
                        this.saveGoldNestingResponseOnServer(nestingID);
                        this.saveGoldRequestOnServer(nestingID);
                    })
                    .catch(() => this.networkLog = 'Test was not saved: connection is absent');
            },

            saveGoldRequestOnServer(nestingID) {
                this.$http.post(`${networkConfiguration.databaseServer.address}/goldRequests/${nestingID}`, this.$store.getters.goldNestingRequest)
                    .then(() => this.networkLog = 'Gold request was saved')
                    .catch(() => this.networkLog = 'Gold request was not saved');
            },

            saveRandomRequestOnServer(nestingID) {
                this.$http.post(`${networkConfiguration.databaseServer.address}/serverRequests/${nestingID}`, this.$store.getters.randomNestingRequest)
                    .then(() => this.networkLog = 'Random request was saved')
                    .catch(() => this.networkLog = 'Random request was not saved');
            },

            saveGoldNestingResponseOnServer(nestingID) {
                this.$http.post(`${networkConfiguration.databaseServer.address}/goldResponses/${nestingID}`, this.$store.getters.goldNestingResponse)
                    .then(() => this.networkLog = 'Gold response was saved')
                    .catch(() => this.networkLog = 'Gold response was not saved');
            }

        }
    }
</script>

<style scoped>

    button {
        margin-bottom: 0;
    }

</style>