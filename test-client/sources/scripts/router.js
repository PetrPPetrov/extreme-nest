// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'

import generationPage from '../templates/generationPage/generationPage'
import testingPage from '../templates/testingPage/testingPage'

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {
            path: `/generation`,
            component: generationPage,
        },
        {
            path: '/testing',
            component: testingPage
        },
        {
            path: '/',
            redirect: `/generation`
        }
    ],
    linkActiveClass: "active-nav-link"
});

export default router