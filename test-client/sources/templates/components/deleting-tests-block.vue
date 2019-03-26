<template>

    <div>
        <label for="select-tests" v-bind:class="{'error-label': this.selectedTest === ''}">Select test:</label>
        <select id="select-tests" v-model="selectedTest" v-bind:class="{'error-input': this.selectedTest === ''}">
            <option v-for="test in visibleTests">{{ test}}</option>
        </select>
        <label for="new-test-name" v-bind:class="{'error-label': (this.selectedTest === '' || newTestName === '' )}">Enter new name:</label>
        <input id="new-test-name" v-model="newTestName" v-bind:class="{'error-input': (this.selectedTest === '' || newTestName === '' )}">
        <button id="rename-button" class="button" :disabled="isDeletingInProgress || this.selectedTest === '' ||
            newTestName === '' || this.$store.getters.generationInProgress" @click="onClickRenameTest">Rename test</button>
        <button id="deleting-button" class="button" :disabled="isDeletingInProgress || this.selectedTest === '' ||
            this.$store.getters.generationInProgress" @click="onClickDeleteTest">Delete test</button>
        <button id="visualization-button" class="button" :disabled="isDeletingInProgress || this.selectedTest === '' ||
            this.$store.getters.generationInProgress" @click="onClickVisualizeTest">Visualize test</button>
    </div>

</template>

<script>

    import * as _ from 'underscore';
    import HttpClient from '../../scripts/network'

    export default {
        data() {
            return {
                networkLog: '...',
                tests: [],
                visibleTests: [],
                selectedTest: '',
                newTestName: '',
                isDeletingInProgress: false
            }
        },
        beforeCreate() {
            const http = new HttpClient(this.$http);
            http.getAllTestsID()
                .then(tests => {
                    this.tests = tests;
                    this.reloadVisibleTests();
                    this.$store.dispatch('networkLog', 'Tests were loaded');
                })
                .catch(() => {
                    this.$store.dispatch('networkLog', 'Tests weren\'t loaded')
                });
        },
        mounted() {
            this.$root.$on('add', (test) => {
                test._id = test.id;
                delete test.id;
                this.tests.unshift(test);
                this.reloadVisibleTests();
            });
        },
        methods: {

            onClickRenameTest(){
                const alias = this.newTestName;
                if (!this.isExistTestWithAlias(alias)) {
                    const test = this.getSelectedTest();
                    const http = new HttpClient(this.$http);
                    http.changeTestAlias(test._id, alias)
                        .then(() => {
                            test.alias = alias;
                            this.reloadVisibleTests();
                            this.$store.dispatch('networkLog', `Test was renamed`);
                        })
                        .catch(() => {
                            this.$store.dispatch('networkLog', `Test wasn't renamed`);
                        })
                } else {
                    this.$store.dispatch('networkLog', `New name already exists`);
                }
                this.newTestName = '';
            },

            isExistTestWithAlias(alias) {
                return !_.isUndefined(_.find(this.tests, (test) => test.alias === alias));
            },

            getSelectedTest() {
                const test = _.find(this.tests, (test) => test._id === this.selectedTest);
                return !_.isUndefined(test) ? test : _.find(this.tests, (test) => test.alias === this.selectedTest);
            },

            reloadVisibleTests() {
                this.visibleTests = this.tests.map(test => !_.isUndefined(test.alias) ? test.alias : test._id);
                if (!_.isUndefined(_.first(this.visibleTests))){
                    this.selectedTest = _.first(this.visibleTests);
                } else {
                    this.selectedTest = '';
                }
            },

            onClickDeleteTest(){
                this.isDeletingInProgress = true;
                this.$store.dispatch('clear');
                this.$root.$emit('clear-canvases');
                this.$store.dispatch('networkLog', `Deleting in progress...`);
                const http = new HttpClient(this.$http);
                const test = this.getSelectedTest();
                http.removeTestByID(test._id)
                    .then(() => {
                        this.$store.dispatch('networkLog', `Test was deleted`);
                        this.tests.splice(test, 1);
                        this.reloadVisibleTests();
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
                this.$root.$emit('clear-canvases');
                this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} visualization in progress...`);
                const http = new HttpClient(this.$http);
                http.getTestByTestID(this.getSelectedTest()._id)
                    .then(test => {
                        delete test.goldRequest._id;
                        delete test.goldResponse._id;
                        this.$store.dispatch('nestingRequest', JSON.stringify(test.goldRequest, null, 4));
                        this.$store.dispatch('goldNestingResponse', JSON.stringify(test.goldResponse, null, 4));
                        this.$root.$emit('draw-gold-nesting-canvas', [test.goldRequest, test.goldResponse, 20]);
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} was visualized`)
                    })
                    .catch(() => {
                        this.$store.dispatch('goldVisualizationLog', `Test: ${this.selectedTest} wasn't visualized`)
                    });
            }

        }
    }

</script>

<style scoped>

    #select-tests {
        width: 100%;
    }

    #new-test-name {
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