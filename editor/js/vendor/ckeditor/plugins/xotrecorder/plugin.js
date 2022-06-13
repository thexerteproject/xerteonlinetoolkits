//'use strict';

(function(){
	CKEDITOR.plugins.add('xotrecorder', {
		requires: 'widget',
		lang: 'en',
		icons: 'xotrecorder',
		hidpi: true,
		init: function(editor) {
			//editor.addContentsCss( this.path + 'styles/style.css' );
			editor.widgets.add('xotrecorder', {
				dialog: 'xotrecorder',
				button: editor.lang.xotrecorder.editorButton,
				// Required field
				template: '<div class="ckeditor-html5-audio"></div>',
				// We add the audio element when needed in the data function, to avoid having an undefined src attribute.
				// See issue #9 on github: https://github.com/iametza/ckeditor-html5-audio/issues/9
				//editables: {},
				// The upcast option is what gives us our movable, deletable widget in the editor
				// Without this we cannot remove or move the player
				upcast: function( element ) {
					return element.name === 'div' && element.hasClass( 'ckeditor-html5-audio' );
				},
				data: function() {
					if ( this.data.url ) {
						// and there isn't a child (the audio element)
						if ( !this.element.getChild( 0 ) ) {
							// Create a new <audio> element.
							var audioElement = new CKEDITOR.dom.element( 'audio' );
							// Set the controls attribute.
							audioElement.setAttribute( 'controls', 'controls' );
							// Append it to the container of the plugin.
							this.element.append( audioElement );
						}

						// change the src of the exsting/new audio element to new uploaded url
						this.element.getChild( 0 ).setAttribute( 'src', this.data.url );
					}
				}
			});
			CKEDITOR.dialog.add('xotrecorder', this.path + 'dialogs/xotrecorder.js');
		}
	});
})();
