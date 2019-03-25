<template>

    <div>
        <button class="button" @click="onClickSaveTest" :disabled="$store.getters.nestingRequest === '' ||
            $store.getters.goldNestingResponse === '' || $store.getters.generationInProgress || isSavingInProgress">Save test</button>
    </div>

</template>

<script>

    import HttpClient from '../../scripts/network'

    export default {
        data() {
            return {
                networkLog: '...',
                isSavingInProgress: false
            }
        },
        methods: {

            onClickSaveTest() {
                this.isSavingInProgress = true;
                this.$store.dispatch('networkLog', 'Saving in progress...');
                const http = new HttpClient(this.$http);
                http.createNewTest()
                    .then(newTest => {
                        Promise.all([
                            http.joinGoldRequestToTest(this.$store.getters.nestingRequest, newTest.id),
                            http.joinGoldResponseToTest(this.$store.getters.goldNestingResponse, newTest.id)
                        ]);
                        this.$root.$emit('add', newTest.id);
                    })
                    .then(() => this.$store.dispatch('networkLog', 'Test was saved'))
                    .catch(() => this.$store.dispatch('networkLog', 'Test wasn\'t saved'))
                    .finally(() => this.isSavingInProgress = false);
            }

        }
    }
</script>

<style scoped>

    button {
        margin-bottom: 0;
    }

</style>