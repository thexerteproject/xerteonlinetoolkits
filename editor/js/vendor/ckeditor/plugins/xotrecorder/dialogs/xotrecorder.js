(function() {

  CKEDITOR.dialog.add('xotrecorder', function(editor) {
    window.gebi = getElementById;
    // Path to plugin - used for recording library and transcoding workers
    let pluginPath = CKEDITOR.plugins.getPath( 'xotrecorder' );

    // Variables required by the recording logic
    var gumStream; 						//stream from getUserMedia()
    var recorder; 						//WebAudioRecorder object
    var input; 							//MediaStreamAudioSourceNode  we'll be recording
    var audioContext; //new audio context to help us record
    var media = navigator.mediaDevices;
    var blob;

    var defaultLoadingMessage = '...loading...';

    // Could possibly store/retrieve these using cookies in future
    var defaultFilename = 'recording';
    var defaultTimestamp = true;

    // Add a style declaration for the faded buttons - https://ckeditor.com/docs/ckeditor4/latest/guide/plugin_sdk_styles.html
    var style = document.createElement('style');
    style.innerHTML = `
    a.cke_disabled, a.cke_disabled span, a.cke_disabled span i {
      color: lightgrey;
      cursor: pointer;
      pointer-events: none;
    }`;
    document.head.appendChild(style);

    // Update dropdowns when media devices change
    media.addEventListener('devicechange', updateDevicesDropdown);

    function startRecording() {

      // Do we still have a recording requiring attention?
      if (blob) {
        if (!window.confirm('You already have a recording waiting to upload. Do you want to discard and record again?'))
          return;
      }
      blob = undefined;  // Else clear the blob and record again

      // Sort the button state
      getButtonById('insertButton').disable();
      getButtonById('uploadButton').disable();
      getElementById('audioPlayer').getElement().setAttribute('src', '');

      // Need to add the device id to the constraints
      var constraints = { audio: { deviceId: /*{ exact:*/ getElementById('recordingDevicesSelect').getValue() /*}*/}, video:false };

      media.getUserMedia(constraints).then(function(stream) {

        // Setup audio context and stream
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        __log("Format: 2 channel " + getElementById('encodingTypeSelect').getValue() + ' @ ' + audioContext.sampleRate/1000 + 'kHz');
        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);
        //input.connect(audioContext.destination)  //stop the input from playing back through the speakers

        //disable controls
        getElementById('recordingDevicesSelect').disable();
        getElementById('encodingTypeSelect').disable();
        getButtonById('uploadButton').disable();
        getButtonById('insertButton').disable();

        recorder = new WebAudioRecorder(input, {
          workerDir: pluginPath + 'js/workers/', // must end with slash
          encoding: getElementById('encodingTypeSelect').getValue(),
          numChannels:2, //2 is the default, mp3 encoding supports only 2
          onEncoderLoading: function(recorder, encoding) {
            __log("Loading "+encoding+" encoder...");
          },
          onEncoderLoaded: function(recorder, encoding) {
            __log(encoding+" encoder loaded");
          }
        });

        recorder.onComplete = function(recorder, newBlob) { 
          __log("Encoding complete");
          blob = newBlob;
          setupAudioPlayer();
          getButtonById('insertButton').enable();
          getButtonById('uploadButton').enable();
        }

        recorder.setOptions({
          timeLimit:120,
          encodeAfterRecord: true,
            ogg: {quality: 0.5},
            mp3: {bitRate: 160}
          });

        //start the recording process
        recorder.startRecording();

      }).catch(function(err) {
          //enable the record button if getUSerMedia() fails
          getElementById('recordButton').enable();
          getElementById('stopButton').disable();
      });

      //disable the record button
      getElementById('recordButton').disable();
      getElementById('stopButton').enable();
    }

    function stopRecording() {
      //stop microphone access
      gumStream.getAudioTracks()[0].stop();

      //disable the stop button, enable record
      getElementById('stopButton').disable();
      getElementById('recordButton').enable();
      
      //tell the recorder to finish the recording (stop recording + encode the recorded audio)
      recorder.finishRecording();
    }

    function setupAudioPlayer() {
      //webkitURL is deprecated but nevertheless
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var au = getElementById('audioPlayer').getElement();
      au.setAttribute('src', url);
      au.disableContextMenu();
    }

    //helper function
    function __log(e, data) {return;
      console.log(e + " " + (data || '') );
    }
 
    // *** Plugin Helper Functions ***
    function initialiseRecorder() {
      getButtonById('insertButton').disable();
      getButtonById('uploadButton').disable();
      getElementById('audioPlayer').getElement().setAttribute('src', '');

      getElementById('recordButton').enable();
      getElementById('stopButton').disable();
      getElementById('recordingDevicesSelect').enable();
      getElementById('encodingTypeSelect').enable();

      blob = undefined;
    }

    function fixTimestamp() {
      let cb = getElementById("timestamp").getElement();
      let ch = cb.$.children;
      ch[0].setAttribute('style', 'margin: 8px 0 0 25px;');
      let newHtml = ch[1].outerHTML + '<br />' + ch[0].outerHTML;
      cb.setHtml(newHtml);
    }

    function setup() {
      // Load the WebAudioRecorder library
      CKEDITOR.scriptLoader.load([pluginPath + 'js/WebAudioRecorder.min.js'], function(completed, failed) {
        if (failed.length > 0) __log('Some files failed to load: ', failed);
      });

      // Hack to use FA icons in tabs
      swapTabTitlesAndLabels();

      // Make the timestamp look nicer
      fixTimestamp();

//exposeSomeData();
      // Initial state
      initialiseRecorder();
    }

// Expose some data for debug - TODO: Revove for release
function exposeSomeData(){
  window.gebi = getElementById;
  window.editor = editor;

  // Rejig the timestamp layout
  window.ts = getElementById('timestamp').getElement();
}
    function getButtonById(id) {
      let currentDialog = CKEDITOR.dialog.getCurrent();
      if (!currentDialog) return;

      return currentDialog.getButton(id);
    }

    function getElementById(id) {
      let currentDialog = CKEDITOR.dialog.getCurrent();
      if (!currentDialog) return;

      let contents = currentDialog._.contents;
      for (const tab in contents) {
        for (const element in contents[tab]) {
          if (element === id) return contents[tab][element];
        }
      }
    }

    function faButton() {
			if (	this.label &&
						this.label.indexOf('>') > -1 &&
						this.label.indexOf('<') > -1 ) {
				document.getElementById(this.domId).children[0].innerHTML = this.label;
			}
    }

    function swapTabTitlesAndLabels() {
      const tabs = CKEDITOR.dialog.getCurrent().parts.tabs.$.childNodes;
      const tabDefinition = CKEDITOR.dialog.getCurrent().definition.contents;

      for (let i = 0; i < tabs.length; i++) {
        tabs[i].setAttribute('title', tabDefinition[i].label);
        tabs[i].innerHTML = tabDefinition[i].title;
      }
    }

    function resetInitialValue() {
        this._.initValue = this.getValue();
    }

		function uploadAndInsert(insert) {
			let reader = new FileReader();
      let flag = 

			reader.onload = function(data) {
				let fd = new FormData();
				fd.append('recorded_data', data.target.result);
        fd.append('filename', getFilename());
        fd.append('extension', getEncodingType());

				$.ajax({
					type: 'POST',
					url: editor.config.uploadAudioUrl,
					data: fd,
					processData: false,
					contentType: false
				})
				.done(function(data) {
          let response = JSON.parse(data);
          if (response && response.status) {
					  if (response.status === 'success') {
              blob = undefined;
              if (insert) {
                getElementById('filename').finalUrl = response.url;
                //The ULTIMATE CKEditor hack
                return CKEDITOR.dialog.okButton(editor).onClick({data: {dialog: CKEDITOR.dialog.getCurrent()}});
              }
              else CKEDITOR.dialog.getCurrent().getButton('cancel').click();
            }
					}
          __log('Uploader didn\'t response. Download the file and upload later.');
        });
			};

			reader.readAsDataURL( blob );
		}

    function getFilename() {
      let filename = getElementById('filename').getValue();
      let cleansed = filename.replace(/[^a-zA-Z0-9_-\s]/g,'');
      cleansed = cleansed.replace(/\s+/g,'_').replace(/_+/g,'_');
      cleansed = cleansed.replace(/^_|_$/g,'');

      if (filename !== cleansed) {
        getElementById('filename').setValue(cleansed);
        alert(editor.lang.xotrecorder.charactersAllowed);
      }

      let timestamp = getElementById('timestamp').getValue() ? '_' + new Date().valueOf() : '';
      return (cleansed + timestamp).replace(/\s/g, '_');
    }

    function getEncodingType() {
      return getElementById('encodingTypeSelect').getValue();
    }

    function updateFilename() {
      let html = "Example filename: <strong>" + getFilename() + '.' + getEncodingType() + '</strong>';
      if (getElementById('timestamp').getValue()) html += ' (timestamp will be different)';
      getElementById('finalFilename').getElement().setHtml( html );
    }

    function updateDevicesDropdown() {
      let recordingDevicesSelect = getElementById('recordingDevicesSelect');
      if (!recordingDevicesSelect) return;

      // Preserve values currently set
      let dropdown = recordingDevicesSelect.getElement().$.querySelectorAll('select')[0];
      let currentList = dropdown.children;
      let empty = (currentList.length === 1 && currentList[0].value === defaultLoadingMessage);

      // Remove all current options
      for (let i = 0; i < currentList.length; i++) currentList[i].remove();

      let ids = [],
          count = 0;
      navigator.mediaDevices
        .enumerateDevices()
        .then( devices => {
          devices.forEach( device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            if (!ids.includes(device.groupId)) {
              ids.push(device.groupId);
      
              if (device.kind === 'audioinput') {
                option.text = device.label || `Microphone ${count + 1}`;
                dropdown.appendChild(option);
              }
            }
          });
        });

        // Reset the default so that we don't get the 'something changed' method on cancel
        // TODO - investigate why this needs to be run asynchronously
        window.setTimeout(function () {
          getElementById('recordingDevicesSelect').onChange();
        }, 250);

        // TODO - figure out this code so that the behavious was as before
/*      let ids = [];
      for (let i = 0; i !== devices.length; ++i) {
        const deviceInfo = devices[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (ids.indexOf(deviceInfo.groupId) < 0) {
          ids.push(deviceInfo.groupId);

          if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `Microphone ${audioInputSelect.length + 1}`;
            audioSelect.appendChild(option);
          }
        }
      }

      let changed = false;
      selectors.forEach((select, selectorIndex) => {
        if ([].slice.call(select.childNodes).some(n => n.value === values[selectorIndex]))
          select.value = values[selectorIndex];
        else
          changed = true;
      });*/
    }

    return {
      title: editor.lang.xotrecorder.dialogTitle,
      minWidth: 500,
      minHeight: 100,
      contents: [
/*tab1*/{
	        // ****************************
	        // Tab 1 Parameters
	        // ****************************
          id: 'recordTab',
          label: editor.lang.xotrecorder.recordTabLabel,
          title: '<i class="fas fa-microphone"></i> ' + editor.lang.xotrecorder.recordTabLabel,
          accessKey: '1',
          //title: editor.lang.xotrecorder.recordLabel,
          elements: [
/*vbox*/  {
            type: 'vbox',
            padding: 0,
            children: [
/*hbox*/    {
              type: 'hbox',
              //widths: ['335px', '110px'],
              children: [
/*vbox*/      {
                type: 'vbox',
                padding: 0,
                widths: ['100%'],
                children: [
/*hbox*/        {
                  type: 'hbox',
                  widths: ['10%', '10%'],
                  align: 'left',
                  children: [
/*recordButton*/  {
                    type: 'button',
                    id: 'recordButton',
                    label: '<i class="fa fa-circle"></i>',
                    title: editor.lang.xotrecorder.recordButton || 'Start Recording',
                    setup: faButton,
                    onClick: startRecording
                  },
/*stopButton*/    {
                    type: 'button',
                    id: 'stopButton',
                    label: '<i class="fa fa-stop"></i>',
                    title: editor.lang.xotrecorder.stopButton || 'Stop Recording',
                    style: 'margin-right: 25px;',
                    setup: faButton,
                    onClick: stopRecording
                  },
/*tooltip*/       {
                    type: 'html',
                    html: editor.lang.xotrecorder.tooltip,
                    id: 'tooltip',
                    style: 'white-space: normal;'
                  }]
                },
/*html*/        {
                  type: 'html',
                  id: 'audioPlayer',
                  html: `<audio controls>Your browser does not support the audio element.</audio>`,
                  style: 'padding-top:10px;height: revert; width: revert;',
                  onShow: function() {
                    this.disable();
                  }
                }] // End Children
              }]
            }] // End Children
          }] // End Elements
        },
/*tab2*/{
	        // ****************************
	        // Tab 2
	        // ****************************
          id: 'settingsTab',
          label: editor.lang.xotrecorder.settingsTabLabel,
          title: '<i class="fas fa-cog"></i> ' + editor.lang.xotrecorder.settingsTabLabel,
          accessKey: '2',
          elements: [
/*vbox*/  {
            type: 'vbox',
            padding: 0,
            children: [
/*fieldset*/{
              type: 'fieldset',
              id: 'audioSettingsFieldset',
              label: editor.lang.xotrecorder.audioSettings || 'Audio Settings',
              children: [
/*hbox*/      {
                type: 'hbox',
                widths: ['50%%', '50%'],
                children: [
/*devicesSelect*/{
                  type: 'select',
                  id: 'recordingDevicesSelect',
                  label: editor.lang.xotrecorder.devicesSelect || 'Recording Device:',
                  items: [[defaultLoadingMessage]],
                  'default': defaultLoadingMessage,
                  onShow: updateDevicesDropdown,
                  onChange: resetInitialValue
                },
/*encodingTypeSel*/{
                  type: 'select',
                  id: 'encodingTypeSelect',
                  label: editor.lang.xotrecorder.encodingTypeSelect || 'Encoding Type:',
                  items: [
                    ['MP3 (MPEG-1 Audio Layer III) (.mp3)', 'mp3'],
                    ['Ogg Vorbis (.ogg)', 'ogg'],
                    ['Uncompressed Waveform Audio (.wav)', 'wav']
                  ],
                  'default': 'mp3',
                  setup: function(widget) {
                    setup();
                  },
                  onChange: function () {
                    updateFilename.call(this);
                    resetInitialValue.call(this);
                  }
                }]
              }] // End Children
            },
/*fieldset*/{
              type: 'fieldset',
              id: 'filenameFieldset',
              label: editor.lang.xotrecorder.fileSettings || 'Upload File Settings',
              style: 'margin-top: 15px;',
              children: [
/*vbox*/      {
                type: 'vbox',
                children: [
/*hbox*/        {
                  type: 'hbox',
                  widths: ['90%%', '10%'],
                  style: 'margin-bottom: 10px',
                  children: [
/*filename*/      {
                    type: 'text',
                    id: 'filename',
                    label: editor.lang.xotrecorder.filenameTextbox || 'Filename:',
                    'default': defaultFilename || 'recording',
                    onChange: function () {
                      updateFilename.call(this);
                      resetInitialValue.call(this);
                    },
                    commit: function (widget) {
                      widget.setData('url', this.finalUrl);
                    }
                  },
/*timestamp*/     {
                    type: 'checkbox',
                    id: 'timestamp',
                    label: editor.lang.xotrecorder.timestampCheckbox || 'Timestamp:',
                    'default': defaultTimestamp || true,
                    onChange: function () {
                      updateFilename.call(this);
                      resetInitialValue.call(this);
                    }
                  }]
                },
/*finalFilename*/{
                  type: 'html',
                  id: 'finalFilename',
                  title: editor.lang.xotrecorder.finalFilename || 'This is only an example of the format, the timestamp, if selected, will be different.',
                  html: ' ',
                  onShow: updateFilename
                }]
              }]
            }]
          }]
        }],
      onCancel: function(ev) { // Catch closing event so we can cancel if recordings left to upload
        if (blob) {
          return window.confirm(editor.lang.xotrecorder.closeMessage);
        }
        return true;
      },
      buttons: [
/*uploadButton*/{
        type: 'button',
        id: 'uploadButton',
        label: editor.lang.xotrecorder.uploadButton,
        title: editor.lang.xotrecorder.uploadButton,
        onClick: function() {
          uploadAndInsert(false);
        }
      },
/*insertButton*/{
        type: 'button',
        id: 'insertButton',
        label: editor.lang.xotrecorder.insertButton,
        title: editor.lang.xotrecorder.insertButton,
        onClick: function() {
          uploadAndInsert(true);
        }
      },
      CKEDITOR.dialog.cancelButton
      ]
    };
  })
})();
