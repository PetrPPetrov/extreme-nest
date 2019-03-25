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
        <div class="wrapper-test-nav-button" v-for="test in tests">
            <img class="test-status-icon" :src="test.icon">
            <p class="tests-nav-button" @click="onTestClick($event)">{{ test.id }}</p>
        </div>

        <hr>
        <button class="button" @click="onClickRunTests" :disabled="isDeletingInProgress">Run new testing</button>
        <hr>
        <p class="log-message">{{ networkLog }}</p>
    </div>

</template>

<script>

    import failedIcon from '../../resources/images/failed.png'
    import successIcon from '../../resources/images/success.png'
    import progressIcon from '../../resources/images/progress.png'

    import * as _ from 'underscore';
    import HttpClient from '../../scripts/network'

    export default {
        data() {
            return {
                networkLog: '...',
                testings: [],
                selectedTesting: '',
                tests: [],
                isDeletingInProgress: false,
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

            getSelectedTestingID(){
                let selectedTestingID = this.selectedTesting.match(/\[[\w\d]+\]/i)[0];
                return selectedTestingID.substring(1, selectedTestingID.length - 1);
            },

            getTestStatusImage(status) {
                switch (status) {
                    case 'progress':
                        return progressIcon;
                    case 'success':
                        return successIcon;
                    case 'failed':
                        return failedIcon;
                    default:
                        return progressIcon;
                }
            },

            onChangeSelect(){
                this.showTestsForSelectedTesting();
            },

            onTestClick(event) {
                const testID = event.srcElement.textContent;
                this.$store.dispatch('clear');
                this.$store.dispatch('goldVisualizationLog', `Test: ${testID} visualization in progress...`);
                this.$store.dispatch('serverVisualizationLog', `Test: ${testID} visualization in progress...`);

                const selectedTestingID = this.getSelectedTestingID();
                const filteredTesting = _.first(this.testings.filter((testing) => testing._id === selectedTestingID));
                const test = _.first(filteredTesting.nestings.filter(nesting => nesting.id === testID));

                this.$store.dispatch('nestingRequest', JSON.stringify(test.goldRequest, null, 4));
                this.$store.dispatch('goldNestingResponse', JSON.stringify(test.goldResponse, null, 4));
                this.$store.dispatch('goldVisualizationLog', `Test: ${testID} visualization in progress...`);
                this.$root.$emit('draw-gold-nesting-canvas', [test.goldRequest, test.goldResponse, 20]);
                this.$store.dispatch('goldVisualizationLog', `Gold nesting was visualized`);
                if (!_.isNull(test.serverResponse) && !_.isUndefined(test.serverResponse)) {
                    this.$store.dispatch('randomNestingRequest', JSON.stringify(test.serverRequest, null, 4));
                    this.$store.dispatch('serverNestingResponse', JSON.stringify(test.serverResponse, null, 4));
                    this.$store.dispatch('serverVisualizationLog', `Nesting from server was visualized`);
                    this.$root.$emit('draw-server-nesting-canvas', [test.serverRequest, test.serverResponse, 20]);
                } else {
                    this.$store.dispatch('serverVisualizationLog', `Nesting from server was not visualized`);
                }
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
                const selectedTestingID = this.getSelectedTestingID();
                const filteredTesting = _.first(this.testings.filter((testing) => testing._id === selectedTestingID));
                if (!_.isUndefined(filteredTesting.nestings) && !_.isNull(filteredTesting.nestings)) {
                    this.tests = filteredTesting.nestings.map(nesting => ({id: nesting.id, icon: this.getTestStatusImage(nesting.status)}));
                } else {
                    this.tests = [];
                }
            },

            onClickDeleteTesting() {
                this.isDeletingInProgress = true;
                const selectedTestingID = this.getSelectedTestingID();
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
                        this.testings.unshift(newTesting);
                        this.showTestings();
                        setTimeout(() => this.reloadTestingResults(), 1000);
                        this.networkLog = 'New testing was ran'
                    })
                    .catch(() => {
                        this.networkLog = 'New testing was not ran'
                    });
            },

            reloadTestingResults() {
                const http = new HttpClient(this.$http);
                http.getAllTestingResults()
                    .then(testingResults => {
                        this.testings = testingResults;
                        const selectedTestingID = this.getSelectedTestingID();
                        const filteredTesting = _.first(this.testings.filter((testing) => testing._id === selectedTestingID));
                        if (!_.isUndefined(filteredTesting.nestings) && !_.isNull(filteredTesting.nestings)) {
                            this.tests = filteredTesting.nestings.map(nesting => ({id: nesting.id, icon: this.getTestStatusImage(nesting.status), status: nesting.status}));
                            const uncheckedTests = this.tests.filter(test => test.status === 'progress');
                            if (!_.isEmpty(uncheckedTests)) {
                                setTimeout(() => this.reloadTestingResults(), 1000);
                            }
                        } else {
                            this.tests = [];
                        }
                    })
                    .catch(() => {
                        this.tests = [];
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

    .wrapper-test-nav-button {
        border-radius: 15px;
        padding: 7px 15px 7px 15px;
        margin: 0;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
        transition: .5s;
        color: #14171A;
        font-size: 12px;
    }

    .wrapper-test-nav-button:hover {
        color: #48AAE6;
        box-shadow: inset 2px 2px 5px rgba(154, 147, 140, 0.5), 1px 1px 5px rgba(255, 255, 255, 1);
    }

    .tests-nav-button {
        padding: 0;
        margin: 0;
    }

    .test-status-icon {
        padding: 0;
        margin: 1px 5px 0 0;
        float: left;
        width: 15px;
        height: auto;
    }

    @media (max-width: 768px) {

        #navigation-block {
            width: 100%;
        }

    }

</style>