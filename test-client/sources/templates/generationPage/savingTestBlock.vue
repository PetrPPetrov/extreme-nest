<template>

    <div>
        <button class="button"
                @click="onClickSaveTest"
                :disabled="
                    this.$store.getters.goldNestingRequest === '' ||
                    this.$store.getters.randomNestingRequest === '' ||
                    this.$store.getters.goldNestingResponse === ''">
                Save test</button>
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
                this.networkLog = 'Test saving in progress...';
                this.$http.post(`${networkConfiguration.databaseServer.address}/nesting`)
                    .then(async response => {
                        const nestingID = response.body.id;
                        await Promise.all([
                            this.saveRandomRequestOnServer(nestingID),
                            this.saveGoldNestingResponseOnServer(nestingID),
                            this.saveGoldRequestOnServer(nestingID)
                        ])
                            .then(() => this.networkLog = 'Test was saved successfully')
                    })
                    .catch(() => this.networkLog = 'Test was not saved');
            },

            saveGoldRequestOnServer(nestingID) {
                return this.$http.post(`${networkConfiguration.databaseServer.address}/goldRequests/${nestingID}`, this.$store.getters.goldNestingRequest)
                    .then(() => Promise.resolve())
            },

            saveRandomRequestOnServer(nestingID) {
                return this.$http.post(`${networkConfiguration.databaseServer.address}/serverRequests/${nestingID}`, this.$store.getters.randomNestingRequest)
                    .then(() => Promise.resolve())
            },

            saveGoldNestingResponseOnServer(nestingID) {
                return this.$http.post(`${networkConfiguration.databaseServer.address}/goldResponses/${nestingID}`, this.$store.getters.goldNestingResponse)
                    .then(() => Promise.resolve())
            }

        }
    }
</script>

<style scoped>

    button {
        margin-bottom: 0;
    }

</style>