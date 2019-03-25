<template>

    <div id="import-form" class="block">
        <p class="block-title">Import</p>
        <input id="input-export-file" type="file" @change="onChangeSelectedFile($event)">
        <button id="run-nesting-button" class="button" @click="onClickImport" :disabled="!selectedFile">Import</button>
        <button class="button" :disabled="$store.getters.importNestingRequest === '' || isSavingInProgress" @click="onClickSaveTest">Save test</button>
        <hr>
        <p class="log-message">{{ $store.getters.networkLog }}</p>
    </div>
    
</template>

<script>

    import * as _ from 'underscore'
    import HttpClient from '../../scripts/network'
    import convertToJSONNestingRequest from '../../scripts/nestingImporter'

    export default {
        data() {
            return {
                selectedFile: null,
                isSavingInProgress: false
            }
        },
        methods: {

            onChangeSelectedFile(event) {
                this.selectedFile = _.first(event.target.files);
            },

            onClickImport() {
                const reader = new FileReader();
                reader.onload = (() => {
                    return (event) => {
                        this.$store.dispatch('networkLog', 'File was loaded');
                        try {
                            const [request, response] = convertToJSONNestingRequest(event.target.result);
                            this.$store.dispatch('importNestingRequest', JSON.stringify(request, null, 4));
                            this.$store.dispatch('importNestingResponse', JSON.stringify(response, null, 4));
                            this.$root.$emit('draw-gold-nesting-canvas', [request, response, 5]);
                            this.$store.dispatch('goldVisualizationLog', 'Nesting request from XML was visualized');
                        } catch (e) {
                            this.$store.dispatch('goldVisualizationLog', 'Nesting request from XML wasn\'t visualized: solution is absent');
                        }
                    };
                })(this.selectedFile);
                reader.onerror = () => {
                    this.selectedFile = null;
                    this.$store.dispatch('networkLog', 'File wasn\'t loaded');
                };
                reader.readAsText(this.selectedFile);
            },

            onClickSaveTest() {
                this.isSavingInProgress = true;
                this.$store.dispatch('networkLog', 'Saving in progress...');
                const http = new HttpClient(this.$http);
                http.createNewTest()
                    .then(newTest => {
                        Promise.all([
                            http.joinGoldRequestToTest(this.$store.getters.importNestingRequest, newTest.id),
                            http.joinGoldResponseToTest(this.$store.getters.importNestingResponse, newTest.id)
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

    #import-form {
        width: calc(100% + 15px);
    }

    input[type=file] {
        outline: none;
        cursor: pointer;
        width: 100%;
        overflow: hidden;
        margin-bottom: 10px;
    }

    input[type=file]:before {
        color: white;
        padding: 3px 11px 3px 10px;
        font-size: 12px;
        border-radius: 10px;
        content: 'Select file';
        display: inline-block;
        background: #48AAE6;
        text-align: center;
        font-family: Helvetica, Arial, sans-serif;
    }

    input[type=file]::-webkit-file-upload-button {
        visibility: hidden;
    }

</style>