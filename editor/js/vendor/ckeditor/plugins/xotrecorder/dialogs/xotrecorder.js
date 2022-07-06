(function() {
  CKEDITOR.dialog.add('xotrecorder', function(editor) {

    // Path to plugin - used for recording library and transcoding workers
    let pluginPath = CKEDITOR.plugins.getPath( 'xotrecorder' );

    // Variables required by the recording logic
    var gumStream; 						//stream from getUserMedia()
    var recorder; 						//WebAudioRecorder object
    var input; 							  //MediaStreamAudioSourceNode  we'll be recording
    var audioContext;         //new audio context to help us record
    var media = navigator.mediaDevices;
    var blob;
    var lang = editor.lang.xotrecorder;
    var dialogOpen = false;
    var recording = false;
    var permissionState = {
      counter: 0,
      timer: null,
      granted: false
    };

    // Could possibly store/retrieve these using cookies in future
    var defaultTimestamp = true;

    // Add a style declaration for the faded buttons - https://ckeditor.com/docs/ckeditor4/latest/guide/plugin_sdk_styles.html
    var style = document.createElement('style');
    style.innerHTML = `
    a.cke_disabled, a.cke_disabled span, a.cke_disabled span i {
      color: lightgrey;
      cursor: pointer;
      pointer-events: none;
    }
    .recording i {
      color:red !important;
    }`;
    document.head.appendChild(style);

    // Update dropdowns when media devices change
    media.addEventListener('devicechange', updateDevicesDropdown);

    function startRecording() {
      if (recording) return;

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

        //disable controls
        enableDisable('recordingDevicesSelect', 'disable');
        enableDisable('encodingTypeSelect', 'disable');
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
          recording = false;
        }

        recorder.setOptions({
          timeLimit:120,
          encodeAfterRecord: true,
            ogg: {quality: 0.5},
            mp3: {bitRate: 160}
          });

        //start the recording process
        recording = true;
        recorder.startRecording();

      }).catch(function(err) { console.log('The recorder stopped prematurely, with this error', err);
          //enable the record button if getUSerMedia() fails
          setRecordButton(permissionState.granted, false); //enabled??, but not red
          enableDisable('stopButton', 'disable');
          recording = false;
          if (err.toString().indexOf('Permission denied')) {
            startUpdatingDevicesList();
          }
      });

      //disable the record button
      setRecordButton(false, true); //disable, red
      enableDisable('stopButton', 'enable');
    }

    function stopRecording() {
      //stop microphone access
      if (gumStream && gumStream.getAudioTracks) gumStream.getAudioTracks()[0].stop();
      recording = false;

      //disable the stop button, enable record
      enableDisable('stopButton', 'disable');
      setRecordButton(permissionState.granted, false); //enabled??, not red
      enableDisable('recordingDevicesSelect', 'enable');
      enableDisable('encodingTypeSelect', 'enable');
      
      //tell the recorder to finish the recording (stop recording + encode the recorded audio)
      recorder.finishRecording();
    }

    function enableDisable(identifier, en_di) {
      let element = getElementById(identifier);
      let state = (en_di === true || en_di === 'enable') ? true : false;
      if (element) element[state ? 'enable' : 'disable']();
    }

    function setupAudioPlayer() {
      //webkitURL is deprecated but nevertheless
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      var player = getElementById('audioPlayer');
      if (!player) return;

      var au = player.getElement();
      au.setAttribute('src', url);
      au.disableContextMenu();
    }

    //helper function
    function __log(e, data) { return;
      console.log(e + " " + (data || '') );
    }
 
    // *** Plugin Helper Functions ***
    function initialiseRecorder() {
      enableDisable('insertButton', 'disable');
      enableDisable('uploadButton', 'disable');
      getElementById('audioPlayer').getElement().setAttribute('src', '');

      setRecordButton(permissionState.granted, false); //enable, not red
      enableDisable('stopButton', 'disable');
      enableDisable('recordingDevicesSelect', 'enable');
      enableDisable('encodingTypeSelect', 'enable');

      blob = undefined;
    }

    // Switch the checkbox and label to make them match other elements
    function fixTimestamp() {
      let cb = getElementById("timestamp").getElement();
      let ch = cb.$.children;

      if (ch.length !== 2) return; // Already done it

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

      // Flag used to prevent alerts if dialog has been closed
      dialogOpen = true;
      permissionState.counter = 0;

      // Make the timestamp look nicer
      fixTimestamp();

      // Initial state
      initialiseRecorder();
      setRecordButton(false, false); //disable, not red
    }

    function getButtonById(id) {
      let currentDialog = CKEDITOR.dialog.getCurrent();
      if (!currentDialog) return;

      return currentDialog.getButton(id);
    }

    function getElementById(id) {
      let currentDialog = CKEDITOR.dialog.getCurrent();
      if (!currentDialog) return;

      let el = currentDialog.getContentElement('recordTab', id) || currentDialog.getContentElement('settingsTab', id) || currentDialog.getButton(id);
      return el;

      /*let contents = currentDialog._.contents;
      for (const tab in contents) {
        for (const element in contents[tab]) {
          if (element === id) return contents[tab][element];
        }
      }*/
    }

    function faButton() {
			if (	this.label &&
						this.label.indexOf('>') > -1 &&
						this.label.indexOf('<') > -1 ) {
				document.getElementById(this.domId).children[0].innerHTML = this.label;
			}
    }

    function setRecordButton(enable, recording) {
      enableDisable('recordButton', enable);

      let recButton = getElementById('recordButton');
      if (!getElementById('recordButton')) return;

      let domId = recButton.domId;
      if(!domId) return;

      document.getElementById(domId).classList[recording ? 'add' : 'remove']("recording");
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
        alert(lang.charactersAllowed);
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

    function startUpdatingDevicesList() {

      function triggerPermissionCheck() {
        // Trigger the permission check
        navigator.mediaDevices.getUserMedia({audio:true, video:false})
        .then(function() {
          mediaDevicesReturn(true);
        })
        .catch(function(e) {
          if (e.toString().indexOf('Permission denied')) {
            mediaDevicesReturn(false);
          }
        });
      }

      function mediaDevicesReturn(allowed) {
        if (permissionState.granted != allowed) updateDevicesDropdown();
        if (allowed) setRecordButton(allowed, recording); //enable, not red
        if (!allowed && dialogOpen) {
          if ((permissionState.counter++ % 60 === 0) && !permissionState.granted) alert(lang.permissionsInitial);
          if (permissionState.granted) {
            stopRecording();
            alert(lang.permissionsRevoked);
          }
        }
        permissionState.granted = allowed;
        if (dialogOpen) permissionState.timer = setTimeout(triggerPermissionCheck, allowed ? 5000 : 1000);
      }
      triggerPermissionCheck();
    }

    function updateDevices(devices) {
      // Setup some variables
      var recordingDevicesSelect = getElementById('recordingDevicesSelect');
      var dropdown = recordingDevicesSelect.getElement().$.querySelectorAll('select')[0];
      var currentRecordingDevices = dropdown.children;
      var count = 0, newDevices = [];

      devices.forEach( function(device) {
        if (
          device.kind === 'audioinput' &&
          !newDevices.some(function(d){return device.groupId === d.groupId;})
        ) { // an audioinput device and not in newDevices already
          newDevices.push({
            deviceId: device.deviceId,
            label: device.label || lang.microphone + ' ' + (++count),
            groupId: device.groupId
          });
        }
      });

      // Loop through current recordingDevicesSelect and remove any new ones that are already present
      for (let i = 0; i < currentRecordingDevices.length; i++) {
        if (
          newDevices.some(function(device) { return device.deviceId === currentRecordingDevices[i].value; })
        ) { // current item is in new list so update text and then remove from new list
    //WRONG - Needs a loop and flag approach              currentRecordingDevices[i].text = device.label;
    // also a check to see if .dataset.groupId is set
          newDevices = newDevices.filter(function(device) {
            return device.deviceId !== currentRecordingDevices[i].value;
          });
        }
        else currentRecordingDevices[i].remove();
      }

      // Loop through new list adding any new ones
      var count = 0;
      newDevices.forEach(function(device) { //console.log(device); debugger;
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || lang.microphone + ' ' + (++count);
        option.dataset.groupId = device.groupId;
        dropdown.appendChild(option);
      });
    }

    function updateDevicesDropdown() {
      var recordingDevicesSelect = getElementById('recordingDevicesSelect');
      if (!recordingDevicesSelect) return;

      // Iterate over media devices and make a list of all unique devices
      navigator.mediaDevices
        .enumerateDevices()
        .then(updateDevices)
        .catch(function(e) {
          console.log('error message', e);
        })

      // Reset the default so that we don't get the 'something changed' method on cancel
      // TODO - investigate why this needs to be run asynchronously
      window.setTimeout(function () {
        let devices = getElementById('recordingDevicesSelect');
        if (devices) devices.onChange();
      }, 250);
    }

    return {
      title: lang.dialogTitle,
      minWidth: 500,
      minHeight: 100,
      contents: [
/*tab1*/{
	        // ****************************
	        // Tab 1 Parameters
	        // ****************************
          id: 'recordTab',
          label: lang.recordTabLabel,
          title: '<i class="fas fa-microphone"></i> ' + lang.recordTabLabel,
          accessKey: '1',
          elements: [
/*vbox*/  {
            type: 'vbox',
            children: [
/*hbox*/    {
              type: 'hbox',
              widths: ['10%', '10%'],
              align: 'left',
              children: [
/*recordButton*/{
                type: 'button',
                id: 'recordButton',
                label: '<i class="fa fa-circle"></i>',
                title: lang.recordButton,
                setup: faButton,
                onClick: startRecording
              },
/*stopButton*/{
                type: 'button',
                id: 'stopButton',
                label: '<i class="fa fa-stop"></i>',
                title: lang.stopButton,
                style: 'margin-right: 25px;',
                setup: faButton,
                onClick: stopRecording
              },
/*tooltip*/   {
                type: 'html',
                html: lang.tooltip,
                id: 'tooltip',
                style: 'white-space: normal;'
              }]
            },
/*html*/    {
              type: 'html',
              id: 'audioPlayer',
              html: '<audio controls>' + lang.audioUnsupported + '</audio>',
              style: 'padding-top: 10px; height: revert; width: revert;'
            }]
          }]
        },
/*tab2*/{
	        // ****************************
	        // Tab 2
	        // ****************************
          id: 'settingsTab',
          label: lang.settingsTabLabel,
          title: '<i class="fas fa-cog"></i> ' + lang.settingsTabLabel,
          accessKey: '2',
          elements: [
/*vbox*/  {
            type: 'vbox',
            children: [
/*fieldset*/{
              type: 'fieldset',
              id: 'audioSettingsFieldset',
              label: lang.audioSettings,
              children: [
/*hbox*/      {
                type: 'hbox',
                widths: ['50%%', '50%'],
                children: [
/*devicesSelect*/{
                  type: 'select',
                  id: 'recordingDevicesSelect',
                  label: lang.devicesSelect,
                  items: [[lang.defaultLoadingMessage]],
                  'default': lang.defaultLoadingMessage,
                  onShow: function () {
                    setTimeout(startUpdatingDevicesList, 100);
                  },
                  onChange: resetInitialValue
                },
/*encodingTypeSel*/{
                  type: 'select',
                  id: 'encodingTypeSelect',
                  label: lang.encodingTypeSelect,
                  items: [
                    [lang.mp3Description, 'mp3'],
                    [lang.oggDescription, 'ogg'],
                    [lang.wavDescription, 'wav']
                  ],
                  'default': 'mp3',
                  setup: setup,
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
              label: lang.fileSettings,
              style: 'margin-top: 10px;',
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
                    label: lang.filenameTextbox,
                    'default': lang.defaultFilename,
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
                    label: lang.timestampCheckbox,
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
                  title: lang.finalFilenameMessage,
                  html: ' ',
                  onShow: updateFilename
                }]
              }]
            }]
          }]
        }],
        onShow: function () {
          const rDS = this.getContentElement('settingsTab', 'recordingDevicesSelect');
          if (!rDS) return;
          const rDSIE = rDS.getInputElement();
          if (!rDSIE) return;

          if (rDSIE.$.selectedIndex < 0 && rDSIE.getChildCount() > 0 && rDSIE.getChild(0).text !== rDS.default) {
            rDSIE.$.selectedIndex = 0;
          }
        },
        onCancel: function(ev) { // Catch closing event so we can cancel if recordings left to upload
          let wasRecording = false;
          if (recording) {
            stopRecording();
            wasRecording = true;
          }

          var returnValue = true;
          if (blob || wasRecording) {
            returnValue = window.confirm(lang.closeMessage);
            if (returnValue) {
              clearTimeout(permissionState.timer);
            }
          }
          dialogOpen = !returnValue;
          return returnValue;
        },
        buttons: [
  /*uploadButton*/{
          type: 'button',
          id: 'uploadButton',
          label: lang.uploadButton,
          title: lang.uploadButton,
          onClick: function() {
            uploadAndInsert(false);
          }
        },
/*insertButton*/{
        type: 'button',
        id: 'insertButton',
        label: lang.insertButton,
        title: lang.insertButton,
        onClick: function() {
          uploadAndInsert(true);
        }
      },
      CKEDITOR.dialog.cancelButton
      ]
    };
  })
})();