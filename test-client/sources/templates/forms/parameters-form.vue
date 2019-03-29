<template>

    <div id="parameters-block" class="block">
        <p class="block-title">Parameters</p>
        <label for="input-count-figures" v-bind:class="{'error-label': (countFigures <= 0 || countFigures === '')}">Count figures:</label>
        <input id="input-count-figures" type="number" v-model="countFigures" v-bind:class="{'error-input': (countFigures <= 0 || countFigures === '')}">
        <label for="input-sheet-width" v-bind:class="{'error-label': (sheetWidth <= 0 || sheetWidth === '')}">Sheet width:</label>
        <input id="input-sheet-width" type="number" v-model="sheetWidth" v-bind:class="{'error-input': (sheetWidth <= 0 || sheetWidth === '')}">
        <label for="input-sheet-height" v-bind:class="{'error-label': (sheetHeight <= 0 || sheetHeight === '')}">Sheet height:</label>
        <input id="input-sheet-height" type="number" v-model="sheetHeight" v-bind:class="{'error-input': (sheetHeight <= 0 || sheetHeight === '')}">
        <label for="input-nesting-time" v-bind:class="{'error-label': (nestingTime <= 0 || nestingTime === '')}">Nesting time in seconds:</label>
        <input id="input-nesting-time" type="number" v-model="nestingTime" v-bind:class="{'error-input': (nestingTime <= 0 || nestingTime === '')}">
        <button id="generation-button" class="button" @click="onClickGenerate" :disabled="(countFigures <= 0 || countFigures === '') ||
            (sheetWidth <= 0 || sheetWidth === '') || (sheetHeight <= 0 || sheetHeight === '') || (nestingTime <= 0 || nestingTime === '') ||
             this.$store.getters.generationInProgress">Generate</button>
        <saving-test-block></saving-test-block>
        <hr>
        <deleting-test-block></deleting-test-block>
        <hr>
        <button id="run-nesting-button" class="button" @click="onClickRunNesting" :disabled="(countFigures <= 0 || countFigures === '') ||
            (sheetWidth <= 0 || sheetWidth === '') || (sheetHeight <= 0 || sheetHeight === '') || (nestingTime <= 0 || nestingTime === '') ||
            this.$store.getters.generationInProgress || ($store.getters.nestingRequest === '') ||
            ($store.getters.goldNestingResponse === '')">Run nesting</button>
        <hr>
        <p class="log-message">{{ $store.getters.networkLog }}</p>
    </div>

</template>

<script>

    import savingTestBlock from '../components/saving-test-block'
    import deletingTestBlock from '../components/deleting-tests-block'

    import networkConfiguration from '../../resources/data/network'
    import generateNestingAsync from '../../scripts/nestingGenerator'

    export default {
        data() {
            return {
                countFigures: 13,
                sheetWidth: 8,
                sheetHeight: 4,
                nestingTime: 1,
            }
        },
        components: {
            savingTestBlock: savingTestBlock,
            deletingTestBlock: deletingTestBlock
        },
        methods: {

            async onClickGenerate(){
                this.$store.dispatch('generationInProgress', true);
                this.$store.dispatch('clear');
                this.$store.dispatch('goldVisualizationLog', 'Nesting generation in progress...');
                const [nestingRequest, nestingResponse] = await generateNestingAsync(
                    Math.floor(this.countFigures), this.sheetWidth, this.sheetHeight, this.nestingTime
                );
                this.$root.$emit('draw-gold-nesting-canvas', [nestingRequest, nestingResponse, 20]);
                this.$store.dispatch('nestingRequest', JSON.stringify(nestingRequest, null, 4));
                this.$store.dispatch('goldNestingResponse', JSON.stringify(nestingResponse, null, 4));
                this.$store.dispatch('goldVisualizationLog', 'Nesting generated successfully');
                this.$store.dispatch('generationInProgress', false);
            },

            onClickRunNesting(){
                this.$store.dispatch('generationInProgress', true);
                const nestingRequest = JSON.parse(this.$store.getters.nestingRequest);
                deleteColorsInNestingRequest(nestingRequest);
                this.$store.dispatch('serverVisualizationLog', 'Nesting generation on the server in progress...');
                this.$http.post(`${networkConfiguration.nestingServer.address}/new`, nestingRequest)
                    .then(response =>
                        setTimeout(() => {
                            const nestingID = response.body.nesting_order_id;
                            this.receiveNestingResponseFromServer(nestingRequest, nestingID);
                        }, nestingRequest.time * 1000)
                    )
                    .catch(() => {
                        this.$store.dispatch('generationInProgress', false);
                        this.$store.dispatch('serverVisualizationLog', 'Server was not generated nesting')
                    });
            },

            receiveNestingResponseFromServer(nestingRequest, nestingID){
                this.$http.get(`${networkConfiguration.nestingServer.address}/result/${nestingID}/full`)
                    .then(response => {
                        if (!response.body.nestings) {
                            setTimeout(() => this.receiveNestingResponseFromServer(nestingRequest, nestingID), nestingRequest.time * 1000)
                        } else {
                            const nestingResponse = response.body;
                            this.$root.$emit('draw-server-nesting-canvas', [nestingRequest, nestingResponse, 20]);
                            this.$store.dispatch('serverNestingResponse', JSON.stringify(nestingResponse, null, 4));
                            this.$store.dispatch('serverVisualizationLog', 'Server generated nesting successfully');
                            this.$store.dispatch('generationInProgress', false);
                        }
                    })
                    .catch(() => {
                        this.$store.dispatch('generationInProgress', false);
                        this.$store.dispatch('serverVisualizationLog', 'Nesting was not generated on the server');
                    });
            }

        }
    }

    function deleteColorsInNestingRequest(nestingRequest){
        nestingRequest.parts.forEach(part => {
            part.instances.forEach(instance => {
                delete instance.color;
                delete instance.pieceID;
            })
        });
        return nestingRequest;
    }

</script>

<style scoped lang="sass">

    #parameters-block
        width: calc(100% + 15px)

    #generation-button
        margin-top: 10px

    @media (max-width: 768px)

        #parameters-block
            width: 100%

    #input-count-figures,
    #input-sheet-height,
    #input-sheet-width,
    #input-nesting-time
        width: 100%

</style>