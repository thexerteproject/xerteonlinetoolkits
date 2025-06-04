(function ($) {
  'use strict';
  
  // separateStyles(['width','height'], 'width:95vw;height:90vw;color:red;size:67px')
  // returns: [object, array]
  // returns: [ { width: '95%', height: '90%' }, ['color:red', 'size:67px'] ]
  function separateStyles(attrs, style) {
    return [
      style.split(';').filter(function(item) {
        return attrs.includes(item.split(':')[0].trim());
      }).reduce(function(obj, item) {
        var pairs = item.split(':');
        if (pairs.length && pairs.length === 2) {
          let extra;
          if (pairs[1].trim().split(' ').length > 2) {
            extra = pairs[1].trim().split(' ').slice(1);
          }
          var dimension = pairs[1].trim().match(/(\d+)\s*(em|px){0,1}(?:\s*(\w+)\s*(rgb\([\d|,|\s]+\)|\w+|#[0123456789abcdefABCDEF]{3,6})){0,1}/i);
          //console.log(dimension, pairs[1]);
          if (dimension && dimension.length > 0) {
            obj[pairs[0].trim()] = {
              'value': dimension[1],
              'units': dimension[2]
            };
            if (dimension[3]) obj[pairs[0].trim()]['style'] = dimension[3];
            if (dimension[4]) obj[pairs[0].trim()]['color'] = dimension[4];
          }
        }
        return obj;
      }, {}),
      style.split(';')
      .filter(function(i) {
        return i.trim().length > 0;
      }) // remove empty terms
      .filter(function(item) { // return terms not in the attrs array: [width, height]
        return !attrs.includes(item.split(':')[0].trim());
      })
    ];
  }

  function cWD (name, ...params) {
    console.log(name, ...params);
    window[/*'widget_' + */name] = {...params};
  }

  CKEDITOR.plugins.add('xotcolumns', {
    requires: 'widget',
    icons: 'xotcolumns',
    lang: 'en',
    hidpi: true,

    // Configure CKEditor DTD for custom drupal-entity element.
    // @see https://www.drupal.org/node/2448449#comment-9717735
    /*beforeInit: function (editor) {
      const dtd = CKEDITOR.dtd;

      dtd['layout-columns'] = {'div': 1};
      for (let tagName in dtd) {
        if (dtd[tagName].div) {
          dtd[tagName]['layout-columns'] = 1;
        }
      }
    },*/

    init: function (editor) {

      const lang = editor.lang.xotcolumns;

      function getNearestWidgetAscendant(widgetName) {
        return editor.getSelection().getStartElement().getAscendant(function (element) {
          return element.hasAttribute && element.hasAttribute('data-widget') && element.getAttribute('data-widget') === widgetName;
        }, true);
      }

      // Register the editing dialog.
      CKEDITOR.dialog.add('xotcolumns', this.path + 'dialogs/xotcolumns.js');

      // Add our plugin-specific CSS to style the widget within CKEditor.
      editor.addContentsCss(this.path + 'css/xotcolumns.css');

      // Add toolbar button for this plugin.
      editor.ui.addButton('xotcolumns', {
        label: lang.toolbarButtonLabel,
        command: 'xotcolumns',
        toolbar: 'blocks,1',
        icon: this.path + 'icons/' + (CKEDITOR.env.hidpi ? 'hidpi/' : '') + 'xotcolumns.png'
      });

      // Register the widget.
      editor.widgets.add('xotcolumns', {
        inline: false,
        // Create the HTML template
        template: '<div class="autocolumns"></div>',

        /*defaults: {
          columns: 1
        },*/

        editables: {
          content: {
            selector: 'div.autocolumns'
          }
        },

        // Prevent the editor from removing these elements
        allowedContent: 'div(autocolumns)',

        // The minimum required for this to work
        requiredContent: 'div(!autocolumns)',

        // Convert any 'data-column' elements into this widget
        upcast: function (element) {
          return element.name === 'div' && element.hasClass('autocolumns');
        },

        dialog: 'xotcolumns',

        init: function () {
          // Get the columns from the autocolumns class
          for (let i=1; i<5; i++) {
            if (this.element.hasClass('autocolumns' + i)) {
              this.setData('columns', i);
              break;
            }
          }

          // Parse any style tag
          let columnGap = {}, columnRule = {},
              style = this.element.getAttribute('style');

          if (style) {
            let styles = separateStyles(['column-rule', 'column-gap'], style);
            if (styles[0]) {
              columnGap = styles[0]['column-gap'];
              columnRule = styles[0]['column-rule'];
            }
          }

          this.setData('column_spacing', columnGap.value);
          this.setData('spacing_units', columnGap.units);
          this.setData('ruler_thickness', columnRule.value);
          this.setData('ruler_style', columnRule.style);
          this.setData('ruler_colour', columnRule.color);
        },
        data: function () {
          // Remove any currently set classes and set new one (also remove 'undefined' just in case)
          for (let i=1; i<5; i++) 
            this.element.removeClass('autocolumns' + i);
          this.element.removeClass('autocolumnsundefined'); // not sure why but this sometimes shows up...
          this.element.addClass('autocolumns' + this.data.columns);

          // Get the old style and merge with the new one
          let extraStyle = '',
              style = this.element.getAttribute('style');

          if (style) {
            let styles = separateStyles(['column-rule', 'column-gap'], style);
            if (styles[1]) extraStyle = styles[1].join('||');
          }

           //column-rule: 4px dotted rgb(255, 249, 61); column-gap: 4em;
          this.element.setAttribute('style',
            'column-rule: ' + this.data.ruler_thickness + 'px ' + this.data.ruler_style + ' ' + this.data.ruler_colour + ';' +
            'column-gap: ' + this.data.column_spacing + this.data.spacing_units + ';' + extraStyle
          );
        }
      });

      if (editor.contextMenu) {
			
        editor.addMenuGroup('xotcolumnsGroup');
        editor.addMenuItem('xotcolumnsItem', {
          label: lang.contextMenuLabel,
          icon: this.path + 'icons/xotcolumns.png',
          command: 'xotcolumns',
          group: 'xotcolumnsGroup',
        });
  
        editor.contextMenu.addListener(function(element, selection, path) {
          if (!element || element.isReadOnly())
            return null;
  
          var element = selection.getStartElement();
          if (element) {
            element = getNearestWidgetAscendant('xotcolumns');
          }
  
          if (element) {
            editor.getMenuItem('editdiv').state = CKEDITOR.TRISTATE_DISABLED;
            editor.getMenuItem('removediv').state = CKEDITOR.TRISTATE_DISABLED;
          }

          return { 
            xotcolumnsItem: CKEDITOR.TRISTATE_OFF
          };
        });
      }      
    }
  });
})(jQuery);
