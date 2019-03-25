// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import Vue from 'vue'
import VueRouter from 'vue-router'

import storage from '../scripts/storage'
import generationPage from '../templates/pages/generation-page'
import importPage from '../templates/pages/import-page'
import testingPage from '../templates/pages/testing-page'

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {
            path: `/create`,
            component: generationPage,
            beforeEnter: (to, from, next) => {
                storage.dispatch('clear');
                next();
            }
        },
        {
            path: `/export`,
            component: importPage,
            beforeEnter: (to, from, next) => {
                storage.dispatch('clear');
                next();
            }
        },
        {
            path: '/testing',
            component: testingPage,
            beforeEnter: (to, from, next) => {
                storage.dispatch('clear');
                next();
            }
        },
        {
            path: '/',
            redirect: `/create`,
            beforeEnter: (to, from, next) => {
                next();
            }
        }
    ],
    linkActiveClass: "active-nav-link"
});

export default router