<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 export-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Get Full Nesting Result (Order ID {{ $store.getters.nestingOrderID }})</p>
        <textarea disabled class="block-textarea"
                  placeholder="Nesting result will be here..."
                  v-model="nestingOrder">
        </textarea>
        <button class='block-button' @click="onClickGetNestingStats">Stats</button>
        <button class="block-button" @click="onClickPreview">Preview</button>
        <button class='block-button' @click="onClickGetNestingResult">Full Nesting Result</button>
        <button class="block-button"
                :class="{'disabled-block-button' : !fullNestingResult}"
                @click="onClickVisualize"
                :disabled="!fullNestingResult">
            Visualize
        </button>
        <div>
            <p class="log-message">{{ message }}</p>
        </div>
    </div>

</template>

<script>

    import axios from 'axios'
    import { saveAs } from 'file-saver';

    const fabric = require('fabric').fabric;
    const canvasPainter = require('../scripts/canvasPainter');
    const nestingRequestParser = require('../scripts/nestingRequestParser');

    export default {
        name: 'exportBlockTemplate',
        data: function () {
            return {
                nestingOrder : '',
                fullNestingResult : false,
                message : 'Unknown status'
            }
        },
        methods: {

            onClickGetNestingStats: function() {
                getNestingStats(this.$root.$data.serverAddress, this.$store.getters.nestingOrderID)
                    .then((data) => {
                        this.nestingOrder = JSON.stringify(data, null, 4);
                        this.message = 'Nesting stats have been received';
                        this.fullNestingResult = false;
                    }).catch((error) => {
                        this.message = 'Error. Can not receive nesting stats';
                        this.nestingOrder = error;
                    });
            },

            onClickPreview: function() {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                const image = new Image();
                image.src = this.$root.$data.serverAddress + '/result/' + this.$store.getters.nestingOrderID + '/image';
                image.onload = () => {
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    this.message = 'Preview image has been received';
                }
            },

            onClickGetNestingResult: function () {
                getFullNestingResult(this.$root.$data.serverAddress, this.$store.getters.nestingOrderID)
                    .then((data) => {
                        this.nestingOrder = JSON.stringify(data, null, 4);
                        this.$store.dispatch('nestingResponse', data);
                        this.message = 'Full nesting result has been received';
                        this.fullNestingResult = true;
                    }).catch((error) => {
                        this.message = 'Error. Can not receive full nesting result';
                        this.nestingOrder = error;
                    });
            },

            onClickVisualize: function() {
                this.$store.dispatch('canvas',new fabric.StaticCanvas('canvas', {
                    scale: 1,
                    width: 600,
                    height: 400,
                    selection: false
                }));

                const nestingRequest = this.$store.getters.nestingRequest;
                const nestingResponse = this.$store.getters.nestingResponse;
                const sheetID = nestingRequestParser.getAllSheetsId(nestingRequest)[0];
                this.$store.dispatch('openedSheetNumber', sheetID);
                canvasPainter.draw(this.$store.getters.canvas, sheetID, nestingRequest, nestingResponse)
            }
        }
    }

    function getNestingStats(address, orderID) {
        return new Promise((resolve, reject) => {
            axios
                .get(address + '/result/' + orderID + '/stats')
                .then(response => resolve(response.data))
                .catch(error => reject(error))
        });
    }

    function getFullNestingResult(address, orderID) {
        return new Promise((resolve, reject) => {
            axios
                .get(address + '/result/' + orderID + '/full')
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }

</script>

<style scoped>

    .block-button:nth-of-type(1),
    .block-button:nth-of-type(2){
        width: 18%;
    }

    .block-button:nth-of-type(3){
        width: 39%;
    }

    .block-button:nth-of-type(4){
        width: 21%;
    }

    .export-form {
        text-align: center;
        margin-top: 13%;
    }

    .export-form div {
        display: inline-block;
    }

</style>