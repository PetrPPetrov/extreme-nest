<template>

    <div>
        <button class="button"
                @click="onClickSaveTest"
                :disabled="
                    this.$store.getters.goldNestingRequest === '' ||
                    this.$store.getters.randomNestingRequest === '' ||
                    this.$store.getters.goldNestingResponse === '' ||
                    this.$store.getters.generationInProgress">
                Save test</button>
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
                this.$store.dispatch('networkLog', 'Saving in progress...');
                this.$http.post(`${networkConfiguration.databaseServer.address}/nesting`)
                    .then(async response => {
                        const nestingID = response.body.id;
                        await Promise.all([
                            this.saveRandomRequestOnServer(nestingID),
                            this.saveGoldNestingResponseOnServer(nestingID),
                            this.saveGoldRequestOnServer(nestingID)
                        ])
                            .then(() => this.$store.dispatch('networkLog', 'Test was saved'))
                    })
                    .catch(() => this.$store.dispatch('networkLog', 'Test wasn\'t saved'));
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