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
        goldNestingRequest: '',
        goldNestingResponse: '',
        randomNestingRequest: '',
        randomNestingResponse: '',
        goldVisualizationLog: '...',
        randomVisualizationLog: '...'
    },
    mutations: {
        set(state, { key, value}){
            state[key] = value;
        }
    },
    getters: {
        canvasGoldGeneration: state => state.canvasGoldGeneration,
        canvasRandomGeneration: state => state.canvasRandomGeneration,
        goldNestingRequest: state => state.goldNestingRequest,
        goldNestingResponse: state => state.goldNestingResponse,
        randomNestingRequest: state => state.randomNestingRequest,
        randomNestingResponse: state => state.randomNestingResponse,
        goldVisualizationLog: state => state.goldVisualizationLog,
        randomVisualizationLog: state => state.randomVisualizationLog
    },
    actions: {
        canvasGoldGeneration({ commit }, canvas) {
            commit('set', { key: 'canvasGoldGeneration', value: canvas });
        },
        canvasRandomGeneration({ commit }, canvas) {
            commit('set', { key: 'canvasRandomGeneration', value: canvas });
        },
        goldNestingRequest({ commit }, request) {
            commit('set', { key: 'goldNestingRequest', value: request });
        },
        goldNestingResponse({ commit }, response) {
            commit('set', { key: 'goldNestingResponse', value: response });
        },
        randomNestingRequest({ commit }, request) {
            commit('set', { key: 'randomNestingRequest', value: request });
        },
        randomNestingResponse({ commit }, response) {
            commit('set', { key: 'randomNestingResponse', value: response });
        },
        goldVisualizationLog({ commit }, message) {
            commit('set', { key: 'goldVisualizationLog', value: message });
        },
        randomVisualizationLog({ commit }, message) {
            commit('set', { key: 'randomVisualizationLog', value: message });
        }
    }
});

export default storage;