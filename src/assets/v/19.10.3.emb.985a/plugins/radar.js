/*! */
W.define("radarCalendar", ["store", "radar", "utils"], function(z, s, F) {
        var r, e = 5 * F.tsMinute,
            t = null,
            E = 3e5;

        function a(e) {
            var t = e.data;
            r !== t.update && (i(t), r = t.update)
        }

        function i(e) {
            s.minifest = e;
            var t = z.get("radarTimestamp"),
                r = 0;
            s.calendar && (r = s.calendar.end - t);
            var a = s.calendar = function(e) {
                    var t = e.zoom;
                    void 0 === t && (t = 6);
                    var r = e.update,
                        a = e.tiles;
                    void 0 === a && (a = []);
                    var i = parseFloat(z.get("radarRange")),
                        n = r,
                        s = new Date(r).getTime(),
                        o = Math.floor(s / E) * E,
                        d = o,
                        l = d + Math.max(-48, i) * F.tsHour,
                        u = d,
                        h = -E,
                        c = [],
                        m = d - l,
                        f = [],
                        p = d,
                        g = 0;
                    for (; l < p;) p = d + h * g++, f.unshift(p);
                    if (i < -2) {
                        var v, x = [];
                        i <= -24 ? v = B : i <= -12 ? v = D : i <= -6 && (v = L), f.reduce(function(e, t, r) {
                            var a = v(t);
                            return a !== e && x.push(r), a
                        }), f = x.map(function(e) {
                            return f[e]
                        })
                    }
                    var b, T, w = f.map(function(e, t) {
                        return M(e, c[t])
                    });
                    if (a.length)
                        for (b = 1 << t, T = new Array(b * b), g = 0; g < a.length; g++) {
                            var A = a[g],
                                y = A[0],
                                C = A[1],
                                R = A[2],
                                S = A[3],
                                P = y + C * b;
                            T[P] = [new Date(R).getTime(), new Date(S).getTime()]
                        }
                    return {
                        timestamps: f,
                        paths: w,
                        calendarHours: i,
                        updateTimeTxt: n,
                        updateTs: s,
                        refTimeTs: o,
                        refTimeArray: T,
                        zoom: t,
                        tilesEdgeSize: b,
                        tsWidth: m,
                        start: l,
                        end: d,
                        endOfCal: u
                    }
                }(e),
                i = a.start,
                n = a.end;
            r < 2 * F.tsMinute && (t = n + 1), (n < t || t < i) && z.set("radarTimestamp", F.bound(t, i, n)), z.set("radarCalendar", s.calendar)
        }

        function n(e) {
            window.wError("radarCalendar", "Unable to create cal from minifest", e)
        }

        function o() {
            s.loadMinifest(!0).then(a).catch(n)
        }
        s.minifest = null, s.on("open", function() {
            s.loadMinifest().then(a).catch(n), t || (t = setInterval(o, e))
        }), s.on("close", function() {
            clearTimeout(t), t = null
        }), z.on("radarRange", function() {
            return i(s.minifest)
        });
        var B = function(e) {
                return new Date(e).getUTCHours()
            },
            D = function(e) {
                var t = new Date(e);
                return 2 * t.getUTCHours() + (30 <= t.getUTCMinutes() ? 1 : 0)
            },
            L = function(e) {
                var t = new Date(e),
                    r = t.getUTCMinutes();
                return 4 * t.getUTCHours() + (45 <= r ? 3 : 30 <= r ? 2 : 15 <= r ? 1 : 0)
            },
            M = function(e) {
                var t = new Date(e).toISOString().replace(/^(\d+)-(\d+)-(\d+)T(\d+):(\d+).*$/, "$1/$2/$3/$4$5");
                return s.server + "/" + s.directory + "/" + t + "/<z>/<x>/<y>/reflectivity.png?multichannel=true"
            }
    }),
    /*! */
    W.define("shadersRadar", [], function() {
        return {
            shBlitzCircleVS: "\nattribute vec4 aPos; // x,y ..dir, z..0 for inner, 1 outer, w -1 inner, 1 outer\nuniform vec4 uVPars0;\nuniform vec4 uVPars1;\nuniform vec4 uVPars2;\nvarying vec4 vTc0;\n\nvoid main() {\n\tgl_Position.xy = aPos.xy * uVPars0.xy + aPos.z * aPos.xy * uVPars0.zw + uVPars1.xy;\n\tgl_Position.zw = vec2( 1.0, 1.0 );\n\tvTc0.rgb = uVPars2.rgb * uVPars2.a;\n\tvTc0.a = aPos.w;\n}\n",
            shBlitzCircleFS: "\nprecision mediump float;\nvarying vec4 vTc0;\n\nvoid main() {\n \tgl_FragColor.rgb = vTc0.rgb * ( 1.0 - vTc0.a * vTc0.a );\n}\n",
            shBlitzArrayVS: "\nattribute vec3 aPos; // x, y ..world mercator, time\nattribute vec4 aTc; // dpos, tc\nuniform vec4 uVPars0;\nuniform vec4 uVPars1;\nuniform vec4 uVPars2;\nuniform vec4 uVPars3;\nuniform vec4 uVPars4;\nuniform vec4 uVPars5;\nvarying vec4 vTc0;\nvarying vec4 vTc1;\n\nvoid main() {\n\tgl_Position.xy = aPos.xy * uVPars0.xy + uVPars1.zw + aTc.xy * uVPars1.xy;\n\tgl_Position.zw = vec2( 1.0, 1.0 );\n\tvTc0.xy = aTc.zw * uVPars2.xy + uVPars2.zw;\n\tvTc0.zw = gl_Position.xy * 0.5 + 0.5;\n\tfloat f = clamp( fract( aPos.z * uVPars3.x + uVPars3.y ) * uVPars3.z + uVPars3.w, 0.0, 1.0 );\n\tf = pow(f, uVPars0.z);\n\t//f *= f;\n\tvTc1 = mix( uVPars4, uVPars5, f );\n}\n",
            shBlitzArrayFS: "\nprecision mediump float;\nuniform sampler2D sTex0;\nvarying vec4 vTc0;\nvarying vec4 vTc1;\n\nvoid main() {\n \tvec4 tex0 = texture2D( sTex0, vTc0.xy );\n \tgl_FragColor = vTc1 * tex0.rrrg;\n}\n",
            shBlitzTrailsVS: "\nattribute vec3 aPos; // x, y ..world mercator, time\nattribute vec4 aTc; // dpos, tc\nuniform vec4 uVPars0;\nuniform vec4 uVPars1;\nuniform vec4 uVPars2;\nuniform vec4 uVPars3;\nuniform vec4 uVPars4;\nvarying vec2 vTc0;\nvarying vec4 vTc1;\n\nvoid main() {\n\tgl_Position.xy = aPos.xy * uVPars0.xy + uVPars1.zw + aTc.xy * uVPars1.xy;\n\tgl_Position.zw = vec2( 1.0, 1.0 );\n\tvTc0 = aTc.zw * uVPars2.xy + uVPars2.zw;\n\tvTc1 = mix( uVPars3, uVPars4, aPos.z );\n}\n",
            shBlitzTrailsFS: "\nprecision mediump float;\nvarying vec2 vTc0;\nvarying vec4 vTc1;\n\nvoid main() {\n\tfloat f = max( 0.0, 1.0 - 2.8 * dot(vTc0, vTc0) );\n\tgl_FragColor = vTc1 * f;\n}\n",
            shBlitzSingleVS: "\nattribute vec4 aPos; // x, y ..pos, zw .. texture coords\nuniform vec4 uVPars0;\nuniform vec4 uVPars1;\nvarying vec2 vTc0;\n\nvoid main() {\n\tgl_Position.xy = aPos.xy * uVPars0.xy + uVPars0.zw;\n\tgl_Position.zw = vec2( 1.0, 1.0 );\n\tvTc0 = aPos.zw * uVPars1.xy + uVPars1.zw;\n}\n",
            shBlitzSingleFS: "\nprecision mediump float;\nuniform vec4 uPars0;\nuniform sampler2D sTex0;\nvarying vec2 vTc0;\n\nvoid main() {\n\tgl_FragColor = vec4( uPars0 * texture2D( sTex0, vTc0 ).g );\n}\n",
            shRectVS: "\nattribute vec2 aPos;\nuniform vec4 uVPars0;\nuniform vec4 uVPars1;\nuniform vec4 uVPars2;\nuniform vec4 uVPars3;\nvarying vec4 vTc0;\nvarying vec4 vTc1;\n\nvoid main(void) {\n\tvec2 tc0 = aPos.xy * 0.5 + 0.5;\n\tgl_Position = vec4( (tc0 * uVPars0.xy + uVPars0.zw) * 2.0 - 1.0, 0.0, 1.0 );\n\tvTc0.xy = tc0 * uVPars1.xy + uVPars1.zw;\n\tvTc0.zw = tc0 * uVPars2.xy + uVPars2.zw;\n\tvTc1.xy = tc0 * uVPars3.xy + uVPars3.zw;\n\tvTc1.zw = tc0;\n}\n",
            shRadarCopyDataFS: "\nprecision mediump float;\nuniform sampler2D sTex0;\nvarying vec4 vTc0;\nvoid main(void) {\n\tgl_FragColor = texture2D( sTex0, vTc0.xy ).gggg;\n}\n",
            shRadarCopyMaskFS: "\nprecision mediump float;\nuniform sampler2D sTex0;\nvarying vec4 vTc0;\nvoid main(void) {\n\tgl_FragColor = texture2D( sTex0, vTc0.xy ).aaaa;\n}\n",
            shProcessMaskFS: "\nprecision mediump float;\nuniform sampler2D sTex0;\nvarying vec4 vTc0;\nvoid main(void) {\n\tvec4 t0 = texture2D( sTex0, vTc0.xy );\n\tfloat m = max( t0.g, t0.b );\n\tvec2 v = clamp( vec2( -90.0, -40.0 ) + m * 100.0, 0.0, 1.0 );\n\tv.g = 1.0 - v.g;\n\tgl_FragColor = v.rgrg;\n}\n",
            shRadarMulti2FS: "\nprecision mediump float;\nuniform vec4 uPars0; // xy ..texture res; zw ..texture res inv\nuniform vec4 uPars1;\nuniform vec4 uPars2;\nuniform vec4 uPars3;\nuniform vec4 uPars4;\nuniform vec4 uPars5;\n\nuniform sampler2D sRadar;\nuniform sampler2D sGradient;\nuniform sampler2D sMask; // static mask\nuniform sampler2D sPattern; // pattern texture for old data\nuniform sampler2D sCompoMask; // no data and old data masks\nuniform sampler2D sBlitz;\n\nvarying vec4 vTc0;\nvarying vec4 vTc1;\n\nfloat cubicHermite(float A, float B, float C, float D, float t) {\n\tfloat a = -A * 0.5 + (3.0*B) * 0.5 - (3.0*C) * 0.5 + D * 0.5;\n\tfloat b = A - (5.0*B) * 0.5 + 2.0 * C - D * 0.5;\n\tfloat c = -A * 0.5 + C * 0.5;\n\tfloat d = B;\n\treturn a*t*t*t + b*t*t + c*t + d;\n}\n\nvec4 cubicHermite4( vec4 A, vec4 B, vec4 C, vec4 D, float t ) {\n\tvec4 a = -A * 0.5 + (3.0*B) * 0.5 - (3.0*C) * 0.5 + D * 0.5;\n\tvec4 b = A - (5.0*B) * 0.5 + 2.0 * C - D * 0.5;\n\tvec4 c = -A * 0.5 + C * 0.5;\n\tvec4 d = B;\n\treturn a*t*t*t + b*t*t + c*t + d;\n}\n\nvoid main(void) {\n\tvec2 tc = vTc0.xy;\n\tvec4 c;\n\tfloat val;\n\n#ifdef CUBIC\n\tvec2 tcH = tc * uPars0.xy;\n\tvec2 fr = fract( tcH );\n\ttc -= fr * uPars0.zw;\n\tfloat ax = uPars2.x;\n\tfloat bx = uPars2.y;\n\tfloat cx = uPars2.z;\n\tfloat dx = uPars2.w;\n\tfloat ay = uPars3.x;\n\tfloat by = uPars3.y;\n\tfloat cy = uPars3.z;\n\tfloat dy = uPars3.w;\n\tvec4 c00 = texture2D( sRadar, tc + vec2( ax, ay ) );\n\tvec4 c01 = texture2D( sRadar, tc + vec2( bx, ay ) );\n\tvec4 c02 = texture2D( sRadar, tc + vec2( cx, ay ) );\n\tvec4 c03 = texture2D( sRadar, tc + vec2( dx, ay ) );\n\tvec4 c10 = texture2D( sRadar, tc + vec2( ax, by ) );\n\tvec4 c11 = texture2D( sRadar, tc + vec2( bx, by ) );\n\tvec4 c12 = texture2D( sRadar, tc + vec2( cx, by ) );\n\tvec4 c13 = texture2D( sRadar, tc + vec2( dx, by ) );\n\tvec4 c20 = texture2D( sRadar, tc + vec2( ax, cy ) );\n\tvec4 c21 = texture2D( sRadar, tc + vec2( bx, cy ) );\n\tvec4 c22 = texture2D( sRadar, tc + vec2( cx, cy ) );\n\tvec4 c23 = texture2D( sRadar, tc + vec2( dx, cy ) );\n\tvec4 c30 = texture2D( sRadar, tc + vec2( ax, dy ) );\n\tvec4 c31 = texture2D( sRadar, tc + vec2( bx, dy ) );\n\tvec4 c32 = texture2D( sRadar, tc + vec2( cx, dy ) );\n\tvec4 c33 = texture2D( sRadar, tc + vec2( dx, dy ) );\n\n\tvec4 c0 = cubicHermite4(c00, c01, c02, c03, fr.x);\n\tvec4 c1 = cubicHermite4(c10, c11, c12, c13, fr.x);\n\tvec4 c2 = cubicHermite4(c20, c21, c22, c23, fr.x);\n\tvec4 c3 = cubicHermite4(c30, c31, c32, c33, fr.x);\n\tc = cubicHermite4(c0, c1, c2, c3, fr.y);\n#else\n\tc = texture2D( sRadar, vTc0.xy );\n#endif\n\n#ifdef ANIM\n\n#ifdef ANIM_CUBIC\n\tval = cubicHermite( c.r, c.g, c.b, c.a, uPars1.z );\n#else\n\tval = mix( c.g, c.b, uPars1.z );\n#endif\n\n#else\n\tval = c.r;\n#endif\n\n\tvec4 finColor = texture2D( sGradient, vec2( val, 0.5 ) );\n\tvec4 mask = texture2D( sMask, vTc0.zw );\n\tvec4 blitz = texture2D( sBlitz, vTc0.zw );\n\tvec4 pattern = texture2D( sPattern, vTc1.xy );\n\tvec4 compoMask = texture2D( sCompoMask, vTc0.xy );\n\n\tfloat mixA = finColor.a * clamp( pattern.g + compoMask.g, 0.0, 1.0 );\n\tvec3 bg = mix(uPars4.rrr, blitz.rgb, pattern.b * uPars4.w) - mask.r - compoMask.r * pattern.r * mask.g;\n\tfinColor.rgb = mix( bg, finColor.rgb, mixA );\n\n\tfloat a = max( uPars4.g, finColor.a * uPars4.b );\n\tgl_FragColor = vec4(finColor.rgb * a, a);\n}\n",
            shMaskCircleVS: "\n\tattribute vec4 aPos;\n\tuniform vec4 uVPars0;\n\tuniform vec4 uVPars1;\n\tvoid main(void) {\n\t\tvec2 p = aPos.xy * uVPars0.xy + uVPars0.zw;\n\t\tp.y += aPos.z * uVPars1.x;\n\t\tgl_Position = vec4( p.xy, 0.0, 1.0 );\n\t}\n",
            shConstFS: "\n\t//precision lowp float;\n\tprecision mediump float;\n\tuniform vec4 uPars0;\n\tvoid main(void) {\n\t\tgl_FragColor = uPars0;\n\t}\n"
        }
    }),
    /*! */
    W.define("RadarRenderClass", ["rootScope", "utils", "GlObj", "store", "map", "radar", "radarMask", "radarRenderWebGL", "blitzRender"], function(a, n, e, r, t, i, s, o, d) {
        return L.CanvasLayer.extend({
            globalAlpha12: .7,
            blendAnimationTimeLimit: 96e4,
            _canvas: null,
            glo: new e,
            failed: !1,
            animationBlend: !1,
            tileEdgeSize: 256,
            loadedFrames: [],
            frames: [],
            compositeFrames: [],
            staticFrame: null,
            changesCounter: 1,
            animationCompositeRefCode: 0,
            staticCompositeRefCode: 0,
            referenceCode: -1,
            frameUpdateCounter: 0,
            maxFrames: 25,
            wasMoved: !1,
            onInit: function() {
                var t = this;
                n.include(this, o), r.on("blitzOn", function(e) {
                    d.switchOn(e), t.renderFrame()
                })
            },
            onCanvasFailed: function() {
                this.glo.release()
            },
            onRemoveCanvas: function() {
                this.glo.release(), this.resetAttribs()
            },
            onReset: function() {
                this.updateLatLonBounds(), this.redraw()
            },
            onRedraw: function() {
                this.renderFrame()
            },
            _moveEnd: function() {
                this.wasMoved = !0, this.updateLatLonBounds(), i.emit("moveEnd")
            },
            getFrameByTs: function(e) {
                var t, r;
                for (this.frameUpdateCounter++, this.removeOldFrames(), r = 0; r < this.frames.length; r++)
                    if ((t = this.frames[r]).ts === e) return t.updateCounter = this.frameUpdateCounter, t;
                return t = {
                    texture: this.getFreeDataTexture(),
                    ts: e,
                    updateCounter: this.frameUpdateCounter
                }, this.frames.push(t), this.frames.sort(function(e, t) {
                    return e.ts > t.ts ? 1 : t.ts > e.ts ? -1 : 0
                }), this.removeOldFrames(), t
            },
            removeOldFrames: function() {
                for (; this.frames.length > this.maxFrames;) {
                    var e = 0,
                        t = this.frames[0].updateCounter,
                        r = void 0;
                    for (r = 1; r < this.frames.length; r++) this.frames[r].updateCounter < t && (e = r, t = this.frames[r].updateCounter);
                    this.recycleDataTexture(this.frames[e].texture), this.frames.splice(e, 1)
                }
            },
            pushLoadedData: function(e) {
                this.loadedFrames.push(e)
            },
            checkLoadedFrames: function() {
                for (var e = !1; 0 < this.loadedFrames.length;) {
                    ++this.changesCounter;
                    var t = this.loadedFrames.shift();
                    t.framesCount && (this.maxFrames = t.framesCount);
                    var r = this.getFrameByTs(t.ts);
                    if (r) {
                        var a = r.texture,
                            i = void 0,
                            n = void 0,
                            s = void 0,
                            o = void 0,
                            d = void 0;
                        r.loadedFrame = t, this.resizeDataTextureIfNeeded(a, t.sizeX, t.sizeY);
                        var l = this.glo,
                            u = l.get(),
                            h = u.LUMINANCE_ALPHA;
                        if (t.textureTiles)
                            for (l.bindTexture2D(a), i = 0; i < t.textureTiles.length; i++) n = t.textureTiles[i], s = t.textureTilesPos[i], d = (o = n.width * n.height) << 1, n.data && o === this.tileEdgeSize * this.tileEdgeSize && n.data.length === d ? u.texSubImage2D(u.TEXTURE_2D, 0, s.x, s.y, n.width, n.height, h, u.UNSIGNED_BYTE, n.data) : u.texSubImage2D(u.TEXTURE_2D, 0, s.x, s.y, this.tileEdgeSize, this.tileEdgeSize, h, u.UNSIGNED_BYTE, this.emptyData)
                    }
                    e = !0
                }
                return e
            },
            resizeCanvas: function(e) {
                var t = this._canvas,
                    r = a.useRetina ? 1 : .7;
                this.resizeCanvasInner(t, e, r)
            },
            resizeCanvasInner: function(e, t, r) {
                var a = r,
                    i = Math.round(t.x * a),
                    n = Math.round(t.y * a);
                e.width === i && e.height === n || (e.width = i, e.height = n, this.ratioScale = a)
            },
            updateLatLonBounds: function() {
                var e = t.getBounds();
                this.mapBounds = [e._southWest.lng, e._southWest.lat, e._northEast.lng, e._northEast.lat], this.mapBoundsMercator = this.getUnitRectFromWgsRect(this.mapBounds), this.mapZoom = t.getZoom(), this.mapBoundsNew = !0
            },
            prepareFramesForTS: function(e) {
                var t, r, a, i = [],
                    n = null,
                    s = 0,
                    o = 0;
                if (1 < this.frames.length) {
                    for (r = this.frames[0].ts, s = this.frames.length - 1, t = 0; t < this.frames.length; t++) {
                        if (e <= (a = this.frames[t].ts)) {
                            r < e && 0 < a - r && (o = (e - r) / (a - r)), s = t - 1;
                            break
                        }
                        r = a
                    }
                    for (t = -1; t < 3; t++) i.push(this.getFrameByIndex(s + t));
                    n = .5 < o ? i[2] : i[1]
                } else 1 === this.frames.length && (i.push(this.frames[0]), n = this.frames[0]);
                if (this.compositeFrames.length === i.length) {
                    for (t = 0; t < i.length; t++)
                        if (this.compositeFrames[t] !== i[t]) {
                            ++this.changesCounter;
                            break
                        }
                } else ++this.changesCounter;
                this.animFraction = o, this.compositeFrames = i, this.staticFrame = n, this.isLastFrame = n === this.frames[this.frames.length - 1], this.frames.length && (this.lastFrameTS = this.frames[this.frames.length - 1].ts)
            },
            getFrameByIndex: function(e) {
                var t = this.frames[Math.max(0, Math.min(e, this.frames.length - 1))];
                return t || null
            },
            getFrameTexture: function(e) {
                var t = this.getFrame(e);
                return t && t.texture ? t.texture : null
            },
            isRefCodeValid: function(e) {
                return e.loadedFrame && e.loadedFrame.referenceCode === this.referenceCode
            },
            getUnitRectFromWgsRect: function(e) {
                var t = n.lonDegToXUnit(e[0]),
                    r = n.latDegToYUnit(e[1]),
                    a = n.lonDegToXUnit(e[2]),
                    i = n.latDegToYUnit(e[3]);
                return [t, r, a, i, a - t, r - i]
            },
            rendererNextTS: void 0,
            rendererNextAnimOn: void 0,
            renderFrame: function(e, t) {
                e && (this.rendererNextTS = e), void 0 !== t && (this.rendererNextAnimOn = t), this.renderFrameRequestedHigh = this.animationRunning ? 30 : 2, !this.infLoopRunning && this.isReady && (this.infLoopRunning = !0, this.renderFrameRequestedLow = 0, this.infLoopSkipFramesLimit = 120, this.infLoopSkipFramesLimitForLowFps = 3, this.infLoopSkipFramesMin = 1, this.infLoopSkipFrames = 0, this.infLoopSkipedFrames = 0, this.lastAnimTime = window.performance.now(), this.requestAnimLastID = requestAnimationFrame(this.infLoop.bind(this)))
            },
            requestLowFpsFrames: function(e) {
                this.renderFrameRequestedLow = Math.max(e, this.renderFrameRequestedLow)
            },
            infLoop: function() {
                var e = n.getAdjustedNow();
                this.isReady && (this.requestAnimLastID = requestAnimationFrame(this.infLoop.bind(this))), this.infLoopSkipedFrames < this.infLoopSkipFramesMin ? ++this.infLoopSkipedFrames : (0 < this.renderFrameRequestedHigh && (--this.renderFrameRequestedHigh, this.infLoopSkipFrames = 0), 0 < this.renderFrameRequestedLow && this.infLoopSkipedFrames >= this.infLoopSkipFramesLimitForLowFps && (--this.renderFrameRequestedLow, this.infLoopSkipFrames = 0), --this.infLoopSkipFrames < 0 ? (this.infLoopSkipFrames = this.infLoopSkipFramesLimit, this.frameTimeMs = e - this.lastAnimTime, this.lastAnimTime = e, this.renderFrameInner(), this.infLoopSkipedFrames = 0) : ++this.infLoopSkipedFrames)
            },
            renderFrameInner: function() {
                if (this.isReady) {
                    d.onUpdateFrame(this);
                    var e = this.rendererNextTS,
                        t = this.rendererNextAnimOn;
                    this.rendererNextTS = null, this.rendererNextAnimOn = void 0, null != t && (this.animationRunning = t);
                    var r = this.checkLoadedFrames();
                    e && (this.ts = e, r = !0), r && this.prepareFramesForTS(this.ts), 0 !== this.compositeFrames.length && (this.checkSizesAndReinit(), this.mapBoundsNew && (s.renderMask(this.mapBounds, this.mapBoundsMercator), ++this.changesCounter), d.isReady && d.renderPass0(this.frameTimeMs, this.mapBoundsMercator), this.frameRenderToCanvas(), d.isReady && d.renderPass1(), this.mapBoundsNew = !1, (this.resetNeeded || this.wasMoved) && (this.reset(), this.resetNeeded = !1, this.wasMoved = !1))
                }
            },
            onCreateCanvas: function(e) {
                this.resetAttribs();
                this.errorCount = 0;
                try {
                    this.glo.create(e, {
                        antialias: !1,
                        depth: !1,
                        stencil: !1,
                        alpha: !0,
                        premultipliedAlpha: !0,
                        preserveDrawingBuffer: !1
                    }, "RadarGlContext") ? this.initParamsAndShaders() : ++this.errorCount
                } catch (e) {
                    window.wError("radar", "webGl failed", e), ++this.errorCount
                }
                return this.isReady = this.errorCount < 1, e.classList.add("radar-layer"), this.isReady
            }
        })
    }),
    /*! */
    W.define("audioContext", ["http", "utils", "store", "rootScope"], function(e, t, r, a) {
        var i, n, s = window.AudioContext || window.webkitAudioContext,
            o = r.get("blitzSoundOn");
        r.on("blitzSoundOn", function(e) {
            (o = e) && l()
        });
        var d = function(e) {
                return n = e
            },
            l = function() {
                i || (i = new s, e.get("https://www.windy.com/img/sounds/blitz_mono.wav", {
                    cache: !1,
                    binary: !0
                }).then(function(e) {
                    var t = e.data;
                    i.decodeAudioData(t, d, window.wError.bind("blitzSound"))
                })), o && i.resume(), i.listener.setPosition(0, 0, 0)
            };
        try {
            s && (l(), "running" === i.state && "ios" !== a.platform || r.set("blitzSoundOn", !1))
        } catch (e) {
            window.wError("blitzSound", e)
        }
        return {
            play: i ? function(e, t) {
                if (i && n && "running" === i.state) {
                    var r = i.createBufferSource(),
                        a = i.createPanner();
                    r.buffer = n, a.connect(i.destination), r.connect(a), a.setPosition(e, 0, t), r.start(0)
                }
            } : t.emptyFun
        }
    }),
    /*! */
    W.define("blitzData", ["utils", "radar", "BlitzFrame", "store"], function(d, l, n, e) {
        var s = l.blitzFrameInterval,
            o = [],
            u = {},
            t = 0,
            h = [],
            c = 0,
            m = 0,
            r = function() {
                c && t && function(e, t) {
                    var r, a, i = [];
                    r = f(e);
                    for (; r + s < t;) r in u && "db" === u[r].source || i.push(p(r, null)), r += s;
                    r = f(t), a = r in u ? u[r] : null, r < c && (!a || "ws" === a.source || a.tsEnd < c) && i.push(p(r, t));
                    Promise.all(i).then(function(e) {
                        e.filter(function(e) {
                            var t = e.status;
                            return "loaded" === t
                        }).forEach(v), x(), setTimeout(g, 1e3), l.emit("blitzLoaded")
                    })
                }(t, Math.max(c, m - l.blitzStableDeltaTime))
            };
        e.on("radarCalendar", function(e) {
            t !== e.start && (t = e.start - 5 * d.tsMinute, r())
        }), l.on("sockedConnected", function(e) {
            var t = e.stable;
            c = t, r()
        });
        var a = function() {
            m = c = 0, h = []
        };
        l.on("close", a), e.on("visibility", function(e) {
            e || a()
        });
        var f = function(e) {
                return Math.floor(e / s) * s
            },
            p = function(e, t) {
                return new n(e, t).load()
            };

        function g() {
            for (var e = d.getAdjustedNow() - 12.33 * d.tsHour; o.length && o[0].ts < e;) delete u[o[0].ts], o.shift()
        }

        function v(e) {
            var t, r = e.ts,
                a = e.source,
                i = u[r];
            if (i) {
                if ("db" === i.source) return;
                "db" === a ? function(e, t) {
                    var r = o.indexOf(e); - 1 < r && (o.splice(r, 1, t), u[e.ts] = t)
                }(i, e) : ((t = i.data).push.apply(t, e.data), i.source !== a && (i.source = "merged"))
            } else o.push(e), u[r] = e
        }
        var x = function() {
            return o.sort(function(e, t) {
                return e.ts - t.ts
            })
        };

        function b(e, t, r) {
            var a = f(r),
                i = u[a] || function(e) {
                    var t = new n(e);
                    return t.source = "ws", o.push(t), u[e] = t
                }(a);
            "db" != i.source && i.addFromSocket(e, t, r)
        }
        return {
            getBlitzFrames: function(r) {
                return r -= s, o.filter(function(e) {
                    var t = e.ts;
                    return r <= t
                })
            },
            getRecents: function() {
                return h
            },
            getCalendarStart: function() {
                return t
            },
            updateRecents: function(e) {
                for (var t = h.length, r = e - l.blitzRecentsDuration, a = -1, i = 0; i < t; i++) {
                    var n = h[i],
                        s = n[2],
                        o = e - s;
                    !n[5] && (.1 < n[3] || o > l.blitzWriteRecentsToFrameMaxDelay) && (++n[5], b(n[0], n[1], s)), a < 0 && r < s && (a = i)
                }
                0 < a && h.splice(0, a)
            },
            reset: function() {
                return o.forEach(function(e) {
                    return e.mesh = null
                })
            },
            onSocketMessage: function(e) {
                var t, r = JSON.parse(e.data),
                    a = r.length - 2,
                    i = r[0];
                d.getAdjustedNow(i), m = i;
                for (var n = 1; n < a; n += 3) {
                    var s = i - r[n];
                    if (t || (t = s), c <= s) {
                        var o = Math.min(t - s, 0);
                        h.push([1 / 262144 * r[n + 1], 1 / 262144 * r[n + 2], s, o, 0, 0])
                    }
                }
            }
        }
    }),
    /*! */
    W.define("blitzRender", ["utils", "blitzData", "blitzSound", "shadersRadar", "colors", "radar"], function(A, R, S, d, n, P) {
        return {
            texture0_d64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAMAAADlCI9NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMBQTFRFPT09ysrKdXV1CQkJUlJSZWVlYGBg9PT0JCQkcXFxnZ2dFRUVTk5OODg4fX19QUFBoaGhSkpKDg4OIiIiXV1dNjY2LS0thoaG4eHhgoKCeXl5lpaWVVVVbW1tHR0dKCgoRkZGampqs7OzGhoaAFgAMTExBQUF3NzcW1tbjY2NiYmJExMTMzMzWFhYv7+/aGhoREREAAAAADMAkJCQurq6t7e3rq6u////AwMDAHAAHx8fAGYAKysrAIAAAEAA6+vrtCitPQAABSFJREFUeNrEmel2qjAQgMGqFVdUwCrXCkoXa7Vqe4u4tO//VncmCYuyhEXPzQ+05/Q4H9/MhJAIm5uNXWDE/5dw4/DPzxwEBPjZ3iD488WIgwCAH/HEJ9ha2/Th3aB3bPgQkQCWbVvcX7WmVqbwd6ERgwAA25P4w/1dxz5s08nH6H78Xs8nuKOZCNfAlh8fANIooLfvhsbRaNBP38IFQdoucOwUCjB+IHivt1jMZouF+xdjOCfIAMBTQO274RcwGo3G4yNc8LuHcCEBAax0ABwFZ7dPgs9g9Pt4JRDRErANV1Y6gEQFXvbJzWPwRxyTCflACKLBq4RgG/6eflIBJCpg8endk+j7fr9f07QafOwJA7XACAIAum3r6QASFOzc+Ch/xqLXJhNVnUxqjGFGE8HqIJCC06+VDiBeARSAq5+Gh9iTyfGoCYJ2POL3GkXw0uCWASnCVcoUxCpgBQjxsfQe9xhe055gdDp41TRE2GMaGq4DRkDaMGURxisIxqe3D9HfVbUldLtCS1XfgYFKCBJknQfiFdAEMP+Q+8lRg/CtliB0yuWOILRagKAdgaDvZ4EpyAgQrcAXwOJjeKHT6ayN5dJYwxcBETyCoAIXwEoJEKWAdgCNj/61JwgvrA2j220qSrPbNYw1aFAhDTQLhIB1AgOwoiYjy/HHyY5XsKPxEYDGR/eG0WyWy+VqFS7NpmFgJigBAei5ChjAwXbCAAc7YoQVnCUA/asYvwvh/yxfK5XX5R9A6CKBSrJwngSBCYgCsKZRBCEFrgCcAIh/0A/hIbqiVE2zqijI0OyukQAc4HTgKxDcez05oVvbplOw8yugD/333qLxX5VqpVKRJLhUlVdK0HqHbuz7VeACgAAcVi4FOwbQIBMQCuiQ+BDeNMel0tg0AYEQdKiCPVHAJiMKQH54lU8BKwEqABqwBfkn8T/GUqnUbpckyfwgBFAHLWxGqoAVAasBrPJDrirYnWUAK3BtNDG+KZVG7fZg0B6VpLGJBE3oRtUDYAoEr8+jGjGFAh+AZIAKWCpw/xB/OJf1wRAkjD8qypIqIDmIAjhEr8YjFUQBkB7UoAKogLE0Gg7msvitvyEBUwBVoJFODAFY0csiX8EpMCtFGGCTwBMFUDAB7cG8vnr5kvX5gBAoFODJnQrOAeLmYk+Bk7gSYACkBEgGTBDwpk8ffsVvWX+jAJADUgQ1vwoDAHGvZIfUAKQEcA4sYwmCgE9ZvL9/EL/qn6AAc4BFIJAiSA/gKXDi12IYH1sACwBvn3bA8LP+98G2AeFv/XM4ImWAEkgZkCogOeACuAryAdzf23ZBAFdBnhTUv0RAEOVCKXAVZC7CUvtNl7/F34cpNOIodxF6CpzEF6KYNtTlr5dVPV0b8hRwAEITERJAI36L8nwAAsa8iShpOiAKuAChqRgJBro8H8LTgD8VJ22EEAV8gMuH0RifRvAwao+8mTjhYbRJWJoRBc4mqQ8jH8emJOHjmDyKOI/jQCQnpgqcDUdBkQVJcBnqxDSCs0lUUGxJxlW9PfABCi1KA+twJ/Mu3TWW5dx2S9ynvMaLif8icgotOfibc1d4Nbtcfh02GQkKv5yev4lNrWwAV3k9zy/gShsU+QUU36IJvIyf8ggoukmVaUPyBtt04S3ZPKckBTYqs25KX32rNrQtn/egKO9mdY6DiStv118czRQ5LSt+YGHlFnCtI5si8fMeWl350DLzsd2NENIfXN7m3DjD0e3/P7z+r8f3/wQYAGKo/YucRkFbAAAAAElFTkSuQmCC",
            enabled: !1,
            enabledSwitched: !0,
            lastAnimTimeMsRenderRecents: 0,
            dts: 0,
            counterTrails: 0,
            trailsRenderNeeded: !0,
            rhd: 1 / 3e5,
            lastVisibleTS: 0,
            switchOn: function(e) {
                this.enabled = e, this.enabledSwitched = !0
            },
            onUpdateFrame: function(e) {
                this.enabledSwitched && (this.enabledSwitched = !1, this.enabled ? this.init(e) : this.resetAttribs()), this.enabled && (R.updateRecents(e.lastAnimTime), this.lastVisibleTS = e.lastAnimTime)
            },
            resetAttribs: function() {
                this.isReady = !1, this.lastAnimTimeMsRenderRecents = 0, this.counterTrails = 0, this.trailsRenderNeeded = !0, this.dts = 0, this.enabledSwitched = !0, R.reset()
            },
            init: function(e) {
                var t = this;
                this.isReady = !0, this.radarRender = e, this.glo = e.glo, this.timeParsAnim = this.computeFrameTimeParams(9e5), this.timeParsStatic = this.computeFrameTimeParams(3e5), this.initParamsAndShaders(), P.on("blitzLoaded", function() {
                    t.counterTrails = 0, t.radarRender && t.radarRender.renderFrame()
                })
            },
            initParamsAndShaders: function() {
                var e = this.glo,
                    t = d;
                this.errorCount = 0, this.texture0 = null, this.createTextureFromBase64(e, this, "texture0", this.texture0_d64), this.shBlitzArray = this.compileShader(t.shBlitzArrayVS, t.shBlitzArrayFS, [], "blitz"), this.shBlitzTrails = this.compileShader(t.shBlitzTrailsVS, t.shBlitzTrailsFS, [], "trails"), this.shBlitzSingle = this.compileShader(t.shBlitzSingleVS, t.shBlitzSingleFS, [], "single"), this.shBlitzCircle = this.compileShader(t.shBlitzCircleVS, t.shBlitzCircleFS, [], "circle"), this.vertexBufferRect = e.createBuffer(new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, 1, 1, 1, 0, -1, 1, 0, 0])), this.vertexBufferRectCount = 4;
                this.vertexBufferCircleSize = 122;
                var r, a, i = new Float32Array(4 * this.vertexBufferCircleSize),
                    n = 0,
                    s = 2 * Math.PI / 120,
                    o = 0;
                for (r = 0; r < this.vertexBufferCircleSize; r++) a = 0 == (1 & r), i[o++] = Math.cos(n), i[o++] = Math.sin(n), i[o++] = a ? 0 : 1, i[o++] = a ? -1 : 1, n += s;
                this.vertexBufferCircle = this.glo.createBuffer(i)
            },
            compileShader: function(e, t, r, a) {
                var i;
                try {
                    i = this.glo.createProgramObj(e, t, r, a)
                } catch (e) {
                    window.wError("blitz", "Compile shader err:", e.full), ++this.errorCount, i = null
                }
                return i
            },
            createTextureFromBase64: function(n, s, o, e) {
                var d = new Image;
                d.onload = function() {
                    var e = n.get(),
                        t = document.createElement("canvas"),
                        r = t.getContext("2d"),
                        a = d.width,
                        i = d.height;
                    t.width = a, t.height = i, r.drawImage(d, 0, 0), s[o] = n.createTexture2D(e.NEAREST, e.NEAREST, e.REPEAT, r.getImageData(0, 0, a, i), a, i)
                }, d.src = e
            },
            prepareBlitzMesh: function(e) {
                var t = e.mesh || {
                        buffer: null,
                        tris: 0
                    },
                    r = e.data.length / 3;
                if (t.tris < r) {
                    t.vertexStride = 16, t.vertexCount = 3 * r, t.tris = r;
                    var a, i, n, s, o, d, l = this.glo,
                        u = new ArrayBuffer(t.vertexStride * t.vertexCount),
                        h = new Float32Array(u),
                        c = new Uint8Array(u),
                        m = 0,
                        f = e.data,
                        p = [64, 80, 0, 112, 192, 80, 128, 112, 128, 192, 64, 0],
                        g = 0,
                        v = 12;
                    for (i = 0; i < r; i++)
                        for (s = f[m++], o = f[m++], d = f[m++], a = 0; a < 3; a++) {
                            for (h[g++] = s, h[g++] = o, h[g] = d, g += 2, n = 0; n < 4; n++) c[v + n] = p[4 * a + n];
                            v += t.vertexStride
                        }
                    t.buffer ? l.setBufferData(t.buffer, u) : t.buffer = l.createBuffer(u)
                }
                e.mesh = t
            },
            prepareMercatorViewportMads: function(e) {
                var t = [],
                    r = 2 * (1 / e[4]),
                    a = -2 * (1 / e[5]),
                    i = -1 - r * e[0],
                    n = 1 - a * e[3];
                return t.push([r, a, i, n]), e[0] < 0 && t.push([r, a, i - r, n]), 1 < e[2] && t.push([r, a, i + r, n]), t
            },
            renderRecents: function(e, t) {
                var r, a, i, n, s, o, d = this.radarRender,
                    l = R.getRecents(),
                    u = this.shBlitzSingle,
                    h = l.length,
                    c = this.flareMaxR,
                    m = d.lastAnimTime - P.blitzFlashMaxDelay,
                    f = 0;
                if (1e3 < d.lastAnimTime - this.lastAnimTimeMsRenderRecents && 0 < h)
                    for (i = 0; i < h; i++)(a = l[i])[3] < .001 && a[2] > m && (a[3] = -1e-4 * (d.lastAnimTime - a[2]));
                if (this.lastAnimTimeMsRenderRecents = d.lastAnimTime, 0 < h && this.texture0) {
                    for (t.blendFunc(t.ONE_MINUS_DST_COLOR, t.ONE), t.useProgram(u.program), e.bindAttribute(this.vertexBufferRect, u.aPos, 4, t.FLOAT, 0, 16, 0), e.bindTexture2D(this.texture0, 0, u.sTex0), e.setBindedTexture2DParams(t.LINEAR, t.LINEAR, t.CLAMP_TO_EDGE), t.uniform4f(u.uVPars1, .5, 1, .5, 0), i = 0; i < h; i++)(a = l[i])[3] < 1300 && (.001 < a[3] || a[2] > m) && (0 < (o = a[3] / 1300) && (a[4]++ || f < 3 && (r = S.getRelativeScreenPosition(a[0], a[1], this.mapBoundsMercatorEx)) && (++f, S.play(r, d.mapZoom)), s = .8 - .8 * o * o, n = c * (o = 1 - o) * o, this.renderOneBlitz(e, t, u, a[0], a[1], n, s)), a[3] += this.dt);
                    if (f && S.vibrate(f), 7 < d.mapZoom && d.mapZoom < 12) {
                        u = this.shBlitzCircle, t.useProgram(u.program), e.bindAttribute(this.vertexBufferCircle, u.aPos, 4, t.FLOAT, 0, 16, 0);
                        var p, g, v, x, b = 34e-5 * this.screenToKmScale * 2,
                            T = 1 / d.lastClientWidth,
                            w = 1 / d.lastClientHeight,
                            A = w / T,
                            y = [3, 4, 6, 9][d.mapZoom - 8],
                            C = .03 * d.mapZoom;
                        for (x = this.mads[0], i = 0; i < h; i++) a = l[i], -1 < (o = 2 / 45e3 * (p = d.lastAnimTime - a[2] + 2e3) - 1) && o < 1 && (o = 1 - (o *= o * o * o) * o, v = (g = b * p) * A, t.uniform4f(u.uVPars0, g - T * y, v - w * y, T * y, w * y), t.uniform4f(u.uVPars1, a[0] * x[0] + x[2], a[1] * x[1] + x[3], 0, 0), t.uniform4f(u.uVPars2, .6, .8, 1, C * o), t.drawArrays(t.TRIANGLE_STRIP, 0, this.vertexBufferCircleSize))
                    }
                }
            },
            renderOneBlitz: function(e, t, r, a, i, n, s) {
                var o, d, l, u;
                for (t.uniform4f(r.uPars0, s, s, s, s), o = 0; o < this.mads.length; o++) l = a * (d = this.mads[o])[0] + d[2], u = i * d[1] + d[3], t.uniform4f(r.uVPars0, this.rSizeX * n, this.rSizeY * n, l, u), t.drawArrays(t.TRIANGLE_FAN, 0, this.vertexBufferRectCount)
            },
            computeFrameTimeParams: function(e) {
                var t = 1 + e / P.blitzFrameInterval,
                    r = 1 / t,
                    a = 1 / (1 - r);
                return [t, r, a, 1 - a]
            },
            renderBlitzFrames: function(e, t, r, a) {
                if (!(this.radarRender.mapZoom < 3) && this.texture0) {
                    var i, n, s, o, d, l = this.radarRender,
                        u = R.getBlitzFrames(R.getCalendarStart()),
                        h = u.length;
                    d = r ? (o = Math.min(l.ts + this.dts, l.lastAnimTime), this.timeParsAnim) : (o = a ? l.lastAnimTime : l.ts, this.timeParsStatic);
                    var c = this.shBlitzArray;
                    for (t.useProgram(c.program), e.bindTexture2D(this.texture0 ? this.texture0 : null, 0, c.sTex0), e.setBindedTexture2DParams(t.NEAREST, t.NEAREST, t.CLAMP_TO_EDGE), t.uniform4f(c.uVPars4, .8, .6, .8, 0), t.uniform4f(c.uVPars5, .8, 1, 1.4, 1), i = 0; i < h; i++) 0 < (s = (o - (n = u[i]).ts) * this.rhd) && s < d[0] && this.renderBlitzFrame(!1, e, t, n, c, [d[1], -d[1] * s, d[2], d[3]])
                }
            },
            renderBlitzFrame: function(e, t, r, a, i, n) {
                var s, o, d, l, u, h, c, m = 1 / 128,
                    f = [
                        [],
                        [.0625 * m, .125 * m, 0, 0],
                        [.0625 * m, .125 * m, 0, .125],
                        [.125 * m, .25 * m, 0, .25],
                        [.25 * m, .5 * m, 0, .5],
                        [.5 * m, -1 * m, .0625, .875]
                    ],
                    p = [0, 8, 8, 16, 32, 64],
                    g = [80, 20, 15, 8, 8, 6, 5, 3, 2],
                    v = this.radarRender.mapZoom,
                    x = A.bound(v - 3, 0, 8),
                    b = v <= 4 ? this.mads.length : 1,
                    T = [1, 1, 2, 2, 3, 3, 4, 4, 5][x];
                this.prepareBlitzMesh(a);
                var w = a.mesh;
                if (w.buffer)
                    for (s = 0; s < b; s++) o = this.mads[s], r.bindBuffer(r.ARRAY_BUFFER, w.buffer), r.enableVertexAttribArray(i.aPos), r.vertexAttribPointer(i.aPos, 3, r.FLOAT, !1, w.vertexStride, 0), r.enableVertexAttribArray(i.aTc), r.vertexAttribPointer(i.aTc, 4, r.UNSIGNED_BYTE, !1, w.vertexStride, 12), r.uniform4f(i.uVPars0, o[0], o[1], g[x], 0), e ? (d = this.trailRadius, r.uniform4f(i.uVPars2, 1 / 64, 1 / 64, -1, -1.17), r.uniform4fv(i.uVPars3, this.getBlitzTrailColor(a.ts)), r.uniform4fv(i.uVPars4, this.getBlitzTrailColor(a.ts + P.blitzFrameInterval))) : (d = p[T], r.uniform4fv(i.uVPars2, f[T]), r.uniform4fv(i.uVPars3, n)), h = -128 * (l = d / (64 * t.canvas.width)), c = -128 * (u = d / (64 * t.canvas.height)), r.uniform4fv(i.uVPars1, [l, u, o[2] + h, o[3] + c]), r.drawArrays(r.TRIANGLES, 0, w.vertexCount)
            },
            renderBlitzTrails: function(e, t) {
                var r, a = R.getCalendarStart(),
                    i = R.getBlitzFrames(a),
                    n = i.length;
                t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), a -= P.blitzFrameInterval;
                var s = this.shBlitzTrails;
                for (t.useProgram(s.program), r = 0; r < n; r++) i[r].ts > a && this.renderBlitzFrame(!0, e, t, i[r], s)
            },
            getBlitzTrailColor: function(e) {
                var t, r, a, i = A.bound((this.radarRender.lastAnimTime - e) / 36e6, 0, 1);
                for (this.blitzColors || (this.blitzColors = n.blitz.getColor()), (t = this.blitzColors.RGBA(i))[3] *= this.trailAlphaZoomFactor / 255, r = t[3] / 255, a = 0; a < 3; a++) t[a] *= r;
                return t
            },
            getScreenToKmScale: function(e) {
                var t = Math.abs(e[2] - e[0]),
                    r = (e[1] + e[3]) / 2;
                return 360 / (40075 * Math.cos(A.deg2rad(r)) * t)
            },
            renderPass0: function(e, t) {
                var r = this.radarRender,
                    a = this.glo,
                    i = a.get(),
                    n = a.getCanvas(),
                    s = r.mapZoom,
                    o = 1 << s,
                    d = .01 * (t[4] + t[5]);
                if (this.mapBoundsMercatorEx = [t[0] - d, t[1] + d, t[2] + d, t[3] - d], this.mapBoundsMercatorEx.push(this.mapBoundsMercatorEx[2] - this.mapBoundsMercatorEx[0], this.mapBoundsMercatorEx[1] - this.mapBoundsMercatorEx[3]), this.dt = Math.min(e, 100), this.flareMaxR = 35 * s - 50, this.trailRadius = A.bound(.1 * (o - 8) + 2 * (s - 1), 4, 160), this.trailAlphaZoomFactor = A.bound(.015 * s - .04, .01, .2), this.screenToKmScale = this.getScreenToKmScale(r.mapBounds), this.mads = this.prepareMercatorViewportMads(r.mapBoundsMercator), this.rSizeX = 1 / n.width, this.rSizeY = 1 / n.height, r.mapBoundsNew && (this.counterTrails = 0), --this.counterTrails <= 0 && (this.counterTrails = 120, this.trailsRenderNeeded = !0), this.trailsRenderNeeded && r.blitzTrailsTexture) {
                    var l = r.blitzTrailsTexture,
                        u = 136 / 255;
                    a.bindFramebuffer(r.framebuffer, l), i.viewport(0, 0, l._width, l._height), i.clearColor(u, u, u, 1), i.clear(i.COLOR_BUFFER_BIT), i.enable(i.BLEND), i.blendFunc(i.ONE, i.ONE_MINUS_SRC_ALPHA), this.renderBlitzTrails(a, i), this.trailsRenderNeeded = !1
                }
            },
            renderPass1: function() {
                var e = this.radarRender,
                    t = this.glo,
                    r = t.get(),
                    a = t.getCanvas(),
                    i = !1;
                e.animationRunning ? e.ts + 1e4 > e.lastFrameTS ? this.dts += 480 * this.dt : this.dts = 0 : e.isLastFrame && (e.requestLowFpsFrames(20), i = !0), t.bindFramebuffer(null), r.viewport(0, 0, a.width, a.height), r.enable(r.BLEND), r.blendFunc(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA), this.renderBlitzFrames(t, r, e.animationRunning, i), e.animationRunning || i && this.renderRecents(t, r), r.disable(r.BLEND)
            }
        }
    }),
    /*! */
    W.define("blitzSound", ["store", "audioContext", "rootScope", "utils"], function(e, n, t, r) {
        var s = e.get("blitzSoundOn");
        e.on("blitzSoundOn", function(e) {
            return s = e
        });
        var a = e.get("vibrate");
        e.on("vibrate", function(e) {
            return a = e
        });
        var i = t.isMobile ? "TapticEngine" in window ? window.TapticEngine.unofficial.strongBoom.bind(null, r.emptyFun) : "vibrate" in navigator ? function(e) {
            var t = 7 + 3 * e;
            navigator.vibrate([t])
        } : r.emptyFun : r.emptyFun;

        function o(e, t, r) {
            return r[0] < e && e < r[2] && r[3] < t && t < r[1] ? (e - r[0]) / r[4] : null
        }
        return {
            play: function(e, t) {
                if (s) {
                    var r = 1 + 1 * Math.max(11 - t, 0),
                        a = r * (2 * e - 1),
                        i = -1 * r;
                    n.play(a, i)
                }
            },
            vibrate: function(e) {
                a && i(e)
            },
            getRelativeScreenPosition: function(e, t, r) {
                var a = null;
                return r && (a = o(e, t, r), r[0] < 0 && null === a && (a = o(e - 1, t, r)), 1 < r[2] && null === a && (a = o(e + 1, t, r))), a
            }
        }
    }),
    /*! */
    W.define("blitzWebSocket", ["radar", "blitzData", "store"], function(r, a, e) {
        var t = "wss://ws.windy.com/blitz?version=1";
        var i = null,
            n = null,
            s = null;

        function o() {
            clearInterval(n), n = null, clearInterval(s), s = null, i && (i.close(), i = null)
        }
        r.on("open", u), r.on("close", o), e.on("visibility", function(e) {
            e ? u() : o()
        });
        var d = function(e) {
                var t = JSON.parse(e.data);
                r.emit("sockedConnected", t), i.onmessage = a.onSocketMessage, n || (n = setInterval(h, 6e4))
            },
            l = function() {
                return null !== i && i.readyState === i.OPEN
            };

        function u() {
            l() || i && i.readyState === i.CONNECTING || ((i = new WebSocket(t)).onmessage = d, s || (s = setInterval(c, 1e4)))
        }

        function h() {
            l() && i.send("ping")
        }

        function c() {
            l() || u()
        }
    }),
    /*! */
    W.define("myLocation", ["geolocation", "map", "radar", "utils", "rootScope", "$", "store"], function(e, a, t, r, i, n, s) {
        var o, d = null,
            l = null,
            u = !1,
            h = i.isMobile || i.isTablet,
            c = r.throttle(function(e) {
                var t = e.alpha,
                    r = e.webkitCompassHeading,
                    a = void 0 !== r ? r : 360 - t;
                !isNaN(a) && o && (o.style.transform = "rotate(" + Math.floor(a) + "deg)")
            }, 300),
            m = L.divIcon({
                className: "iconfont my-location-arrow",
                html: '<img src="img/actual-pos.png" />',
                iconSize: [16, 36],
                iconAnchor: [8, 18]
            }),
            f = function() {
                !u && s.get("displayLocation") && (h && window.addEventListener("deviceorientation", c), u = !0, v())
            },
            p = function() {
                clearInterval(l), l = null, d && a.removeLayer(d), d = null, h && window.removeEventListener("deviceorientation", c), u = !1
            };
        t.on("open", f), t.on("close", p), s.on("displayLocation", function(e) {
            e ? f() : p()
        }), s.on("visibility", function(e) {
            e && u && v()
        });
        var g = {
            enableHighAccuracy: !0,
            timeout: 7e3
        };

        function v() {
			var latitude = 37.2063179;
			var longitude = -80.2365658;
			
			d ? d.setLatLng([latitude, longitude]) : (d = L.marker([latitude, longitude], {
                        icon: h ? m : a.myMarkers.myLocationIcon
                    }).addTo(a), h && (o = n("img", d._icon)));
			
        }
    }),
    /*! */
    W.define("radarAnimation", ["store", "utils", "$", "radar", "map"], function(r, a, e, t, i) {
        var n, s, o, d, l = {
                slow: 12,
                medium: 6,
                fast: 3
            },
            u = function() {
                return 1e3 * l[r.get("radarSpeed")] * (1 + a.bound(.2 * (i.getZoom() - 5), 0, 2))
            },
            h = !1,
            c = !1,
            m = !0,
            f = null,
            p = e("#radar-wrapper"),
            g = e("#radar-bar .main-timecode"),
            v = function() {
                c = !1, x()
            },
            x = function() {
                h && R()
            },
            b = function() {
                c = !0, T()
            },
            T = function() {
                return window.cancelAnimationFrame(f)
            },
            w = function(e) {
                return e ? v() : b()
            },
            A = r.get("radarCalendar");

        function y() {
            h = !0, p.classList.add("play"), R()
        }

        function C() {
            if (h && !c && !m) {
                var e = (Date.now() - n) / d,
                    t = s + a.bound(e, 0, 1) * o;
                r.set("radarTimestamp", t), 1 <= e ? function() {
                    if (!h) return;
                    T(), setTimeout(function() {
                        h && !c && (g.style.opacity = 0)
                    }, 500), setTimeout(function() {
                        g.style.opacity = 1, h && !c && (r.set("radarTimestamp", A.start), R())
                    }, 1e3)
                }() : f = window.requestAnimationFrame(C)
            }
        }

        function R() {
            A = r.get("radarCalendar");
            var e = r.get("radarTimestamp");
            T(), e >= A.end && (r.set("radarTimestamp", A.start), e = A.start), s = e, n = Date.now(), o = A.end - s, d = u() * o / A.tsWidth, C()
        }
        return r.on("radarCalendar", x), r.on("radarSpeed", x), r.on("radarRange", x), r.on("radarAnimation", function(e) {
            e !== h && (e ? y() : (h = !1, T(), p.classList.remove("play"), g.style.opacity = 1))
        }), t.on("open", function() {
            m = !0, i.on("movestart", b), i.on("moveend", v), r.on("visibility", w)
        }), t.on("close", function() {
            r.set("radarAnimation", !1), r.off("visibility", w), i.off("movestart", b), i.off("moveend", v), c = !1
        }), t.on("loadedPartially", function() {
            m = !1, h && R()
        }), {
            reloadAnim: x,
            suspendAnim: b,
            resumeAnim: v,
            start: y
        }
    }),
    /*! */
    W.define("BlitzFrame", ["http", "rootScope", "lruCache", "radar"], function(e, t, r, a) {
        var s = new r(200),
            i = 1 / a.blitzFrameInterval,
            n = t.server + "/blitz/5mins",
            o = t.nodeServer + "/blitz/latest";

        function d(e, t) {
            return void 0 === t && (t = 0), this.ts = e, this.status = "undefined", this.source = "undefined", this.data = [], this.blitzCount = 0, this.tsEnd = t, this.promise = null, this
        }
        return d.prototype.addFromSocket = function(e, t, r) {
            this.data.push(e, t, (r - this.ts) * i), "dbpartial" === this.source && (this.source = "merged")
        }, d.prototype.parse = function(e) {
            var t = new DataView(e);
            if (1 !== t.getUint8(0)) return null;
            this.blitzCount = t.getUint16(1), this.binarySize = e.byteLength;
            for (var r = "db" === this.source ? new Float32Array(3 * this.blitzCount) : new Array(3 * this.blitzCount), a = 0, i = 3, n = 0, s = 0; n < this.blitzCount; n++) {
                var o = t.getUint16(i),
                    d = t.getUint16(i + 2),
                    l = t.getUint8(i + 4),
                    u = void 0;
                o += (192 & l) << 10, d += (48 & l) << 12;
                var h = 15 & l;
                u = h < 15 ? (a += h, 5) : (a = t.getUint16(i + 5), 7), r[s++] = 1 / 262144 * o, r[s++] = 1 / 262144 * d, r[s++] = 1 / 3e3 * a, i += u
            }
            return r
        }, d.prototype.createPromise = function(i) {
            var n = this;
            return new Promise(function(a) {
                n.loadingPromise = e.get(i, {
                    binary: !0,
                    cache: !1
                }).then(function(e) {
                    var t = e.data,
                        r = e.status;
                    n.source = 0 < n.tsEnd ? "dbpartial" : "db", 200 === r && t && 5 < t.byteLength ? (n.data = n.parse(t), n.status = n.data && 0 < n.data.length ? "loaded" : "corrupted") : n.status = 204 === r ? "loaded" : "corrupted", s.remove(i), a(n)
                }).catch(function() {
                    n.status = "failed", s.remove(i), a(n)
                })
            })
        }, d.prototype.load = function() {
            if (this.status = "loading", 0 < this.tsEnd) {
                var e = o + "/" + this.ts + "/" + this.tsEnd;
                this.promise = this.createPromise(e)
            } else {
                var t = n + "/" + this.ts,
                    r = s.get(t);
                r && r instanceof Promise ? this.promise = r : (this.promise = this.createPromise(t), s.put(t, this.promise))
            }
            return this.promise
        }, d
    }),
    /*! */
    W.define("radarCtrl", ["utils", "radar", "map", "radarDataTiler", "store", "radarRender", "render", "broadcast"], function(e, t, r, a, i, n, s, o) {
        var d = !1,
            l = 0,
            u = 0,
            h = !0,
            c = !0,
            m = e.debounce(function() {
                var e = null;
                g && (g = !1, e = p);
                n.resetNeeded = !0, a.startLoading(e, l)
            }.bind(this), 300);
        t.on("open", function() {
            if (n.addTo(r), n.failed) return window.alert("It seems that radar failed. " + t.crashMessage), void i.set("overlay", "wind");
            o.on("mapChanged", f), m()
        });
        var f = function() {
            return c = !0
        };
        t.on("close", function() {
            r.removeLayer(n), o.off("mapChanged", f)
        }), t.on("moveEnd", m), t.on("loaded", function(e) {
            h ? (h = !1, n.renderFrame(e, !1)) : 0 !== u && u <= l && l <= e && n.renderFrame(l, !1);
            u = e
        }), t.on("loadedAll", function() {
            c && (c = !1, s.emit("rendered", "radar"))
        });
        var p = null,
            g = !1;
        return i.on("radarCalendar", function(e) {
            p = e, g = !0, m()
        }), i.on("radarAnimation", function(e) {
            d = e, n.renderFrame(null, d)
        }), i.on("radarTimestamp", function(e) {
            a.singleFrameOn && p && 24e4 < p.end - e && (a.singleFrameOn = !1, a.startLoading(p, e)), n.renderFrame(e, d), l = e
        }), i.on("blitzOn", m), n
    }),
    /*! */
    W.define("radarDataTiler", ["radar", "radarLoader", "GlObj", "radarRender", "DataTiler"], function(x, e, b, T, t) {
        return t.instance({
            syncCounter: 0,
            cancelRqstd: !1,
            enabled: !0,
            radarParams: null,
            loader: e,
            loading: !1,
            singleFrameOn: !0,
            calendar: null,
            referenceCode: 0,
            processTile: function(e, t) {
                var r = this.addRefTime(e, t);
                return null == r ? e.isEmpty = !0 : (e.isEmpty = !1, e.url += r), e
            },
            addRefTime: function(e, t) {
                if (this.calendar && this.calendar.refTimeArray && this.calendar.refTimeArray.length) {
                    var r, a, i, n, s, o, d = this.calendar,
                        l = d.refTimeArray,
                        u = [e.x, e.y, e.x + 1, e.y + 1],
                        h = d.zoom - e.z,
                        c = 0,
                        m = Number.MAX_SAFE_INTEGER,
                        f = l.length;
                    if (0 < h)
                        for (r = 0; r < u.length; r++) u[r] <<= h;
                    for (i = u[1]; i < u[3]; i++)
                        for (a = u[0]; a < u[2]; a++)(n = i * d.tilesEdgeSize + a) < f && (s = l[n]) && ((o = s[0]) && c < o && (c = o), (o = s[1]) && o < m && (m = o));
                    if (c) return t.ts > m ? "&maxt=" + new Date(c).toISOString().replace(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+).*/, "$1$2$3$4$5$6") : ""
                }
                return null
            },
            startLoading: function(e, t) {
                if (e ? this.calendar = e : e = this.calendar, !e) return null;
                var r = {
                    dataQuality: "radar",
                    maxTileZoom: 10
                };
                r.referenceCode = ++this.referenceCode, T.referenceCode = r.referenceCode;
                var a, i, n = e.timestamps.length;
                if (r.frames = [], this.singleFrameOn) a = n - 1, i = {}, r.frames.push(i), i.ts = e.timestamps[a], i.fullPath = e.paths[a], i.referenceCode = r.referenceCode, n = 1, r.loadingFrame = 0;
                else {
                    for (a = 0; a < n; a++) i = {}, r.frames.push(i), i.ts = e.timestamps[a], i.fullPath = e.paths[a], i.referenceCode = r.referenceCode;
                    if (r.loadingFrame = n - 2, t)
                        for (a = 0; a < n - 1; a++)
                            if (t >= e.timestamps[a] && t < e.timestamps[a + 1]) {
                                r.loadingFrame = a - 1;
                                break
                            }
                }
                return r.framesCount = n, r.framesToLoad = n, r.framesToLoadEmitPartially = n >> 1, this.loadNext(r), e
            },
            loadNext: function(e) {
                ++e.loadingFrame >= e.framesCount && (e.loadingFrame = 0), 0 < e.framesToLoad ? (e.framesToLoad-- === e.framesToLoadEmitPartially && x.emit("loadedPartially"), e.fullPath = e.frames[e.loadingFrame].fullPath, e.ts = e.frames[e.loadingFrame].ts, this.getTiles(e)) : (x.emit("loadedAll"), this.loading = !1, T.renderFrame())
            },
            tilesReady: function(e, t, r) {
                if (this.referenceCode === r.referenceCode) {
                    var a, i, n, s, o, d, l = r.frames[r.loadingFrame],
                        u = {
                            frameIndex: r.loadingFrame,
                            framesCount: r.framesCount,
                            ts: l.ts,
                            referenceCode: r.referenceCode,
                            width: this.width,
                            height: this.height,
                            offsetX: this.offsetX,
                            offsetY: this.offsetY,
                            trans: this.trans
                        },
                        h = e.length,
                        c = [],
                        m = [];
                    if (0 < h && 0 < (a = e[0].length)) {
                        for (i = 0; i < h; i++)
                            for (n = 0; n < a; n++) {
                                var f = e[i][n];
                                if (f) {
                                    var p = {
                                        url: f.url,
                                        width: f.width,
                                        height: f.height,
                                        data: f.data,
                                        mx: f.x,
                                        my: f.y,
                                        mz: f.z
                                    };
                                    0 === n && 0 === i && (s = f.x, o = f.y, d = f.z), c.push(p), m.push({
                                        x: 256 * n,
                                        y: 256 * i
                                    })
                                }
                            }
                        if (1 === c.length) {
                            var g = c[0],
                                v = m[0];
                            c.push({
                                url: g.url,
                                width: g.width,
                                height: g.height,
                                data: g.data,
                                mx: g.x,
                                my: g.y,
                                mz: g.z
                            }), m.push({
                                x: v.x + g.tileSize,
                                y: v.y
                            }), a++
                        }
                        u.tilesCountX = a, u.tilesCountY = h, u.tilesDX = 256 * a, u.tilesDY = 256 * h, u.sizeX = b.getNextPowerOf2Size(u.tilesDX), u.sizeY = b.getNextPowerOf2Size(u.tilesDY), u.x0 = s, u.y0 = o, u.z0 = d, u.textureTiles = c, u.textureTilesPos = m, this.loading || (this.loading = !0, x.emit("loadingStarted")), T.pushLoadedData(u), x.emit("loaded", u.ts)
                    }
                    this.loadNext(r)
                }
            }
        })
    }),
    /*! */
    W.define("radarInterpolator", ["radarCtrl", "utils", "rootScope"], function(m, a, e) {
        var n = e.map;

        function t(e, t, r, a) {
            var i = 256 * (1 << n.zoom);
            return s(r / i, a / i)
        }

        function r(e) {
            var t = e.lat,
                r = e.lon;
            return s(a.lonDegToXUnit(r), a.latDegToYUnit(t))
        }

        function s(e, t) {
            for (var r = m.frames, a = 0, i = 0, n = 0; n < r.length; n++) {
                var s = r[n];
                if (s && s.loadedFrame) {
                    var o = s.loadedFrame.textureTiles;
                    if (0 < o.length) {
                        var d = 1 << o[0].mz,
                            l = e * d - .5 / 256,
                            u = t * d - .5 / 256,
                            h = Math.floor(l),
                            c = Math.floor(u);
                        a < (i = f(o, h, c, l -= h, u -= c)) && (a = i)
                    }
                }
            }
            return [Math.round(i), Math.round(a), 0]
        }

        function f(e, t, r, a, i) {
            for (var n = 0; n < e.length; n++) {
                var s = [0, 0, 1, 0, 0, 1, 1, 1],
                    o = e[n];
                if (o.mx === t && o.my === r && o.data) {
                    a *= o.width, i *= o.height;
                    var d = Math.floor(a),
                        l = Math.floor(i);
                    a -= d, i -= l;
                    for (var u = 0, h = 0; h < 4; h++) {
                        var c = 0,
                            m = s[h + h],
                            f = s[h + h + 1],
                            p = d + m,
                            g = l + f;
                        0 <= p && p < o.width && 0 <= g && g < o.height && (240 < (c = o.data[g * o.width + p << 1]) && (c = 0), c *= ((1 - a) * (1 - m) + a * m) * ((1 - i) * (1 - f) + i * f)), u += c
                    }
                    return .5 * u
                }
            }
            return 0
        }
        return {
            createFun: function(e) {
                e(r, t)
            }
        }
    }),
    /*! */
    W.define("radarLoader", ["lruCache", "utils", "broadcast"], function(e, t, r) {
        var a = new e(450),
            i = 0;
        var u = document.createElement("canvas"),
            h = u.getContext("2d");

        function n(e, t) {
            return this.url = e, this.status = "undefined", this.data = null, this.width = 0, this.height = 0, this.x = t.x, this.y = t.y, this.z = t.z, this.isEmpty = t.isEmpty, this
        }
        return n.prototype.load = function() {
            var l = this;
            return this.status = "loading", this.promise = new Promise(function(o) {
                if (l.isEmpty) return l.data = null, l.width = 0, l.height = 0, l.status = "loaded", void o(l);
                var d = new Image;
                d.crossOrigin = "Anonymous", d.onload = function() {
                    l.data = null, l.width = 0, l.height = 0;
                    var e = d.width,
                        t = d.height;
                    if (256 === e && 256 === t) {
                        u.width = e, u.height = t, h.drawImage(d, 0, 0, d.width, d.height);
                        var r, a = h.getImageData(0, 0, e, t).data,
                            i = a.length >> 1,
                            n = new Uint8Array(i),
                            s = 0;
                        for (r = 0; r < i;) n[r++] = a[s + 1], n[r++] = a[s + 2], s += 4;
                        l.data = n, l.width = e, l.height = t
                    } else 0;
                    l.status = "loaded", o(l)
                }, d.onerror = function() {
                    l.status = "failed", l.url, 10 < ++i && (r.emit("noConnection"), i = 0), o(l)
                }, d.src = l.url, (d.complete || void 0 === d.complete) && (d.src = t.emptyGIF, d.src = l.url)
            }), this.promise
        }, {
            loadTile: function(e) {
                var t = e.url,
                    r = a.get(t);
                if (!r) return (r = new n(t, e)).isEmpty || a.put(t, r), r.load();
                switch (r.status) {
                    case "loaded":
                        return Promise.resolve(r);
                    case "loading":
                        return r.promise;
                    case "failed":
                        return a.remove(t), r = new n(t, e), a.put(t, r), r.load()
                }
            },
            resetCacheStats: function() {},
            logCacheStats: function() {}
        }
    }),
    /*! */
    W.define("radarLogos", ["radar", "$", "http", "utils", "rootScope"], function(r, e, a, t, i) {
        var n, s = {
                lat: 0,
                lon: 0
            },
            o = null,
            d = (t.debounce(l, 1e3), function(e, t) {
                return .5 < Math.abs(s.lat - e) || Math.abs(.5 < s.lon - t)
            });

        function l() {
            var e = i.map.lat,
                t = i.map.lon;
            d(e, t) && (a.get("/reverse/v3/radar-provider/" + e + "/" + t).then(u), s = {
                lat: e,
                lon: t
            })
        }

        function u(e) {
            var t = e.data;
            t.name !== o && (n ? function(e) {
                n.style.opacity = 0, setTimeout(function() {
                    n.style.opacity = 1, n.innerHTML = e
                }, 1e3)
            }(function(e) {
                return e && e.url && e.img && e.abbrev ? '<a class="radar-inlined noselect" href="' + e.url + '"><img src="img/providers/' + e.img + '" /></a>\n\t\t\t<span class="radar-inlined uiyellow noselect">\n\t\t\t\t<a href="' + e.url + '">' + e.abbrev + "</a> protects your life and property by publishing radar data.\n\t\t\t</span>\t" : ""
            }(t)) : t && t.abbrev && (r.modelName = t.abbrev, r.emit("providerChanged")), o = t.name)
        }
    }),
    /*! */
    W.define("radarMask", ["utils", "http", "radar"], function(S, e, t) {
        return {
            defaultRadius: 250,
            darkMaskValue: .07,
            stations: null,
            getLatScaleKmToUnit: function(e) {
                return 249532e-10 / Math.cos(.0174532925 * e)
            },
            getDeltaLatFromKm: function(e) {
                return .0089946279 * e
            },
            resetAttribs: function() {
                this.radarRender = null, this.vertexBufferCircle = null, this.stations = null
            },
            init: function(e) {
                this.radarRender = e, this.glo = e.glo;
                this.vertexBufferCircleSize = 73;
                var t, r, a = new Float32Array(4 * this.vertexBufferCircleSize),
                    i = 0,
                    n = 2 * Math.PI / 71,
                    s = 4;
                for (a[0] = a[1] = a[2] = a[3] = 0, r = 0; r < 72; r++) t = Math.sin(i), a[s++] = Math.cos(i), a[s++] = Math.max(t, 0), a[s++] = Math.min(t, 0), a[s++] = 0, i += n;
                this.vertexBufferCircle = this.glo.createBuffer(a);
                var o = [
                    [0, 1],
                    [.8, -.5],
                    [-.8, -.5],
                    [0, -3]
                ];
                for (a = new Float32Array(4 * o.length), r = s = 0; r < o.length; r++) a[s++] = o[r][0], a[s++] = o[r][1], a[s++] = 0, a[s++] = 0;
                this.vertexBufferPoint = this.glo.createBuffer(a), this.loadStationsJson()
            },
            loadStationsJson: function() {
                var r = this;
                e.get(t.server + "/" + t.directory + "/coverage.json").then(function(e) {
                    var t = e.data;
                    r.makeRadarArray(t), r.radarRender && (r.radarRender.mapBoundsNew = !0, r.radarRender.renderFrame())
                })
            },
            makeRadarArray: function(e) {
                var t, r, a = [],
                    i = 3;
                for (t = 0; t < e.length; t++) r = e[t], 0 == --i && (i = 3, (r < 100 || 1e3 < r) && (r = this.defaultRadius)), a.push(r);
                this.stations = a
            },
            pushUnitRect: function(e, t, r) {
                e.push([t[0] + r, t[1], t[2] + r, t[3], t[4], t[5]])
            },
            renderMask: function(e, t) {
                if (this.startRender(), this.stations) {
                    var r, a, i, n, s, o, d, l, u, h, c, m, f = t,
                        p = [];
                    for (p.push(f), f[0] < 0 && this.pushUnitRect(p, f, 1), 1 < f[2] && this.pushUnitRect(p, f, -1), a = 0; a < p.length; a++) {
                        var g = p[a],
                            v = 0,
                            x = 1 / g[4],
                            b = 1 / g[5],
                            T = 2 * x,
                            w = -2 * b,
                            A = -1 - T * g[0],
                            y = 1 - w * g[3],
                            C = 2 / this.radarRender.textureMask._width,
                            R = 2 / this.radarRender.textureMask._height;
                        for (i = this.stations.length / 3, r = 0; r < i; r++) l = this.stations[v + 1], d = this.stations[v + 0], o = this.stations[v + 2], m = this.getDeltaLatFromKm(o), n = S.lonDegToXUnit(l), h = 2 * ((s = S.latDegToYUnit(d)) - S.latDegToYUnit(d + m)), c = 2 * (S.latDegToYUnit(d - m) - s), u = 2 * o * this.getLatScaleKmToUnit(d), this.renderCircle(T * n + A, w * s + y, x * u + C, b * h + R, b * c + R), v += 3
                    }
                }
            },
            startRender: function() {
                var e = this.glo,
                    t = e.get(),
                    r = this.radarRender.textureMask;
                e.bindFramebuffer(this.radarRender.framebuffer, r), t.viewport(0, 0, r._width, r._height), this.stations ? t.clearColor(this.darkMaskValue, 0, 0, 0) : t.clearColor(0, 1, 0, 0), t.clear(t.COLOR_BUFFER_BIT), this.shader = this.radarRender.shCircleMask, t.useProgram(this.shader.program), t.uniform4f(this.shader.uPars0, 0, 1, 0, 0), e.bindAttribute(this.vertexBufferCircle, this.shader.aPos, 4, t.FLOAT, 0, 16, 0)
            },
            renderCircle: function(e, t, r, a, i) {
                var n = this.glo.get();
                n.uniform4f(this.shader.uVPars0, r, a, e, t), n.uniform4f(this.shader.uVPars1, i, 0, 0, 0), n.drawArrays(n.TRIANGLE_FAN, 0, this.vertexBufferCircleSize)
            },
            debugRenderStations: function(e) {
                var t, r, a, i, n, s, o = this.glo,
                    d = o.get();
                for (d.uniform4f(this.shader.uPars0, 0, 1, 0, 0), o.bindAttribute(this.vertexBufferPoint, this.shader.aPos, 4, d.FLOAT, 0, 16, 0), r = 0; r < e.length; r++) {
                    var l = e[r],
                        u = 0,
                        h = 2 * (1 / l[4]),
                        c = -2 * (1 / l[5]),
                        m = -1 - h * l[0],
                        f = 1 - c * l[3],
                        p = 8 / this.radarRender.textureMask._width,
                        g = 8 / this.radarRender.textureMask._height;
                    if (this.stations)
                        for (a = this.stations.length / 3, t = 0; t < a; t++) s = this.stations[u + 1], i = S.lonDegToXUnit(this.stations[u]), n = S.latDegToYUnit(s), d.uniform4f(this.shader.uVPars0, p, g, h * i + m, c * n + f), d.uniform4f(this.shader.uVPars1, 1, 0, 0, 0), d.drawArrays(d.TRIANGLE_FAN, 0, 3), u += 3
                }
            }
        }
    }),
    /*! */
    W.define("radarRender", ["RadarRenderClass"], function(e) {
        return new e
    }),
    /*! */
    W.define("radarRenderWebGL", ["rootScope", "GlObj", "shadersRadar", "map", "colors", "radarMask", "blitzRender"], function(s, V, o, g, t, d, v) {
        return {
            resetAttribs: function() {
                this.isReady = !1, this.infLoopRunning = !1, this.loadedFrames = [], this.frames = [], this.compositeFrames = [], this.staticFrame = null, this.changesCounter = 1, this.animationCompositeRefCode = 0, this.staticCompositeRefCode = 0, this.referenceCode = 1, this.frameUpdateCounter = 0, this.radarTextureResX = this.radarTextureResY = this.tileEdgeSize, this.loadedTiles = [], this.dataTextures = [], this.dataTexturesUsed = 0, this.animationRunning = !1, this.framebuffer = null, this.radarTextureComposite = [null, null], this.textureMask = null, this.maskTextureWidth = 0, this.maskTextureHeight = 0, this.blitzTrailsTexture = null, this.blitzTrailsTextureWidth = 0, this.blitzTrailsTextureHeight = 0, this.animShader = null, this.lastClientWidth = 0, this.lastClientHeight = 0, d.resetAttribs(), v.resetAttribs()
            },
            initParamsAndShaders: function() {
                var e = this.glo,
                    t = e.get();
                this.emptyData = new Uint8Array(this.tileEdgeSize * this.tileEdgeSize * 2);
                for (var r = 0; r < this.emptyData.length;) this.emptyData[r++] = 0, this.emptyData[r++] = 255;
                this.errorCount = 0, this.maxTextureSize = t.getParameter(t.MAX_TEXTURE_SIZE), this.shRadarCopyData = this.compileShader(o.shRectVS, o.shRadarCopyDataFS), this.shRadarCopyMask = this.compileShader(o.shRectVS, o.shRadarCopyMaskFS), this.shProcessMask = this.compileShader(o.shRectVS, o.shProcessMaskFS), this.shCircleMask = this.compileShader(o.shMaskCircleVS, o.shConstFS);
                var a = [],
                    i = o.shRadarMulti2FS;
                this.shLinearStatic = this.compileShader(o.shRectVS, i, a, "shRadarStaticLinear"), this.shLinearAnimLinear = this.compileShader(o.shRectVS, i, a.concat(["ANIM"]), "shLinearAnimLinear"), s.isMobile || s.isTablet ? this.shCubicStatic = this.shCubicAnimLinear = this.shCubicAnimCubic = null : (this.shCubicStatic = this.compileShader(o.shRectVS, i, a.concat(["CUBIC"]), "shCubicStatic"), this.shCubicAnimLinear = this.compileShader(o.shRectVS, i, a.concat(["CUBIC", "ANIM"]), "shCubicAnimLinear"), this.shCubicAnimCubic = this.compileShader(o.shRectVS, i, a.concat(["CUBIC", "ANIM", "ANIM_CUBIC"]), "shCubicAnimCubic")), this.shStatic = this.shCubicStatic || this.shLinearStatic, this.shAnim = this.shCubicAnimCubic || this.shLinearAnimLinear, this.shAnimBlend = this.shCubicAnimLinear || this.shLinearAnimLinear, this.shStatic && this.shAnim && this.shAnimBlend && (this.errorCount = 0), this.texelShiftX = this.texelShiftY = this.shCubicStatic ? .5 : 0, this.filterStatic = this.shCubicStatic ? t.NEAREST : t.LINEAR, this.filterAnim = this.shCubicAnimCubic ? t.NEAREST : t.LINEAR, this.framebuffer = e.createFramebuffer(), this.vertexBufferRect = e.createBuffer(new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1])), this.createPatternTexture(), this.reCreateGradientTexture(!0);
                for (var n = 0; n < this.radarTextureComposite.length; n++) this.radarTextureComposite[n] = e.createTexture2D(t.NEAREST, t.NEAREST, t.CLAMP_TO_EDGE, null, this.radarTextureResX, this.radarTextureResY, t.RGBA);
                d.init(this), v.enabled = !0
            },
            checkSizesAndReinit: function() {
                var e = this.glo,
                    t = e.get(),
                    r = e.getCanvas();
                if (this.lastClientWidth !== r.width || this.lastClientHeight !== r.height) {
                    this.lastClientWidth = r.width, this.lastClientHeight = r.height;
                    var a = this.ratioScale < 1.5 ? .7 : 1,
                        i = Math.min(V.getNextPowerOf2Size(a * this.lastClientWidth), this.maxTextureSize),
                        n = Math.min(V.getNextPowerOf2Size(a * this.lastClientHeight), this.maxTextureSize);
                    this.maskTextureWidth === i && this.maskTextureHeight === n || (this.maskTextureWidth = i, this.maskTextureHeight = n, this.textureMask ? e.resizeTexture2D(this.textureMask, new Uint8Array(i * n * 4), i, n) : this.textureMask = e.createTexture2D(t.LINEAR, t.LINEAR, t.REPEAT, new Uint8Array(i * n * 4), i, n)), a = .33, i = Math.min(V.getNextPowerOf2Size(a * this.lastClientWidth), this.maxTextureSize), n = Math.min(V.getNextPowerOf2Size(a * this.lastClientHeight), this.maxTextureSize), this.blitzTrailsTextureWidth === i && this.blitzTrailsTextureHeight === n || (this.blitzTrailsTextureWidth = i, this.blitzTrailsTextureHeight = n, this.blitzTrailsTexture ? e.resizeTexture2D(this.blitzTrailsTexture, new Uint8Array(i * n * 4), i, n) : this.blitzTrailsTexture = e.createTexture2D(t.LINEAR, t.LINEAR, t.REPEAT, new Uint8Array(i * n * 4), i, n))
                }
            },
            getBlitzPattern: function(e, t) {
                return 120 + 40 * [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1][7 - e % 8 + t % 16 * 8]
            },
            createPatternTexture: function() {
                var e = this.glo.get(),
                    t = new Uint8Array(16384),
                    r = [192, 255, 64, 0],
                    a = [64, 255, 192, 0],
                    i = document.createElement("canvas");
                i.width = 64, i.height = 64;
                var n = i.getContext("2d");
                n.fillStyle = "black", n.fillRect(0, 0, 64, 64), n.font = "12px sans-serif", n.fillStyle = "rgb(60,60,60)", n.translate(0, 64), n.rotate(-Math.PI / 4), n.fillText("no data", 20, 0);
                var s, o, d, l, u, h = n.getImageData(0, 0, 64, 64).data,
                    c = 0;
                for (o = 0; o < 64; o++)
                    for (d = 64 - (o >> 1), s = 0; s < 64; s++) d = 3 & ++d, l = 1 & o ? a[d] : r[d], 0 !== (u = h[4 * (64 * (63 - o) + s)]) || 3 & s || 3 & o || (u = 36), t[c++] = u, t[c++] = l, t[c] = this.getBlitzPattern(s, o), c += 2;
                this.texturePattern = this.glo.createTexture2D(e.NEAREST, e.NEAREST, e.REPEAT, t, 64, 64)
            },
            reCreateGradientTexture: function(e) {
                this.createGradientTexture(t.radar, 256, .5, e)
            },
            createGradientTexture: function(e, t, r, a) {
                var i = this.glo.get(),
                    n = e.createGradientArray(!1, !1, r),
                    s = e.createSteppedArray(n, 20, 10);
                this.textureGrad = this.glo.createTexture2D(i.LINEAR, i.LINEAR, i.CLAMP_TO_EDGE, a ? n : s, t, 1)
            },
            recycleDataTexture: function(e) {
                var t = this.dataTextures.indexOf(e);
                0 <= t && t < this.dataTexturesUsed && (this.dataTextures.splice(t, 1), this.dataTextures.push(e), this.dataTexturesUsed--)
            },
            getFreeDataTexture: function() {
                var e = null,
                    t = this.glo.get();
                return this.dataTexturesUsed < this.dataTextures.length ? e = this.dataTextures[this.dataTexturesUsed] : (e = this.glo.createTexture2D(t.NEAREST, t.NEAREST, t.CLAMP_TO_EDGE, null, this.radarTextureResX, this.radarTextureResY, t.LUMINANCE_ALPHA), this.dataTextures.push(e)), ++this.dataTexturesUsed, e
            },
            resizeDataTextureIfNeeded: function(e, t, r, a) {
                a = a || this.glo.get().LUMINANCE_ALPHA, t > this.radarTextureResX && (this.radarTextureResX = t), r > this.radarTextureResY && (this.radarTextureResY = r), e._width === this.radarTextureResX && e._height === this.radarTextureResY || this.glo.resizeTexture2D(e, null, this.radarTextureResX, this.radarTextureResY, a)
            },
            compileShader: function(e, t, r, a) {
                var i;
                try {
                    i = this.glo.createProgramObj(e, t, r, a)
                } catch (e) {
                    window.wError("radar", "Compile shader err:", e.full), ++this.errorCount, i = null
                }
                return i
            },
            dbgDate: function(e) {
                return new Date(e).toISOString().substring(11, 19)
            },
            createCompositeFromFrames: function(e) {
                var t, r, a, i = this.glo,
                    n = i.get(),
                    s = e.length,
                    o = Math.min(this.mapZoom - 1, 6),
                    d = this.mapBoundsMercator,
                    l = 1 << o,
                    u = [],
                    h = [];
                for (t = 0; t < 4; t++) u[t] = d[t] * l, h[t] = Math.floor(u[t]), 1 !== t && 2 !== t || (h[t] += 1);
                var c = {};
                for (c.tilesX = h[2] - h[0], c.tilesY = h[1] - h[3], c.usedSizeX = c.tilesX * this.tileEdgeSize, c.usedSizeY = c.tilesY * this.tileEdgeSize, c.neededSizeX = V.getNextPowerOf2Size(c.usedSizeX), c.neededSizeY = V.getNextPowerOf2Size(c.usedSizeY), t = 0; t < this.radarTextureComposite.length; t++) this.resizeDataTextureIfNeeded(this.radarTextureComposite[t], c.neededSizeX, c.neededSizeY, n.RGBA);
                var m = (u[2] - u[0]) * this.tileEdgeSize,
                    f = Math.abs(u[0] - h[0]) * this.tileEdgeSize,
                    p = (u[1] - u[3]) * this.tileEdgeSize,
                    g = Math.abs(u[3] - h[3]) * this.tileEdgeSize;
                c.textureMad = [m / this.radarTextureResX, p / this.radarTextureResY, f / this.radarTextureResX, g / this.radarTextureResY], this.compositePars = c;
                var v, x, b = [];
                for (t = 0; t < s; t++)
                    if (v = e[t].loadedFrame, (x = e[t].texture) && v) {
                        var T = v.tilesDX / x._width,
                            w = v.tilesDY / x._height,
                            A = o - v.z0,
                            y = 1 << Math.abs(A);
                        A < 0 && (y = 1 / y);
                        for (var C = v.tilesDX / this.radarTextureResX * y, R = v.tilesDY / this.radarTextureResY * y, S = v.x0 * y, P = v.y0 * y, z = (S - h[0]) * this.tileEdgeSize / this.radarTextureResX, F = (P - h[3]) * this.tileEdgeSize / this.radarTextureResY, E = (1 << o) * this.tileEdgeSize / this.radarTextureResX; E <= z;) z -= E;
                        b.push({
                            i: t,
                            tex: x,
                            dzoom: A,
                            p0: [C, R, z, F],
                            p1: [T, w, 0, 0]
                        })
                    } r = this.radarTextureComposite[0], i.bindFramebuffer(this.framebuffer, r), n.viewport(0, 0, r._width, r._height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), a = this.shRadarCopyMask, n.useProgram(a.program), i.bindAttribute(this.vertexBufferRect, a.aPos, 2, n.FLOAT, 0, 8, 0);
                var B = b.length;
                if (0 < B) {
                    var D = s < 3 ? [0, 0] : [1, 2];
                    for (t = 0; t < D.length; t++) {
                        var L = b[D[t]];
                        n.uniform4fv(a.uVPars0, L.p0), n.uniform4fv(a.uVPars1, L.p1), n.colorMask(0 === t, 1 === t, 0, 0), i.bindTexture2D(L.tex, 0, a.sTex0);
                        var M = 0 === L.dzoom ? n.NEAREST : n.LINEAR;
                        i.setBindedTexture2DParams(M, M, n.REPEAT), n.drawArrays(n.TRIANGLE_FAN, 0, 4)
                    }
                    r = this.radarTextureComposite[1], i.bindFramebuffer(this.framebuffer, r), n.viewport(0, 0, r._width, r._height), n.colorMask(!0, !0, !0, !0), a = this.shProcessMask, n.useProgram(a.program), i.bindAttribute(this.vertexBufferRect, a.aPos, 2, n.FLOAT, 0, 8, 0), n.uniform4f(a.uVPars0, 1, 1, 0, 0), n.uniform4f(a.uVPars1, 1, 1, 0, 0), i.bindTexture2D(this.radarTextureComposite[0], 0, a.sTex0), i.setBindedTexture2DParams(n.NEAREST, n.NEAREST, n.REPEAT), n.drawArrays(n.TRIANGLE_FAN, 0, 4)
                }
                for (r = this.radarTextureComposite[0], i.bindFramebuffer(this.framebuffer, r), n.viewport(0, 0, r._width, r._height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), a = this.shRadarCopyData, n.useProgram(a.program), i.bindAttribute(this.vertexBufferRect, a.aPos, 2, n.FLOAT, 0, 8, 0), t = 0; t < B; t++) {
                    var k = b[t];
                    n.uniform4fv(a.uVPars0, k.p0), n.uniform4fv(a.uVPars1, k.p1), n.colorMask(0 === k.i, 1 === k.i, 2 === k.i, 3 === k.i), i.bindTexture2D(k.tex, 0, a.sTex0);
                    var N = 0 === k.dzoom ? n.NEAREST : n.LINEAR;
                    i.setBindedTexture2DParams(N, N, n.REPEAT), n.drawArrays(n.TRIANGLE_FAN, 0, 4)
                }
                n.colorMask(!0, !0, !0, !0)
            },
            frameRenderToCanvas: function() {
                for (var e, t, r = this.glo, a = r.get(), i = this.filterStatic, n = 0; n < this.radarTextureComposite.length; n++) this.resizeDataTextureIfNeeded(this.radarTextureComposite[n], 0, 0, a.RGBA);
                this.animationRunning ? (this.animationCompositeRefCode !== this.changesCounter && (this.createCompositeFromFrames(this.compositeFrames), 2 < this.compositeFrames.length && (this.animShader = this.compositeFrames[2].ts - this.compositeFrames[1].ts > this.blendAnimationTimeLimit ? this.shAnimBlend : this.shAnim), this.animationCompositeRefCode = this.changesCounter, this.staticCompositeRefCode = 0), this.animShader || (this.animShader = this.shAnim), e = this.animShader, i = this.filterAnim) : (e = this.shStatic, !this.staticFrame || this.staticFrame.updateCounter === this.lastStaticFrameUpdateCounter && this.staticCompositeRefCode === this.changesCounter || (this.createCompositeFromFrames([this.staticFrame]), this.animationCompositeRefCode = 0, this.staticCompositeRefCode = this.changesCounter, this.lastStaticFrameUpdateCounter = this.staticFrame.updateCounter)), t = this.radarTextureComposite[0], r.bindFramebuffer(null), a.viewport(0, 0, this._canvas.width, this._canvas.height), a.useProgram(e.program), r.bindAttribute(this.vertexBufferRect, e.aPos, 2, a.FLOAT, 0, 8, 0), r.bindTexture2D(t, 0, e.sRadar), r.setBindedTexture2DParams(i, i, a.REPEAT), r.bindTexture2D(this.textureGrad, 1, e.sGradient), r.bindTexture2D(this.textureMask, 2, e.sMask), r.setBindedTexture2DParams(a.LINEAR, a.LINEAR, a.REPEAT), r.bindTexture2D(this.texturePattern, 3, e.sPattern), r.bindTexture2D(this.radarTextureComposite[1], 4, e.sCompoMask), r.setBindedTexture2DParams(a.LINEAR, a.LINEAR, a.REPEAT);
                var s = t._width,
                    o = t._height,
                    d = 1 / s,
                    l = 1 / o,
                    u = 11 < g._zoom ? 0 : 1,
                    h = 0;
                this.blitzTrailsTexture && v.isReady && (r.bindTexture2D(this.blitzTrailsTexture, 5, e.sBlitz), r.setBindedTexture2DParams(a.LINEAR, a.LINEAR, a.REPEAT), h = 1), a.uniform4f(e.uVPars0, 1, 1, 0, 0);
                var c = this.compositePars.textureMad;
                a.uniform4f(e.uVPars1, c[0], -c[1], c[2] + this.texelShiftX * d, c[1] + c[3] + this.texelShiftY * l), a.uniform4f(e.uVPars2, 1, 1, 0, 0);
                var m = 1 << this.mapZoom + 8,
                    f = Math.round(m * this.mapBoundsMercator[0]) % this.texturePattern._width / this.texturePattern._width,
                    p = Math.round(m * this.mapBoundsMercator[1]) % this.texturePattern._height / this.texturePattern._height;
                a.uniform4f(e.uVPars3, this._canvas.width / this.texturePattern._width, this._canvas.height / this.texturePattern._height, f, -p), a.uniform4f(e.uPars0, s, o, d, l), a.uniform4f(e.uPars1, .25 * this._canvas.width, -.25 * this._canvas.height, this.animFraction, this.globalAlpha), a.uniform4f(e.uPars2, -1.5 * d, -.5 * d, .5 * d, 1.5 * d), a.uniform4f(e.uPars3, -1.5 * l, -.5 * l, .5 * l, 1.5 * l), a.uniform4f(e.uPars4, 136 / 255, u, this.globalAlpha12, h), a.drawArrays(a.TRIANGLE_FAN, 0, 4)
            }
        }
    }),
    /*! */
    W.define("radarUIloaders", ["radar", "$", "store", "format", "trans"], function(e, t, r, a, i) {
        e.once("loadingStarted", function() {
            f(), r.on("radarCalendar", m), e.on("loaded", p), e.on("loadedAll", v), e.on("close", v), e.on("loadingStarted", f)
        });
        var n, s = t("#plugin-radar"),
            o = t(".radar-loader", s),
            d = t(".update-loader", s),
            l = ["#b19552", "rgba(0,0,0,0)"],
            u = [],
            h = 0,
            c = !1;

        function m(e) {
            n = e, c = !0, s.classList.add("updating"), g()
        }

        function f() {
            c || (n = r.get("radarCalendar"), s.classList.add("radar-loading"), g())
        }

        function p(e) {
            var t = n.timestamps.indexOf(e);
            if (-1 < t) {
                u[t] = 1;
                var r = u.map(function(e, t) {
                    var r = l[e],
                        a = (1 + t) * h;
                    return (t ? r + " " + a + "%" : "to right") + ", " + r + " " + a + "%"
                }).join(",");
                o.style.background = "linear-gradient(" + r + ")"
            }
        }

        function g() {
            h = 100 / n.timestamps.length;
            for (var e = 0; e < n.timestamps.length; e++) u[e] = 0
        }

        function v() {
            c && r.get("radarAnimation") && function() {
                var e = a.howOld({
                    translate: !0,
                    ts: n.updateTs
                });
                d.textContent = i.MENU_D_UPDATED + " " + e, d.classList.add("show"), setTimeout(function() {
                    return d.classList.remove("show")
                }, 4e3)
            }(), c = !1, s.classList.remove("updating"), s.classList.remove("radar-loading"), o.style.background = "none"
        }
    }),
    /*! */
    W.tag("radar", '<div id="radar-wrapper" class="notap" data-ref="wrapper"><div class="radar-info uiyellow size-m nomouse" data-ref="info"></div><div class="big-loader"></div><div class="update-loader uiyellow nomouse size-m animation" data-icon="&#xe022;"></div><div data-ref="sound2" class="sound-onoff iconfont clickable"></div><div data-ref="play" class="play-pause iconfont clickable"></div><div id="radar-bar" data-ref="bar" class="progress-bar"><div class="progress-line"><div class="radar-loader"></div></div><div class="timecode ghost-timecode"><div class="box"></div></div><div class="timecode main-timecode"><div class="box"></div></div></div><div id="range-switch" data-ref="range" class="transparent-switch compact uiyellow size-xs tooltip-right" data-tooltipsrc="R_TIME_RANGE"><div data-do="set,-12">12h</div><div data-do="set,-6">6h</div><div data-do="set,-1">1h</div></div><div id="speed-switch" data-ref="speed" class="transparent-switch compact uiyellow" data-tooltipsrc="S_SPEED"><div data-do="set,slow" class="iconfont">&#xe030;</div><div data-do="set,medium" class="iconfont">&#xe031;</div><div data-do="set,fast" class="iconfont">&#xe032;</div></div><div id="radar-mobile-switches"><div data-ref="location" class="checkbox" data-t="MY_LOCATION"></div><div data-ref="vibrate" class="checkbox">Vibrate</div></div><a id="note-message-radar" data-ref="embed" class="mobilehide uiyellow" href="https://www.windy.com/" target="_top" data-afterbegin="E_MESSAGE"><span>&nbsp;www.windy.com</span></a></div><div id="radar-more" data-ref="more" data-icon="&#xe024;"><span data-t="MORE"></span><span data-t="LESS"></span></div><a id="blitzortung-contrib" data-do="url,https://www.lightningmaps.org/">Lightningmaps.org & contributors</a>', ".overlay-radar #rh-bottom #product-switch,.overlay-radar #rh-bottom #isolines,.overlay-radar #rh-bottom #info-icon,.overlay-radar #rh-bottom #particles{display:none}.overlay-radar #rh-bottom #radar-blitz-sound,.overlay-radar #rh-bottom #radar-blitz{display:inline-block}.overlay-radar #rh-bottom #rh-bottom-messages{display:block;position:absolute;bottom:100%;width:100%;right:0;font-size:11px}.overlay-radar #rh-bottom #rh-bottom-messages #radar-blitz-contrib{display:block;line-height:1.45;white-space:normal;margin-bottom:8px;padding-right:15px}.overlay-radar #rh-bottom #rh-bottom-messages #radar-radar-contrib{white-space:nowrap;margin-bottom:15px;transition:1s opacity;-webkit-transition:1s opacity}.overlay-radar #rh-bottom #rh-bottom-messages #radar-radar-contrib .radar-inlined{display:inline-block;vertical-align:middle}.overlay-radar #rh-bottom #rh-bottom-messages #radar-radar-contrib img{-webkit-filter:invert(100%) drop-shadow(0 0 1px rgba(0,0,0,0.6));filter:invert(100%) drop-shadow(0 0 1px rgba(0,0,0,0.6));max-width:50px;max-height:50px;margin-right:15px}.overlay-radar #rh-bottom #rh-bottom-messages #radar-radar-contrib span{width:calc( 100% - 65px );padding-right:5px;white-space:normal;line-height:1.6}@media (max-height:500px){.overlay-radar #rh-bottom #rh-bottom-messages{display:none}}.overlay-radar #detail .desktop-timecode,.overlay-radar #detail .progress-bar .progress-line{opacity:.6;pointer-events:none}.overlay-radar #bottom{bottom:-100px}#device-mobile .overlay-radar #bottom,#device-tablet .overlay-radar #bottom{bottom:-180px}#device-mobile .overlay-radar #legend-mobile,#device-tablet .overlay-radar #legend-mobile,#device-mobile .overlay-radar #playpause-mobile,#device-tablet .overlay-radar #playpause-mobile{display:none !important}.overlay-radar #map-container .my-location-arrow img{width:16px;height:36px;position:absolute}#plugin-radar{position:fixed;bottom:-100px;margin-right:270px;pointer-events:none}.overlay-radar #plugin-radar{bottom:0}.ondetail #plugin-radar{bottom:-200px}#plugin-radar #radar-wrapper{pointer-events:auto;position:relative;bottom:0;height:40px;max-width:520px;margin:0 auto;border-left:60px solid transparent;border-right:60px solid transparent;background-clip:content-box}#plugin-radar #radar-wrapper .sound-onoff,#plugin-radar #radar-wrapper .play-pause{font-size:32px;position:absolute;left:-50px;top:-17px}#plugin-radar #radar-wrapper .sound-onoff{display:none}#plugin-radar #radar-wrapper .progress-line{top:-10px;height:26px;position:relative}#plugin-radar #radar-wrapper .progress-line::before{position:absolute;content:' ';left:0;top:0;width:100%;height:6px;display:block;background-color:#e5e5e5;border-radius:6px}#plugin-radar #radar-wrapper .progress-line .radar-loader{height:100%;width:100%;border-radius:6px;display:none;position:absolute;top:0;left:0}#plugin-radar #radar-wrapper .update-loader,#plugin-radar #radar-wrapper .radar-info{position:absolute;top:-23px}#plugin-radar #radar-wrapper .radar-info{transition:.3s opacity 0s;-webkit-transition:.3s opacity 0s;opacity:0}#plugin-radar #radar-wrapper .update-loader{right:0}#plugin-radar #radar-wrapper .update-loader::before{position:relative;left:-0.2em;top:.1em}#plugin-radar #radar-wrapper .big-loader{top:-120px;margin-left:-25px;left:50%;opacity:.5;font-size:15px;position:absolute;display:none}#plugin-radar #radar-wrapper .timecode{font-size:12px;top:-2.3em}#plugin-radar #radar-wrapper .main-timecode .box::after{content:' ';background:#946051;height:6px;width:4px;position:absolute;top:100%;left:2em;margin-left:-2px;margin-top:.5em}#plugin-radar #radar-wrapper.play .radar-info{opacity:1}#plugin-radar #radar-wrapper.play .main-timecode{transition:.3s opacity 0s;-webkit-transition:.3s opacity 0s;content:' ';background-color:#d49500;font-size:1px;width:12px;height:12px;border-radius:6px;top:-3px;margin-left:-6px;box-shadow:0 0 4px 0 black}#plugin-radar #radar-wrapper.play .main-timecode .box{display:none}#plugin-radar #radar-wrapper #range-switch{font-size:10px;position:absolute;bottom:12px;right:5px}#plugin-radar #radar-wrapper #range-switch:hover::before{border-right-color:#a79090}#plugin-radar #radar-wrapper #radar-mobile-switches{display:none}#plugin-radar #radar-wrapper #speed-switch{font-size:14px;position:absolute;bottom:8px;left:5px}#plugin-radar #radar-wrapper #speed-switch:hover::before{border-left-color:#a79090}#plugin-radar #radar-wrapper.size-0 .radar-info,#plugin-radar #radar-wrapper.size-1 .radar-info,#plugin-radar #radar-wrapper.size-0 .ui-switch,#plugin-radar #radar-wrapper.size-1 .ui-switch{display:none}#plugin-radar #radar-wrapper.size-2 .radar-info{font-size:10px}#plugin-radar #radar-wrapper.size-2 #speed-switch{display:none}#plugin-radar #radar-wrapper [data-tooltip]:hover::after{background:#a79090}#plugin-radar #note-message-radar,#plugin-radar #radar-more{display:none}#plugin-radar.updating #radar-wrapper .radar-loader{display:block}#plugin-radar.radar-loading #radar-wrapper .big-loader,#plugin-radar.radar-loading #radar-wrapper .radar-loader{display:block}#plugin-radar #blitzortung-contrib{display:none}#device-mobile #plugin-radar,#device-tablet #plugin-radar{margin-right:0}#device-mobile #plugin-radar{margin:0;height:55px;pointer-events:auto;left:0;right:0;transition:bottom .2s,height ease-in-out .4s,background .4s ease-in-out .4s;-webkit-transition:bottom .2s,height ease-in-out .4s,background .4s ease-in-out .4s}#device-mobile #plugin-radar.display-more{background-color:#9D0300;height:120px}#device-mobile #plugin-radar.display-more::after{display:block}#device-mobile #plugin-radar #radar-wrapper{background:none;height:25px;margin-top:25px;max-width:initial;border-left-width:100px;border-right-width:70px}#device-mobile #plugin-radar #radar-wrapper .progress-line{border:none;height:6px;top:0}#device-mobile #plugin-radar #radar-wrapper .sound-onoff,#device-mobile #plugin-radar #radar-wrapper .play-pause{border:10px solid transparent;background-clip:padding-box;color:white;margin:-10px;margin-left:-18px;text-shadow:0 0 4px black;box-shadow:none;background:none;width:inherit;height:inherit;left:-48px}#device-mobile #plugin-radar #radar-wrapper .sound-onoff:hover,#device-mobile #plugin-radar #radar-wrapper .play-pause:hover{opacity:1}#device-mobile #plugin-radar #radar-wrapper .sound-onoff{display:block;left:-78px;top:-11px;font-size:28px}#device-mobile #plugin-radar #radar-wrapper .sound-onoff::before{content:\"\\e039\";position:relative}#device-mobile #plugin-radar #radar-wrapper .sound-onoff.off:before{content:\"\\e03a\"}#device-mobile #plugin-radar #radar-wrapper .radar-info{left:-80px;font-size:18px;opacity:1 !important;bottom:50px;top:initial}#device-mobile #plugin-radar #radar-wrapper .update-loader{top:-68px;left:-80px;right:inherit}#device-mobile #plugin-radar #radar-wrapper #speed-switch{display:none}#device-mobile #plugin-radar #radar-wrapper.play .play-pause::before{content:'e'}#device-mobile #plugin-radar #radar-wrapper .big-loader{top:-160px}#device-mobile #plugin-radar #radar-wrapper.play .main-timecode,#device-mobile #plugin-radar #radar-wrapper .main-timecode{transition:.3s opacity 0s;-webkit-transition:.3s opacity 0s;content:' ';background-color:#d49500;font-size:33px;width:1em;height:1em;border-radius:.5em;margin-left:-0.5em;top:-0.5em;margin-top:1.5px;box-shadow:0 0 4px 0 black}#device-mobile #plugin-radar #radar-wrapper.play .main-timecode .box,#device-mobile #plugin-radar #radar-wrapper .main-timecode .box{display:none}#device-mobile #plugin-radar #radar-wrapper #range-switch{text-shadow:none;font-size:16px;color:white;bottom:-40px;right:-50px}#device-mobile #plugin-radar #radar-wrapper #radar-mobile-switches{position:absolute;display:block;bottom:-60px;left:-85px;line-height:1.8;color:white}#device-mobile #plugin-radar #radar-mobile-switches,#device-mobile #plugin-radar #range-switch{pointer-events:none;opacity:0;transition:opacity .5s}#device-mobile #plugin-radar #blitzortung-contrib{font-size:9px;position:fixed;left:50%;bottom:1px;transform:translateX(-50%);opacity:.7;transition:opacity .3s}.overlay-radar #device-mobile #plugin-radar #blitzortung-contrib{display:block}#device-mobile #plugin-radar.display-more #radar-more{color:white;text-shadow:none}#device-mobile #plugin-radar.display-more #radar-more [data-t=\"MORE\"]{display:none}#device-mobile #plugin-radar.display-more #radar-more [data-t=\"LESS\"]{display:block}#device-mobile #plugin-radar.display-more #radar-mobile-switches,#device-mobile #plugin-radar.display-more #range-switch{pointer-events:auto;opacity:1}#device-mobile #plugin-radar.display-more #blitzortung-contrib{opacity:0;pointer-events:none}#device-mobile #plugin-radar #radar-more{border:10px solid transparent;background-clip:padding-box;margin:-10px;display:block;text-align:center;position:absolute;right:8px;top:8px;color:#fff3e1;text-shadow:0 0 4px black}#device-mobile #plugin-radar #radar-more::before{font-size:30px}#device-mobile #plugin-radar #radar-more span{font-size:8px;letter-spacing:.15em;display:block;margin-top:-5px}#device-mobile #plugin-radar #radar-more [data-t=\"LESS\"]{display:none}#device-mobile .iphonex #plugin-radar{margin-bottom:18px}#device-mobile .iphonex #plugin-radar::after{display:none;position:fixed;left:0;bottom:0;right:0;height:18px;background-color:#9D0300;content:' ';z-index:200}#device-mobile .onairport #plugin-radar,#device-mobile .onstation #plugin-radar,#device-mobile .oncap-alert #plugin-radar,#device-mobile .onfavs #plugin-radar,#device-mobile .ondetail #plugin-radar{bottom:-200px}#device-mobile .overlay-radar #plugin-radar #blitzortung-contrib{display:block}", "", function(e) {
        var t = this,
            r = W.require,
            a = r("radar"),
            h = r("trans"),
            c = r("utils"),
            i = r("rootScope"),
            n = r("store"),
            s = r("storage"),
            o = r("$"),
            d = r("colors"),
            l = r("BindedSwitch"),
            u = r("BindedCheckbox"),
            m = r("BindedBar");
        a.crashMessage = "Radar uses webGL technology, that can occasionaly fail on some devices.\n\nWhat can you do? " + ("android" === i.platform ? " Update your Android System WebView component to the latest version." : "") + " Update your browser or Windy App to the latest version. And try again please";
        var f = s.get("radarCrashCounter") || 0;
        1 <= f ? (s.remove("radarCrashCounter"), window.wError("radar", "Crashed browser"), window.alert("It seems that radar repeatedly crashed your browser. " + a.crashMessage)) : s.put("radarCrashCounter", ++f), d.radar.getColor(), r("radarCalendar"), r("radarAnimation"), r("radarUIloaders"), r("radarCtrl"), r("radarLogos"), r("blitzWebSocket"), r("myLocation"), r("radarInterpolator");
        var p = r("radarAnimation");
        s.remove("radarCrashCounter"), this.onopen = function() {
            a.emit("open"), n.set("isolines", "off")
        }, this.onclose = function() {
            a.emit("close"), t.node.classList.remove("display-more")
        }, a.once("loadedAll", function() {
            "radar" === n.get("overlay") && n.get("radarAnimation") && p.start()
        }), this.onredraw = function() {
            return a.emit("reload")
        }, l.instance({
            el: this.refs.range,
            bindStore: "radarRange"
        }), l.instance({
            el: this.refs.speed,
            bindStore: "radarSpeed"
        }), u.instance({
            el: this.refs.play,
            bindStore: "radarAnimation"
        }), u.instance({
            el: this.refs.location,
            bindStore: "displayLocation"
        }), u.instance({
            el: this.refs.vibrate,
            bindStore: "vibrate"
        });
        var g = o("#radar-blitz");
        g && u.instance({
            el: g,
            bindStore: "blitzOn"
        });
        var v = o("#radar-blitz-sound") || this.refs.sound2;
        v && u.instance({
            el: v,
            bindStore: "blitzSoundOn"
        }), m.instance({
            progressBar: this.refs.bar,
            resizableEl: this.refs.wrapper,
            infoEl: this.refs.info,
            UIident: "radar",
            bindTimestamp: "radarTimestamp",
            bindCalendar: "radarCalendar",
            bindAnimation: "radarAnimation",
            jumpingWidth: 110,
            left: 0,
            _init: function() {
                var t = this;
                this.throttledUpdate = c.throttle.call(this, this.changeText, 500), this.createText = this.getText.bind(this), this.createGhostText = this.getText.bind(this, "ghost"), n.on("radarAnimation", function(e) {
                    return t.jumpingGhost = !e
                }), m._init.call(this)
            },
            changeText: function() {
                this.latestTxt !== this.displayedText && (this.infoEl.textContent = this.latestTxt, this.displayedText = this.latestTxt)
            },
            update: function(e) {
                m.update.call(this, e), this.jumpingGhost ? this.changeText() : this.throttledUpdate()
            },
            onresize: function() {
                i.isMobile || c.replaceClass(/size-\S+/, "size-" + Math.floor(this.width / 100), this.resizableEl), m.onresize.call(this)
            },
            getText: function(e, t) {
                var r = this.pos2ts(t || this.left),
                    a = Date.now() - r,
                    i = Math.floor(a / c.tsHour),
                    n = Math.round(a / c.tsMinute) - 60 * i,
                    s = new Date(r),
                    o = s.getHours(),
                    d = s.getMinutes(),
                    l = this.displayHour(o, d);
                if (isNaN(i) || isNaN(n)) return this.latestTxt = "";
                if ("ghost" === e) return l;
                var u = i ? c.template(h.METARS_H_M_AGO, {
                    DURATION: i,
                    DURATIONM: n
                }) : c.template(h.METAR_MIN_AGO, {
                    DURATION: n
                });
                return this.latestTxt = l + " - " + u, this.latestTxt
            }
        }), this.refs.more && (this.refs.more.onclick = function() {
            return t.el.classList.toggle("display-more")
        }), "embed2" === i.target && (this.refs.embed.href = "https://www.windy.com/-Weather-radar-radar?utm_medium=embed-map&utm_source=" + encodeURIComponent(document.referrer))
    });