import {EventEmitter} from 'events';
import {timestamp, hasTimestampExpired} from 'helpers/timeUtils';


/**
 * Config
 */
const ALLOWED_UPDATE_INTERVAL = 60;

/**
 * Events
 */
export const FIXED_UPDATE = 'FIXED_UPDATE';
export const UPDATE = 'UPDATE';


class GameLoopApi extends EventEmitter {

	constructor () {
		super();

		this.isPaused = true;
		this.start();
	}

	start () {
		if(this.isPaused) {
			this.isPaused = false;
			this.lastFixed = timestamp();

			this.frameTimer = window.requestAnimationFrame(() => {
				this.gameLoop(this.lastFixed);
			});
		}
	}

	stop () {
		this.isPaused = true;
		window.cancelAnimationFrame(this.frameTimer);
	}

	gameLoop (lastTime) {

		if(this.paused) {
			return;
		}

		const now = timestamp();
		const delta = Math.min(1, (now - lastTime) / 1000); // in seconds, capped at 1 second if the browser loses focus

		if (hasTimestampExpired(this.lastFixed, ALLOWED_UPDATE_INTERVAL)) {
			this.lastFixed = now;
			this.emit(FIXED_UPDATE, delta);
		}

		this.emit(UPDATE, delta);

		// run next loop
		this.frameTimer = window.requestAnimationFrame(() => {
			this.gameLoop(now);
		});
	}
}

export default new GameLoopApi();

