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
        canvasGoldGeneration: {},
        canvasRandomGeneration: {},
        goldNestingRequest: '',
        goldNestingResponse: '',
        randomNestingRequest: '',
        randomNestingResponse: '',
        importNestingRequest: '',
        importNestingResponse: '',
        networkLog: '...',
        goldVisualizationLog: '...',
        randomVisualizationLog: '...',
        generationInProgress : false,
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
        importNestingRequest: state => state.importNestingRequest,
        importNestingResponse: state => state.importNestingResponse,
        randomNestingResponse: state => state.randomNestingResponse,
        networkLog: state => state.networkLog,
        goldVisualizationLog: state => state.goldVisualizationLog,
        randomVisualizationLog: state => state.randomVisualizationLog,
        generationInProgress: state => state.generationInProgress
    },
    actions: {
        clear({ commit }) {
            commit('set', { key: 'goldNestingRequest', value: '' });
            commit('set', { key: 'goldNestingResponse', value: '' });
            commit('set', { key: 'randomNestingRequest', value: '' });
            commit('set', { key: 'goldNestingResponse', value: '' });
            commit('set', { key: 'randomNestingResponse', value: '' });
            commit('set', { key: 'importNestingRequest', value: '' });
            commit('set', { key: 'importNestingResponse', value: '' });
            commit('set', { key: 'networkLog', value: '...' });
            commit('set', { key: 'goldVisualizationLog', value: '...' });
            commit('set', { key: 'randomVisualizationLog', value: '...' });
        },
        clearCanvases({ commit, state }) {
            state['canvasGoldGeneration'].clear();
            state['canvasRandomGeneration'].clear();
        },
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
        randomVisualizationLog({ commit }, message) {
            commit('set', { key: 'randomVisualizationLog', value: message });
        },
        generationInProgress({ commit }, status) {
            commit('set', { key: 'generationInProgress', value: status });
        }
    }
});

export default storage;