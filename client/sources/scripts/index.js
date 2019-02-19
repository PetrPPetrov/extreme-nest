// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

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
        nestingResponse: {},
        openedSheetNumber: 0,
        canvas: {}
    },
    components : {
        headerTemplate: headerTemplate,
        importBlockTemplate: importBlockTemplate,
        exportBlockTemplate: exportBlockTemplate,
        informationBlockTemplate: informationBlockTemplate,
        visualizationBlockTemplate: visualizationBlockTemplate
    }
});