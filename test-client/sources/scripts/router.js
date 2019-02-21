// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'

import generationTemplate from '../templates/generationPage/generationTemplate'
import testingTemplate from '../templates/testingPage/testingTemplate'

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        { path: `/generation`, component: generationTemplate, },
        { path: '/testing', component: testingTemplate },
        { path: '/', redirect: `/generation` }
    ],
    linkActiveClass: "active-nav-link"
});

export default router