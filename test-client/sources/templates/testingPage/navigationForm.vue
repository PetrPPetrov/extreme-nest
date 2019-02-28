<template>

    <div id="navigation-block" class="block">
        <p class="block-title">Testings</p>
        <label for="select-testing" v-bind:class="{'error-label': selectedTesting === ''}">Select testing:</label>
        <select id="select-testing" v-model="selectedTesting" v-bind:class="{'error-input': selectedTesting === ''}">
            <option v-for="testing in testings">[{{ testing._id }}] - {{ testing.date }} - {{ testing.time }}</option>
        </select>
        <button class="button" @click="onClickShowTesting" :disabled="selectedTesting === ''">Show testing</button>
        <button id="delete-button" class="button" @click="onClickDeleteTesting" :disabled="selectedTesting === ''">Delete testing</button>
        <hr>
        <hr>
        <button class="button" @click="onClickRunTests">Run new testing</button>
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
                testings: [],
                selectedTesting: '',
                tests: []
            }
        },
        mounted() {
            this.$http.get(`${networkConfiguration.databaseServer.address}/testing`)
                .then(response => {
                    this.testings = response.body;
                    const firstTesting = this.testings[0];
                    if (firstTesting) {
                        this.selectedTesting = `[${firstTesting._id}] - ${firstTesting.date} - ${firstTesting.time}`;
                    }
                    this.networkLog = 'Testing results was loaded'
                })
                .catch(() => this.networkLog = 'Testing results was not loaded')
        },
        methods: {

            onClickShowTesting(){

            },

            onClickDeleteTesting() {
                let testingID = this.selectedTesting.match(/\[[\w\d]+\]/i)[0];
                testingID = testingID.substring(1, testingID.length - 1);
                this.$http.delete(`${networkConfiguration.databaseServer.address}/testing/${testingID}`)
                    .then(() => {
                        this.testings = this.testings.filter((testing) => testing._id !== testingID);
                        const firstTesting = this.testings[0];
                        if (firstTesting) {
                            this.selectedTesting = `[${firstTesting._id}] - ${firstTesting.date} - ${firstTesting.time}`;
                        }
                        this.networkLog = 'Testing was deleted'
                    })
                    .catch(() => this.networkLog = 'Testing was not deleted');
            },

            onClickRunTests() {
                this.$http.post(`${networkConfiguration.databaseServer.address}/testing`)
                    .then(response => {
                        this.testings.push(response.body);
                        this.networkLog = 'New testing was ran'
                    })
                    .catch(() => this.networkLog = 'New testing was not ran');
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

    @media (max-width: 768px) {

        #navigation-block {
            width: 100%;
        }

    }

</style>