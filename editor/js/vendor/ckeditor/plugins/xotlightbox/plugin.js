(function() {

  // obj to keep track of all featherlight attributes
  var featherlightAttributes;

  // return FL = {
  //   type: iframe, image - from 'data-featherlight'
  //   height: vm/vh, %, px - from 'data-featherlight-iframe-height' OR 'data-featherlight-style'
  //   width: vm/vh, %, px - from 'data-featherlight-iframe-width' OR 'data-featherlight-style'
  // }
  function getFeatherlightAttributes(element) {
    var FL = featherlightAttributes || {};

    // Get featherlight type
    if (element.getAttribute('data-featherlight')) {
      FL.type = element.getAttribute('data-featherlight');

      // Get width and height if iframe
      FL.size = false; // assume not used
      ['width','height'].map(function(attr) {
        FL[attr] = {};
        if (element.getAttribute('data-featherlight-iframe-' + attr)) {
          FL[attr].value = element.getAttribute('data-featherlight-iframe-' + attr);
          FL.size = true;
        }
      });

      // Check for a styles attribute and separate out width,height
      FL.style = [];
      if (element.getAttribute('data-featherlight-iframe-style')) {
        var styles = separateStyles(['width','height'], element.getAttribute('data-featherlight-iframe-style'));
        ['width','height'].map(function(attr) {
          if (styles[0][attr]) {
            FL[attr] = styles[0][attr];
            FL.size = true;
          }
        });
        FL.style = styles[1];
      }
    }
    return FL;
  }

  // separateStyles(['width','height'], 'width:95vw;height:90vw;color:red;size:67px')
  // returns: [object, array]
  // returns: [ { width: '95vw', height: '90vw' }, ['color:red', 'size:67px'] ]
  function separateStyles(attrs, style) {
    return [
      style.split(';').filter(function(item) {
        return attrs.includes(item.split(':')[0].trim());
      }).reduce(function(obj, item) {
        var pairs = item.split(':');
        if (pairs.length && pairs.length === 2) {
          var dimension = pairs[1].trim().match(/(\d+)\s*(vw|vh|%|px){0,1}/i);
          if (dimension.length > 0) {
            obj[pairs[0].trim()] = {
              'value': dimension[1],
              'units': (dimension[2] || '').trim()
            };
          }
        }
        return obj;
      }, {}),
      style.split(';')
        .filter(function(i){return i.trim().length>0;}) // remove empty terms ; ;
        .filter(function(item) { // return terms not in the attrs array: [width, height]
          return !attrs.includes(item.split(':')[0].trim());
        })
    ];
  }

  function sizeToggle(dialog) {
    setSizeElements(dialog, this.checked);
    featherlightAttributes.size = this.checked;
  }

  function setSizeElements(dialog, enable) {
    ['widthSetting','widthUnits','heightSetting','heightUnits'].map(function(attr) {
      dialog.getContentElement('target', attr)[ enable ? 'enable' : 'disable' ]();
    });
  }

  CKEDITOR.plugins.add('xotlightbox', (function(editor) {
    return {
      requires: 'dialog,link,numericinput',
      init: function(editor) {
        if (!editor.plugins.link) return; // link plugin not installed so nothing to do

        CKEDITOR.on('dialogDefinition', function(evt) {

          if (evt.data.name !== 'link') return; // we only want the link plugin dialog definition

          var linkDialog = evt.data;

          // Get references to the link dialog definition and the target tab definitions
          var linkDialogDefinition = linkDialog.definition,
            linkDialogTargetTab = linkDialogDefinition.getContents('target');

          // Get a reference to the linkTargetType updateDropdowns
          var linkTargetTypeDropdown = linkDialogTargetTab.get('linkTargetType');

          // Store reference to the original onShow handler (for calling later) and redefine
          if (!linkDialogDefinition.onShowOriginal) linkDialogDefinition.onShowOriginal = linkDialogDefinition.onShow;
          linkDialogDefinition.onShow = function() {
            var editor = this.getParentEditor(),
                element = CKEDITOR.plugins.link.getSelectedLink(editor);

            // Selects a link if we just right click inside, without selecting first
            if (element && element.hasAttribute('href')) editor.getSelection().selectElement(element);

            featherlightAttributes = {};
            if (element) { //  we have an existing hyperlink, get data-featherlight attributes
              featherlightAttributes = getFeatherlightAttributes(element);
              if (featherlightAttributes.type) {
                element.setAttribute('target', '_lightbox');
              }
            }

            // Return control back to link dialog
            linkDialogDefinition.onShowOriginal.apply(this, arguments);
          };

          // Store reference to the original onOk handler (for calling later) and redefine
          if (!linkDialogDefinition.onOkOriginal) linkDialogDefinition.onOkOriginal = linkDialogDefinition.onOk;
          linkDialogDefinition.onOk = function() {
            var editor = this.getParentEditor();
            linkDialogDefinition.onOkOriginal.apply(this, arguments);

            // Get the link that we are editing... or a new link has been inserted so we need to get a reference
            var element = editor.getSelection().getSelectedElement() || CKEDITOR.plugins.link.getSelectedLink(editor);

            // If type is set then we want to write 'data-featherlight' attributes to the element
            if (featherlightAttributes.type && featherlightAttributes.type.length > 0) {

              // first we set the type selected
              element.setAttribute('data-featherlight', featherlightAttributes.type);
              element.removeAttribute('target');

              // now we work through the size logic, but only for iframe
              if (featherlightAttributes.type === 'iframe' && featherlightAttributes.size) {

                featherlightAttributes.style = featherlightAttributes.style || [];
                ['width','height'].map(function(attr) {
                  if (featherlightAttributes[attr].value) {
                    if (featherlightAttributes[attr].units) { // add to style tag
                      featherlightAttributes.style.push(attr + ':' + featherlightAttributes[attr].value + featherlightAttributes[attr].units);
                      element.removeAttribute('data-featherlight-iframe-' + attr);
                    }
                    else {
                      element.setAttribute('data-featherlight-iframe-' + attr, featherlightAttributes[attr].value);
                    }
                  }
                  else {
                    element.removeAttribute('data-featherlight-iframe-' + attr);
                  }
                });

                if (featherlightAttributes.style.length > 0) {
                  element.setAttribute('data-featherlight-iframe-style', featherlightAttributes.style.join(';'));
                }
                else {
                  element.removeAttribute('data-featherlight-iframe-style');
                }
              }
              else { // ... otherwise size not needed - we remove all size tags
                element.removeAttribute('data-featherlight-iframe-width');
                element.removeAttribute('data-featherlight-iframe-height');

                // Remove style attribute also but then put it back if we still need it
                element.removeAttribute('data-featherlight-iframe-style');
                if (featherlightAttributes.type === 'iframe' && featherlightAttributes.style && featherlightAttributes.style.length > 0) {
                  element.setAttribute('data-featherlight-iframe-style', featherlightAttributes.style.join(';'));
                }
              }
            }
            else { // ... otherwise we've selected a different target - remove all the featherlight attributes from element
              ['', '-iframe-width', '-iframe-height', '-iframe-style', '-image-style'].map(function(fragment){
                element.removeAttribute('data-featherlight' + fragment);
              });
            }
          };

          // No onCancel handler to store so just define the new handler
          linkDialogDefinition.onCancel = function() {
            // Put any attributes that we've messed with back to what they were
            var element = this.getParentEditor().getSelection().getSelectedElement();
            if (element) {
              if (element.getAttribute('target') === '_lightbox') {
                element.removeAttribute('target');

                if (featherlightAttributes.type) {
                  element.setAttribute('data-featherlight', featherlightAttributes.type);
                }
              }
            }
          };

          // Store reference to the original linkTargetTypeDropdown setup handler (for calling later) and redefine
          if (!linkTargetTypeDropdown.setupOriginal) linkTargetTypeDropdown.setupOriginal = linkTargetTypeDropdown.setup;
          linkTargetTypeDropdown.setup = function(data) {

            if (featherlightAttributes.type) { // Check if target dropdown should have Lightbox selected and fix
              if (!data.target) data.target = {};
              data.target.type = "_lightbox";
            }
            linkTargetTypeDropdown.setupOriginal.apply(this, arguments);
            linkTargetTypeDropdown.onChange.call(this);
          };

          // Store reference to the original linkTargetTypeDropdown commit handler (for calling later) and redefine
          if (!linkTargetTypeDropdown.commitOriginal) linkTargetTypeDropdown.commitOriginal = linkTargetTypeDropdown.commit;
          linkTargetTypeDropdown.commit = function(data) {
            linkTargetTypeDropdown.commitOriginal.apply(this, arguments);

            // Check if target was Lightbox and remove target attribute
            if (data.target && data.target.type === "_lightbox") {
              delete data.target;
              featherlightAttributes.type = 'iframe';
            }
          };

          // Store reference to the original linkTargetTypeDropdown onChange handler (for calling later) and redefine
          if (!linkTargetTypeDropdown.onChangeOriginal) linkTargetTypeDropdown.onChangeOriginal = linkTargetTypeDropdown.onChange;
          linkTargetTypeDropdown.onChange = function() {
            linkTargetTypeDropdown.onChangeOriginal.apply(this, arguments);

            var display = (this.getValue() === '_lightbox');
            this.getDialog().getContentElement('target', 'lightboxOptions').getElement()[display ? 'show' : 'hide']();
            if (!display) delete featherlightAttributes.type;
          };

          // Check if we've added Lightbox option before, if not then add it...
          if (linkTargetTypeDropdown.items && !linkTargetTypeDropdown.items.some(function(item) {
              return item[0] === 'Lightbox';
            })) {
            linkTargetTypeDropdown.items.push(["Lightbox", "_lightbox"]);

            var lightboxTypeOnChange = function() {
              var display = (this.getValue() === "iframe");
              this.getDialog().getContentElement('target', 'iframeSizeSettings').getElement()[display ? 'show' : 'hide']();
            };

            // Add a filedset containing lightbox Options
            linkDialogTargetTab.elements.push({
              type: 'fieldset',
              id: 'lightboxOptions',
              label: 'Lightbox Options',
              children: [{
                type: 'hbox',
                children: [{
                    type: 'select',
                    id: 'lightboxType',
                    label: 'Type',
                    onChange: lightboxTypeOnChange,
                    'default': 'iframe',
                    items: [
                      //['<auto>', 'auto'],
                      ['Image', 'image'],
                      ['iFrame', 'iframe'],
                      //['Ajax', '_ajax']
                    ],
                    setup: function(data) {
                      if (featherlightAttributes && featherlightAttributes.type) {
                        if (['image','iframe'].includes(featherlightAttributes.type.toLowerCase()))
                          this.setValue(featherlightAttributes.type.toLowerCase());
                      }
                      //lightboxTypeOnChange.call(this);
                    },
                    commit: function(data) {
                      if (data.target && data.target.name === '_lightbox') {
                        featherlightAttributes.type = ['image','iframe'].includes(this.getValue()) ? this.getValue() : '';
                      }
                    }
                  },
                  {
                    type: 'fieldset',
                    id: 'iframeSizeSettings',
                    label: ' ',
                    onLoad: function() {
                      var dialog = this.getDialog();
                      var checkbox = document.createElement("input");
                      checkbox.setAttribute("type", "checkbox");
                      checkbox.onclick = function() {
                        sizeToggle.call(this, dialog);
                      };

                      var legend = this.getElement().$.firstElementChild;
                      legend.appendChild(checkbox);
                      legend.appendChild( document.createTextNode(" Set Size") );
                    },
                    setup: function() {
                      if (!featherlightAttributes.size) featherlightAttributes.size = false;
                      var checkbox = this.getElement().$.firstElementChild.firstElementChild;
                      checkbox.checked = featherlightAttributes.size;
                      setSizeElements(this.getDialog(), featherlightAttributes.size);
                    },
                    'default': 'notSet',
                    children: [{
                      type: 'vbox',
                      children: [{
                          type: 'hbox',
                          children: [{
                              id: 'widthSetting',
                              label: 'Width',
                              type: 'number',
                              style: 'width: 58px',
                              'default': '90',
                              min: 0,
                              max: 9999,
                              step: 1,
                              setup: function(data) {
                                if (featherlightAttributes.width && featherlightAttributes.width.value) {
                                  this.setValue(featherlightAttributes.width.value);
                                }
                                else {
                                  if (featherlightAttributes.height && featherlightAttributes.height.value) {
                                    this.setValue('');
                                  }
                                }
                              }
                            },
                            {
                              type: 'select',
                              id: 'widthUnits',
                              label: '',
                              style: 'margin-top:0px;',
                              'default': 'vw',
                              items: [
                                ['<not set> ', 'notSet'],
                                ['vw ', 'vw'],
                                ['% ', '%'],
                                ['px ', 'px']
                              ],
                              setup: function(data) {
                                if (featherlightAttributes.width && featherlightAttributes.width.value) {
                                  this.setValue( featherlightAttributes.width.units ? featherlightAttributes.width.units : 'notSet');
                                }
                                else {
                                  if (featherlightAttributes.height && featherlightAttributes.height.value) {
                                    this.setValue('notSet');
                                  }
                                }
                              }
                            }
                          ]
                        },
                        {
                          type: 'hbox',
                          children: [{
                              id: 'heightSetting',
                              label: 'Height',
                              type: 'number',
                              style: 'width: 58px;',
                              'default': '90',
                              min: 0,
                              max: 9999,
                              step: 1,
                              setup: function(data) {
                                if (featherlightAttributes.height && featherlightAttributes.height.value) {
                                  this.setValue(featherlightAttributes.height.value);
                                }
                                else {
                                  if (featherlightAttributes.width && featherlightAttributes.width.value) {
                                    this.setValue('');
                                  }
                                }
                              }
                            },
                            {
                              type: 'select',
                              id: 'heightUnits',
                              label: '',
                              style: 'margin-top:0px;',
                              'default': 'vh',
                              items: [
                                ['<not set> ', 'notSet'],
                                ['vh ', 'vh'],
                                ['% ', '%'],
                                ['px ', 'px']
                              ],
                              setup: function(data) {
                                if (featherlightAttributes.height && featherlightAttributes.height.value) {
                                  this.setValue( featherlightAttributes.height.units ? featherlightAttributes.height.units : 'notSet');
                                }
                                else {
                                  if (featherlightAttributes.width && featherlightAttributes.width.value) {
                                    this.setValue('notSet');
                                  }
                                }
                              }
                            }
                          ]
                        }
                      ]
                    }],
                    commit: function(data) {
                      var dialog = this.getDialog();

                      if (featherlightAttributes.size === true) {
                        if ([/*'image',*/'iframe'].includes(
                          dialog.getContentElement('target', 'lightboxType').getValue()
                        )) {
                          ['width','height'].map(function(attr) {
                            var setting = dialog.getContentElement('target', attr + 'Setting').getValue(),
                                units = dialog.getContentElement('target', attr + 'Units').getValue();

                            featherlightAttributes[attr] = {};
                            if (setting.length > 0) {
                              featherlightAttributes[attr].value = setting;
                              if (units !== 'notSet') featherlightAttributes[attr].units = units;
                            }
                          });
                        }
                      }
                    }
                  }
                ]
              }]
            });
          }
        });
      }
    };
  })());
})();
