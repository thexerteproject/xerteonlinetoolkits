/**
 * @license Copyright (c) 2016 Uritec. All rights reserved.
 * For licensing, see LICENSE.md
 * version 0.2
 */

/**
 * @fileOverview Extends the Dialog User Interface to add the option of using input type="number"
 */

/* globals CKEDITOR */

(function() {
	'use strict';

	CKEDITOR.plugins.add( 'numericinput', {
		requires: 'dialogui',
		init: function( editor ) {

			// Add hook to automatically use the numericinput type on existing dialogs that we don't want/can't change

			// Customize dialogs:
			CKEDITOR.on( 'dialogDefinition', function( ev ) {
				if ( editor != ev.editor )
					return;

				var dialogName = ev.data.name,
					dialogDefinition = ev.data.definition,
					tabsToProcess,
					tabName, fields, tab;

				if (dialogName == 'tableProperties')
					dialogName = 'table';

				var fieldsToModify = editor.config.numericinput_modifyfields;
				if (!fieldsToModify)
					return;

				/*
					numericinput_modifyfields is an object, each entry is the name of a dialog that we want to modify,
						the value is another object, the tabs of the dialog, and finally an object with the name of the fields.
					eg for the Table dialog
					config.numericinput_modifyfields = {
						'table': {
							'info' : {
									'txtRows': {
										'min': 1
									},
									'txtCols': {
										'min': 1
									},
									'txtBorder': {
									}, 'txtCellSpace': {
									},
									'txtCellPad': {
									}
							}
						}

					}
				*/
				// iterate the possible items defined in the configuration
				if ( fieldsToModify && ( tabsToProcess = fieldsToModify[ dialogName ] ) ) {
					for ( tabName in tabsToProcess ) {
						tab = dialogDefinition.getContents( tabName );
						if (!tab)
							continue;

						fields = tabsToProcess[ tabName ];
						for ( var fieldName in fields ) {
							var dialogField = tab.get( fieldName );
							if ( dialogField ) {
								dialogField.type = 'number';
								dialogField = CKEDITOR.tools.extend(dialogField, fields[ fieldName], true);
							}

						}
					}
				}
			});


			if (CKEDITOR.ui.dialog.numericInput)
				return;

			initNumericInput();
		}
	} );

	function initNumericInput() {
		var initPrivateObject = function( elementDefinition ) {
				if (!this._)
					this._ = {};
				this._[ 'default' ] = this._.initValue = elementDefinition[ 'default' ] || '';
				this._.required = elementDefinition.required || false;
				var args = [ this._ ];
				for ( var i = 1; i < arguments.length; i++ )
					args.push( arguments[ i ] );
				args.push( true );
				CKEDITOR.tools.extend.apply( CKEDITOR.tools, args );
				return this._;
			},
			numericBuilder = {
				build: function( dialog, elementDefinition, output ) {
					return new CKEDITOR.ui.dialog.numericInput( dialog, elementDefinition, output );
				}
			},
			commonPrototype = {
				isChanged: function() {
					return this.getValue() != this.getInitValue();
				},

				reset: function( noChangeEvent ) {
					this.setValue( this.getInitValue(), noChangeEvent );
				},

				setInitValue: function() {
					this._.initValue = this.getValue();
				},

				resetInitValue: function() {
					this._.initValue = this._[ 'default' ];
				},

				getInitValue: function() {
					return this._.initValue;
				}
			};

		CKEDITOR.tools.extend( CKEDITOR.ui.dialog, {
			/**
			 * A numeric input with a label.
			 *
			 * @class CKEDITOR.ui.dialog.numericInput
			 * @extends CKEDITOR.ui.dialog.labeledElement
			 * @constructor Creates a numericInput class instance.
			 * @param {CKEDITOR.dialog} dialog Parent dialog window object.
			 * @param {CKEDITOR.dialog.definition.uiElement} elementDefinition
			 * The element definition. Accepted fields:
			 *
			 * * `default` (Optional) The default value.
			 * * `validate` (Optional) The validation function.
			 * * `min` (Optional) The minimum value of the input.
			 * * `max` (Optional) The maximum value of the input.
			 * * `step` (Optional) The step value of the input.
			 *
			 * @param {Array} htmlList List of HTML code to output to.
			 */
			numericInput: function( dialog, elementDefinition, htmlList ) {
				if ( arguments.length < 3 )
					return;

				initPrivateObject.call( this, elementDefinition );
				var domId = this._.inputId = CKEDITOR.tools.getNextId() + '_numericInput',
					attributes = { 'class': 'cke_dialog_ui_input_text cke_dialog_ui_input_number', id: domId, type: 'number' };

				// Set the validator, if any.
				if ( elementDefinition.validate )
					this.validate = elementDefinition.validate;

				// Set the min, max and step.
				if ( typeof elementDefinition.min != 'undefined' )
					attributes.min = elementDefinition.min;
				if ( typeof elementDefinition.max != 'undefined' )
					attributes.max = elementDefinition.max;
				if ( elementDefinition.step )
					attributes.step = elementDefinition.step;

				if ( elementDefinition.inputStyle )
					attributes.style = elementDefinition.inputStyle;

				// If user presses Enter in a text box, it implies clicking OK for the dialog.
				var me = this,
					keyPressedOnMe = false;
				dialog.on( 'load', function() {
					me.getInputElement().on( 'keydown', function( evt ) {
						if ( evt.data.getKeystroke() == 13 )
							keyPressedOnMe = true;
					} );

					// Lower the priority this 'keyup' since 'ok' will close the dialog.(#3749)
					me.getInputElement().on( 'keyup', function( evt ) {
						if ( evt.data.getKeystroke() == 13 && keyPressedOnMe ) {
							var okButton = dialog.getButton( 'ok' );
							if (okButton)
								setTimeout( function() {
									dialog.getButton( 'ok' ).click();
								}, 0 );
							keyPressedOnMe = false;
						}

					}, null, null, 1000 );
				} );

				var innerHTML = function() {
					// IE BUG: Text input fields in IE at 100% would exceed a <td> or inline
					// container's width, so need to wrap it inside a <div>.
					var html = [ '<div class="cke_dialog_ui_input_number" role="presentation"' ];

					if ( elementDefinition.width )
						html.push( 'style="width:' + elementDefinition.width + '" ' );

					html.push( '><input ' );

					attributes[ 'aria-labelledby' ] = this._.labelId;
					if (this._.required)
						attributes[ 'aria-required' ] = this._.required;
					for ( var i in attributes )
						html.push( i + '="' + attributes[ i ] + '" ' );
					html.push( ' /></div>' );
					return html.join( '' );
				};
				CKEDITOR.ui.dialog.labeledElement.call( this, dialog, elementDefinition, htmlList, innerHTML );
			}

		}, true );

		/** @class CKEDITOR.ui.dialog.numericInput */
		CKEDITOR.ui.dialog.numericInput.prototype = CKEDITOR.tools.extend( new CKEDITOR.ui.dialog.labeledElement(), {
			/**
			 * Gets the text input DOM element under this UI object.
			 *
			 * @returns {CKEDITOR.dom.element} The DOM element of the text input.
			 */
			getInputElement: function() {
				return CKEDITOR.document.getById( this._.inputId );
			},

			/**
			 * Puts focus into the text input.
			 */
			focus: function() {
				var me = this.selectParentTab();

				// GECKO BUG: setTimeout() is needed to workaround invisible selections.
				setTimeout( function() {
					var element = me.getInputElement();
					if (element)
						element.$.focus();
				}, 0 );
			},

			/**
			 * Selects all the text in the text input.
			 */
			select: function() {
				var me = this.selectParentTab();

				// GECKO BUG: setTimeout() is needed to workaround invisible selections.
				setTimeout( function() {
					var e = me.getInputElement();
					if ( e ) {
						e.$.focus();
						e.$.select();
					}
				}, 0 );
			},

			/**
			 * Handler for the text input's access key up event. Makes a `select()`
			 * call to the text input.
			 */
			accessKeyUp: function() {
				this.select();
			},

			/**
			 * Sets the value of this numeric input object.
			 *
			 *		uiElement.setValue( 83 );
			 *
			 * @param {Number} value The new value.
			 * @returns {CKEDITOR.ui.dialog.textInput} The current UI element.
			 */
			setValue: function( value ) {
				return CKEDITOR.ui.dialog.uiElement.prototype.setValue.apply( this, arguments );
			},

			/**
			 * Gets the value of this number input object.
			 *
			 * @returns {String} The value.
			 */
			getValue: function() {
				return CKEDITOR.ui.dialog.uiElement.prototype.getValue.call( this );
				if ( value === '' )
					return value;

				return parseFloat( value );
			},

			/**
			 * Gets the value as number of this number input object.
			 *
			 * @returns {Number} The value.
			 */
			getValueAsNumber: function() {
				var value = CKEDITOR.ui.dialog.uiElement.prototype.getValue.call( this );
				if ( value === '' )
					return null;

				return parseFloat( value );
			},

			keyboardFocusable: true
		}, commonPrototype, true );

		CKEDITOR.dialog.addUIElement( 'number', numericBuilder );
	}
})();


/*
/**
 * An object to modify elements of existing dialogs and turn them to input type="number"
 *
 *		CKEDITOR.config.numericinput_modifyfields;
 *
 * @since 0.2
 * @cfg {Object} numericinput_modifyfields
 * @member CKEDITOR.config

The object is composed of dialog names, each of these properties is another object.
This second object then lists the tab names and its value is again an object.
In the third object the keys are the control names, and the value is an object with the properties that must me modified.

Example for the Table dialog:

config.numericinput_modifyfields = {
	'table': {
		'info' : {
			'txtRows': {
				'min': 1
			},
			'txtCols': {
				'min': 1
			},
			'txtBorder': {
				'min': 0,
				'controlStyle': 'width: 4em',
			},
			'txtCellSpace': {
				'min': 0,
				'controlStyle': 'width: 4em',
			},
			'txtCellPad': {
				'min': 0,
				'controlStyle': 'width: 4em',
			}
		}
	}
}

*/