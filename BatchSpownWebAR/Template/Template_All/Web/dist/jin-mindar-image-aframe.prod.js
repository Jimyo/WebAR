(() => {
    const {
        Controller: t,
        UI: e
    } = window.MINDAR.IMAGE;
    AFRAME.registerSystem("mindar-image-system", {
        container: null,
        video: null,
        processingImage: !1,
        init: function() {
            this.anchorEntities = []
        },
        tick: function() {},
        setup: function({
            imageTargetSrc: t,
            maxTrack: i,
            showStats: a,
            uiLoading: s,
            uiScanning: n,
            uiError: o,
            captureRegion: r
        }) {
            this.imageTargetSrc = t, this.maxTrack = i, this.showStats = a, this.captureRegion = r, this.ui = new e({
                uiLoading: s,
                uiScanning: n,
                uiError: o
            })
        },
        registerAnchor: function(t, e) {
            this.anchorEntities.push({
                el: t,
                targetIndex: e
            })
        },
        start: function() {
            this.container = this.el.sceneEl.parentNode, this.showStats && (this.mainStats = new Stats, this.mainStats.showPanel(0), this.mainStats.domElement.style.cssText = "position:absolute;top:0px;left:0px;z-index:999", this.container.appendChild(this.mainStats.domElement)), this.ui.showLoading(), this._startVideo()
        },
        switchTarget: function(t) {
            this.controller.interestedTargetIndex = t
        },
        stop: function() {
            this.pause(), this.video.srcObject.getTracks().forEach((function(t) {
                t.stop()
            })), this.video.remove()
        },
        pause: function(t = !1) {
            t || this.video.pause(), this.controller.stopProcessVideo()
        },
        unpause: function() {
            this.video.play(), this.controller.processVideo(this.video)
        },
        _startVideo: function() {
            if (this.video = document.createElement("video"), this.video.setAttribute("autoplay", ""), this.video.setAttribute("muted", ""), this.video.setAttribute("playsinline", ""), this.video.style.position = "absolute", this.video.style.top = "0px", this.video.style.left = "0px", this.video.style.zIndex = "-2", this.container.appendChild(this.video), !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return this.el.emit("arError", {
                error: "VIDEO_FAIL"
            }), void this.ui.showCompatibility();
            navigator.mediaDevices.getUserMedia({
                audio: !1,
                video: {
                    facingMode: "environment"
                }
            }).then((t => {
                this.video.addEventListener("loadedmetadata", (() => {
                    this.video.setAttribute("width", this.video.videoWidth), this.video.setAttribute("height", this.video.videoHeight), this._startAR()
                })), this.video.srcObject = t
            })).catch((t => {
                console.log("getUserMedia error", t), this.el.emit("arError", {
                    error: "VIDEO_FAIL"
                })
            }))
        },
        _startAR: async function() {
            const e = this.video,
                i = this.container;
            let a, s;
            const n = e.videoWidth / e.videoHeight;
            n > i.clientWidth / i.clientHeight ? (s = i.clientHeight, a = s * n) : (a = i.clientWidth, s = a / n), this.controller = new t({
                inputWidth: e.videoWidth,
                inputHeight: e.videoHeight,
                maxTrack: this.maxTrack,
                onUpdate: t => {
                    if ("processDone" === t.type) 
                    {
                        this.mainStats && this.mainStats.update();
                    }
                    else if ("updateMatrix" === t.type) {
                        const {
                            targetIndex: e,
                            worldMatrix: i
                        } = t;
                       
                        this.anchorEntities[e].el.updateWorldMatrix(i);
                        this.anchorEntities[e].el.updatePaint(this.controller.capturedRegion);
                        this.ui.hideScanning();

                        for (let t = 0; t < this.anchorEntities.length; t++)
                        {
                            if(this.anchorEntities[t].el.el.object3D.visible === true)
                            {
                               return;
                            }
                            // this.anchorEntities[t].targetIndex === e && (i && this.anchorEntities[t].el.updatePaint(this.controller.capturedRegion), this.anchorEntities[t].el.updateWorldMatrix(i), i && this.ui.hideScanning())
                        }//JIN
                        this.ui.showScanning();
                    }
                    
                }
            }), this.controller.shouldCaptureRegion = this.captureRegion;
            const o = this.controller.getProjectionMatrix(),
                r = 2 * Math.atan(1 / o[5] / s * i.clientHeight) * 180 / Math.PI,
                h = o[14] / (o[10] - 1),
                d = o[14] / (o[10] + 1),
                l = (o[5], o[0], i.clientWidth / i.clientHeight),
                c = i.getElementsByTagName("a-camera")[0].getObject3D("camera");
            c.fov = r, c.aspect = l, c.near = h, c.far = d, c.updateProjectionMatrix(), this.video.style.top = -(s - i.clientHeight) / 2 + "px", this.video.style.left = -(a - i.clientWidth) / 2 + "px", this.video.style.width = a + "px", this.video.style.height = s + "px";
            const {
                dimensions: g
            } = await this.controller.addImageTargets(this.imageTargetSrc);
            for (let t = 0; t < this.anchorEntities.length; t++) {
                const {
                    el: e,
                    targetIndex: i
                } = this.anchorEntities[t];
                i < g.length && e.setupMarker(g[i])
            }
            await this.controller.dummyRun(this.video), this.el.emit("arReady"), this.ui.hideLoading(), this.ui.showScanning(), this.controller.processVideo(this.video)
        }
    }), AFRAME.registerComponent("mindar-image", {
        dependencies: ["mindar-image-system"],
        schema: {
            imageTargetSrc: {
                type: "string"
            },
            maxTrack: {
                type: "int",
                default: 1
            },
            showStats: {
                type: "boolean",
                default: !1
            },
            captureRegion: {
                type: "boolean",
                default: !1
            },
            autoStart: {
                type: "boolean",
                default: !0
            },
            uiLoading: {
                type: "string",
                default: "yes"
            },
            uiScanning: {
                type: "string",
                default: "yes"
            },
            uiError: {
                type: "string",
                default: "yes"
            }
        },
        init: function() {
            const t = this.el.sceneEl.systems["mindar-image-system"];
            t.setup({
                imageTargetSrc: this.data.imageTargetSrc,
                maxTrack: this.data.maxTrack,
                captureRegion: this.data.captureRegion,
                showStats: this.data.showStats,
                uiLoading: this.data.uiLoading,
                uiScanning: this.data.uiScanning,
                uiError: this.data.uiError
            }), this.data.autoStart && this.el.sceneEl.addEventListener("renderstart", (() => {
                t.start()
            }))
        }
    }), AFRAME.registerComponent("mindar-image-target", {
        dependencies: ["mindar-image-system"],
        schema: {
            targetIndex: {
                type: "number"
            }
        },
        postMatrix: null,
        init: function() {
            this.el.sceneEl.systems["mindar-image-system"].registerAnchor(this, this.data.targetIndex);
            const t = this.el.object3D;
            this.paintMaterial = null;
            const e = this.el.querySelector("a-gltf-model");
            e && e.getAttribute("mindar-image-paint") && e.addEventListener("model-loaded", (() => {
                e.getObject3D("mesh").traverse((t => {
                    t.isMesh && t.material && t.material.name === e.getAttribute("mindar-image-paint") && (this.paintMaterial = t.material)
                }))
            })), t.visible = !1, t.matrixAutoUpdate = !1
        },
        setupMarker([t, e]) {
            const i = new AFRAME.THREE.Vector3,
                a = new AFRAME.THREE.Quaternion,
                s = new AFRAME.THREE.Vector3;
            i.x = t / 2, i.y = t / 2 + (e - t) / 2, s.x = t, s.y = t, s.z = t, this.postMatrix = new AFRAME.THREE.Matrix4, this.postMatrix.compose(i, a, s)
        },
        updateWorldMatrix(t) {
            if (this.el.object3D.visible || null === t ? this.el.object3D.visible && null === t && this.el.emit("targetLost") : this.el.emit("targetFound"), this.el.object3D.visible = null !== t, null !== t) {
                var e = new AFRAME.THREE.Matrix4;
                e.elements = t, e.multiply(this.postMatrix), this.el.object3D.matrix = e
            }
        },
        updatePaint(t) {
            
            if (!this.paintMaterial || this.el.object3D.visible) return;
            const e = t.length,
                i = t[0].length,
                a = new Uint8ClampedArray(e * i * 4);
            for (let s = 0; s < e; s++)
                for (let e = 0; e < i; e++) {
                    const n = s * i + e;
                    a[4 * n + 0] = t[s][e][0], a[4 * n + 1] = t[s][e][1], a[4 * n + 2] = t[s][e][2], a[4 * n + 3] = 255
                }
            const s = new ImageData(a, i, e),
                n = document.createElement("canvas");
            n.height = e, n.width = i;
            const o = n.getContext("2d");
            o.clearRect(0, 0, n.width, n.height), o.putImageData(s, 0, 0);
            const r = n.toDataURL("image/png");
            (new THREE.TextureLoader).load(r, (t => {
                this.paintMaterial.map.dispose(), this.paintMaterial.map = t, this.paintMaterial.needsUpdate = !0
            }))
        }
    })
})();