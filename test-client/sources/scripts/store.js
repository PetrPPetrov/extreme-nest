// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

'use strict';

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        nestingRequest: '',
        goldNestingResponse: '',
        serverNestingResponse: '',
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
        serverNestingResponse: state => state.serverNestingResponse,
        importNestingRequest: state => state.importNestingRequest,
        importNestingResponse: state => state.importNestingResponse,
        networkLog: state => state.networkLog,
        goldVisualizationLog: state => state.goldVisualizationLog,
        serverVisualizationLog: state => state.serverVisualizationLog,
        generationInProgress: state => state.generationInProgress
    },
    actions: {
        clear({ commit }) {
            commit('set', { key: 'nestingRequest', value: '' });
            commit('set', { key: 'goldNestingResponse', value: '' });
            commit('set', { key: 'serverNestingResponse', value: '' });
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
        serverNestingResponse({ commit }, response) {
            commit('set', { key: 'serverNestingResponse', value: response });
        },
        importNestingRequest({ commit }, request) {
            commit('set', { key: 'importNestingRequest', value: request });
        },
        importNestingResponse({ commit }, request) {
            commit('set', { key: 'importNestingResponse', value: request });
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

export default store;