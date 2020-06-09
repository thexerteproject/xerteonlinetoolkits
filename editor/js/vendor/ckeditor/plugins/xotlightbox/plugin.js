(function() {
  CKEDITOR.plugins.add('xotlightbox', (function(editor) {
    return {
      init: function(editor) {
        if (!editor.plugins.link) return; // link plugin not installed so nothing to do

        CKEDITOR.on('dialogDefinition', function(evt) {

          if (evt.data.name !== 'link') return; // we only want the link plugin dialog definition

          var linkDialog = evt.data,
            linkDialogDefinition = linkDialog.definition,
            featherlightAttribute = null,
            hrefAttribute = null,
            targetAttribute = null;

          // Get a reference to the linkTargetType updateDropdowns
          var linkTargetTypeDropdown = linkDialogDefinition.getContents('target').get('linkTargetType');

          // Check if we've added Lightbox option before, if not then add it...
          if (linkTargetTypeDropdown.items && !linkTargetTypeDropdown.items.some(function(item){
            return item[0] === 'Lightbox';
          })) linkTargetTypeDropdown.items.push(["Lightbox", "_lightbox"]);

          // Store reference to the original onShow handler (for calling later) and redefine
          if (!linkDialogDefinition.onShowOriginal) linkDialogDefinition.onShowOriginal = linkDialogDefinition.onShow;
          linkDialogDefinition.onShow = function() {
            var editor = this._.editor,
              element = CKEDITOR.plugins.link.getSelectedLink(editor),
              selection = editor.getSelection();

            // Selects a link if we just right click inside, without selecting first
            if (element && element.hasAttribute('href')) selection.selectElement(element);

            if (element) { //  we have an existing hyperlink, check if it has a data-featherlight and store what we may mess with
              featherlightAttribute = element.getAttribute('data-featherlight');
              hrefAttribute = element.getAttribute('href');
              targetAttribute = element.getAttribute('target');

              // Switch around some attribute values for featherlight
              if (featherlightAttribute && hrefAttribute == '#') {
                element.setAttribute('target', '_lightbox');
                element.setAttribute('href', featherlightAttribute);
                element.$.setAttribute('data-cke-saved-href', featherlightAttribute);
                element.removeAttribute('data-featherlight');
              }
            }

            // Return control back to link dialog
            linkDialogDefinition.onShowOriginal.apply(this, arguments);
          };

          // Store reference to the original onOk handler (for calling later) and redefine
          if (!linkDialogDefinition.onOkOriginal) linkDialogDefinition.onOkOriginal = linkDialogDefinition.onOk;
          linkDialogDefinition.onOk = function() {
            var editor = this._.editor;
            linkDialogDefinition.onOkOriginal.apply(this, arguments);

            var data = {};
            this.commitContent(data);

            if (data["data-featherlight"]) {
              // Get the link that we are editing
              var element = editor.getSelection().getSelectedElement();
              if (!element) { // ... or a new link has been inserted so we need to get a reference
                element = CKEDITOR.plugins.link.getSelectedLink(editor);
              }

              element.setAttribute('data-featherlight', data.url.protocol + data.url.url);
              element.$.removeAttribute('data-cke-saved-href');
              element.setAttribute('href', "#");
              element.removeAttribute('target');
            }
          };

          // No onCancel handler to store
          linkDialogDefinition.onCancel = function() {
            // Put all the attributes that we've messed with back to what they were
            var element = editor.getSelection().getSelectedElement();
            if (element) {
              if (featherlightAttribute)
                element.setAttribute('data-featherlight', featherlightAttribute);
              else
                element.removeAttribute('data-featherlight');

              if (targetAttribute)
                element.setAttribute('target', targetAttribute);
              else
                element.removeAttribute('target');

              if (hrefAttribute) {
                element.setAttribute('href', hrefAttribute);
                element.$.setAttribute('data-cke-saved-href', hrefAttribute);
              }
            }
          };

          // Store reference to the original linkTargetTypeDropdown setup handler (for calling later) and redefine
          if (!linkTargetTypeDropdown.setupOriginal) linkTargetTypeDropdown.setupOriginal = linkTargetTypeDropdown.setup;
          linkTargetTypeDropdown.setup = function(data) {
            if (featherlightAttribute) { // Check if target dropdown should have Lightbox selected and fix
              data.target.type = "_lightbox";
            }
            linkTargetTypeDropdown.setupOriginal.apply(this, arguments);
          };

          // Store reference to the original linkTargetTypeDropdown commit handler (for calling later) and redefine
          if (!linkTargetTypeDropdown.commitOriginal) linkTargetTypeDropdown.commitOriginal = linkTargetTypeDropdown.commit;
          // Check if link was Lightbox and remove target
          linkTargetTypeDropdown.commit = function(data) {
            linkTargetTypeDropdown.commitOriginal.apply(this, arguments);

            if (data.target && data.target.type === "_lightbox") {
              delete data.target;
              data['data-featherlight'] = 'iframe';
            }
          };
        });
      }
    };
  })());
})();
