import {EventEmitter} from 'events';
import $ from 'jquery';
import _ from 'underscore';
import KeyboardKeyCodes from 'constants/KeyboardKeyCodes';


export const EVENT_KEY_DOWN = 'EVENT_KEY_DOWN';
export const EVENT_KEY_UP = 'EVENT_KEY_UP';

class KeyboardApi extends EventEmitter {
	initialize () {
		$(window).on('mousedown', this.handleMouseDown.bind(this));
		$(window).on('keydown', this.handleKeyDown.bind(this));
		$(window).on('keyup', this.handleKeyUp.bind(this));
	}

	/**
	 * BUGFIX: pressing the mouse wheel and scrolling cause some weird issues
	 * and when using the news panel with a youtube video it crashes the browser
	 */
	handleMouseDown (ev) {
		if (ev.which === 2) {
			ev.preventDefault();
			return false;
		}
		return true;
	}

	handleKeyDown (evt) {
		let tag = evt.target.tagName.toLowerCase();
		if (evt.keyCode === 9 && !_.contains(['input', 'textarea'], tag)) {
			// block the default browser behavior of the Tab key unless target is a form element
			evt.preventDefault();
			return false;
		}

		const keyCode = getKeyCodeFromEvent(evt);
		if(keyCode) {
			this.emit(EVENT_KEY_DOWN, evt);
		}

		return true;
	}

	handleKeyUp (evt) {
		if (!evt.metaKey || evt.keyCode === 9) {
			evt.preventDefault();
		}

		const keyCode = getKeyCodeFromEvent(evt);
		if(keyCode) {
			this.emit(EVENT_KEY_UP, evt);
		}
	}
}

function getKeyCodeFromEvent (evt) {
	const tag = evt.target.tagName.toLowerCase();
	let key = KeyboardKeyCodes.has(evt.keyCode) ? evt.keyCode : null;

	if(key === KeyboardKeyCodes.KEYCODE_SHIFT
		|| key === KeyboardKeyCodes.KEYCODE_CTRL
		|| key === KeyboardKeyCodes.KEYCODE_ALT) {
		key = null;
	}

	if (!key || (key !== KeyboardKeyCodes.KEYCODE_ESC && _.contains(['input', 'textarea'], tag))) {
		return null;
	}
	return key;
}

export default new KeyboardApi();
