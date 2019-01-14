<template>

    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 information">
        <img class="big-icon" :src="image">
        <p v-html="title" class="title">DEEP - NEST - REST</p>
        <p v-html="subtitle" class="subtitle"></p>
        <p v-html="description" class="description"></p>
    </div>

</template>

<script>

    import image from '../resources/images/white-icon.png'
    import information from '../resources/data/information'

    export default {
        name: 'informationBlockTemplate',
        data: function () {
            return {
                image: image,
                title: information.title,
                subtitle: information.subtitle,
                description: information.description
            }
        }
    }

</script>

<style scoped>

    .information {
        margin-top: 11%;
    }

    .big-icon {
        float: left;
        height: 150px;
        width: auto;
    }

    .title {
        font-family: 'Staatliches', cursive;
        margin-top: 30px;
        float: left;
        font-size: 45px;
        color: white;
    }

    .subtitle {
        font-family: 'Open Sans Condensed', sans-serif;
        transform: translateY(-20px);
        float: left;
        color: white;
        font-size: 18px;
    }

    .description {
        font-family: 'Open Sans', sans-serif;
        float: left;
        margin: 5px 0 0 16px;
        color: white;
        font-size: 18px;
    }

</style>