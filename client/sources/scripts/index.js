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
       nestingOrder: 0,
    },
    components : {
        headerTemplate: headerTemplate,
        importBlockTemplate: importBlockTemplate,
        exportBlockTemplate: exportBlockTemplate,
        informationBlockTemplate: informationBlockTemplate,
        visualizationBlockTemplate: visualizationBlockTemplate
    }
});