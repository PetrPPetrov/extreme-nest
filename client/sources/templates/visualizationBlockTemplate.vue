<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 visualization-form" v-show="!$root.$data.isOpenedImportForms">
        <p class="block-title">Visualization area</p>
        <p class="description">
            You can see result of nesting optimization right here. For it
            you need get full nesting result and click on <b>Visualize</b> button.
            Also yo can download this image, for it click on button <b>Download</b>.
        </p>
        <div class="block">
            <img :src="image">
        </div>
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
        }
    }

</script>

<style scoped>

    .visualization-form {
        text-align: center;
        margin-top: 13%;
        height: 500%;
    }

    .block {
        margin-top: 20%;
        height: 400px;
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