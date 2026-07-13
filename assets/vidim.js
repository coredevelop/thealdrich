function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var vidim$2 = { exports: {} };
var vidim$1 = vidim$2.exports;
var hasRequiredVidim;
function requireVidim() {
  if (hasRequiredVidim) return vidim$2.exports;
  hasRequiredVidim = 1;
  (function(module, exports) {
    (function(global, factory) {
      module.exports = factory();
    })(vidim$1, function() {
      function createCommonjsModule(fn, module2) {
        return module2 = { exports: {} }, fn(module2, module2.exports), module2.exports;
      }
      var componentEmitter = createCommonjsModule(function(module2) {
        {
          module2.exports = Emitter;
        }
        function Emitter(obj) {
          if (obj) return mixin(obj);
        }
        function mixin(obj) {
          for (var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
          }
          return obj;
        }
        Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
          this._callbacks = this._callbacks || {};
          (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
          return this;
        };
        Emitter.prototype.once = function(event, fn) {
          function on() {
            this.off(event, on);
            fn.apply(this, arguments);
          }
          on.fn = fn;
          this.on(event, on);
          return this;
        };
        Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
          this._callbacks = this._callbacks || {};
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }
          var callbacks = this._callbacks["$" + event];
          if (!callbacks) return this;
          if (1 == arguments.length) {
            delete this._callbacks["$" + event];
            return this;
          }
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          if (callbacks.length === 0) {
            delete this._callbacks["$" + event];
          }
          return this;
        };
        Emitter.prototype.emit = function(event) {
          this._callbacks = this._callbacks || {};
          var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
          if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0, len = callbacks.length; i < len; ++i) {
              callbacks[i].apply(this, args);
            }
          }
          return this;
        };
        Emitter.prototype.listeners = function(event) {
          this._callbacks = this._callbacks || {};
          return this._callbacks["$" + event] || [];
        };
        Emitter.prototype.hasListeners = function(event) {
          return !!this.listeners(event).length;
        };
      });
      function setDefaults(object, defaults) {
        var defaultsKeys = Object.keys(defaults);
        defaultsKeys.forEach(function(key) {
          if (!object.hasOwnProperty(key)) {
            object[key] = defaults[key];
          }
        });
      }
      function getElement(query) {
        var parent = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : document;
        if ("string" === typeof query) {
          return parent.querySelector(query);
        }
        return query;
      }
      function throttle(func, wait) {
        var timeout, context, args, result;
        var previous = 0;
        var later = function later2() {
          previous = Date.now();
          timeout = null;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        };
        var throttled = function throttled2() {
          var now = Date.now();
          if (!previous) previous = now;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          } else if (!timeout) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
        throttled.cancel = function() {
          clearTimeout(timeout);
          previous = 0;
          timeout = context = args = null;
        };
        return throttled;
      }
      function ready(fn) {
        if (document.readyState != "loading") {
          fn();
        } else {
          document.addEventListener("DOMContentLoaded", fn);
        }
      }
      var utility = Object.freeze({
        setDefaults,
        getElement,
        throttle,
        ready
      });
      var html5Provider = function(vidim2) {
        var defaults = {
          preload: "auto"
        };
        var vidimHTML5Provider = {
          /**
           * Initial provider setup
           */
          _initializeProvider: function _initializeProvider() {
            setDefaults(this._options, defaults);
            this._constructPlayer();
            this._dispatch();
            this._listen();
          },
          /**
           * Sets up the actual player
           */
          _constructPlayer: function _constructPlayer() {
            this.el = document.createElement("video");
            this.el.setAttribute("playsinline", "");
            if (this._options.loop) {
              this.el.setAttribute("loop", "");
            }
            if (this._options.autoplay) {
              this.el.setAttribute("autoplay", "");
            }
            if (this._options.preload) {
              this.el.setAttribute("preload", this._options.preload);
            }
            if (this._options.muted) {
              this.el.muted = true;
            }
            this.el.style.position = "absolute";
            this.el.style.left = "50%";
            this.el.style.top = "50%";
            this.el.style.transform = "translate(-50%, -50%)";
            this.el.style.webkitTransform = "translate(-50%, -50%)";
            this.el.style.msTransform = "translate(-50%, -50%)";
            this.el.style.oTransform = "translate(-50%, -50%)";
            this.el.style.mozTransform = "translate(-50%, -50%)";
            this.el.style.minWidth = "calc( 100% + 2px )";
            this.el.style.minHeight = "calc( 100% + 2px )";
            this.el.style.opacity = "0";
            var src = this._options.src;
            if (src.length && "string" !== typeof src) {
              for (var i = 0; i < src.length; i++) {
                var source = document.createElement("source");
                source.setAttribute("type", src[i].type);
                source.setAttribute("src", src[i].src);
                this.el.appendChild(source);
              }
            }
            this.wrapper.appendChild(this.el);
            if (this._options.startAt) {
              this.el.currentTime = this._options.startAt;
            }
            if ("function" === typeof this._options.onReady) {
              this._options.onReady(this);
            }
            this.emit("ready");
            this._constructOverlay();
            this.resize();
          },
          /**
           * Dispatches normalized events
           */
          _dispatch: function _dispatch() {
            var _this = this;
            this.el.addEventListener("play", function() {
              _this.emit("play", _this);
            }, false);
            this.el.addEventListener("pause", function() {
              _this.emit("pause", _this);
            }, false);
            this.el.addEventListener("ended", function() {
              _this.emit("end", _this);
            }, false);
            this.el.addEventListener("canplay", function() {
              _this.emit("canplay", _this);
            }, false);
            this.el.addEventListener("canplaythrough", function() {
              _this.emit("canplaythrough", _this);
            }, false);
          },
          /**
           * Any event listeners that are important to this provider
           */
          _listen: function _listen() {
            var _this2 = this;
            this.on("play", function() {
              _this2.el.style.opacity = "1";
            });
            if (!this._options.showPosterBeforePlay) {
              this.once("play", function() {
                _this2.wrapper.style.backgroundImage = "url('" + _this2._options.poster + "')";
              });
            }
            if (this._options.showPosterOnEnd) {
              this.on("end", function() {
                _this2.el.style.opacity = "0";
              });
            }
            if (this._options.showPosterOnPause) {
              this.on("pause", function() {
                _this2.el.style.opacity = "0";
              });
            }
          },
          /**
           * Starts the video playback
           */
          play: function play() {
            this.el.play();
            return this;
          },
          /**
           * Pauses the video playback
           */
          pause: function pause() {
            this.el.pause();
            return this;
          },
          /**
           * Sets the player volume
           * @param {Number} [volume=100] Min = 0, Max = 100
           */
          setVolume: function setVolume() {
            var volume = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
            this.el.volume = parseFloat(volume / 100);
            return this;
          },
          /**
           * Gets the player volume
           * @returns {Number} Current player volume
           */
          getVolume: function getVolume() {
            return this.el.volume * 100;
          },
          /**
           * Mutes the player
           */
          mute: function mute() {
            this.el.muted = true;
            return this;
          },
          /**
           * Unmutes the server
           */
          unMute: function unMute() {
            this.el.muted = false;
            return this;
          },
          /**
           * Sets the time player should seek to
           * @param {Number} [time=0] Amount of seconds in the video to seek to
           */
          setTime: function setTime() {
            var time = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
            this.el.currentTime = time;
            return this;
          },
          /**
           * Gets the time video playback is currently at
           * @returns {Number} Number of seconds from start to the current position
           */
          getTime: function getTime() {
            return this.el.currentTime;
          },
          /**
           * Gets video duration in seconds
           * @returns {Number} Length of the video in seconds
           */
          getDuration: function getDuration() {
            return this.el.duration;
          },
          /**
           * Hides the media and shows the poster behind it
           */
          showPoster: function showPoster() {
            this.pause().el.style.opacity = "0";
          },
          /**
           * Changes the source of the current video
           * @param {Object} src Hash of video types and sources
           */
          changeSource: function changeSource(src) {
            var newPoster = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
            this.el.innerHTML = "";
            if (src.length && "string" !== typeof src) {
              for (var i = 0; i < src.length; i++) {
                var source = document.createElement("source");
                source.setAttribute("type", src[i].type);
                source.setAttribute("src", src[i].src);
                this.el.appendChild(source);
              }
            }
            this.el.load && this.el.load();
            if (this._options.startAt) {
              this.el.currentTime = this._options.startAt;
            }
            if (newPoster) {
              var oldPoster = this._options.poster;
              if (-1 !== this.wrapper.style.backgroundImage.indexOf(oldPoster)) {
                this.wrapper.style.backgroundImage = "url('" + newPoster + "')";
              }
              this._options.poster = newPoster;
            }
          },
          /**
           * Destroys and unloads the player
           */
          destroy: function destroy() {
            this.emit("destroy");
            this.el.pause && this.el.pause();
            this.el.src = "";
            this.el.load && this.el.load();
            try {
              this.wrapper.parentNode.removeChild(this.wrapper);
            } catch (e) {
            }
            vidim2.deleteInstance(this.vidimID);
            delete this.container.vidimID;
            this.off();
          },
          /**
           * Resizes the player to provide the best viewing experience
           */
          resize: function resize() {
            if (!this.el) {
              return;
            }
            var containerHeight = this.container.offsetHeight, containerWidth = this.container.offsetWidth;
            if ("BODY" === this.container.nodeName) {
              containerWidth = window.innerWidth;
              containerHeight = window.innerHeight;
            }
            if (1 < this._options.ratio && containerWidth / containerHeight < this._options.ratio || 1 > this._options.ratio && containerHeight / containerWidth < this._options.ratio) {
              this.el.style.maxHeight = "calc( 100% + 2px )";
              this.el.style.maxWidth = "";
            } else {
              this.el.style.maxHeight = "";
              this.el.style.maxWidth = "calc( 100% + 2px )";
            }
            this.emit("resize");
          }
        };
        vidim2.registerProvider("HTML5", vidimHTML5Provider);
      };
      var YouTubeProvider = function(vidim2) {
        var defaults = {
          quality: "hd1080"
        };
        var vidimYouTubeProvider = {
          /**
           * Initial provider setup
           */
          _initializeProvider: function _initializeProvider() {
            {
              setDefaults(this._options, defaults);
              this._constructPlayer();
              this._listen();
            }
          },
          /**
           * Sets up the actual player
           */
          _constructPlayer: function _constructPlayer() {
            var _this2 = this;
            if (11 === this._options.src.length) {
              this.videoID = this._options.src;
            } else {
              var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
              var videoMatch = this._options.src.match(regex);
              if (!videoMatch || 11 !== videoMatch[2].length) {
                return new Error("Provided source is not a valid YouTube url");
              }
              this.videoID = videoMatch[2];
            }
            var toBeReplaced = document.createElement("div");
            this.wrapper.appendChild(toBeReplaced);
            var playerParams = {
              videoId: this.videoID,
              playerVars: {
                allowfullscreen: false,
                controls: 0,
                enablejsapi: 1,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                origin: typeof window.location.origin !== "undefined" ? window.location.origin : window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""),
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                start: this._options.startAt,
                autoplay: +this._options.autoplay
              },
              events: {
                "onReady": function onReady() {
                  if (_this2._options.muted) {
                    _this2.mute();
                  }
                  _this2.player.setPlaybackQuality(_this2._options.quality);
                  if ("function" === typeof _this2._options.onReady) {
                    _this2._options.onReady(_this2);
                  }
                  _this2.emit("ready");
                  if (_this2._options.loop) {
                    var loopInterval = void 0;
                    _this2.on("play", function() {
                      loopInterval = setInterval(function() {
                        if (_this2.getTime() === 0 || _this2.getTime() + 0.15 > _this2.getDuration()) {
                          _this2.setTime(0);
                          _this2.play();
                        }
                      }, 100);
                    });
                    _this2.on("pause", function() {
                      clearInterval(loopInterval);
                    });
                    _this2.on("destroy", function() {
                      clearInterval(loopInterval);
                    });
                  }
                },
                "onStateChange": function onStateChange(e) {
                  switch (e.data) {
                    case 0:
                      _this2.emit("end", _this2);
                      break;
                    case 1:
                      _this2.emit("play", _this2);
                      break;
                    case 2:
                      _this2.emit("pause", _this2);
                      break;
                    case 3:
                      _this2.emit("buffering", _this2);
                      break;
                  }
                }
              }
            };
            if (this._options.loop) {
              playerParams.playerVars.playlist = this.videoID;
              playerParams.playerVars.loop = 1;
            }
            this.player = new YT.Player(toBeReplaced, playerParams);
            this.el = this.player.getIframe();
            this.el.style.position = "absolute";
            this.el.style.left = "50%";
            this.el.style.top = "50%";
            this.el.style.transform = "translate(-50%, -50%)";
            this.el.style.webkitTransform = "translate(-50%, -50%)";
            this.el.style.msTransform = "translate(-50%, -50%)";
            this.el.style.oTransform = "translate(-50%, -50%)";
            this.el.style.mozTransform = "translate(-50%, -50%)";
            this.el.style.minWidth = "calc( 100% + 2px )";
            this.el.style.minHeight = "calc( 100% + 2px )";
            this.el.style.opacity = "0";
            this._constructOverlay();
            this.resize();
          },
          /**
           * Any event listeners that are important to this provider
           */
          _listen: function _listen() {
            var _this3 = this;
            this.on("play", function() {
              _this3.el.style.opacity = "1";
            });
            if (!this._options.showPosterBeforePlay) {
              this.once("play", function() {
                _this3.wrapper.style.backgroundImage = "url('" + _this3._options.poster + "')";
              });
            }
            if (this._options.showPosterOnEnd) {
              this.on("end", function() {
                _this3.el.style.opacity = "0";
              });
            } else {
              this.on("end", function() {
                _this3.player.seekTo(_this3.player.getDuration());
                _this3.player.playVideo();
                _this3.player.pauseVideo();
              });
            }
            if (this._options.showPosterOnPause) {
              this.on("pause", function() {
                _this3.el.style.opacity = "0";
              });
            }
          },
          /**
           * Starts the video playback
           */
          play: function play() {
            this.player.playVideo();
            return this;
          },
          /**
           * Pauses the video playback
           */
          pause: function pause() {
            this.player.pauseVideo();
            return this;
          },
          /**
           * Sets the player volume
           * @param {Number} [volume=100] Min = 0, Max = 100
           */
          setVolume: function setVolume() {
            var volume = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
            this.player.setVolume(volume);
            return this;
          },
          /**
           * Gets the player volume
           * @returns {Number} Current player volume
           */
          getVolume: function getVolume() {
            return this.getVolume();
          },
          /**
           * Mutes the player
           */
          mute: function mute() {
            this.player.mute();
            return this;
          },
          /**
           * Unmutes the server
           */
          unMute: function unMute() {
            this.player.unMute();
            return this;
          },
          /**
           * Sets the time player should seek to
           * @param {Number} [time=0] Amount of seconds in the video to seek to
           */
          setTime: function setTime() {
            var time = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
            this.player.seekTo(time, true);
            return this;
          },
          /**
           * Gets the time video playback is currently at
           * @returns {Number} Number of seconds from start to the current position
           */
          getTime: function getTime() {
            return this.player.getCurrentTime();
          },
          /**
           * Gets video duration in seconds
           * @returns {Number} Length of the video in seconds
           */
          getDuration: function getDuration() {
            return this.player.getDuration();
          },
          /**
           * Hides the media and shows the poster behind it
           */
          showPoster: function showPoster() {
            this.pause().el.style.opacity = "0";
          },
          /**
           * Changes the source of the current video
           * @param {Object} src Hash of video types and sources
           */
          changeSource: function changeSource(src) {
            var newPoster = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
            if (11 === src.length) {
              this.videoID = src;
            } else {
              var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
              var videoMatch = src.match(regex);
              if (!videoMatch || 11 !== videoMatch[2].length) {
                return new Error("Provided source is not a valid YouTube url");
              }
              this.videoID = videoMatch[2];
            }
            this.player.loadPlaylist(this.videoID, 0, this._options.startAt, this._options.quality);
            this.player.setLoop(this._options.loop);
            if (newPoster) {
              var oldPoster = this._options.poster;
              if (-1 !== this.wrapper.style.backgroundImage.indexOf(oldPoster)) {
                this.wrapper.style.backgroundImage = "url('" + newPoster + "')";
              }
              this._options.poster = newPoster;
            }
          },
          /**
           * Destroys and unloads the player
           */
          destroy: function destroy() {
            this.emit("destroy");
            this.player.destroy();
            try {
              this.wrapper.parentNode.removeChild(this.wrapper);
            } catch (e) {
            }
            vidim2.deleteInstance(this.vidimID);
            delete this.container.vidimID;
            this.off();
          },
          /**
           * Resizes the player to provide the best viewing experience
           */
          resize: function resize() {
            if (!this.el) {
              return;
            }
            var containerHeight = this.container.offsetHeight, containerWidth = this.container.offsetWidth;
            if ("BODY" === this.container.nodeName) {
              containerWidth = window.innerWidth;
              containerHeight = window.innerHeight;
            }
            if (1 < this._options.ratio && containerWidth / containerHeight < this._options.ratio || 1 > this._options.ratio && containerHeight / containerWidth < this._options.ratio) {
              this.el.style.maxHeight = "calc( 100% + 2px )";
              this.el.style.maxWidth = "";
              this.el.style.height = "";
              this.el.style.width = this.el.offsetHeight * this._options.ratio + 200 + "px";
            } else {
              this.el.style.maxHeight = "";
              this.el.style.maxWidth = "calc( 100% + 2px )";
              this.el.style.height = this.el.offsetWidth / this._options.ratio + "px";
              this.el.style.width = "";
              if (this.el.offsetHeight < this.wrapper.offsetHeight + 140) {
                this.el.style.height = this.el.offsetWidth / this._options.ratio + 140 + "px";
              }
            }
            this.emit("resize");
          }
        };
        vidim2.registerProvider("YouTube", vidimYouTubeProvider);
      };
      var index = function factory(global) {
        if ("undefined" === typeof global.document) {
          return;
        }
        var ID = 0;
        var instances = {};
        var defaults = {
          wrapperClass: "",
          overlayClass: "",
          src: false,
          type: "HTML5",
          ratio: 1.7778,
          autoplay: true,
          loop: true,
          poster: "",
          showPosterBeforePlay: true,
          showPosterOnEnd: false,
          showPosterOnPause: false,
          zIndex: 0,
          autoResize: true,
          muted: true,
          startAt: 0,
          onReady: false
        };
        var optionsProvided = [];
        var providers = {};
        function registerProvider(type, provider) {
          if ("function" === typeof provider) {
            providers[type] = provider.call(global, defaults);
          } else {
            providers[type] = provider;
          }
        }
        function getInstanceFromID(id) {
          if (!instances[id]) {
            return null;
          }
          return instances[id];
        }
        function getInstanceFromElement(element) {
          element = getElement(element);
          if ("undefined" === typeof element.vidimID || !instances[element.vidimID]) {
            return null;
          }
          return instances[element.vidimID];
        }
        function destroyAllInstances() {
          for (var key in instances) {
            instances[key].hasOwnProperty("destroy") && instances[key].destroy();
          }
          instances = {};
        }
        function deleteInstance(id) {
          delete instances[id];
        }
        function scanDOM() {
          var vidimElements = document.querySelectorAll("[data-vidim]");
          if (!vidimElements.length) {
            return;
          }
          for (var i = 0; i < vidimElements.length; i++) {
            var element = vidimElements[i];
            var options = element.getAttribute("data-vidim");
            if ("undefined" !== typeof element.vidimID) {
              continue;
            }
            try {
              var regex = /({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;
              var fixedOptions = options.replace(regex, '$1"$2":').replace(/:\s?'/g, ':"').replace(/'\s?}/g, '"}').replace(/',"/g, '","');
              var parsedOptions = JSON.parse(fixedOptions);
              new vidim2(element, parsedOptions);
            } catch (e) {
            }
          }
        }
        function vidim2(element) {
          var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          Object.keys(options).forEach(function(key) {
            optionsProvided.push(key);
          });
          setDefaults(options, defaults);
          if (options.src && !providers[options.type]) {
            return new Error("No provider can handle type: '" + options.type + "'");
          }
          if ("string" === typeof options.ratio) {
            if ("4/3" === options.ratio) {
              options.ratio = 4 / 3;
            } else {
              options.ratio = 16 / 9;
            }
          }
          this._options = options;
          this.container = getElement(element);
          if (!this.container) {
            return new Error("Could not find the container: " + element);
          }
          if (-1 === optionsProvided.indexOf("zIndex") && "BODY" === this.container.nodeName) {
            this._options.zIndex = -1;
          }
          this._initialize();
        }
        var prototype = vidim2.prototype;
        prototype._initialize = function() {
          this.vidimID = ID++;
          this.container.vidimID = this.vidimID;
          instances[this.vidimID] = this;
          componentEmitter(this);
          if (!this._options.src && this._options.poster) {
            this._constructWrapper();
            this.destroy = function() {
              this.emit("destroy");
              try {
                this.wrapper.parentNode.removeChild(this.wrapper);
              } catch (e) {
              }
              vidim2.deleteInstance(this.vidimID);
              delete this.container.vidimID;
              this.off();
            };
            return;
          }
          var provider = providers[this._options.type];
          for (var key in provider) {
            this[key] = provider[key];
          }
          if ("function" !== typeof this._initializeProvider) {
            return new Error("Provider is missing method: _initializeProvider");
          }
          this._constructWrapper();
          this._initializeProvider();
          if (this._options.autoResize) {
            window.addEventListener("resize", throttle(this.resize, 200).bind(this), false);
          }
          this.resize();
        };
        prototype._constructWrapper = function() {
          var containerStyle = getComputedStyle(this.container, null);
          if ("static" === containerStyle.getPropertyValue("position")) {
            this.container.style.position = "relative";
          }
          this.wrapper = document.createElement("div");
          if ("BODY" === this.container.nodeName) {
            this.wrapper.style.position = "fixed";
          } else {
            this.wrapper.style.position = "absolute";
          }
          if (this._options.wrapperClass) {
            if ("function" === typeof this._options.wrapperClass) {
              this.wrapper.classList.add(this._options.wrapperClass.call(this));
            } else {
              this.wrapper.classList.add(this._options.wrapperClass);
            }
          }
          this.wrapper.style.left = 0;
          this.wrapper.style.top = 0;
          this.wrapper.style.height = "100%";
          this.wrapper.style.width = "100%";
          this.wrapper.style.overflow = "hidden";
          this.wrapper.style.zIndex = parseInt(this._options.zIndex, 10);
          if (this._options.poster) {
            this.wrapper.style.backgroundSize = "cover";
            this.wrapper.style.backgroundPosition = "center center";
            this.wrapper.style.backgroundRepear = "no-repeat";
            if (this._options.showPosterBeforePlay) {
              this.wrapper.style.backgroundImage = "url('" + this._options.poster + "')";
            }
          }
          this.container.insertBefore(this.wrapper, this.container.firstChild);
        };
        prototype._constructOverlay = function() {
          this.overlay = document.createElement("div");
          this.overlay.style.position = "absolute";
          if (this._options.overlayClass) {
            if ("function" === typeof this._options.overlayClass) {
              this.overlay.classList.add(this._options.overlayClass.call(this));
            } else {
              this.overlay.classList.add(this._options.overlayClass);
            }
          }
          this.overlay.style.left = 0;
          this.overlay.style.top = 0;
          this.overlay.style.height = "100%";
          this.overlay.style.width = "100%";
          this.wrapper.appendChild(this.overlay);
        };
        vidim2.getInstanceFromID = getInstanceFromID;
        vidim2.getInstanceFromElement = getInstanceFromElement;
        vidim2.registerProvider = registerProvider;
        vidim2.destroyAllInstances = destroyAllInstances;
        vidim2.deleteInstance = deleteInstance;
        vidim2.utility = utility;
        vidim2.scanDOM = scanDOM;
        html5Provider(vidim2);
        YouTubeProvider(vidim2);
        ready(scanDOM);
        return vidim2;
      }("undefined" !== typeof window ? window : void 0);
      return index;
    });
  })(vidim$2);
  return vidim$2.exports;
}
var vidimExports = requireVidim();
const vidim = /* @__PURE__ */ getDefaultExportFromCjs(vidimExports);
export {
  vidim as v
};
