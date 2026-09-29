/**
 * Browser audio recorder that inserts recordings through XerteAudio.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { XerteAudio } from './xerte-audio.js';
import { uploadAudio } from './xerte-upload-adapter.js';

const MIME_TYPES = [
	{ type: 'audio/webm;codecs=opus', extension: 'webm' },
	{ type: 'audio/ogg;codecs=opus', extension: 'ogg' },
	{ type: 'audio/mp4', extension: 'm4a' }
];

function recordingFormat() {
	const supported = MIME_TYPES.find( item => MediaRecorder.isTypeSupported?.( item.type ) );
	return supported || { type: '', extension: 'webm' };
}

function extensionForMime( mimeType, fallback ) {
	if ( /(?:mp4|m4a)/i.test( mimeType ) ) return 'm4a';
	if ( /ogg/i.test( mimeType ) ) return 'ogg';
	if ( /wav/i.test( mimeType ) ) return 'wav';
	if ( /mpeg|mp3/i.test( mimeType ) ) return 'mp3';
	if ( /webm/i.test( mimeType ) ) return 'webm';
	return fallback;
}

export class XerteRecorder extends Plugin {
	static get pluginName() { return 'XerteRecorder'; }
	static get requires() { return [ XerteAudio ]; }

	init() {
		const editor = this.editor;
		const lang = editor.config.get( 'xerteRecorderLanguage' );
		editor.ui.componentFactory.add( 'xerteRecorder', locale => {
			const button = new ButtonView( locale );
			button.set( { label: lang.editorButton, withText: true, tooltip: true } );
			button.bind( 'isEnabled' ).to( editor.commands.get( 'insertXerteAudio' ), 'isEnabled', enabled =>
				enabled && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia &&
				!!editor.config.get( 'xerteUploadAudioUrl' ) );
			button.on( 'execute', () => openRecorder( editor ) );
			return button;
		} );
	}
}

function openRecorder( editor ) {
	const lang = editor.config.get( 'xerteRecorderLanguage' );
	const endpoint = editor.config.get( 'xerteUploadAudioUrl' );
	const overlay = document.createElement( 'div' );
	overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px';
	const dialog = document.createElement( 'div' );
	dialog.setAttribute( 'role', 'dialog' );
	dialog.setAttribute( 'aria-modal', 'true' );
	dialog.setAttribute( 'aria-label', lang.dialogTitle );
	dialog.style.cssText = 'box-sizing:border-box;background:#fff;color:#172033;max-width:95vw;width:480px;padding:0;border:1px solid rgba(148,163,184,.35);border-radius:16px;box-shadow:0 24px 65px rgba(15,23,42,.32);overflow:hidden;font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif';
	const header = document.createElement( 'div' );
	header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid #e7ebf1;background:linear-gradient(135deg,#f8fafc,#eef3f9)';
	const icon = document.createElement( 'div' );
	icon.setAttribute( 'aria-hidden', 'true' );
	icon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"></path></svg>';
	icon.style.cssText = 'width:40px;height:40px;border-radius:12px;background:#2563eb;color:#fff;display:grid;place-items:center;box-shadow:0 6px 14px rgba(37,99,235,.25);flex:none';
	const heading = document.createElement( 'h2' );
	heading.textContent = lang.dialogTitle;
	heading.style.cssText = 'font-size:18px;line-height:1.2;margin:0;flex:1';
	const closeButton = document.createElement( 'button' );
	closeButton.type = 'button';
	closeButton.textContent = '×';
	closeButton.setAttribute( 'aria-label', lang.closeButton );
	closeButton.style.cssText = 'width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:#64748b;font-size:25px;line-height:1;cursor:pointer';
	header.append( icon, heading, closeButton );
	dialog.appendChild( header );

	const content = document.createElement( 'div' );
	content.style.cssText = 'padding:20px';
	dialog.appendChild( content );
	const stage = document.createElement( 'div' );
	stage.style.cssText = 'padding:16px;border:1px solid #dfe5ee;border-radius:12px;background:#f8fafc;transition:background .15s,border-color .15s';
	const statusRow = document.createElement( 'div' );
	statusRow.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:22px';
	const statusDot = document.createElement( 'span' );
	statusDot.style.cssText = 'width:9px;height:9px;border-radius:50%;background:#94a3b8;box-shadow:0 0 0 4px rgba(148,163,184,.14);flex:none';

	const status = document.createElement( 'div' );
	status.setAttribute( 'role', 'status' );
	status.setAttribute( 'aria-live', 'polite' );
	status.style.cssText = 'font-weight:600;color:#475569';
	statusRow.append( statusDot, status );
	stage.appendChild( statusRow );
	content.appendChild( stage );

	function setStatus( message, state = 'idle' ) {
		const appearances = {
			idle: [ '#94a3b8', 'rgba(148,163,184,.14)', '#f8fafc', '#dfe5ee', '#475569' ],
			recording: [ '#dc2626', 'rgba(220,38,38,.15)', '#fff7f7', '#fecaca', '#b91c1c' ],
			ready: [ '#16a34a', 'rgba(22,163,74,.14)', '#f3fff6', '#bbf7d0', '#15803d' ],
			busy: [ '#2563eb', 'rgba(37,99,235,.14)', '#f5f8ff', '#bfdbfe', '#1d4ed8' ],
			error: [ '#dc2626', 'rgba(220,38,38,.15)', '#fff7f7', '#fecaca', '#b91c1c' ]
		};
		const [ dot, ring, background, border, text ] = appearances[ state ] || appearances.idle;
		status.textContent = message;
		statusDot.style.background = dot;
		statusDot.style.boxShadow = `0 0 0 4px ${ ring }`;
		stage.style.background = background;
		stage.style.borderColor = border;
		status.style.color = text;
	}
	setStatus( lang.initialMessage );

	const preview = document.createElement( 'audio' );
	preview.controls = true;
	preview.hidden = true;
	preview.style.cssText = 'display:none;width:100%;margin-top:14px';
	stage.appendChild( preview );

	const filenameLabel = document.createElement( 'label' );
	filenameLabel.textContent = lang.filenameTextbox + ' ';
	filenameLabel.style.cssText = 'display:block;margin:18px 0 6px;font-size:13px;font-weight:650;color:#334155';
	const filename = document.createElement( 'input' );
	filename.type = 'text';
	filename.value = lang.defaultFilename;
	filename.style.cssText = 'box-sizing:border-box;display:block;width:100%;margin-top:7px;padding:10px 11px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#172033;font:inherit;outline:none';
	filenameLabel.appendChild( filename );
	content.appendChild( filenameLabel );

	const record = document.createElement( 'button' );
	record.type = 'button'; record.textContent = lang.recordButton;
	const stop = document.createElement( 'button' );
	stop.type = 'button'; stop.textContent = lang.stopButton; stop.disabled = true;
	const insert = document.createElement( 'button' );
	insert.type = 'button'; insert.textContent = lang.insertButton; insert.disabled = true;
	const cancel = document.createElement( 'button' );
	cancel.type = 'button'; cancel.textContent = lang.cancelButton;
	const baseButtonStyle = 'min-height:38px;padding:8px 14px;border-radius:9px;font:600 14px system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer';
	record.style.cssText = `${ baseButtonStyle };border:1px solid #dc2626;background:#dc2626;color:#fff`;
	stop.style.cssText = `${ baseButtonStyle };border:1px solid #cbd5e1;background:#fff;color:#334155`;
	insert.style.cssText = `${ baseButtonStyle };border:1px solid #2563eb;background:#2563eb;color:#fff;margin-left:auto`;
	cancel.style.cssText = `${ baseButtonStyle };border:1px solid transparent;background:transparent;color:#64748b`;
	const footer = document.createElement( 'div' );
	footer.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:18px;padding-top:16px;border-top:1px solid #e7ebf1;flex-wrap:wrap';
	footer.append( record, stop, cancel, insert );
	content.appendChild( footer );

	let recorder = null;
	let stream = null;
	let chunks = [];
	let blob = null;
	let previewUrl = null;
	let format = recordingFormat();
	let recordedExtension = format.extension;
	let closed = false;

	function stopStream() {
		for ( const track of stream?.getTracks?.() || [] ) track.stop();
		stream = null;
	}

	function clearPreview() {
		if ( previewUrl ) URL.revokeObjectURL( previewUrl );
		previewUrl = null;
		preview.removeAttribute( 'src' );
		preview.hidden = true;
		preview.style.display = 'none';
		blob = null;
	}

	function close() {
		closed = true;
		if ( recorder?.state === 'recording' ) recorder.stop();
		stopStream();
		clearPreview();
		overlay.remove();
		editor.editing.view.focus();
	}

	record.onclick = async () => {
		clearPreview();
		chunks = [];
		setStatus( lang.requestingPermission, 'busy' );
		try {
			stream = await navigator.mediaDevices.getUserMedia( { audio: true } );
			format = recordingFormat();
			recorder = format.type ? new MediaRecorder( stream, { mimeType: format.type } ) : new MediaRecorder( stream );
			recorder.ondataavailable = event => {
				if ( event.data.size ) chunks.push( event.data );
			};
			recorder.onstop = () => {
				if ( closed ) {
					stopStream();
					return;
				}
				blob = new Blob( chunks, { type: recorder.mimeType || format.type } );
				recordedExtension = extensionForMime( blob.type, format.extension );
				previewUrl = URL.createObjectURL( blob );
				preview.src = previewUrl;
				preview.hidden = false;
				preview.style.display = 'block';
				insert.disabled = !blob.size;
				record.disabled = false;
				stop.disabled = true;
				stopStream();
				setStatus( blob.size ? lang.recordingReady : lang.noAudioRecorded, blob.size ? 'ready' : 'error' );
			};
			recorder.onerror = () => {
				stopStream();
				record.disabled = false;
				stop.disabled = true;
				setStatus( lang.recordingFailed, 'error' );
			};
			recorder.start();
			record.disabled = true;
			stop.disabled = false;
			insert.disabled = true;
			setStatus( lang.recordingStatus, 'recording' );
		} catch ( error ) {
			stopStream();
			setStatus( error.name === 'NotAllowedError' ?
				lang.permissionDenied : lang.startFailed.replace( '%0', error.message ), 'error' );
		}
	};

	stop.onclick = () => {
		if ( recorder?.state === 'recording' ) {
			setStatus( lang.finishingRecording, 'busy' );
			recorder.stop();
		}
	};

	insert.onclick = async () => {
		if ( !blob ) return;
		insert.disabled = true;
		record.disabled = true;
		setStatus( lang.uploading, 'busy' );
		try {
			const cleanName = filename.value.replace( /[^a-zA-Z0-9_-]/g, '_' ) || 'recording';
			const extension = recordedExtension;
			const url = await uploadAudio( blob, endpoint, { filename: `${ cleanName }.${ extension }`, extension, lang } );
			editor.execute( 'insertXerteAudio', { src: url, align: 'center' } );
			close();
		} catch ( error ) {
			setStatus( error.message || String( error ), 'error' );
			insert.disabled = false;
			record.disabled = false;
		}
	};

	cancel.onclick = close;
	closeButton.onclick = close;
	overlay.addEventListener( 'keydown', event => {
		if ( event.key === 'Escape' ) close();
	} );
	overlay.appendChild( dialog );
	document.body.appendChild( overlay );
	record.focus();
}
