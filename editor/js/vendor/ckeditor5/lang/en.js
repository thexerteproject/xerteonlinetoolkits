/**
 * English language variables for Xerte's CKEditor 5 extensions.
 * Keep all custom editor strings for this language in this file so that
 * XerteTrans can work with one file per language.
 * @license Apache-2.0
 */
(function(root, factory) {
    var lang = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = lang;
    }
    if (root) {
        root.XerteCKEditor5Languages = root.XerteCKEditor5Languages || {};
        root.XerteCKEditor5Languages.en = lang;
    }
})(typeof window !== 'undefined' ? window : this, function() {
    return {
        xerteRecorder: {
            editorButton: 'Record audio',
            dialogTitle: 'Record audio',
            closeButton: 'Close recorder',
            initialMessage: 'Press Record to request microphone access.',
            filenameTextbox: 'Filename',
            defaultFilename: 'recording',
            recordButton: 'Record',
            stopButton: 'Stop',
            insertButton: 'Upload and insert',
            cancelButton: 'Cancel',
            requestingPermission: 'Requesting microphone access…',
            recordingReady: 'Recording ready to preview.',
            noAudioRecorded: 'No audio was recorded.',
            recordingFailed: 'Recording failed.',
            recordingStatus: 'Recording…',
            permissionDenied: 'Microphone permission was not granted.',
            startFailed: 'Could not start recording: %0',
            finishingRecording: 'Finishing recording…',
            uploading: 'Uploading…',
            uploadFailed: 'Audio upload failed.',
            readFailed: 'Could not read the audio file.',
            invalidAudioFile: 'Choose an M4A, MP3, MP4, OGG, WAV or WebM audio file.'
        }
    };
});
