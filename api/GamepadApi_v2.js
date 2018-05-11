import { EventEmitter } from 'events';
import _ from 'underscore';
import $ from 'jquery';
import { Set } from 'immutable';
import ueFunctions from 'ueFunctions';
import GameApi from 'api/GameApi';
import {
	BUTTONS,
	STICKS,
	UP,
	RIGHT,
	DOWN,
	LEFT,
	DPAD_DIRECTIONS,
	STICK_LEFT_X,
	STICK_LEFT_Y,
	STICK_RIGHT_X,
	STICK_RIGHT_Y} from 'constants/GamepadConstants';
import {logFunc } from 'helpers/bkpUtils';

/**
 * Events
 */
export const EVENT_GAMEPAD_CONNECTED = 'EVENT_GAMEPAD_CONNECTED';
export const EVENT_GAMEPAD_DISCONNECTED = 'EVENT_GAMEPAD_DISCONNECTED';
export const EVENT_GAMEPAD_BUTTON_PRESS = 'EVENT_GAMEPAD_BUTTON_PRESS';
export const EVENT_GAMEPAD_BUTTON_RELEASE = 'EVENT_GAMEPAD_BUTTON_RELEASE';
export const EVENT_GAMEPAD_BUTTON_HOLD_UPDATE = 'EVENT_GAMEPAD_BUTTON_HOLD_UPDATE';

/**
 * Config
 */
const ALLOWED_UPDATE_INTERVAL = 60;
const ALLOWED_UPDATE_INTERVAL_REMOTE_PLAY = 2000;
const ALLOWED_FIRST_HOLD_INTERVAL = 300;
const STICK_AS_DPAD_THRESHOLD = 0.5;

/**
 * Logging
 */
const logger = logFunc('GamepadApi');


class GamepadApi extends EventEmitter {
	constructor () {
		super();

		this.gamepads = Set();
		this.activeMapping = null;
		this.isGamepadActive = false;
		this.isListeningForWindowEvents = false;
		this.lastUpdateTimestamp = 0;
		this.lastUpdateTimestampRemotePlay = 0;
		this.isGameRunningInCoherent = ueFunctions.getIsGameRunningInCoherent();
		this.isRemotePlayActive = false;
		this.wasVisible = true; // need to track visibility in order to ignore button presses
		this.isVisible = true; // need to track visibility in order to ignore button presses

		this.gamepadSleep = this.gamepadSleep.bind(this);
		this.gamepadAwake = this.gamepadAwake.bind(this);
	}

	/**
	 * Connects listeners to the window object and starts watching for inputs
	 */
	initialize () {
		logger('initialize');

		// Start gamepad scan interval
		this.frameTimer = window.requestAnimationFrame(() => {
			this.gameLoop();
		});
	}

	gamepadSleep (evt) {
		if (evt && evt.key === 'Unidentified' && evt.keyCode === 0) {
			return; // ignore keyDown events coming from the gamepad
		}

		if (this.isGamepadActive) {
			// set flag to wake up on next notify event from the gamepad
			this.isGamepadActive = false;
			logger('gamepadSleep -> notify gamepad disconnected', { gamepadId: this.gamepads.first() });
			// tell the app that that gamepad has been disconnected
			this.emit(EVENT_GAMEPAD_DISCONNECTED, this.gamepads.first());

			if (!this.isGameRunningInCoherent && this.isListeningForWindowEvents) {
				logger('gamepadSleep -> removing keyboard and mouse listeners');
				this.isListeningForWindowEvents = false;
				// clear window listeners and reset flag
				$(window).off('mousedown', this.gamepadSleep);
				$(window).off('keydown', this.gamepadSleep);
			}
		}
	}

	gamepadAwake () {
		if (!this.isGamepadActive) {
			// clear wake up flag
			this.isGamepadActive = true;
			// tell the app that that gamepad has been connected
			GameApi.requestIfRemotePlayActive().then(isRemotePlayActive => {
				logger('gamepadAwake -> notify gamepad connected', { gamepadId: this.gamepads.first(), isRemotePlayActive: this.isRemotePlayActive });
				this.isRemotePlayActive = isRemotePlayActive;
				// pipe into the same path as connecting a gamepad
				this.emit(EVENT_GAMEPAD_CONNECTED, this.gamepads.first(), this.isRemotePlayActive);
			});

			if (!this.isGameRunningInCoherent && !this.isListeningForWindowEvents) {
				logger('gamepadAwake -> adding keyboard and mouse listeners');
				this.isListeningForWindowEvents = true;
				// add window listeners to catch the next keyboard or mouse click
				$(window).on('mousedown', this.gamepadSleep);
				$(window).on('keydown', this.gamepadSleep);
			}
		}
	}

	notifyButtonPress (button, value, { isHold } = {}) {
		logger('notifyButtonPress', {isGamepadActive: this.isGamepadActive, button, value, isHold});
		// wake up if sleeping
		this.gamepadAwake();

		if (this.isGamepadActive) {
			// notify of button press
			this.emit(EVENT_GAMEPAD_BUTTON_PRESS, button, value, isHold);
			return true;
		}
		return false;
	}

	notifyButtonReleased (button) {
		logger('notifyButtonReleased', { button, isGamepadActive: this.isGamepadActive });
		if (this.isGamepadActive) {
			// notify what button was released
			this.emit(EVENT_GAMEPAD_BUTTON_RELEASE, button);
		}
	}

	notifyButtonHold (button, buttonsHeld) {
		logger('notifyButtonHold', { button, isGamepadActive: this.isGamepadActive });
		// check if button is a hold trigger
		if (!this.isGamepadActive) {
			return false;
		}

		let hold = buttonsHeld[button];
		logger('notifyButtonHold -> active and isButtonHoldTrigger', {
			button, last_notify: hold.last_notify, count: hold.count
		});

		if (!hold.last_notify) {
			// If we haven't already sent a second notify, check if x seconds have passed
			// and start sending notifications that the user is holding a button down
			if (hasTimestampExpired(hold.started_at, ALLOWED_FIRST_HOLD_INTERVAL)) {
				//console.log(`GamepadApi START notifying hold ${button}`);
				hold.last_notify = Date.now();
				hold.count++;

				this.notifyButtonPress(button, null, { isHold: true });
				this.emitHoldCountUpdateIfNeeded(buttonsHeld);
				return true;
			}
		} else {
			// The user has been continuously holding a button down
			//console.log(`GamepadApi CONTINUE notifying hold ${button}`);
			hold.last_notify = Date.now();
			hold.count++;

			this.notifyButtonPress(button, null, { isHold: true });
			this.emitHoldCountUpdateIfNeeded(buttonsHeld);
			return true;
		}

		return false; // notify was not triggered
	}

	emitHoldCountUpdateIfNeeded (buttonsHeld, force = false) {
		logger('emitHoldCountUpdateIfNeeded', { isGamepadActive: this.isGamepadActive });
		// if there isn't an active mapping then ignore
		if (!this.isGamepadActive) {
			return;
		}

		// check if any of the buttons are holdTriggers
		let holdCounts = this.getHoldCounts(buttonsHeld);
		if (!_.isEmpty(holdCounts) || force) {
			logger('emitHoldCountUpdateIfNeeded -> notify gamepad hold update', holdCounts);
			this.emit(EVENT_GAMEPAD_BUTTON_HOLD_UPDATE, holdCounts);
		}
	}

	getHoldCounts (buttonsHeld) {
		//const holdCounts = {};
		// const state = this.store.getState();
		// if(state.activeMapping) {
		// 	_.keys(buttonsHeld).forEach(btn => {
		// 		if (state.activeMapping.isButtonHoldTrigger(btn) && !isDpadButton(btn)) {
		// 			holdCounts[btn] = buttonsHeld[btn].count || 0;
		// 		}
		// 	});
		// }
		//return holdCounts;
	}

	visibilityChanged (isVisible) {
		logger('visibilityChanged', {wasVisible: this.wasVisible, isVisible: this.isVisible});
		this.wasVisible = this.isVisible;
		this.isVisible = isVisible;
	}

	gameLoop (prevState = {}, prevButtonsHeld = {}, ignoredButtons = {}, forceIsFirstVisibleTick = false) {

		if (!this.isVisible) {
			logger('gameLoop -> window is not visible', {isVisible: this.isVisible});
			// stop looping until we are visible again
			this.isGameLoopBlocked = true;
			return;
		}

		this.isGameLoopBlocked = false;

		let isFirstVisibleTick = !!forceIsFirstVisibleTick;

		if (this.isVisible && !this.wasVisible) {
			logger('gameLoop -> first tick since being made visible');
			// first tick since being made visible, only do this flow once
			this.wasVisible = true;
			isFirstVisibleTick = true;
			prevButtonsHeld = {};
			prevState = {};
		}

		let state = prevState;
		let buttonsHeld = _.clone(prevButtonsHeld);
		let didAlreadyNotifyFace = false;
		let didAlreadyNotifyDpad = false;

		if (hasTimestampExpired(this.lastUpdateTimestamp, ALLOWED_UPDATE_INTERVAL)) {
			forceIsFirstVisibleTick = false;

			let previousGamepads = this.gamepads;

			// reinitialize button state and gamepads
			state = {};
			this.gamepads = Set();
			this.lastUpdateTimestamp = Date.now();

			let gamepadsArray = getGamepads();
			// if we get an array of gamepads
			if (gamepadsArray && gamepadsArray.length) {
				// check for any new gamepads in the array from last loop
				_.each(gamepadsArray, gamepad => {
					if (gamepad && gamepad.id) {
						this.gamepads = this.gamepads.add(gamepad.id);

						if (!previousGamepads.has(gamepad.id)) {
							logger('gameLoop', 'triggering gamepadAwake');
							this.gamepadAwake();
						}

						// collect all the button presses and build out a state object
						state = this.updateButtonState(state, gamepad);
					}
				});

				// using the state object, need to compare it to the prevState object to figure out what button was pressed
				BUTTONS.forEach(btn => {
					if (ignoredButtons[btn]) {
						if (state[btn]) {
							// this button is currently ignored, we need to skip it
							return;
						}

						// user is no longer holding this button down, we can stop ignoring it
						delete ignoredButtons[btn];
					}

					let isDpad = isDpadButton(btn),
						didNotify = false;

					// skip function since during this loop, we already sent a button notify event
					if ((!isDpad && didAlreadyNotifyFace) || (isDpad && didAlreadyNotifyDpad)) {
						return;
					}

					if (!prevState[btn] && state[btn] && !isFirstVisibleTick) {
						// the button was pressed (gamepadDown)
						didNotify = this.notifyButtonPress(btn);

						// when a button is first pressed, need to set a timestamp to compare later
						buttonsHeld[btn] = { started_at: Date.now(), last_notify: null, count: 0 };
					} else if (prevState[btn] && !state[btn]) {
						// the button was released (gamepadUp)
						this.notifyButtonReleased(btn);
						delete buttonsHeld[btn];
					} else if (prevState[btn] && state[btn] && !isFirstVisibleTick) {
						// button is being held (gamepadHold)
						if (!buttonsHeld[btn]) {
							// notify as PRESS since it was skipped for some reason
							didNotify = this.notifyButtonPress(btn);
							buttonsHeld[btn] = { started_at: Date.now(), last_notify: null, count: 0 };
							//console.log(`Detected Hold On ${btn} but button not in buttonsHeld lookup`);
						} else {
							didNotify = this.notifyButtonHold(btn, buttonsHeld);
						}
					}

					/*
					 * The idea here is that we only want to notify 1 face button, and 1 dpad button each loop
					 * to try an limit the amount of input the gamepad could send to the game.
					 */
					if (didNotify) {
						if (isDpad) {
							didAlreadyNotifyDpad = true;
						} else {
							didAlreadyNotifyFace = true;
						}
					}
				});

				// for stick notify, we only use the LEFT stick
				// here we are piping the LEFT stick input into the same methods that pressing the DPAD would trigger
				[STICK_LEFT_X, STICK_LEFT_Y].forEach(btn => {
					if (state[btn] > STICK_AS_DPAD_THRESHOLD || state[btn] < -STICK_AS_DPAD_THRESHOLD) {
						// convert stick directions into DPAD directions
						let dpadDirection = null;
						if (btn === STICK_LEFT_X) {
							dpadDirection = state[btn] > 0 ? RIGHT : LEFT;
						}
						if (btn === STICK_LEFT_Y) {
							dpadDirection = state[btn] > 0 ? DOWN : UP;
						}

						// check if this is a PRESS or a HOLD
						if (
							(prevState[btn] < STICK_AS_DPAD_THRESHOLD && state[btn] >= STICK_AS_DPAD_THRESHOLD) ||
							(prevState[btn] > -STICK_AS_DPAD_THRESHOLD && state[btn] <= -STICK_AS_DPAD_THRESHOLD)
						) {
							didAlreadyNotifyDpad = this.notifyButtonPress(dpadDirection);
							buttonsHeld[dpadDirection] = { started_at: Date.now(), last_notify: null };
						} else if (
							(prevState[btn] >= STICK_AS_DPAD_THRESHOLD && state[btn] >= STICK_AS_DPAD_THRESHOLD) ||
							(prevState[btn] <= -STICK_AS_DPAD_THRESHOLD && state[btn] <= -STICK_AS_DPAD_THRESHOLD)
						) {
							if (!buttonsHeld[dpadDirection]) {
								// notify as PRESS since it was skipped for some reason
								didAlreadyNotifyDpad = this.notifyButtonPress(dpadDirection);
								buttonsHeld[dpadDirection] = { started_at: Date.now(), last_notify: null };
								//console.log(`Detected Hold On ${btn} but button not in buttonsHeld lookup`);
							} else {
								// continued hold
								didAlreadyNotifyDpad = this.notifyButtonHold(dpadDirection, buttonsHeld);
							}
						}
					}
				});
			}

			// check if any gamepads were removed between last and this loop
			previousGamepads.forEach(gamepadId => {
				if (!this.gamepads.has(gamepadId)) {
					logger('gameLoop -> triggering gamepadSleep');
					this.gamepadSleep();
				}
			});
		} else {
			forceIsFirstVisibleTick = isFirstVisibleTick;
		}

		if (this.isGameRunningInCoherent && hasTimestampExpired(this.lastUpdateTimestampRemotePlay, ALLOWED_UPDATE_INTERVAL_REMOTE_PLAY)) {
			// check remote play
			this.lastUpdateTimestampRemotePlay = Date.now();
			GameApi.requestIfRemotePlayActive().then(isRemotePlayActive => {
				if (this.isRemotePlayActive !== isRemotePlayActive) {
					this.isRemotePlayActive = isRemotePlayActive;
					// fake that the gamepad was just connected so that isRemotePlayActive updates
					this.isGamepadActive = false;
					this.gamepadAwake();
				}
			});
		}

		if (!didAlreadyNotifyDpad) {
			// Sticks update faster than button presses
			STICKS.forEach(btn => {
				// throttle the values a bit otherwise the manager is notified
				// constantly of gamepad state changes
				if (state[btn] > 0.1 || state[btn] < -0.1) {
					this.notifyButtonPress(btn, state[btn]);
				}
			});
		}

		// if in the previous button held, there where buttons, but now there aren't emit event one last time to clean up store
		if (!_.isEmpty(prevButtonsHeld) && _.isEmpty(buttonsHeld)) {
			this.emitHoldCountUpdateIfNeeded(buttonsHeld, true);
		}

		// run next loop
		this.frameTimer = window.requestAnimationFrame(() => {
			this.gameLoop(isFirstVisibleTick ? {} : state, buttonsHeld, isFirstVisibleTick ? state : ignoredButtons, forceIsFirstVisibleTick);
		});
	}

	updateButtonState (state, gamepad) {
		BUTTONS.forEach((btn, i) => {
			//NOTE: converts number to button name
			if (i < gamepad.buttons.length - 1) {
				state[btn] = gamepad.buttons[i].value > 0 || gamepad.buttons[i].pressed;
			}
		});

		if (gamepad.axes[0] && gamepad.axes[1]) {
			state[STICK_LEFT_X] = parseFloat(gamepad.axes[0].toFixed(4));
			state[STICK_LEFT_Y] = parseFloat(gamepad.axes[1].toFixed(4));
		}

		if (gamepad.axes[2] && gamepad.axes[3]) {
			state[STICK_RIGHT_X] = parseFloat(gamepad.axes[2].toFixed(4));
			state[STICK_RIGHT_Y] = parseFloat(gamepad.axes[3].toFixed(4));
		}

		return state;
	}
}

// helpers
function hasTimestampExpired (lastTimeStamp, allowedInterval) {
	let timestamp = Date.now();
	return timestamp - lastTimeStamp >= allowedInterval;
}

function getGamepads () {
	return navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
}

function isDpadButton (btn) {
	return _.includes(DPAD_DIRECTIONS, btn);
}

const instance = new GamepadApi();

export function restartGameLoop () {
	if (instance && instance.isGameLoopBlocked) {
		instance.gameLoop();
	}
}

export default instance;
