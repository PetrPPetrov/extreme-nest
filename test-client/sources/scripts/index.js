// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import Vue from 'vue'
import VueResource from 'vue-resource'

import router from './router'
import storage from './storage'

import headerForm from '../templates/headerForm'

Vue.use(VueResource);

new Vue({
    el : '#app',
    store: storage,
    router: router,
    components : {
        headerForm: headerForm
    }
});