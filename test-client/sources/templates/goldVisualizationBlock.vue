<template>

    <div>
        <label for="canvas-gold-visualization">Visualization of gold nesting:</label>
        <canvas id="canvas-gold-visualization"
                @mousemove="onMouseMoveInCanvas"
                @mousedown="onMouseDownInCanvas"
                @mouseup="omMouseUpInCanvas"
                @wheel="onMouseWheelInCanvas"></canvas>
        <hr>
        <p class="log-message">{{ $store.getters.goldVisualizationLog }}</p>
    </div>

</template>

<script>

    const fabric = require('fabric').fabric;

    export default {
        data() {
            return {
                transX: 0,
                transY: 0,
                scale: 1,
                mouseDown: false,
                oldPageX : 0,
                oldPageY : 0
            }
        },
        mounted() {
            this.$store.dispatch('canvasGoldGeneration', new fabric.StaticCanvas('canvas-gold-visualization', {
                scale: 1,
                width: 445,
                height: 240,
                selection: false
            }));
        },
        methods : {

            onMouseMoveInCanvas(event) {
                if (this.mouseDown) {
                    this.transX -= (this.oldPageX - event.pageX) / this.scale;
                    this.transY -= (this.oldPageY - event.pageY) / this.scale;
                    this.applyTransform();
                    this.oldPageX = event.pageX;
                    this.oldPageY = event.pageY;
                }
            },

            onMouseDownInCanvas(event) {
                this.mouseDown = true;
                this.oldPageX = event.pageX;
                this.oldPageY = event.pageY;
            },

            omMouseUpInCanvas() {
                this.mouseDown = false;
            },

            onMouseWheelInCanvas(event) {
                const canvas = document.getElementById('canvas-gold-visualization');
                const offset = canvas.getBoundingClientRect();
                const centerX = event.pageX - offset.left;
                const centerY = event.pageY - offset.top;
                const zoomStep = event.deltaY * 0.001;
                this.setScale(this.scale - zoomStep, centerX, centerY);
            },

            setScale(scaleToSet, anchorX, anchorY) {
                const baseScale = 1;
                const zoomMax = 10;
                const zoomMin = 1;
                if (scaleToSet > zoomMax * baseScale) {
                    scaleToSet = zoomMax * baseScale;
                } else if (scaleToSet < zoomMin * baseScale) {
                    scaleToSet = zoomMin * baseScale;
                }

                if (typeof anchorX != 'undefined' && typeof anchorY != 'undefined') {
                    const zoomStep = scaleToSet / this.scale;
                    this.transX -= (zoomStep - 1) / scaleToSet * anchorX;
                    this.transY -= (zoomStep - 1) / scaleToSet * anchorY;
                }

                this.scale = scaleToSet;
                this.applyTransform();
            },

            applyTransform: function () {
                let canvas = this.$store.getters.canvasGoldGeneration;
                let group = new fabric.Group(canvas.getObjects());
                group.scaleX = this.scale / canvas.scale;
                group.scaleY = this.scale / canvas.scale;
                group.left = group.width / 2 + this.transX * this.scale;
                group.top = group.height / 2 + this.transY * this.scale;
                group.destroy();

                canvas.scale = this.scale;
                canvas.renderAll();
            }
        }
    }

</script>