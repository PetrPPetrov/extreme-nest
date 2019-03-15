<template>

    <div id="export-form" class="block">
        <p class="block-title">Export</p>
        <input id="input-export-file" type="file" @change="onChangeSelectedFile($event)">
        <button id="run-nesting-button" class="button" @click="onClickReadFile">Export</button>
        <hr>
        <p class="log-message">{{ $store.getters.networkLog }}</p>
    </div>
    
</template>

<script>

    import * as _ from 'underscore'

    export default {
        data() {
            return {
                selectedFile: [],
                exportedNestingFile : ''
            }
        },
        methods: {

            onChangeSelectedFile(event) {
                this.selectedFile = _.first(event.target.files);
            },

            onClickReadFile() {
                var reader = new FileReader();
                reader.onload = (() => {
                    return (event) => {
                        this.$store.dispatch('networkLog', 'File was loaded');
                        this.exportedNestingFile = event.target.result;
                    };
                })(this.selectedFile);
                reader.onerror = () => this.$store.dispatch('networkLog', 'File wasn\'t loaded');
                reader.readAsText(this.selectedFile);
            },

        }
    }

</script>

<style scoped>


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