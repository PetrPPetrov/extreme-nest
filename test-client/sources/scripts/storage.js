// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const storage = new Vuex.Store({
    state: {
        canvasGoldGeneration: {},
        canvasRandomGeneration: {},
        visualizationLog: '...',
        exportLog: '...'
    },
    mutations: {
        set(state, { key, value}){
            state[key] = value;
        }
    },
    getters: {
        canvasGoldGeneration: state => state.canvasGoldGeneration,
        canvasRandomGeneration: state => state.canvasRandomGeneration,
        visualizationLog: state => state.visualizationLog,
        exportLog: state => state.exportLog
    },
    actions: {
        canvasGoldGeneration({ commit }, canvas) {
            commit('set', { key: 'canvasGoldGeneration', value: canvas });
        },
        canvasRandomGeneration({ commit }, canvas) {
            commit('set', { key: 'canvasRandomGeneration', value: canvas });
        },
        visualizationLog({ commit }, message) {
            commit('set', { key: 'visualizationLog', value: message });
        },
        exportLog({ commit }, message) {
            commit('set', { key: 'exportLog', value: message });
        }
    }
});

export default storage;