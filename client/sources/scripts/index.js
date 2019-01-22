import Vue from 'vue'

import headerTemplate from '../templates/headerTemplate'
import importBlockTemplate from '../templates/importBlockTemplate'
import exportBlockTemplate from '../templates/exportBlockTemplate'
import informationBlockTemplate from '../templates/informationBlockTemplate'
import visualizationBlockTemplate from '../templates/visualizationBlockTemplate'

new Vue({
    el : '#app',
    data: {
        isOpenedImportForms : true,
        serverAddress: '',
        nestingOrderID: 0,
        nestingRequest: {},
        nestingResponse: {}
    },
    components : {
        headerTemplate: headerTemplate,
        importBlockTemplate: importBlockTemplate,
        exportBlockTemplate: exportBlockTemplate,
        informationBlockTemplate: informationBlockTemplate,
        visualizationBlockTemplate: visualizationBlockTemplate
    }
});