// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const storage = new Vuex.Store({
    state: {
        canvas: {},
        openedSheetNumber: 0,
        nestingOrderID: 0,
        nestingRequest: {},
        nestingResponse: {},
    },
    mutations: {
        set(state, { key, value}){
            state[key] = value;
        }
    },
    getters: {
        canvas(state) {
            return state.canvas;
        },
        openedSheetNumber(state) {
            return state.openedSheetNumber;
        },
        nestingOrderID(state) {
            return state.nestingOrderID;
        },
        nestingRequest(state) {
            return state.nestingRequest;
        },
        nestingResponse(state) {
            return state.nestingResponse;
        }
    },
    actions: {
        canvas({ commit }, canvas) {
            commit('set', { key: 'canvas', value: canvas });
        },
        openedSheetNumber({ commit }, openedSheetNumber) {
            commit('set', { key: 'openedSheetNumber', value: openedSheetNumber });
        },
        nestingOrderID({ commit }, nestingOrderID) {
            commit('set', { key: 'nestingOrderID', value: nestingOrderID });
        },
        nestingRequest({ commit }, nestingRequest) {
            commit('set', { key: 'nestingRequest', value: nestingRequest });
        },
        nestingResponse({ commit }, nestingResponse) {
            commit('set', { key: 'nestingResponse', value: nestingResponse });
        }
    }
});

export default storage;