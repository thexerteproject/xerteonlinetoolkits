/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview [Mathematical Formulas](http://ckeditor.com/addon/mathjax) plugin.
 */

'use strict';

( function() {

    //	var cdn = 'http:\/\/cdn.mathjax.org\/mathjax\/2.2-latest\/MathJax.js?config=TeX-AMS_HTML';
    var cdn = 'https:\/\/cdn.mathjax.org\/mathjax\/latest\/MathJax.js?config=TeX-MML-AM_HTMLorMML-full';

	CKEDITOR.plugins.add( 'extmathjax', {
		lang: 'ca,cs,cy,de,el,en,en-gb,es,fa,fi,hu,ja,km,nb,nl,no,pl,pt,ro,ru,sv,uk,zh,zh-cn', // %REMOVE_LINE_CORE%
		requires: 'widget,dialog',
		icons: 'extmathjax',
		hidpi: true, // %REMOVE_LINE_CORE%

		init: function( editor ) {
			var cls = editor.config.mathJaxClass || 'math-tex';
            var rootPath = this.path;
            editor.addContentsCss( rootPath + 'css/extmathjax.css' );

			editor.widgets.add( 'extmathjax', {
				inline: true,
				dialog: 'extmathjax',
				button: editor.lang.extmathjax.button,
				mask: true,
				allowedContent: 'span(!' + cls + ')',
				pathName: editor.lang.extmathjax.pathName,

				template: '<span class="' + cls + '" style="display:inline-block" data-cke-survive=1></span>',

				parts: {
					span: 'span'
				},

				defaults: {
					math: '',
                    syntax: 't',
                    block: true
				},

				init: function() {
                    var iframe = this.parts.span.getChild( 0 );

					// Check if span contains iframe and create it otherwise.
					if ( !iframe || iframe.type != CKEDITOR.NODE_ELEMENT || !iframe.is( 'iframe' ) ) {
						iframe = new CKEDITOR.dom.element( 'iframe' );
						iframe.setAttributes( {
							style: 'border:0;width:0;height:0',
							scrolling: 'no',
							frameborder: 0,
							allowTransparency: true,
							src: CKEDITOR.plugins.extmathjax.fixSrc
						} );
						this.parts.span.append( iframe );
					}

					// Wait for ready because on some browsers iFrame will not
					// have document element until it is put into document.
					// This is a problem when you crate widget using dialog.
					this.once( 'ready', function() {
						// Src attribute must be recreated to fix custom domain error after undo
						// (see iFrame.removeAttribute( 'src' ) in frameWrapper.load).
						if ( CKEDITOR.env.ie )
							iframe.setAttribute( 'src', CKEDITOR.plugins.extmathjax.fixSrc );

						this.frameWrapper = new CKEDITOR.plugins.extmathjax.frameWrapper( iframe, editor );
						this.frameWrapper.setValue( this.data.math );
					} );
                    CKEDITOR.plugins.extmathjax.widget = this;

                },

				data: function() {
					if ( this.frameWrapper )
						this.frameWrapper.setValue( this.data.math );
                    if ( this.wrapper )
                    {
                        if (this.data.block)
                        {
                            this.wrapper.addClass("mathjax-block");
                        }
                        else
                        {
                            this.wrapper.removeClass("mathjax-block");
                        }
                    }
				},

				upcast: function( el, data ) {
					if ( !( el.name == 'span' && el.hasClass( cls ) ) )
						return;

					if ( el.children.length > 1 || el.children[ 0 ].type != CKEDITOR.NODE_TEXT )
						return;

					data.math = el.children[ 0 ].value;

                    if (data.math.indexOf('`') >= 0)
                    {
                        data.syntax='a';
                        data.block = false;
                    }
                    else if (data.math.indexOf('\\(') >=0)
                    {
                        data.syntax = 't';
                        data.block = false;
                    }
                    else if (data.math.indexOf('\\[') >=0)
                    {
                        data.syntax = 't';
                        data.block = true;
                    }
                    else if (data.math.indexOf('<math display="block">') >=0)
                    {
                        data.syntax = 'm';
                        data.block = true;
                    }
                    else if (data.math.indexOf('<math>') >=0)
                    {
                        data.syntax = 'm';
                        data.block = false;
                    }

					// Add style display:inline-block to have proper height of widget wrapper and mask.
					var attrs = el.attributes;

					if ( attrs.style )
						attrs.style += ';display:inline-block';
					else
						attrs.style = 'display:inline-block';

					// Add attribute to prevent deleting empty span in data processing.
					attrs[ 'data-cke-survive' ] = 1;


					el.children[ 0 ].remove();

					return el;
				},

				downcast: function( el ) {
					el.children[ 0 ].replaceWith( new CKEDITOR.htmlParser.text( this.data.math ) );

					// Remove style display:inline-block.
					var attrs = el.attributes;
					attrs.style = attrs.style.replace( /display:\s?inline-block;?\s?/, '' );
					if ( attrs.style === '' )
						delete attrs.style;

					return el;
				}
			} );

			// Add dialog.
			CKEDITOR.dialog.add( 'extmathjax', this.path + 'dialogs/mathjax.js' );

			// Add MathJax script to page preview.
			editor.on( 'contentPreview', function( evt ) {
				evt.data.dataValue = evt.data.dataValue.replace( /<\/head>/,
					'<script src="' + ( editor.config.mathJaxLib ? CKEDITOR.getUrl( editor.config.mathJaxLib ) : cdn ) + '"><\/script><\/head>' );
			} );

			editor.on( 'paste', function( evt ) {
				// Firefox does remove iFrame elements from pasted content so this event do the same on other browsers.
				// Also iFrame in paste content is reason of "Unspecified error" in IE9 (#10857).
				var regex = new RegExp( '<span[^>]*?' + cls + '.*?<\/span>', 'ig' );
				evt.data.dataValue = evt.data.dataValue.replace( regex, function( match ) {
					return  match.replace( /(<iframe.*?\/iframe>)/i, '' );
				} );
			} );
		}
	} );

	/**
	 * @private
	 * @class CKEDITOR.plugins.mathjax
	 */
	CKEDITOR.plugins.extmathjax = {};

	/**
	 * A variable to fix problems with `iframe`. This variable is global
	 * because it is used in both the widget and the dialog window.
	 *
	 * @private
	 * @property CKEDITOR.plugins.mathjax.fixSrc
	 * @member CKEDITOR.plugins.mathjax
	 */
	CKEDITOR.plugins.extmathjax.fixSrc =
		// In Firefox src must exist and be different than about:blank to emit load event.
		CKEDITOR.env.gecko ? 'javascript:true' :
		// Support for custom document.domain in IE.
		CKEDITOR.env.ie ? 'javascript:' +
						'void((function(){' + encodeURIComponent(
							'document.open();' +
							'(' + CKEDITOR.tools.fixDomain + ')();' +
							'document.close();'
						) + '})())' :
		// In Chrome src must be undefined to emit load event.
						'javascript:void(0)';

	/**
	 * Loading indicator image generated by preloaders.net.
	 *
	 * @private
	 * @property CKEDITOR.plugins.mathjax.loadingIcon
	 * @member CKEDITOR.plugins.mathjax
	 */
	CKEDITOR.plugins.extmathjax.loadingIcon = CKEDITOR.plugins.get( 'extmathjax' ).path + 'images/loader.gif';

	/**
	 * Computes predefined styles and copies them to another element.
	 *
	 * @private
	 * @member CKEDITOR.plugins.mathjax
	 * @param {CKEDITOR.dom.element} from Copy source.
	 * @param {CKEDITOR.dom.element} to Copy target.
	 */
	CKEDITOR.plugins.extmathjax.copyStyles = function( from, to ) {
		var stylesToCopy = [ 'color', 'font-family', 'font-style', 'font-weight', 'font-variant', 'font-size' ];

		for ( var i = 0; i < stylesToCopy.length; i++ ) {
			var key = stylesToCopy[ i ],
				val = from.getComputedStyle( key );
			if ( val )
				to.setStyle( key, val );
		}
	};

	/**
	 * Trims MathJax value from '\(1+1=2\)' to '1+1=2'.
	 *
	 * @private
	 * @member CKEDITOR.plugins.mathjax
	 * @param {String} value String to trim.
	 * @returns {String} Trimed string.
	 */
	CKEDITOR.plugins.extmathjax.trim = function( value ) {

		var begin, end, widget = CKEDITOR.plugins.extmathjax.widget;
        if (widget.data.syntax == 'a')
        {
            begin = value.indexOf( '`' ) + 1;
            end = value.lastIndexOf( '`' );
        }
        else if (widget.data.syntax == 't' && !widget.data.block)
        {
            begin = value.indexOf( '\\(' ) + 2;
            end = value.lastIndexOf( '\\)' );
        }
        else if (widget.data.syntax == 't' && widget.data.block)
        {
            begin = value.indexOf( '\\[' ) + 2;
            end = value.lastIndexOf( '\\]' );
        }
        else if (widget.data.syntax == 'm' && !widget.data.block)
        {
            begin = value.indexOf( '<math>' ) + 6;
            end = value.lastIndexOf( '</math>' );
        }
        else if (widget.data.syntax == 'm' && widget.data.block)
        {
            begin = value.indexOf( '<math display="block">' ) + 21;
            end = value.lastIndexOf( '</math>' );
        }
        else
        {
            return value;
        }

        return value.substring( begin, end );

	};

    CKEDITOR.plugins.extmathjax.add = function( value ) {

        var begin, end, widget = CKEDITOR.plugins.extmathjax.widget;
        if (widget.data.syntax == 'a')
        {
            begin = '`';
            end = '`';
        }
        else if (widget.data.syntax == 't' && !widget.data.block)
        {
            begin = '\\(';
            end = '\\)';
        }
        else if (widget.data.syntax == 't' && widget.data.block)
        {
            begin = '\\[';
            end = '\\]';
        }
        else if (widget.data.syntax == 'm' && !widget.data.block)
        {
            begin = '<math>';
            end = '</math>';
        }
        else if (widget.data.syntax == 'm' && widget.data.block)
        {
            begin = '<math display="block">';
            end = '</math>';
        }
        else
        {
            return value;
        }

        return begin + value + end;

    };


	/**
	 * FrameWrapper is responsible for communication between the MathJax library
	 * and the `iframe` element that is used for rendering mathematical formulas
	 * inside the editor.
	 * It lets you create visual mathematics by using the
	 * {@link CKEDITOR.plugins.mathjax.frameWrapper#setValue setValue} method.
	 *
	 * @private
	 * @class CKEDITOR.plugins.mathjax.frameWrapper
	 * @constructor Creates a class instance.
	 * @param {CKEDITOR.dom.element} iFrame The `iframe` element to be wrapped.
	 * @param {CKEDITOR.editor} editor The editor instance.
	 */
	if ( !( CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) ) {
		CKEDITOR.plugins.extmathjax.frameWrapper = function( iFrame, editor ) {

			var buffer, preview, value, newValue,
				doc = iFrame.getFrameDocument(),

				// Is MathJax loaded and ready to work.
				isInit = false,

				// Is MathJax parsing Tex.
				isRunning = false,

				// Function called when MathJax is loaded.
				loadedHandler = CKEDITOR.tools.addFunction( function() {
					preview = doc.getById( 'preview' );
					buffer = doc.getById( 'buffer' );
					isInit = true;

					if ( newValue )
						update();

					// Private! For test usage only.
					CKEDITOR.fire( 'mathJaxLoaded', iFrame );
				} ),

				// Function called when MathJax finish his job.
				updateDoneHandler = CKEDITOR.tools.addFunction( function() {
					CKEDITOR.plugins.extmathjax.copyStyles( iFrame, preview );

					preview.setHtml( buffer.getHtml() );

					editor.fire( 'lockSnapshot' );

					iFrame.setStyles( {
						height: 0,
						width: 0
					} );

					// Set iFrame dimensions.
					var height = Math.max( doc.$.body.offsetHeight, doc.$.documentElement.offsetHeight ),
						width = Math.max( preview.$.offsetWidth, doc.$.body.scrollWidth );

					iFrame.setStyles( {
						height: height + 'px',
						width: width + 'px'
					} );

					editor.fire( 'unlockSnapshot' );

					// Private! For test usage only.
					CKEDITOR.fire( 'mathJaxUpdateDone', iFrame );

					// If value changed in the meantime update it again.
					if ( value != newValue )
						update();
					else
						isRunning = false;
				} );

			iFrame.on( 'load', load );

			load();

			function load() {
				doc = iFrame.getFrameDocument();

				if ( doc.getById( 'preview' ) )
					return;

				// Because of IE9 bug in a src attribute can not be javascript
				// when you undo (#10930). If you have iFrame with javascript in src
				// and call insertBefore on such element then IE9 will see crash.
				if ( CKEDITOR.env.ie )
					iFrame.removeAttribute( 'src' );

				doc.write( '<!DOCTYPE html>' +
							'<html>' +
							'<head>' +
								'<meta charset="utf-8">' +
								'<script type="text/x-mathjax-config">' +

									// MathJax configuration, disable messages.
									'MathJax.Hub.Config( {' +
										'showMathMenu: false,' +
										'messageStyle: "none"' +
									'} );' +

									// Get main CKEDITOR form parent.
									'function getCKE() {' +
										'if ( typeof window.parent.CKEDITOR == \'object\' ) {' +
											'return window.parent.CKEDITOR;' +
										'} else {' +
											'return window.parent.parent.CKEDITOR;' +
										'}' +
									'}' +

									// Run MathJax.Hub with its actual parser and call callback function after that.
									// Because MathJax.Hub is asynchronous create MathJax.Hub.Queue to wait with callback.
									'function update() {' +
										'MathJax.Hub.Queue(' +
											'[ \'Typeset\', MathJax.Hub, this.buffer ],' +
											'function() {' +
												'getCKE().tools.callFunction( ' + updateDoneHandler + ' );' +
											'}' +
										');' +
									'}' +

									// Run MathJax for the first time, when the script is loaded.
									// Callback function will be called then it's done.
									'MathJax.Hub.Queue( function() {' +
										'getCKE().tools.callFunction(' + loadedHandler + ');' +
									'} );' +
								'</script>' +

								// Load MathJax lib.
								'<script src="' + ( editor.config.mathJaxLib || cdn ) + '"></script>' +
							'</head>' +
							'<body style="padding:0;margin:0;background:transparent;overflow:hidden">' +
								'<span id="preview"></span>' +

								// Render everything here and after that copy it to the preview.
								'<span id="buffer" style="display:none"></span>' +
							'</body>' +
							'</html>' );
			}

			// Run MathJax parsing Tex.
			function update() {
				isRunning = true;

				value = newValue;

				editor.fire( 'lockSnapshot' );

				buffer.setHtml( value );

				// Set loading indicator.
				preview.setHtml( '<img src=' + CKEDITOR.plugins.extmathjax.loadingIcon + ' alt=' + editor.lang.extmathjax.loading + '>' );

				iFrame.setStyles( {
					height: '16px',
					width: '16px',
					display: 'inline',
					'vertical-align': 'middle'
				} );

				editor.fire( 'unlockSnapshot' );

				// Run MathJax.
				doc.getWindow().$.update( value );
			}

			return {
				/**
				 * Sets the TeX value to be displayed in the `iframe` element inside
				 * the editor. This function will activate the MathJax
				 * library which interprets TeX expressions and converts them into
				 * their representation that is displayed in the editor.
				 *
				 * @param {String} value TeX string.
				 */
				setValue: function( value ) {
					newValue = value;

					if ( isInit && !isRunning )
						update();
				}
			};
		};
	} else {
		// In IE8 MathJax does not work stable so instead of using standard
		// frame wrapper it is replaced by placeholder to show pure TeX in iframe.
		CKEDITOR.plugins.extmathjax.frameWrapper = function( iFrame, editor ) {
			iFrame.getFrameDocument().write( '<!DOCTYPE html>' +
				'<html>' +
				'<head>' +
					'<meta charset="utf-8">' +
				'</head>' +
				'<body style="padding:0;margin:0;background:transparent;overflow:hidden">' +
					'<span style="white-space:nowrap;" id="tex"></span>' +
				'</body>' +
				'</html>' );

			return {
				setValue: function( value ) {
					var doc = iFrame.getFrameDocument(),
						tex = doc.getById( 'tex' );

					tex.setHtml( CKEDITOR.plugins.extmathjax.trim( value ) );

					CKEDITOR.plugins.extmathjax.copyStyles( iFrame, tex );

					editor.fire( 'lockSnapshot' );

					iFrame.setStyles( {
						width: Math.min( 250, tex.$.offsetWidth ) + 'px',
						height: doc.$.body.offsetHeight + 'px',
						display: 'inline',
						'vertical-align': 'middle'
					} );

					editor.fire( 'unlockSnapshot' );
				}
			};
		};
	}
} )();

/**
 * Sets the path to the MathJax library. It can be both a local
 * resource and a location different than the default CDN.
 *
 * Please note that this must be a full or absolute path.
 *
 *		config.mathJaxLib = 'http:\/\/example.com\/libs\/MathJax.js';
 *
 * @cfg {String} [mathJaxLib='http:\/\/cdn.mathjax.org\/mathjax\/2.2-latest\/MathJax.js?config=TeX-AMS_HTML']
 * @member CKEDITOR.config
 */

/**
 * Sets the default class for `span` elements that will be
 * converted into [Mathematical Formulas](http://ckeditor.com/addon/mathjax)
 * widgets.
 *
 * If you set it to the following:
 *
 *		config.mathJaxClass = 'my-math';
 *
 * The code below will be recognized as a Mathematical Formulas widget.
 *
 *		<span class="my-math">\( \sqrt{4} = 2 \)</span>
 *
 * @cfg {String} [mathJaxClass='math-tex']
 * @member CKEDITOR.config
 */