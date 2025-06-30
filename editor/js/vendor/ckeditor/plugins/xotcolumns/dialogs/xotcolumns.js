// Dialog window for Layout Columns

CKEDITOR.dialog.add('xotcolumns', function (editor) {
  'use strict';

  const lang = editor.lang.xotcolumns;

  // Add a style declaration for the faded buttons - https://ckeditor.com/docs/ckeditor4/latest/guide/plugin_sdk_styles.html
  var style = document.createElement('style');
  style.innerHTML = `
  a.cke_disabled, a.cke_disabled span, a.cke_disabled span i {
    color: lightgrey;
    cursor: pointer;
    pointer-events: none;
  }`;
  document.head.appendChild(style);

  function getNearestWidgetAscendant(widgetName) {
    return editor.getSelection().getStartElement().getAscendant(function (element) {
      return element.hasAttribute && element.hasAttribute('data-widget') && element.getAttribute('data-widget') === widgetName;
    }, true);
  }

  function cWD (name, ...params) {
    console.log(name, ...params);
    window[/*'widget_' + */name] = {...params};
  }

  function blackOrWhite(colour) {
    var rgbval = parseInt(colour.substr(1), 16),
      brightness = ((rgbval >> 16) * 0.299) + (((rgbval & 65280) >> 8) * 0.587) + ((rgbval & 255) * 0.114);
  
    return (brightness > 160) ? "#000000" : "#FFFFFF"; // checks whether black or white text is best on bg colour
  }

  return {
    title: 'Autocolumn Settings',
    minWidth: 400,
    minHeight: 100,
    fragment: null,
    onShow: function () {
      //console.log('widget focussed', editor.widgets.focussed);

      // Various scenarios to deal with (brackets show results of nearest widget, getSelectedElement, getSelectedText)
      //    1) Caret flashing = no text selected
      //      a) Inside a xotcolumn widget (widget, null, '')
      //      b) Not inside a xotcolumn widget (null, null, '')
      //      c) Inside html element (such as <a>) but outside widget (null, null, '')
      //      d) Inside html element (such as <a>) and inside widget (widget, null, '')
      //    2) Text only selected
      //      a) Inside a xotcolumn widget (widget, null, 'SELECTED_TEXT')
      //      b) Not inside a xotcolumn widget (null, null, 'SELECTED_TEXT')
      //      c) Inside html element (such as <a>) but outside widget (null, null, 'SELECTED_TEXT')
      //      d) Inside html element (such as <a>) and inside widget (widget, null, 'SELECTED_TEXT')
      //    3) Selection contains ONLY an html tag, such as <a>
      //      a) Inside a xotcolumn widget 
      //      b) Not inside a xotcolumn widget 
      //      c) Inside html element (such as <a>) but outside widget 
      //      d) Inside html element (such as <a>) and inside widget

      //    4) Selection contains text and html
      //      a) Inside a xotcolumn widget
      //      b) Not inside a xotcolumn widget
      //    5) widget itself is selected

      // USEFUL finds
      //  editor.widgets.focused - is a widget selected
      //  editor.getSelection().selectElement(widget) - select the widget - get widget using nearestWidget below
      //  editor.getSelection().getStartElement().getName() - test what tag you are in, for example === 'a' ?
        
      //if (!sel.getSelectedElement()) {
      //  if (editor.widgets.focused) { // we have a widget focussed
      //    //if () 
      //  }
      //  console.log('selected element', sel.getSelectedElement());
      //}*/

      // if inside <a> then select whole <a>
      //if (
      //  !sel.getSelectedElement() &&
      //  sel.getStartElement() &&
      //  sel.getStartElement().getName() === 'a')
      // // we are inside an <a> so lets select the whole <a>
      //   sel.selectElement(sel.getStartElement()); // select the <a>
      //}

      // get the nearest widget, either currently selected or an ascendant
      //     editor.widgets.focused === nearestWidget tells you if it's the current focussed one
      //function getNearestWidgetAscendant(widgetName) {
      //  return editor.getSelection().getStartElement().getAscendant(function (element) {
      //    return element.hasClass && element.hasClass('cke_widget_' + widgetName);
      //  }, true);
      //}*/

      var selection = editor.getSelection();
      var widgets = editor.widgets;
      var nearestWidget = getNearestWidgetAscendant('xotcolumns');

      // Toggle the Remove button status
      this.getButton('remove_button')[nearestWidget ? 'enable' : 'disable']();
  
      if (nearestWidget) { // Scenario 2, 3, 4 DONE
        // First we'll find the correct widget and focus it
        for (let inst in widgets.instances) {
          let w = widgets.instances[inst].element.$;
          if (w === nearestWidget.$) {
            widgets.instances[inst].focus();
            break;
          }
        }
  
        // Store a fragment with a clone of all the nodes
        let children = widgets.focused.element.getChildren();
        let fragment = document.createDocumentFragment();
        children.$.forEach(function(node) {
          fragment.append(node.cloneNode(true));
        });
        this._.selectedElements = fragment;
  
        // Setup the dialog data content with correct data
        this.setupContent(widgets.focused);
        
        // Cancel the default setup (wrong data)
        return false;
      }
      else { // Scenario 1, 5, 6, 7
        // Check for existence of the widget class
        if (
            selection &&
            selection.getSelectedElement() &&
            selection.getSelectedElement().$ &&
            selection.getSelectedElement().$.hasAttribute('data-cke-widget-wrapper')
        ) { // Scenario 1 DONE
          return; // Just allow default behaviours
        }

        // Scenario 5, 6 or 7 
        // Simple - TODO - explore what happens if we get multiple ranges...
        this._.selectedElements = selection.getRanges()[0].cloneContents(true).$; // Works great!!
        return;
      }

    },
    onHide: function () {
      // MEGA MEGA HACKY but seems to be how anchor and link plugins do it too...
      if (editor.widgets.focused && editor.widgets.focused.element) {
        let widgetElement = editor.widgets.focused.element.$;
        let widgetElementParent = widgetElement.parentElement;

        // If we have content then put it back
        if (this._.selectedElements) {
          // First remove all children
          while (widgetElement.hasChildNodes()) {
            widgetElement.removeChild(widgetElement.lastChild);
          }

          if (this._.markForRemoval) {
            widgetElementParent.parentNode.replaceChild(this._.selectedElements, widgetElementParent);
          }
          else {
            widgetElement.append(this._.selectedElements);
          }
        }

        // Lastly, tidy up
        if (this._.markForRemoval) delete this._.markForRemoval;
        if (this._.selectedElements) delete this._.selectedElements;
      }
    },
    contents: [
      {
        id: 'autocolumns',
        elements: [
          {
            id: 'columnsFieldset',
            type: 'fieldset',
            label: lang.columnsFieldsetLabel,
            children: [
              {
                type: 'hbox',
                widths: ['50%', '10%', '40%'],
                children: [
                  {
                    id: 'columns',
                    type: 'number',
                    label: lang.columnsLabel,
                    style: 'width: 58px; padding: 0 0 10px 30px;',
                    default: 2,
                    min: 1,
                    max: 5,
                    step: 1,
                    onChange: function () {
                      let columns = this.getValue();
                      if (parseInt(columns, 10) !== columns) {
                        columns = Math.round(columns);
                        if (Math.min(columns, this.min) < this.min) columns = this.min;
                        if (Math.max(columns, this.max) > this.max) columns = this.max;
                        this.setValue(columns, true);
                      }
                    },
                    setup: function (element) {
                      this.setValue(element.data.columns || this.default);
                    },
                    commit: function (widget) {
                      widget.setData('columns', this.getValue());
                    }
                  },
                  {
                    id: 'column_spacing',
                    type: 'number',
                    label: lang.column_spacingLabel,
                    style: 'width: 58px;',
                    default: 1,
                    min: 0,
                    step: 0.1,
                    onChange: function () {
                      let precision = 1 / (this.step || 1);
                      this.setValue(
                        Math.round(this.getValue() * precision) / precision, true
                      );
                    },
                    setup: function (element) {
                      this.setValue(element.data.column_spacing || this.default);
                    },
                    commit: function (widget) {
                      widget.setData('column_spacing', this.getValue());
                    }
                  },
                  {
                    id: 'spacing_units',
                    type: 'select',
                    default: 'em',
                    style: 'margin-top: 0; width: 58px;',
                    items: [
                      ['em'],
                      ['px']
                    ],
                    onChange: function() {
                      const spacing = this.getDialog().getContentElement('autocolumns','column_spacing');
                      const spacing_input = spacing.getInputElement();

                      // change step values
                      const step = (this.getValue() === 'px' ? 1 : 0.1);
                      spacing.step = step;
                      spacing_input.setAttribute('step', step);

                      // trigger 'column_spacing'onChange
                      spacing.onChange();
                    },
                    setup: function (widget) {
                      this.setValue(widget.data.spacing_units || this.default);
                    },
                    commit: function (widget) {
                      widget.setData('spacing_units', this.getValue());
                    }
                  }
                ]
              },
              {
                type: 'html',
                html: lang.tip
              }
            ]
          },
          {
            id: 'rulerStyleFieldset',
            type: 'fieldset',
            label: lang.rulerStyleFieldsetLabel,
            children: [
              {
                type: 'hbox',
                widths: ['33%', '33%', '33%'],
                children: [
                  {
                    id: 'ruler_style',
                    type: 'select',
                    label: lang.ruler_styleLabel,
                    default: 'none',
                    items: [
                      ['none'],
                      ['solid'],
                      ['double'],
                      ['dotted'],
                      ['dashed']
                    ],
                    setup: function (widget) {
                      this.setValue(widget.data.ruler_style || this.default);
                    },
                    commit: function (widget) {
                      widget.setData('ruler_style', this.getValue());
                    }
                  },
                  {
                    type: 'hbox',
                    widths: ['50%', '50%'],
                    children: [
                      {
                        id: 'ruler_thickness',
                        type: 'number',
                        label: lang.ruler_thicknessLabel,
                        style: 'width: 50px; margin-top: 0.35em;',
                        default: 1,
                        min: 0,
                        step: 1,
                        setup: function (element) {
                          this.setValue(element.data.ruler_thickness || this.default);
                        },
                        commit: function (widget) {
                          widget.setData('ruler_thickness', this.getValue());
                        }
                      },
                      {
                        type: 'html',
                        html: 'px',
                        style: 'display: block; margin: 2.2em 0 0 0.4em;'
                      }
                    ]
                  },
                  {
                    type: 'hbox',
                    widths: ['60%', '40%'],
                    children: [
                      {
                        type: 'text',
                        id: 'ruler_colour',
                        label: lang.ruler_colourLabel,
                        default: '#000000',
                        onChange: function () {
                          this.getInputElement().setAttribute('style',
                            'background-color: ' + this.getValue() + ';' +
                            'color: ' + blackOrWhite(this.getValue()) + ';'
                          );
                        },
                        setup: function(widget) {
                            this.setValue(widget.data.ruler_colour || this.default);
                            this.disable()
                        },
                        commit: function(widget) {
                            widget.setData('ruler_colour', this.getValue().toUpperCase());
                        }
                      },
                      {
                        type: 'button',
                        id: 'ruler_colour_button',
                        label: lang.ruler_colour_buttonLabel,
                        style: 'margin-top: 1.66em;',
                        onClick: function() {
                          editor.getColorFromDialog(function(colour) {
                              const colour_box = this.getDialog().getContentElement('autocolumns','ruler_colour');
                              colour_box.setValue(colour.toUpperCase());
                          }, this, {'color': '#987654'}); // TODO figure this out
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    buttons: [
      {
        type: 'button',
        id: 'remove_button',
        label: lang.remove_buttonLabel,
        title: lang.remove_buttonTitle,
        onClick: function() {
          let returnValue = window.confirm(lang.remove_buttonPromptMessage);
          if (returnValue) {
            this.getDialog()._.markForRemoval = true;
            this.getDialog().getButton('ok').click();
          }
        }
      },
      CKEDITOR.dialog.okButton,
      CKEDITOR.dialog.cancelButton
    ]
  };
});
