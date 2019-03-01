<template>

    <div id="navigation-block" class="block">
        <p class="block-title">Testings</p>
        <label for="select-testing" v-bind:class="{'error-label': selectedTesting === ''}">Select testing:</label>
        <select id="select-testing" v-model="selectedTesting" v-bind:class="{'error-input': selectedTesting === ''}" @change="onChangeSelect">
            <option v-for="testing in testings">[{{ testing._id }}] - {{ testing.date }} - {{ testing.time }}</option>
        </select>
        <button id="delete-button" class="button" @click="onClickDeleteTesting"
                :disabled="selectedTesting === '' || isDeletingInProgress">Delete testing</button>
        <hr>
        <p class="tests-nav-button" v-for="test in tests" @click="onTestClick($event)">{{ test }}</p>
        <hr>
        <button class="button" @click="onClickRunTests" :disabled="isDeletingInProgress">Run new testing</button>
        <hr>
        <p class="log-message">{{ networkLog }}</p>
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
                testings: [],
                selectedTesting: '',
                tests: [],
                isDeletingInProgress: false
            }
        },
        mounted() {
            const http = new HttpClient(this.$http);
            http.getAllTestingResults()
                .then(testingResults => {
                    this.testings = testingResults;
                    this.showTestings();
                    this.networkLog = 'Testing results were loaded'
                })
                .catch(() => {
                    this.networkLog = 'Testing results weren\'t loaded'
                });
        },
        methods: {

            getSelectedTestID(){
                let selectedTestingID = this.selectedTesting.match(/\[[\w\d]+\]/i)[0];
                return selectedTestingID.substring(1, selectedTestingID.length - 1);
            },

            onChangeSelect(){
                this.showTestsForSelectedTesting();
            },

            onTestClick(event) {
                const testID = event.srcElement.textContent;
                this.$store.dispatch('clear');
                this.$store.dispatch('clearCanvases');
                this.$store.dispatch('goldVisualizationLog', `Test: ${testID} visualization in progress...`);
                const http = new HttpClient(this.$http);
                http.getTestByTestID(testID)
                    .then((test) => {
                        const canvasBlockSize = 20;
                        const canvas = this.$store.getters.canvasGoldGeneration;
                        this.$store.dispatch('goldNestingRequest', JSON.stringify(test.goldRequest, null, 4));
                        this.$store.dispatch('goldNestingResponse', JSON.stringify(test.goldResponse, null, 4));
                        drawCanvas(canvas, test.goldRequest, test.goldResponse, canvasBlockSize);
                        this.$store.dispatch('goldVisualizationLog', `Test: ${testID} was visualized`)
                    })
                    .catch(() => {
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTestID} wasn't visualized`)
                    });
            },

            showTestings() {
                const firstTesting = _.first(this.testings);
                if (!_.isUndefined(firstTesting) && !_.isNull(firstTesting)) {
                    this.selectedTesting = `[${firstTesting._id}] - ${firstTesting.date} - ${firstTesting.time}`;
                    this.showTestsForSelectedTesting();
                } else {
                    this.selectedTesting = '';
                    this.tests = [];
                }
            },

            showTestsForSelectedTesting() {
                const selectedTestingID = this.getSelectedTestID();
                const filteredTesting = _.first(this.testings.filter((testing) => testing._id === selectedTestingID));
                if (!_.isUndefined(filteredTesting.nestings) && !_.isNull(filteredTesting.nestings)) {
                    this.tests = filteredTesting.nestings.map(nesting => nesting._id);
                } else {
                    this.tests = [];
                }
            },

            onClickDeleteTesting() {
                this.isDeletingInProgress = true;
                const selectedTestingID = this.getSelectedTestID();
                const http = new HttpClient(this.$http);
                http.removeTestingResultByID(selectedTestingID)
                    .then(() => {
                        this.testings = this.testings.filter((testing) => testing._id !== selectedTestingID);
                        this.showTestings();
                        this.networkLog = 'Testing was deleted'
                    })
                    .catch(() => {
                        this.networkLog = 'Testing was not deleted'
                    })
                    .finally(() => this.isDeletingInProgress = false);
            },

            onClickRunTests() {
                const http = new HttpClient(this.$http);
                http.runNewTesting()
                    .then((newTesting) => {
                        this.testings.push(newTesting);
                        this.showTestings();
                        this.networkLog = 'New testing was ran'
                    })
                    .catch(() => {
                        this.networkLog = 'New testing was not ran'
                    });
            }

        }
    }

</script>

<style scoped>

    label {
        margin-top: 10px;
    }

    button {
        margin: 0;
    }

    #delete-button {
        margin-top: 10px;
    }

    #select-testing {
        width: 100%;
        margin-bottom: 10px;
    }

    #navigation-block {
        width: calc(100% + 15px);
    }

    .tests-nav-button {
        border-radius: 15px;
        padding: 7px 15px 7px 15px;
        color: #14171A;
        font-size: 12px;
        margin: 0;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
        transition: .5s;
    }

    .tests-nav-button:hover {
        color: #48AAE6;
        box-shadow: inset 2px 2px 5px rgba(154, 147, 140, 0.5), 1px 1px 5px rgba(255, 255, 255, 1);
    }

    @media (max-width: 768px) {

        #navigation-block {
            width: 100%;
        }

    }

</style>