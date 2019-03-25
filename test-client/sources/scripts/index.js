// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import Vue from 'vue'
import VueResource from 'vue-resource'

import store from './store'
import router from './router'

import headerForm from '../templates/forms/header-form'

Vue.use(VueResource);

new Vue({
    el : '#app',
    store: store,
    router: router,
    components : {
        headerForm: headerForm
    }
});