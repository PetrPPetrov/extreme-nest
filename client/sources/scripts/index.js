// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

import Vue from 'vue'

import storage from './storage'
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
    },
    store: storage,
    components : {
        headerTemplate: headerTemplate,
        importBlockTemplate: importBlockTemplate,
        exportBlockTemplate: exportBlockTemplate,
        informationBlockTemplate: informationBlockTemplate,
        visualizationBlockTemplate: visualizationBlockTemplate
    }
});