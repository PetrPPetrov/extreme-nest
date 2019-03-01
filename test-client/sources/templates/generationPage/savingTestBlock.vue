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

    import HttpClient from '../../scripts/network'

    export default {
        data() {
            return {
                networkLog: '...',
            }
        },
        methods: {

            onClickSaveTest() {
                this.$store.dispatch('networkLog', 'Saving in progress...');
                const http = new HttpClient(this.$http);
                http.createNewTest()
                    .then(newTest => Promise.all([
                            http.joinGoldRequestToTest(this.$store.getters.goldNestingRequest, newTest.id),
                            http.joinServerRequestToTest(this.$store.getters.randomNestingRequest, newTest.id),
                            http.joinGoldResponseToTest(this.$store.getters.goldNestingResponse, newTest.id)
                        ])
                        .then(() => this.$store.dispatch('networkLog', 'Test was saved'))
                    )
                    .catch(() => this.$store.dispatch('networkLog', 'Test wasn\'t saved'));
            }

        }
    }
</script>

<style scoped>

    button {
        margin-bottom: 0;
    }

</style>