<template>

    <div>
        <label for="select-tests" v-bind:class="{'error-label': this.selectedTest === ''}">Select test:</label>
        <select id="select-tests" v-model="selectedTest" v-bind:class="{'error-input': this.selectedTest === ''}">
            <option v-for="test in tests">{{ test }}</option>
        </select>
        <button id="deleting-button" class="button" :disabled="isDeletingInProgress || this.selectedTest === '' || this.$store.getters.generationInProgress"
                @click="onClickDeleteTest">Delete test</button>
        <button id="visualization-button" class="button" :disabled="isDeletingInProgress || this.selectedTest === '' || this.$store.getters.generationInProgress"
                @click="onClickVisualizeTest">Visualize test</button>
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
                    if (this.tests[0]){
                        this.selectedTest = this.tests[0];
                    }
                    this.$store.dispatch('networkLog', 'Tests were loaded')
                })
                .catch(() => this.$store.dispatch('networkLog', 'Tests weren\'t loaded'));
        },
        methods: {

            onClickDeleteTest(){
                this.isDeletingInProgress = true;
                this.$store.dispatch('networkLog', `Deleting in progress...`);
                this.$http.delete(`${networkConfiguration.databaseServer.address}/nesting/${this.selectedTest}`)
                    .then(() => {
                        this.$store.dispatch('networkLog', `Test was deleted`);
                        this.tests.splice(this.tests.indexOf(this.selectedTest), 1);
                        this.selectedTest = this.tests[0];
                    })
                    .catch(() => this.$store.dispatch('networkLog', `Test wasn't deleted`))
                    .finally(() => this.isDeletingInProgress = false)
            },

            async onClickVisualizeTest() {
                const canvasBlockSize = 20;
                this.$store.dispatch('clear');
                const canvas = this.$store.getters.canvasGoldGeneration;
                this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} visualization in progress...`);
                await Promise.all([this.receiveGoldRequestFromServer(), this.receiveGoldResponseFromServer()])
                    .then(([goldRequest, goldResponse]) => {
                        drawCanvas(canvas, goldRequest, goldResponse, canvasBlockSize);
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} was visualized`)
                    })
                    .catch(() => this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} wasn't visualized`));
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

    label[for="select-tests"] {
        margin-top: 0;
        padding-top: 0;
    }

    #visualization-button {
        margin-bottom: 0;
    }

</style>