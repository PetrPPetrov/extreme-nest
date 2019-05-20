<template>

    <div>
        <label :for="event">{{ title }}</label>
        <canvas :id="event" @mousemove="onMouseMoveInCanvas" @mousedown="onMouseDownInCanvas"
            @mouseup="omMouseUpInCanvas" @wheel="onMouseWheelInCanvas"></canvas>
        <hr>
        <p class="log-message">{{ this.logMessage }}</p>
    </div>

</template>

<script>

    const fabric = require('fabric').fabric;
    import drawCanvas from '../../../../common/canvasPainter'

    export default {
        props: ['title', 'event', 'log-message'],
        data() {
            return {
                canvas: null,
                transX: 0,
                transY: 0,
                scale: 1,
                mouseDown: false,
                oldPageX : 0,
                oldPageY : 0
            }
        },
        mounted() {
            this.canvas = new fabric.StaticCanvas(this.event, {
                scale: 1,
                width: 445,
                height: 240,
                selection: false
            });
            this.$root.$on('clear-canvases', () => {
                this.canvas.clear();
            });
            this.$root.$on(this.event, ([request, response, blockSize]) => {
                this.canvas.clear();
                drawCanvas(this.canvas, request, response, blockSize);
            });
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
                const canvas = document.getElementById(this.event);
                const offset = canvas.getBoundingClientRect();
                const centerX = event.pageX - offset.left;
                const centerY = event.pageY - offset.top;
                const zoomStep = event.deltaY * 0.001;
                this.setScale(this.scale - zoomStep, centerX, centerY);
            },

            setScale(scaleToSet, anchorX, anchorY) {
                const baseScale = 0.1;
                const zoomMax = 100;
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
                let group = new fabric.Group(this.canvas.getObjects());
                group.scaleX = this.scale / this.canvas.scale;
                group.scaleY = this.scale / this.canvas.scale;
                group.left = group.width / 15 + this.transX * this.scale;
                group.top = group.height / 15 + this.transY * this.scale;
                group.destroy();
                this.canvas.scale = this.scale;
                this.canvas.renderAll();
            }
        }
    }

</script>