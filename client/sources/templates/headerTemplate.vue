<template>

    <header>
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                    <img class="small-icon" :src="image">
                    <p class="header-title">DEEP-</p>
                    <p class="header-title">NEST</p>
                    <p class="header-title">-REST</p>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 toolbar">
                    <p class="hyper">Documentation</p>
                </div>
            </div>
        </div>
    </header>

</template>

<script>

    import image from '../resources/images/red-icon.png'

    export default {
        name: 'headerTemplate',
        data: function () {
            return {
                image: image
            }
        }
    }

</script>

<style scoped>

    header {
        width: 100%;
        height: 50px;
        background-color: white;
    }

    .small-icon {
        float: left;
        margin: 5px 5px 0 0;
        height: 45px;
        width: auto;
    }

    .header-title {
        float: left;
        color: #4A4849;
        margin: 12px 0 0 0;
        font-size: 22px;
        font-family: 'Staatliches', cursive;
    }

    .header-title:nth-of-type(2) {
        color: #B42329;
    }

    .hyper {
        color: #0D88E4;;
        text-align: right;
        font-family: 'Open Sans Condensed', sans-serif;
        font-size: 20px;
        cursor: pointer;
        margin: 10px 0 0 0;
    }

</style>