<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 block export-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Get Full Nesting Result({{ $root.$data.nestingOrderID }})</p>
        <textarea disabled class="block-textarea" placeholder="Full nesting result will be here..." v-model="nestingOrder"></textarea>
        <button class='block-button'
            @click="onClickGetNestingResult">
            Get Nesting Result
        </button>
        <button class="block-button"
                :class="{'disabled-block-button' : nestingOrder.length === 0}"
                @click="onClickVisualize"
                :disabled="nestingOrder.length === 0">
            Visualize
        </button>
        <button class="block-button"
                :class="{'disabled-block-button' : nestingOrder.length === 0}"
                @click="onClickDownload"
                :disabled="nestingOrder.length === 0">
            Download
        </button>
        <div>
            <p class="log-message">{{ message }}</p>
        </div>
    </div>

</template>

<script>

    import axios from 'axios'
    import { saveAs } from 'file-saver';

    import configuration from '../resources/data/configuration'

    export default {
        name: "exportBlockTemplate",
        data: function () {
            return {
                nestingOrder : '',
                message : '...'
            }
        },
        methods: {

            onClickGetNestingResult: function () {
                getFullNestingResult(this.$root.$data.serverAddress, this.$root.$data.nestingOrderID)
                    .then((data) => {
                        this.nestingOrder = JSON.stringify(data);
                        this.message = "Nesting image was got.";
                    }).catch((error) => {
                        this.nestingOrder = '';
                        this.message = "Error. Nesting image was not got.";
                    });
            },

            onClickDownload: function() {
                downloadNestingImage(this.$root.$data.serverAddress, this.$root.$data.nestingOrderID)
                    .then((data) => {
                        const blob = new Blob([data], {type: "image/png"});
                        saveAs(blob, 'order_' + this.$root.$data.nestingOrderID +'.png');
                        this.message = "Nesting image downloaded successfully.";
                    }).catch((error) => {
                        this.message = "Error. Nesting image was not downloaded.";
                    });
            },

            onClickVisualize: function () {
                const canvas = document.getElementById("canvas");
                const context = canvas.getContext('2d');
                const image = new Image();
                image.src = this.$root.$data.serverAddress + '/result/' + this.$root.$data.nestingOrderID + '/image';
                image.onload = () => {
                    this.$root.$data.isClickedOnVisualization = true;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                }
            }

        }
    }
    
    function getFullNestingResult(address, orderID) {
        return new Promise((resolve, reject) => {
            axios
                .get(address + '/result/' + orderID + '/full')
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }

    function downloadNestingImage(address, imageID) {
        return new Promise((resolve, reject) => {
            axios
                .get(address + '/result/' + imageID + '/image', {
                    responseType: 'arraybuffer'
                })
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }

</script>

<style scoped>

    .block-button:nth-of-type(1) {
        margin-left: 0;
        width: 48%;
    }

    .block-button:nth-of-type(2) {
        width: 25%;
    }

    .block-button:nth-of-type(3) {
        width: 25%;
    }

    .export-form div {
        display: inline-block;
    }

</style>