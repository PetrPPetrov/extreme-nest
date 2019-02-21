// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import Vue from 'vue'

import router from './router'
import storage from './storage'

import headerTemplate from '../templates/headerTemplate'
import generationTemplate from '../templates/generationPage/generationTemplate'
import testingTemplate from '../templates/testingPage/testingTemplate'

new Vue({
    el : '#app',
    store: storage,
    router: router,
    components : {
        headerTemplate: headerTemplate,
        generationTemplate: generationTemplate,
        testingTemplate: testingTemplate
    }
});