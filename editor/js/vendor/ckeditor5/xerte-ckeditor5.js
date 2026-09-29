/**
 * @license Apache-2.0
 * jQuery bridge and config helpers for CKEditor 5 (GPL-2.0+ — see LICENSE-NOTICE.txt).
 */
(function (window, $) {
	'use strict';
	var bridgeScript = document.currentScript;
	var languageAssetBase = bridgeScript && bridgeScript.src ?
		bridgeScript.src.replace(/xerte-ckeditor5\.js(?:\?.*)?$/, '') : 'editor/js/vendor/ckeditor5/';

	window.__xerteCke5Instances = window.__xerteCke5Instances || {};
	window.__xerteCke5Shims = window.__xerteCke5Shims || {};
	/** Maps editor id → textarea element the instance was created on (detect stale reuse after wizard DOM rebuild). */
	window.__xerteCke5SourceElements = window.__xerteCke5SourceElements || {};
	window.__xerteCke5InlineCssInjected = window.__xerteCke5InlineCssInjected || false;
	window.__xerteCke5UiCssInjected = window.__xerteCke5UiCssInjected || false;

	function ensureLegacyCkeditorGlobal() {
		if (window.CKEDITOR && window.CKEDITOR.instances) {
			return;
		}
		var cke = window.CKEDITOR || {};
		cke.instances = window.__xerteCke5Shims;
		cke.on = cke.on || function () {
			// CKEditor 4 global events are not available in CKEditor 5.
		};
			cke.remove = cke.remove || function (id) {
				var shim = window.__xerteCke5Shims[id];
				if (shim && shim.destroy) {
					return shim.destroy();
				}
				var nativeEd = window.__xerteCke5Instances[id];
				if (nativeEd && nativeEd.destroy) {
					return nativeEd.destroy().then(function () {
						if (window.__xerteCke5Instances[id] !== nativeEd) {
							return;
						}
						delete window.__xerteCke5Instances[id];
						delete window.__xerteCke5Shims[id];
						delete window.__xerteCke5SourceElements[id];
					});
				}
				delete window.__xerteCke5Instances[id];
				delete window.__xerteCke5Shims[id];
				delete window.__xerteCke5SourceElements[id];
			};
		window.CKEDITOR = cke;
	}
	ensureLegacyCkeditorGlobal();

	function browseUrl(type) {
		var u = typeof rlourlvariable !== 'undefined' ? rlourlvariable : '';
		if (u.length > 0 && u.charAt(u.length - 1) === '/') {
			u = u.substr(0, u.length - 1);
		}
		return 'editor/elfinder/browse.php?mode=cke5&type=' + type +
			'&uploadDir=' + encodeURIComponent(typeof rlopathvariable !== 'undefined' ? rlopathvariable : '') +
			'&uploadURL=' + encodeURIComponent(u);
	}

	/** CKEditor 4 browse URLs use mode=cke; CKEditor 5 needs mode=cke5 (__xerteCke5FilePickerResolve). */
	function browseUrlForCke5(url) {
		if (!url || typeof url !== 'string') {
			return url;
		}
		return url.replace(/([?&])mode=cke\b(?=&|$)/gi, '$1mode=cke5');
	}

	function defaultUploadUrl() {
		var u = typeof rlourlvariable !== 'undefined' ? rlourlvariable : '';
		if (u.length > 0 && u.charAt(u.length - 1) === '/') {
			u = u.substr(0, u.length - 1);
		}
		return 'editor/uploadImage.php?mode=dragdrop&uploadPath=' +
			encodeURIComponent(typeof rlopathvariable !== 'undefined' ? rlopathvariable : '') +
			'&uploadURL=' + encodeURIComponent(u);
	}

	function defaultUploadAudioUrl() {
		var u = typeof rlourlvariable !== 'undefined' ? rlourlvariable : '';
		if (u.endsWith('/')) u = u.slice(0, -1);
		return 'editor/uploadAudio.php?mode=record&uploadPath=' +
			encodeURIComponent(typeof rlopathvariable !== 'undefined' ? rlopathvariable : '') +
			'&uploadURL=' + encodeURIComponent(u);
	}

	function selectedLanguageCode() {
		if (typeof language !== 'undefined' && language && language.$code) {
			return String(language.$code).toLowerCase().split(/[-_]/)[0];
		}
		return 'en';
	}

	window.__xerteCke5LanguagePromises = window.__xerteCke5LanguagePromises || {};
	function loadOptionalLanguageScript(key, url) {
		if (window.__xerteCke5LanguagePromises[key]) {
			return window.__xerteCke5LanguagePromises[key];
		}
		window.__xerteCke5LanguagePromises[key] = new Promise(function (resolve) {
			var script = document.createElement('script');
			script.src = url;
			script.onload = function () { resolve(true); };
			script.onerror = function () { resolve(false); };
			document.head.appendChild(script);
		});
		return window.__xerteCke5LanguagePromises[key];
	}

	function loadSelectedLanguages(lang) {
		if (lang === 'en') {
			return Promise.resolve({ requestedLanguage: lang, uiLanguage: lang });
		}
		return Promise.all([
			loadOptionalLanguageScript('ckeditor:' + lang,
				languageAssetBase + 'translations/' + lang + '.js'),
			loadOptionalLanguageScript('xerte:' + lang,
				languageAssetBase + 'lang/' + lang + '.js')
		]).then(function (loaded) {
			return {
				requestedLanguage: lang,
				uiLanguage: loaded[0] ? lang : 'en'
			};
		});
	}

	function mapLegacyToolbarItem(item) {
		var map = {
			Undo: 'undo',
			Redo: 'redo',
			Find: 'findAndReplace',
			Replace: 'findAndReplace',
			Sourcedialog: 'sourceEditing',
			Source: 'sourceEditing',
			Format: 'heading',
			Font: 'fontFamily',
			FontSize: 'fontSize',
			LineHeight: 'lineHeight',
			lineheight: 'lineHeight',
			lineHeight: 'lineHeight',
			Language: 'textPartLanguage',
			TextColor: 'fontColor',
			BGColor: 'fontBackgroundColor',
			Bold: 'bold',
			Italic: 'italic',
			Underline: 'underline',
			Strike: 'strikethrough',
			Subscript: 'subscript',
			Superscript: 'superscript',
			CodeSnippet: 'codeBlock',
			RemoveFormat: 'removeFormat',
			SpecialChar: 'specialCharacters',
			FontAwesome: 'fontAwesome',
			HorizontalRule: 'horizontalLine',
			Mathjax: 'xerteMathJax',
			Link: 'link',
			xotlink: 'xotlink',
			Image: 'insertImage',
			Table: 'insertTable',
			MediaEmbed: 'mediaEmbed',
			NumberedList: 'numberedList',
			BulletedList: 'bulletedList',
			Outdent: 'outdent',
			Indent: 'indent',
			xotMarkWord: 'xotMarkWord',
			Mark: 'markTag',
			markTag: 'markTag'
		};
		return map[item] || null;
	}

	function normalizeToolbar(toolbar) {
		if (!toolbar) {
			return null;
		}
		if (!Array.isArray(toolbar) && toolbar.items && Array.isArray(toolbar.items)) {
			return toolbar;
		}
		if (Array.isArray(toolbar) && toolbar.length && typeof toolbar[0] === 'string') {
			return toolbar;
		}
		var flat = [];
		function pushMapped(raw) {
			var mapped = mapLegacyToolbarItem(String(raw));
			if (mapped && flat.indexOf(mapped) === -1) {
				flat.push(mapped);
			}
		}
		if (Array.isArray(toolbar)) {
			for (var i = 0; i < toolbar.length; i++) {
				var group = toolbar[i];
				if (Array.isArray(group)) {
					for (var j = 0; j < group.length; j++) {
						pushMapped(group[j]);
					}
					if (i < toolbar.length - 1 && flat.length && flat[flat.length - 1] !== '|') {
						flat.push('|');
					}
				} else if (group && group.items && Array.isArray(group.items)) {
					for (var k = 0; k < group.items.length; k++) {
						pushMapped(group.items[k]);
					}
				}
			}
		}
		while (flat.length && flat[flat.length - 1] === '|') {
			flat.pop();
		}
		return flat.length ? { items: flat, shouldNotGroupWhenFull: false } : null;
	}

	function mergeEditorConfig(user, loadedLanguages) {
		user = user || {};
		var requestedLang = loadedLanguages && loadedLanguages.requestedLanguage || selectedLanguageCode();
		var lang = loadedLanguages && loadedLanguages.uiLanguage || requestedLang;
		var base = {
			language: {
				ui: lang,
				content: lang,
				textPartLanguage: [
					{ title: 'English', languageCode: 'en' },
					{ title: 'Dutch', languageCode: 'nl' },
					{ title: 'German', languageCode: 'de' },
					{ title: 'French', languageCode: 'fr' },
					{ title: 'Spanish', languageCode: 'es' },
					{ title: 'Arabic', languageCode: 'ar', textDirection: 'rtl' },
					{ title: 'Hebrew', languageCode: 'he', textDirection: 'rtl' }
				]
			},
			xerteUploadUrl: user.uploadUrl || defaultUploadUrl(),
			xerteUploadAudioUrl: user.uploadAudioUrl || defaultUploadAudioUrl(),
			xerteBrowseMediaUrl: user.browseMediaUrl || browseUrlForCke5(user.filebrowserBrowseUrl) || browseUrl('media')
		};
		if (user.toolbar) {
			var toolbar = normalizeToolbar(user.toolbar);
			if (toolbar) {
				base.toolbar = toolbar;
			}
		}
		if (user.height) {
			base.height = user.height;
		}
		if (user.editorplaceholder) {
			base.placeholder = user.editorplaceholder;
		}
		if (user.inlineEditor) {
			base.menuBar = { isVisible: false };
		}
		var skip = { uploadUrl: 1, uploadAudioUrl: 1, filebrowserBrowseUrl: 1, filebrowserImageBrowseUrl: 1,
			filebrowserFlashBrowseUrl: 1, browseMediaUrl: 1, browseImageUrl: 1, toolbar: 1, height: 1,
			startupMode: 1, codemirror: 1, extraAllowedContent: 1, editorplaceholder: 1, toolbarStartupExpanded: 1,
			mathJaxClass: 1, mathJaxLib: 1, toolbarGroups: 1, autoUpdateElement: 1, removePlugins: 1, extraPlugins: 1,
			inlineEditor: 1 };
		for (var k in user) {
			if (user.hasOwnProperty(k) && !skip[k]) {
				base[k] = user[k];
			}
		}
		return base;
	}

	function applyEditableHeight(editor, px) {
		if (!px || !editor || !editor.ui) {
			return;
		}
		var v = editor.ui.view;
		var el = v && v.editable && v.editable.element;
		if (el) {
			el.style.minHeight = parseInt(px, 10) + 'px';
		}
	}

	function stabilizeEditorLayout(editor, domEl, userConfig, initialMetrics) {
		if (!editor || !editor.ui || !editor.ui.view) {
			return;
		}
		var root = editor.ui.view.element;
		var editable = editor.ui.view.editable && editor.ui.view.editable.element;
		if (root) {
			root.style.display = 'block';
			root.style.width = '100%';
			root.style.maxWidth = '100%';
			root.style.boxSizing = 'border-box';
		}
		if (editable) {
			editable.style.width = '100%';
			editable.style.boxSizing = 'border-box';
		}
		var sourceHeight = 0;
		if (userConfig && userConfig.height) {
			sourceHeight = parseInt(userConfig.height, 10) || 0;
		}
		if (!sourceHeight && initialMetrics && initialMetrics.height) {
			sourceHeight = parseInt(initialMetrics.height, 10) || 0;
		}
		if (!sourceHeight) {
			if (domEl && domEl.style && domEl.style.height) {
				sourceHeight = parseInt(domEl.style.height, 10) || 0;
			}
			if (!sourceHeight && $ && domEl) {
				sourceHeight = parseInt($(domEl).height(), 10) || 0;
			}
		}
		if (sourceHeight > 0 && editable) {
			editable.style.minHeight = sourceHeight + 'px';
			editable.style.height = sourceHeight + 'px';
			editable.style.overflowY = 'auto';
		}
		if (root) {
			// The wizard panel is resizable. A pixel min-width captured before CKEditor
			// replaces the textarea prevents the editor (and its table cell) shrinking.
			root.style.minWidth = '0';
			var updateToolbarPanelWidth = function () {
				var width = Math.floor(root.getBoundingClientRect().width);
				if (width > 0) {
					root.style.setProperty('--xerte-editor-width', width + 'px');
					// CKEditor's grouping engine listens to maxWidth changes directly.
					// Setting it on the ToolbarView makes the three-dot (extended toolbar options) calculation use
					// the middle-pane width instead of the toolbar's intrinsic width.
					var toolbar = editor.ui && editor.ui.view && editor.ui.view.toolbar;
					if (toolbar) {
						toolbar.maxWidth = width + 'px';
					}
				}
			};
			updateToolbarPanelWidth();
			if (window.ResizeObserver) {
				editor.__xerteToolbarResizeObserver = new ResizeObserver(updateToolbarPanelWidth);
				editor.__xerteToolbarResizeObserver.observe(root);
			}
		}
	}

	function setupInlineToolbarVisibility(editor) {
		if (!editor || !editor.ui || !editor.ui.view) {
			return;
		}
		var toolbarEl = editor.ui.view.toolbar && editor.ui.view.toolbar.element;
		var menuBarEl = editor.ui.view.menuBarView && editor.ui.view.menuBarView.element;
		if (menuBarEl) {
			menuBarEl.style.display = 'none';
		}
		if (!toolbarEl) {
			return;
		}
		toolbarEl.style.display = 'none';
		toolbarEl.style.position = 'relative';
		toolbarEl.style.zIndex = '2';

		var tracker = editor.ui.focusTracker;
		if (tracker && typeof tracker.on === 'function') {
			tracker.on('change:isFocused', function (evt, name, isFocused) {
				toolbarEl.style.display = isFocused ? '' : 'none';
			});
		}
	}

	function applyToolbarPreference(editor, show) {
		if (!editor || !editor.ui || !editor.ui.view) {
			return;
		}
		var stickyPanel = editor.ui.view.stickyPanel;
		if (stickyPanel && stickyPanel.element) {
			stickyPanel.element.style.display = show ? '' : 'none';
			if (show && editor.ui.view.toolbar) {
				window.requestAnimationFrame(function () {
					editor.ui.view.toolbar.fire('change:maxWidth');
				});
			}
		}
	}

	function ensureInlineEditorCssOverrides() {
		if (window.__xerteCke5InlineCssInjected) {
			return;
		}
		var css = ''
			+ '.ck.ck-editor__editable_inline > :first-child{margin-top:0!important;}'
			+ '.ck.ck-editor__editable_inline > :last-child{margin-bottom:0!important;}'
			+ '.ck.ck-editor__editable_inline{padding:0!important;}';
		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
		window.__xerteCke5InlineCssInjected = true;
	}

	function ensureEditorUiCssOverrides() {
		if (window.__xerteCke5UiCssInjected) {
			return;
		}
		// Keep CKEditor 5 UI constrained to container width (prevents toolbar going off-screen).
		var css = ''
			+ '.ck.ck-editor{width:100%!important;min-width:0!important;max-width:100%!important;}'
			+ '.ck.ck-editor__top{width:100%!important;min-width:0!important;max-width:100%!important;overflow:visible!important;}'
			+ '.ck.ck-editor__top,.ck.ck-editor__top *{box-sizing:border-box;}'
			+ '.ck.ck-editor__top .ck-sticky-panel{width:100%!important;min-width:0!important;max-width:100%!important;}'
			// Use the measured editor width rather than a percentage. Once this panel
			// becomes position:fixed, percentage widths are relative to the viewport.
			+ '.ck.ck-editor__top .ck-sticky-panel__content{width:var(--xerte-editor-width,100%)!important;min-width:0!important;max-width:calc(100vw - 24px)!important;box-sizing:border-box;}'
			+ '.ck.ck-editor .ck-toolbar__grouped-dropdown>.ck-dropdown__panel{width:min(calc(var(--xerte-editor-width, 600px) - 8px),60vw)!important;max-width:calc(100vw - 24px)!important;}'
			+ '.ck.ck-editor .ck-toolbar__grouped-dropdown .ck-toolbar_floating{width:100%!important;max-width:100%!important;}'
			+ '.ck.ck-editor .ck-toolbar__grouped-dropdown .ck-toolbar_floating>.ck-toolbar__items{flex-wrap:wrap!important;}';
		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
		window.__xerteCke5UiCssInjected = true;
	}

	function apiShim(editor, domEl) {
		var self = {
			getData: function () {
				return editor.getData();
			},
			setData: function (html) {
				editor.setData(html == null ? '' : String(html));
			},
			on: function (ev, fn) {
				if (ev === 'change') {
					editor.model.document.on('change:data', function () {
						fn.call(self);
					});
				} else if (ev === 'fileUploadResponse') {
					// Drag-drop uploads update the document; change:data covers content updates.
				} else if (ev === 'focus') {
					editor.editing.view.document.on('focus', function () {
						fn.call(self);
					});
				}
			},
			fire: function (ev) {
				if (ev === 'change') {
					editor.model.document.fire('change:data');
				}
			},
			setReadOnly: function (ro) {
				if (ro) {
					editor.enableReadOnlyMode('xerte');
				} else {
					editor.disableReadOnlyMode('xerte');
				}
			},
			destroy: function () {
				var id = domEl.id;
				var nativeEditor = editor;
				if (editor.__xerteToolbarResizeObserver) {
					editor.__xerteToolbarResizeObserver.disconnect();
				}
				return editor.destroy().then(function () {
					// A newer editor may already own this id (wizard rebuilt before this async finish).
					if (window.__xerteCke5Instances[id] !== nativeEditor) {
						return;
					}
					delete window.__xerteCke5Instances[id];
					delete window.__xerteCke5Shims[id];
					delete window.__xerteCke5SourceElements[id];
					if ($ && $(domEl).removeData) {
						$(domEl).removeData('xerteCke5Instance');
					}
				});
			},
			_native: editor
		};
		return self;
	}

	function createInstance(domEl, userConfig, callback) {
		var bundle = window.XerteCKEditor5;
		if (!bundle) {
			throw new Error('XerteCKEditor5 bundle not loaded');
		}
		var Editor = bundle;
		var wantsInline = !!(userConfig && userConfig.inlineEditor);
		if (typeof bundle.create !== 'function') {
			Editor = wantsInline && bundle.Inline ? bundle.Inline : (bundle.Classic || bundle.Inline);
		}
		if (!Editor || typeof Editor.create !== 'function') {
			throw new Error('XerteCKEditor5 editor class not available');
		}
		var initialMetrics = {
			width: domEl && domEl.getBoundingClientRect ? domEl.getBoundingClientRect().width : 0,
			height: domEl && domEl.getBoundingClientRect ? domEl.getBoundingClientRect().height : 0
		};
		var lang = selectedLanguageCode();
		return loadSelectedLanguages(lang).then(function (loadedLanguages) {
			var cfg = mergeEditorConfig(userConfig || {}, loadedLanguages);
			return Editor.create(domEl, cfg);
		}).then(function (editor) {
			var id = domEl.id;
			window.__xerteCke5Instances[id] = editor;
			window.__xerteCke5SourceElements[id] = domEl;
			if ($ && $(domEl).data) {
				$(domEl).data('xerteCke5Instance', editor);
			}
			if (userConfig && userConfig.height) {
				applyEditableHeight(editor, userConfig.height);
			}
			stabilizeEditorLayout(editor, domEl, userConfig || {}, initialMetrics);
			if (userConfig && userConfig.inlineEditor) {
				ensureInlineEditorCssOverrides();
				if (editor.ui && editor.ui.view && editor.ui.view.editable && editor.ui.view.editable.element) {
					var inlineEditable = editor.ui.view.editable.element;
					inlineEditable.style.width = '100%';
					inlineEditable.style.boxSizing = '';
					inlineEditable.style.minHeight = '40px';
					inlineEditable.style.height = '40px';
					inlineEditable.style.overflowY = 'auto';
				}
				setupInlineToolbarVisibility(editor);
			} else if (userConfig && typeof userConfig.toolbarStartupExpanded !== 'undefined') {
				applyToolbarPreference(editor, !!userConfig.toolbarStartupExpanded);
			}
			if (userConfig && userConfig.startupMode === 'source') {
				try {
					editor.execute('sourceEditing');
				} catch (e) { /* ignore */ }
			}
			var shim = apiShim(editor, domEl);
			window.__xerteCke5Shims[id] = shim;
			ensureEditorUiCssOverrides();
			if (typeof callback === 'function') {
				callback.call(shim, domEl);
			}
			return editor;
		});
	}

	window.XerteCKEditor5Facade = {
		mergeEditorConfig: mergeEditorConfig,
		create: createInstance,
		getInstance: function (id) {
			return window.__xerteCke5Instances[id] || null;
		},
		destroyById: function (id) {
			var shim = window.__xerteCke5Shims[id];
			if (shim && shim.destroy) {
				return shim.destroy();
			}
			var ed = window.__xerteCke5Instances[id];
			if (ed) {
				if (ed.__xerteToolbarResizeObserver) {
					ed.__xerteToolbarResizeObserver.disconnect();
				}
				return ed.destroy().then(function () {
					if (window.__xerteCke5Instances[id] !== ed) {
						return;
					}
					delete window.__xerteCke5Instances[id];
					delete window.__xerteCke5Shims[id];
					delete window.__xerteCke5SourceElements[id];
				});
			}
			delete window.__xerteCke5SourceElements[id];
			return Promise.resolve();
		}
	};

	if (!$ || !$.fn) {
		return;
	}

	$.fn.ckeditor = function (callback, config) {
		if (!$.isFunction(callback)) {
			var tmp = config;
			config = callback;
			callback = tmp;
		}
		config = config || {};
		var promises = [];
		this.each(function () {
			var el = this;
			var id = el.id;
			var deferred = $.Deferred();
			promises.push(deferred.promise());
			var existing = window.__xerteCke5Instances[id];
			var boundEl = window.__xerteCke5SourceElements[id];
			// Reuse only if this jQuery node is the same element the editor was created on.
			// After buildPage() replaces #mainPanel, ids repeat (e.g. textarea_1) but the node is new — stale maps must refresh.
			if (existing && boundEl === el) {
				var shim = apiShim(existing, el);
				if (callback) {
					callback.call(shim, el);
				}
				deferred.resolve();
				return;
			}
			if (existing && boundEl !== el) {
				window.XerteCKEditor5Facade.destroyById(id)
					.then(function () {
						return createInstance(el, config, callback);
					})
					.then(function () {
						deferred.resolve();
					})
					.catch(function (err) {
						console.error('[XerteCKEditor5]', err);
						deferred.reject(err);
					});
				return;
			}
			createInstance(el, config, callback)
				.then(function () {
					deferred.resolve();
				})
				.catch(function (err) {
					console.error('[XerteCKEditor5]', err);
					deferred.reject(err);
				});
		});
		var all = $.when.apply($, promises);
		this.promise = function () {
			return all;
		};
		return this;
	};

	$.fn.ckeditorGet = function () {
		var id = this.eq(0).attr('id');
		var ed = window.__xerteCke5Instances[id];
		if (!ed) {
			throw 'CKEditor 5 is not initialized yet, use ckeditor() with a callback.';
		}
		return apiShim(ed, this[0]);
	};

	var _val = $.fn.val;
	$.fn.val = function (value) {
		if (arguments.length && this.is('textarea')) {
			var self = this;
			var id = self.attr('id');
			var ed = id && window.__xerteCke5Instances[id];
			if (ed) {
				var d = $.Deferred();
				ed.setData(value == null ? '' : String(value)).then(function () {
					d.resolveWith(self);
				});
				return d.promise();
			}
		}
		if (!arguments.length && this.eq(0).is('textarea')) {
			var id0 = this.eq(0).attr('id');
			var ed0 = id0 && window.__xerteCke5Instances[id0];
			if (ed0) {
				return ed0.getData();
			}
		}
		return _val.apply(this, arguments);
	};

})(window, window.jQuery);
