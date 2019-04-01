<template>

    <div>
        <label>{{ title }}</label>
        <textarea v-model="data" v-bind:style="{ height: height + 'px' }"></textarea>
    </div>

</template>

<script>

    export default {
        props: ['title', 'data', 'height']
    }

</script>

<style scoped lang="sass">

    textarea
        width: 100%
        resize: none

</style>