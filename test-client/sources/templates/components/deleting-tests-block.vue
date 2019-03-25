<template>

    <div>
        <label for="select-tests" v-bind:class="{'error-label': this.selectedTestID === ''}">Select test:</label>
        <select id="select-tests" v-model="selectedTestID" v-bind:class="{'error-input': this.selectedTestID === ''}">
            <option v-for="test in tests">{{ test }}</option>
        </select>
        <button id="deleting-button" class="button" :disabled="isDeletingInProgress || this.selectedTestID === '' ||
            this.$store.getters.generationInProgress" @click="onClickDeleteTest">Delete test</button>
        <button id="visualization-button" class="button" :disabled="isDeletingInProgress || this.selectedTestID === '' ||
            this.$store.getters.generationInProgress" @click="onClickVisualizeTest">Visualize test</button>
    </div>

</template>

<script>

    import * as _ from 'underscore';
    import HttpClient from '../../scripts/network'
    import drawCanvas from '../../scripts/canvasPainter'

    export default {
        data() {
            return {
                networkLog: '...',
                tests: [],
                selectedTestID: '',
                isDeletingInProgress: false
            }
        },
        beforeCreate() {
            const http = new HttpClient(this.$http);
            http.getAllTestsID()
                .then(tests => {
                    this.tests = tests;
                    this.$store.dispatch('networkLog', 'Tests were loaded');
                    if (!_.isNull(_.first(this.tests)) && !_.isUndefined(_.first(this.tests))){
                        this.selectedTestID = _.first(this.tests);
                    } else {
                        this.selectedTestID = '';
                    }
                })
                .catch(() => {
                    this.$store.dispatch('networkLog', 'Tests weren\'t loaded')
                });
        },
        mounted() {
            this.$root.$on('add', (testID) => {
                this.tests.unshift(testID);
                this.selectedTestID = _.first(this.tests);
            });
        },
        methods: {

            onClickDeleteTest(){
                this.isDeletingInProgress = true;
                this.$store.dispatch('clear');
                this.$store.dispatch('clearCanvases');
                this.$store.dispatch('networkLog', `Deleting in progress...`);
                const http = new HttpClient(this.$http);
                http.removeTestByID(this.selectedTestID)
                    .then(() => {
                        this.$store.dispatch('networkLog', `Test was deleted`);
                        this.tests.splice(this.tests.indexOf(this.selectedTestID), 1);
                        if (!_.isNull(_.first(this.tests)) && !_.isUndefined(_.first(this.tests))){
                            this.selectedTestID = _.first(this.tests);
                        } else {
                            this.selectedTestID = '';
                        }
                    })
                    .catch(() => {
                        this.$store.dispatch('networkLog', `Test wasn't deleted`)
                    })
                    .finally(() => {
                        this.isDeletingInProgress = false
                    });
            },

            onClickVisualizeTest() {
                this.$store.dispatch('clear');
                this.$store.dispatch('clearCanvases');
                this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTestID} visualization in progress...`);
                const http = new HttpClient(this.$http);
                http.getTestByTestID(this.selectedTestID)
                    .then(test => {
                        const canvasBlockSize = 20;
                        const canvas = this.$store.getters.canvasGoldGeneration;
                        drawCanvas(canvas, test.goldRequest, test.goldResponse, canvasBlockSize);
                        delete test.goldRequest._id;
                        delete test.goldResponse._id;
                        this.$store.dispatch('nestingRequest', JSON.stringify(test.goldRequest, null, 4));
                        this.$store.dispatch('goldNestingResponse', JSON.stringify(test.goldResponse, null, 4));
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTestID} was visualized`)
                    })
                    .catch(() => {
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTestID} wasn't visualized`)
                    });
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