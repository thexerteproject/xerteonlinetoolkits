(function() {
  CKEDITOR.plugins.add('xotlightbox', (function(editor) {
    return {
      init: function(editor) {
        if (!editor.plugins.link) return; // link plugin not installed so nothing to do

        CKEDITOR.on('dialogDefinition', function(evt) {

          if (evt.data.name !== 'link') return; // we only want the link plugin dialog definition

          var linkDialog = evt.data,
              linkDialogDefinition = linkDialog.definition,
              linkDialog_onShow = linkDialogDefinition.onShow,
              linkDialog_onOk = linkDialogDefinition.onOk,
              featherlightAttribute = null,
              hrefAttribute = null,
              targetAttribute = null;

          linkDialogDefinition.onShow = function() {
            var element = CKEDITOR.plugins.link.getSelectedLink(editor),
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
            linkDialog_onShow.apply(this, arguments);
          };

          linkDialogDefinition.onOk = function() {
            linkDialog_onOk.apply(this, arguments);

            var data = {};
            this.commitContent(data);

            if (data["data-featherlight"]) {
              // Get the link that we are editing
              var element = editor.getSelection().getSelectedElement();
              if (!element) { // ... or a new link has been inserted so we need to get a reference
                element = CKEDITOR.plugins.link.getSelectedLink( editor );
              }
              element.setAttribute('data-featherlight', data.url.protocol + data.url.url);
              element.$.removeAttribute('data-cke-saved-href');
              element.setAttribute('href', "#");
              element.removeAttribute('target');
            }
          };

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

          // Get references to the target dropdown and keep copy of the setup/commit functions
          var linkTargetTypeDropdown = linkDialogDefinition.getContents('target').get("linkTargetType");
          var linkTargetTypeDropdownSetup = linkTargetTypeDropdown.setup;
          var linkTargetTypeDropdownCommit = linkTargetTypeDropdown.commit;

          // Check if target dropdown should have Lightbox selected and fix
          linkTargetTypeDropdown.setup = function(data) {
            if (featherlightAttribute) {
              data.target.type = "_lightbox";
            }
            linkTargetTypeDropdownSetup.apply(this, arguments);
          };

          // Check if link was Lightbox and remove target
          linkTargetTypeDropdown.commit = function(data) {
            linkTargetTypeDropdownCommit.apply(this, arguments);

            if (data.target && data.target.type === "_lightbox") {
              delete data.target;
              data['data-featherlight'] = 'iframe';
            }
          };

          // Add the Lightbox entry to the link dialog, target tab dropdown
          linkTargetTypeDropdown.items.push(["Lightbox", "_lightbox"]);
        });
      }
    };
  })());
})();
