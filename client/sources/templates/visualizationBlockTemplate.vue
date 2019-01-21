<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 visualization-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Visualization area</p>
        <p class="description">
            You can see result of nesting optimization right here. For it
            you need get full nesting result and click on <b>Visualize</b> button.
            Also yo can download this image, for it click on button <b>Download</b>.
        </p>
        <button class='block-button' @click="onClickPrevSheet"><</button>
        <button class="block-button" @click="onClickNextSheet">></button>
        <button class='block-button' @click="onClickDown">+</button>
        <button class="block-button" @click="onClickUp">-</button>
        <canvas id="canvas"/>
    </div>

</template>

<script>

    import image from '../resources/images/visualization-icon.png'

    export default {
        name: "visualizationBlockTemplate",
        data: function () {
            return {
                image: image
            }
        },
        methods : {

            onClickPrevSheet : function () {
                
            },

            onClickNextSheet : function() {
                
            },

            onClickDown : function() {
                
            },

            onClickUp : function () {

            }
            
        }
    }

</script>

<style scoped>

    .block-button {
        margin-top: 5px;
        width: 15%;
    }

    canvas {
        width: 100%;
        height: 390px;
        border-radius: 5px;
        margin-top: 8px;
        background-color: white;
    }

    .visualization-form {
        text-align: center;
        margin-top: 13%;
        height: 500%;
    }

    img {
        width: 100px;
        height: auto;
        margin-top: 25%;
    }

    .description {
        margin-left: 0;
    }

</style>