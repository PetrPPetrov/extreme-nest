<template>

    <div id="navigation-block" class="block">
        <p class="block-title">Tests</p>
        <label for="select-tests">Select testing:</label>
        <select id="select-tests">
            <option v-for="testing in testings">{{ testing }}</option>
        </select>
        <button class="button" @click="onClickDeleteTest">Show testing</button>
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
                selectedTests: []
            }
        },
        mounted() {
            // this.$http.get(`${networkConfiguration.databaseServer.address}/tests`)
            //     .then(response => {
            //         this.testings = response.body;
            //         this.networkLog = 'Testing results was loaded'
            //     })
            //     .catch(() => this.networkLog = 'Testing results was not loaded: connection is absent')
        },
        methods: {

            onClickRunTests() {
                this.$http.post(`${networkConfiguration.databaseServer.address}/tests`)
                    .then(response => {
                        const testID = response.body.id;
                        console.log(testID);
                    })
                    .catch(() => {

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
        margin-bottom: 0;
    }

    #select-tests {
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