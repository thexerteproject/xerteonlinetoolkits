/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

'use strict';

CKEDITOR.dialog.add( 'extmathjax', function( editor ) {

	var preview,
		lang = editor.lang.extmathjax;

	return {
		title: lang.title,
		minWidth: 350,
		minHeight: 100,
		contents: [
			{
				id: 'info',
				elements: [
                    {
                        id: 'mjoptions',
                        type: 'hbox',
                        children: [
                            {
                                type : 'select',
                                id : 'style',
                                items :
                                    [
                                        [ lang.TeX, 't' ],
                                        [ lang.AsciiMath, 'a' ],
                                        [ lang.MathML, 'm' ]
                                    ],
                                setup: function (widget) {
                                    this.allowOnChange = false;

                                    if (widget.data.syntax)
                                        this.setValue(widget.data.syntax);

                                    this.allowOnChange = true;
                                },
                                onChange : function(e)
                                {
                                    var dialog = CKEDITOR.dialog.getCurrent();
                                    CKEDITOR.plugins.extmathjax.widget.setData('syntax', this.getValue());
                                    preview.setValue( CKEDITOR.plugins.extmathjax.add( dialog.getValueOf( 'info', 'equation' ) ));
                                },
                                commit : function( widget )
                                {
                                    widget.setData('syntax', this.getValue());
                                }
                            },
                            {
                                id: "button",
                                type: "checkbox",
                                label: lang.displayasblock,
                                setup: function (widget) {
                                    this.allowOnChange = false;

                                    if (widget.data.block)
                                        this.setValue(widget.data.block);

                                    this.allowOnChange = true;
                                },
                                onChange : function(e)
                                {
                                    var dialog = CKEDITOR.dialog.getCurrent();
                                    CKEDITOR.plugins.extmathjax.widget.setData('block', this.getValue());
                                    preview.setValue( CKEDITOR.plugins.extmathjax.add( dialog.getValueOf( 'info', 'equation' ) ));
                                },
                                commit: function (widget) {
                                    widget.setData('block' , this.getValue());
                                }
                            }

                        ]
                    },
					{
						id: 'equation',
						type: 'textarea',
						label: lang.dialogInput,

						onLoad: function( widget ) {
							var that = this;

							if ( !( CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) ) {
								this.getInputElement().on( 'keyup', function() {
									// Add \( and \) for preview.
									preview.setValue( CKEDITOR.plugins.extmathjax.add( that.getInputElement().getValue()) );
								} );
							}
						},

						setup: function( widget ) {
							// Remove \( and \).
							this.setValue( CKEDITOR.plugins.extmathjax.trim( widget.data.math ) );
						},

						commit: function( widget ) {
							// Add \( and \) to make TeX be parsed by MathJax by default.
							widget.setData( 'math', CKEDITOR.plugins.extmathjax.add( this.getValue()) );
						}
					},
					{
						id: 'documentation',
						type: 'html',
						html:
							'<div style="width:100%;text-align:right;margin:-8px 0 10px">' +
								'<a class="cke_mathjax_doc" href="' + lang.docUrl + '" target="_black" style="cursor:pointer;color:#00B2CE;text-decoration:underline">' +
									lang.docLabel +
								'</a>' +
							'</div>'
					},
					( !( CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) ) && {
						id: 'preview',
						type: 'html',
						html:
							'<div style="width:100%;text-align:center;">' +
								'<iframe style="border:0;width:0;height:0;font-size:20px" scrolling="no" frameborder="0" allowTransparency="true" src="' + CKEDITOR.plugins.extmathjax.fixSrc + '"></iframe>' +
							'</div>',

						onLoad: function( widget ) {
							var iFrame = CKEDITOR.document.getById( this.domId ).getChild( 0 );
							preview = new CKEDITOR.plugins.extmathjax.frameWrapper( iFrame, editor );
						},

						setup: function( widget ) {
							preview.setValue( widget.data.math );
						}
					}
				]
			}
		]
	};
} );