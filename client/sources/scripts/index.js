import Vue from 'vue'

import headerTemplate from '../templates/headerTemplate'
import importBlockTemplate from '../templates/importBlockTemplate'
import informationBlockTemplate from '../templates/informationBlockTemplate'

new Vue({
    el : '#app',
    components : {
        headerTemplate: headerTemplate,
        importBlockTemplate: importBlockTemplate,
        informationBlockTemplate: informationBlockTemplate
    }
});