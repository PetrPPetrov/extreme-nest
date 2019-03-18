<template>

    <div id="import-form" class="block">
        <p class="block-title">Import</p>
        <input id="input-export-file" type="file" @change="onChangeSelectedFile($event)">
        <button id="run-nesting-button" class="button" @click="onClickImport" :disabled="!selectedFile">Import</button>
        <hr>
        <p class="log-message">{{ $store.getters.networkLog }}</p>
    </div>
    
</template>

<script>

    import * as _ from 'underscore'
    import convertToJSONNestingRequest from '../../scripts/nestingImporter'

    export default {
        data() {
            return {
                selectedFile: null
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
                        const request = convertToJSONNestingRequest(event.target.result);
                        this.$store.dispatch('exportNestingRequest', JSON.stringify(request, null, 4));
                    };
                })(this.selectedFile);
                reader.onerror = () => {
                    this.selectedFile = null;
                    this.$store.dispatch('networkLog', 'File wasn\'t loaded');
                };
                reader.readAsText(this.selectedFile);
            },

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