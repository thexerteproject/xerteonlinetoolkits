(function() {

  // Keep track of currently open dialog
  var currentDialog,
      featherlightAttributes;

  // return FL = {
  //   type: iframe, image - from 'data-featherlight'
  //   height: vm/vh, %, px - from 'data-featherlight-iframe-height' OR 'data-featherlight-style'
  //   width: vm/vh, %, px - from 'data-featherlight-iframe-width' OR 'data-featherlight-style'
  // }
  function extractFeatherlightAttributes(element) {
    var FL = featherlightAttributes || {};

    // Get featherlight type
    if (element.getAttribute('data-featherlight')) {
      FL.type = element.getAttribute('data-featherlight');

      // Get width and height if iframe
      if (FL.type === 'iframe') {
          if (element.getAttribute('data-featherlight-iframe-width')) FL.width = {'value': element.getAttribute('data-featherlight-iframe-width')};
          if (element.getAttribute('data-featherlight-iframe-height')) FL.height = {'value': element.getAttribute('data-featherlight-iframe-height')};
          FL.size = (FL.width || FL.height) ? true : false;
      }

      // Check for a styles attribute and separate out width,height
      if (element.getAttribute('data-featherlight-iframe-style')) {
        var styles = separateStyles(['width','height'], element.getAttribute('data-featherlight-iframe-style'));
        if (styles[0].width) FL.width = styles[0].width;
        if (styles[0].height) FL.height = styles[0].height;
        if (styles[1].length > 0) FL.style = styles[1];
        FL.size = FL.size || ((styles[0].width || styles[0].height) ? true : false);
      }
    }
console.log(FL);
    return FL;
  }

  // separateStyles(['width','height'], 'width:95vw;height:90vw;color:red;size:67px')
  // returns: [ ['width:95vw','height:90vw' ], 'color:red;size:67px'] ]
  function separateStyles(attrs, style) {
    return [
      style.split(';').filter(function(item) {
        return attrs.includes(item.split(':')[0].trim());
      }).reduce(function(obj, item) { //console.log(item); debugger;
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
      style.split(';').filter(function(item) {
        return !attrs.includes(item.split(':')[0].trim());
      })
    ];
  }

  function sizeToggle() {
    setSizeElements(this.checked);
    if (!featherlightAttributes) featherlightAttributes = {};
    featherlightAttributes.size = this.checked;
  }

  function setSizeElements(enable) {//debugger;
    var option = enable ? 'enable' : 'disable';
    currentDialog.getContentElement('target', 'widthSetting')[option]();
    currentDialog.getContentElement('target', 'widthUnits')[option]();
    currentDialog.getContentElement('target', 'heightSetting')[option]();
    currentDialog.getContentElement('target', 'heightUnits')[option]();
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
          linkDialogDefinition.onShow = function() {//window.th = this;debugger;
            var editor = this.getParentEditor(),
                element = CKEDITOR.plugins.link.getSelectedLink(editor),
                selection = editor.getSelection();

            // Store a reference to currentDialog
            currentDialog = this;

            // Selects a link if we just right click inside, without selecting first
            if (element && element.hasAttribute('href')) selection.selectElement(element);

            featherlightAttributes = {};
            if (element) { //  we have an existing hyperlink, extract data-featherlight options
              featherlightAttributes = extractFeatherlightAttributes(element);
              if (featherlightAttributes.type) {
                element.setAttribute('target', '_lightbox');//console.log(element);debugger;
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

            console.log(featherlightAttributes);
            if (featherlightAttributes.type && featherlightAttributes.type.length > 0) {
              // Get the link that we are editing... or a new link has been inserted so we need to get a reference
              var element = editor.getSelection().getSelectedElement() || CKEDITOR.plugins.link.getSelectedLink(editor);

              element.setAttribute('data-featherlight', featherlightAttributes.type);
              element.removeAttribute('target');


              if (featherlightAttributes.size) {
                if (featherlightAttributes.width || featherlightAttributes.height) {
                  var style = [];
                  if (featherlightAttributes.width) {
                    if (featherlightAttributes.width.units === "notSet") {
                      element.setAttribute('data-featherlight-iframe-width', featherlightAttributes.width.value);
                      delete featherlightAttributes.width;
                    }
                    else {
                      element.removeAttribute('data-featherlight-iframe-width');
                      style.push('width:' + featherlightAttributes.width.value + featherlightAttributes.width.units);
                    }
                    if (featherlightAttributes.height.units === "notSet") {
                      element.setAttribute('data-featherlight-iframe-height', featherlightAttributes.height.value);
                      delete featherlightAttributes.height;
                    }
                    else {
                      element.removeAttribute('data-featherlight-iframe-height');
                      style.push('height:' + featherlightAttributes.height.value + featherlightAttributes.height.units);
                    }

                    if (featherlightAttributes.style || style.length > 0) {
                      if (featherlightAttributes.style && featherlightAttributes.style.length !== 1 && featherlightAttributes.style !== '') style.concat(featherlightAttributes.style);
                      if (style.length > 0) {
                        element.setAttribute('data-featherlight-iframe-style', style.join(';'));
                      }
                      else {
                        element.removeAttribute('data-featherlight-iframe-style');
                      }
                    }
                  }
                }
              }
              else {
                element.removeAttribute('data-featherlight-iframe-width');
                element.removeAttribute('data-featherlight-iframe-height');
                if (featherlightAttributes.style && featherlightAttributes.style.length !== 1 && featherlightAttributes.style !== '') {
                  element.setAttribute('data-featherlight-iframe-style', featherlightAttributes.style.join(';'));
                }
                else {
                  element.removeAttribute('data-featherlight-iframe-style');
                }
              }
            }
          };

          // No onCancel handler to store so just define the new handler
          linkDialogDefinition.onCancel = function() {
            // Put all the attributes that we've messed with back to what they were
            var editor = this._.editor,
              element = editor.getSelection().getSelectedElement();

            if (element) {
              if (element.getAttribute('target') && element.getAttribute('target') === '_lightbox') {
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
            console.log(data);
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
          };

          // Check if we've added Lightbox option before, if not then add it...
          if (linkTargetTypeDropdown.items && !linkTargetTypeDropdown.items.some(function(item) {
              return item[0] === 'Lightbox';
            })) {
            linkTargetTypeDropdown.items.push(["Lightbox", "_lightbox"]);

            var lightboxTypeOnChange = function() {
              var display = this.getValue() === "iframe";
              //console.log(this.getDialog(), this.getDialog().getContentElement('target', 'iframeSizeSettings'));
              this.getDialog().getContentElement('target', 'iframeSizeSettings').getElement()[display ? 'show' : 'hide']();
              featherlightAttributes.size = false;
            };

            // Add a filedset containing lightbox Options
            linkDialogTargetTab.elements.push({
              type: 'fieldset',
              id: 'lightboxOptions',
              label: 'Lightbox Options',
              setup: function() {
                console.log("lightbox options fieldset setup.");
              },
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
                      lightboxTypeOnChange.call(this);
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
                      var checkbox = document.createElement("input");
                      checkbox.setAttribute("type", "checkbox");
                      checkbox.onclick = sizeToggle;

                      var legend = this.getElement().$.firstElementChild;
                      legend.appendChild(checkbox);
                      legend.appendChild( document.createTextNode(" Set Size") );
                    },
                    setup: function() {
                      var checkbox = this.getElement().$.firstElementChild.firstElementChild;
                      checkbox.checked = featherlightAttributes.size; // ? true : false);
                      setSizeElements(featherlightAttributes.size);
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
                              }
                            }
                          ]
                        }
                      ]
                    }],
                    commit: function(data) {
                      var dialog = this.getDialog(),
                        style = {};

                      if (featherlightAttributes.size === true) {
                        if (['image','iframe'].includes(
                          dialog.getContentElement('target', 'lightboxType').getValue()
                        )) {
                          var h = dialog.getContentElement('target', 'heightSetting').getValue(),
                              hu = dialog.getContentElement('target', 'heightUnits').getValue(),
                              w = dialog.getContentElement('target', 'widthSetting').getValue(),
                              wu = dialog.getContentElement('target', 'widthUnits').getValue();

                          if (w.length > 0) featherlightAttributes.width = {'value' : w, units: wu};
                          if (h.length > 0) featherlightAttributes.height = {'value' : h, units: hu};
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
