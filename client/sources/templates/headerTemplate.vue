<template>

    <header>
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                    <p class="header-title">EXTREME-NEST</p>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 toolbar">
                    <p class="hyper">Documentation</p>
                </div>
            </div>
        </div>
    </header>

</template>

<script>


    export default {
        name: 'headerTemplate'
    }

</script>

<style scoped>

    header {
        width: 100%;
        height: 50px;
        background-color: white;
        border-bottom: 1px solid #ACB1B4;
    }

    .header-title {
        float: left;
        color: #6F7D9A;
        margin: 12px 0 0 0;
        font-size: 22px;
        font-family: 'Staatliches', cursive;
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