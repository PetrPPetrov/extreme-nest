<template>

    <div id="navigation-tests-form" class="block">
        <p class="block-title">Tests</p>
        <label for="select-tests">Select test:</label>
        <select id="select-tests" v-model="selectedTest" @change="onChangeSelectedTest">
            <option v-for="test in tests">{{ test }}</option>
        </select>
        <button class="button" :disabled="isDeletingInProgress" @click="onClickDeleteTest">Delete test</button>
        <hr>
        <p class="log-message">{{ networkLog }}</p>
    </div>

</template>

<script>

    import drawCanvas from '../../scripts/canvasPainter'
    import networkConfiguration from '../../resources/data/network'

    export default {
        data() {
            return {
                networkLog: '...',
                tests: [],
                selectedTest: '',
                isDeletingInProgress: false
            }
        },
        beforeCreate() {
            this.$http.get(`${networkConfiguration.databaseServer.address}/nesting`)
                .then(response => {
                    this.tests = response.body;
                    this.networkLog = 'Testing results was loaded'
                })
                .catch(() => this.networkLog = 'Testing results was not loaded');
        },
        methods: {

            onClickDeleteTest(){
                if (this.selectedTest === '') {
                    this.networkLog = `Test not selected.`;
                    return;
                }

                this.isDeletingInProgress = true;
                this.networkLog = `Deleting in progress...`;
                this.$http.delete(`${networkConfiguration.databaseServer.address}/nesting/${this.selectedTest}`)
                    .then(() => {
                        this.networkLog = `Test: ${this.selectedTest} was deleted`;
                        this.tests.splice(this.tests.indexOf(this.selectedTest), 1);
                        this.selectedTest = this.tests[0];
                    })
                    .catch(() => this.networkLog = `Test: ${this.selectedTest} was not deleted`)
                    .finally(() => this.isDeletingInProgress = false)
            },

            async onChangeSelectedTest() {
                if (this.selectedTest === '') {
                    return;
                }

                const canvasBlockSize = 20;
                const canvas = this.$store.getters.canvasGoldGeneration;
                await Promise.all([this.receiveGoldRequestFromServer(), this.receiveGoldResponseFromServer()])
                    .then(([goldRequest, goldResponse]) => {
                        canvas.clear();
                        drawCanvas(canvas, goldRequest, goldResponse, canvasBlockSize);
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} was visualized`)
                    })
                    .catch(() => this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} was not visualized`));
            },

            receiveGoldRequestFromServer() {
                return this.$http.get(`${networkConfiguration.databaseServer.address}/goldRequests/${this.selectedTest}`)
                    .then(goldRequest => Promise.resolve(goldRequest.body))
            },

            receiveGoldResponseFromServer() {
                return this.$http.get(`${networkConfiguration.databaseServer.address}/goldResponses/${this.selectedTest}`)
                    .then(goldResponse => Promise.resolve(goldResponse.body))
            }

        }
    }

</script>

<style scoped>

    #select-tests {
        width: 100%;
        margin-bottom: 10px;
    }

    #navigation-tests-form {
        width: calc(100% + 15px);
    }

    @media (max-width: 768px) {

        #navigation-tests-form {
            width: 100%;
        }

    }

</style>