/**
 * markText Plugin
 *
 * @author Peter Neumann
 */

CKEDITOR.plugins.add('markTag', {
  icons: 'mark',
  lang: [
    'en', 'de',
  ],
  init: function (editor) {

    var style = new CKEDITOR.style({ element: 'mark' })

    // Listen for contextual style activation
    editor.attachStyleStateChange(style, function (state) {
      !editor.readOnly && editor.getCommand('wrapMark').setState(state)
    })

    // Adding/Creating command.
    editor.addCommand('wrapMark', new CKEDITOR.styleCommand(style))

    // Register the button, when the button plugin is enabled
    if (editor.ui.addButton) {
      editor.ui.addButton('Mark', {
        label: editor.lang.markTag.button,
        command: 'wrapMark',
        toolbar: 'basicstyles',
      })
    }
  },
})
