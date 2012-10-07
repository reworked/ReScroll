/**
 * ReScroll v1.0
 *
 * Copyright (c) 2012 Thom Engström, http://reworked.org/
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
if(typeof window.ReScroll === 'undefined') {
	var ReScroll = function () {
		var elements,
			that = this,
			msie = navigator.userAgent.match(/MSIE/i) !== null,
			defaults = {
				ease: 'linear',
				units: 'px'
			},

			bind = function (run) {
				var	events = ['scroll', 'resize'],
					attach = 'attachEvent' in window,
					set = run === true ? attach ? window.attachEvent : window.addEventListener : attach ? window.deatachEvent : window.removeEventListener,
					event;

				for(event in events) {
					set(attach ? 'on' + events[event] : events[event], onScroll);
				}
			},

			onScroll = function (e) {
				var a,b,fn,fns,arr,prop,el,plugin,keyframe,keyframes,scrollTop;

				for(a = 0; a < elements.length; a++) {
					arr = [];
					el = elements[a];
					keyframes = el.keyframes;
					scrollTop = msie ? document.documentElement.scrollTop : window.pageYOffset;

					for(b = 0; b < keyframes.length; b++) {
						keyframe = keyframes[b];

						if(keyframe.start <= scrollTop && keyframe.end >= scrollTop) {
							arr.push(keyframe);
						}
					}
					
					keyframes = arr;

					for(b = 0; b < keyframes.length; b++) {
						keyframe = keyframes[b];

						for(plugin in keyframe) {

							if(plugin !== 'start' || plugin !== 'end') {
								fns = that.keyframes[plugin];

								if(fns) {

									for(prop in fns) {
										fn = fns[prop];
										prop = keyframe[plugin][prop];

										if(fn && prop) {
											fn.call(el.element, {
												from: prop.from,
												to: prop.to,
												start: keyframe.start,
												end: keyframe.end,
												newValue: ease(prop.ease || defaults.ease, scrollTop, prop.from, prop.to, keyframe.start, keyframe.end),
												scrollTop: scrollTop,
												unit: prop.unit || defaults.units,
												value: el.value || undefined
											});
										}
									}
								}
							}
						}
					}
				}
			},

			ease = function (ease, scrollTop, from, to, start, end) {
				ease = ease in that.easing ? ease : 'linear';
				return that.easing[ease].call(that, scrollTop - start, from, to - from, end - start);
			};

		this.keyframes = {};

		this.easing = {
			linear: function (t, b, c, d) {
				return c * t / d + b;
			}
		};

		this.setup = function (a, b) {
			if(a && a.elements) {
				elements = a.elements;

				for(b in a) {
					if(b !== 'elements') {
						defaults[b] = a[b];
					}
				}

				return that;

			} else if (Object.prototype.toString.call(a) === '[object Array]') {
				elements = a;
				return that;
			}

			return false;
		};

		this.run = function () {
			if(elements) {
				bind(true);
				onScroll(null);
				return that;
			}

			return false;
		};

		this.extend = function (name, obj, extend) {
			var a, b = name === 'ReScroll.easing', c = b ? that.easing : that.keyframes, d = name in c;

			if(!extend && d) {
				throw new Error('Plugin-name: "'+ name +'" already exists.');
			}

			name = d ? c[name] : (b ? c : c[name] = {} );
			obj = typeof obj === 'function' ? obj() : obj;
			
			for(a in obj) {
				name[a] = obj[a];
			}

			return that;
		};

		this.destroy = function () {
			bind(false);
			return that;
		};

		return this;
	};

	window.ReScroll = new ReScroll();
}