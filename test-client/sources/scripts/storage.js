// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const storage = new Vuex.Store({
    state: {
        nestingRequest: '',
        goldNestingResponse: '',
        randomNestingRequest: '',
        randomNestingResponse: '',
        importNestingRequest: '',
        importNestingResponse: '',
        networkLog: '...',
        goldVisualizationLog: '...',
        serverVisualizationLog: '...',
        generationInProgress : false,
    },
    mutations: {
        set(state, { key, value}){
            state[key] = value;
        }
    },
    getters: {
        nestingRequest: state => state.nestingRequest,
        goldNestingResponse: state => state.goldNestingResponse,
        randomNestingRequest: state => state.randomNestingRequest,
        importNestingRequest: state => state.importNestingRequest,
        importNestingResponse: state => state.importNestingResponse,
        randomNestingResponse: state => state.randomNestingResponse,
        networkLog: state => state.networkLog,
        goldVisualizationLog: state => state.goldVisualizationLog,
        serverVisualizationLog: state => state.serverVisualizationLog,
        generationInProgress: state => state.generationInProgress
    },
    actions: {
        clear({ commit }) {
            commit('set', { key: 'nestingRequest', value: '' });
            commit('set', { key: 'goldNestingResponse', value: '' });
            commit('set', { key: 'randomNestingRequest', value: '' });
            commit('set', { key: 'randomNestingResponse', value: '' });
            commit('set', { key: 'importNestingRequest', value: '' });
            commit('set', { key: 'importNestingResponse', value: '' });
            commit('set', { key: 'networkLog', value: '...' });
            commit('set', { key: 'goldVisualizationLog', value: '...' });
            commit('set', { key: 'serverVisualizationLog', value: '...' });
        },
        nestingRequest({ commit }, request) {
            commit('set', { key: 'nestingRequest', value: request });
        },
        goldNestingResponse({ commit }, response) {
            commit('set', { key: 'goldNestingResponse', value: response });
        },
        randomNestingRequest({ commit }, request) {
            commit('set', { key: 'randomNestingRequest', value: request });
        },
        importNestingRequest({ commit }, request) {
            commit('set', { key: 'importNestingRequest', value: request });
        },
        importNestingResponse({ commit }, request) {
            commit('set', { key: 'importNestingResponse', value: request });
        },
        randomNestingResponse({ commit }, response) {
            commit('set', { key: 'randomNestingResponse', value: response });
        },
        networkLog({ commit }, message) {
            commit('set', { key: 'networkLog', value: message });
        },
        goldVisualizationLog({ commit }, message) {
            commit('set', { key: 'goldVisualizationLog', value: message });
        },
        serverVisualizationLog({ commit }, message) {
            commit('set', { key: 'serverVisualizationLog', value: message });
        },
        generationInProgress({ commit }, status) {
            commit('set', { key: 'generationInProgress', value: status });
        }
    }
});

export default storage;