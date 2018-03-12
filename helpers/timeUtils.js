import { parseDuration, zeroPrepend } from 'helpers/bkpUtils';

export function parseDurationAsTimecode (timestamp) {
	const duration = parseDuration(timestamp);
	let timeArr = [zeroPrepend(duration.minutes, 2), zeroPrepend(duration.seconds, 2)];

	if (duration.hours > 0) {
		timeArr.unshift(zeroPrepend(duration.hours, 2));
	}

	return timeArr.join(':');
}

/**
  @param timeout: Date object to countdown to
  @param element: jquery element the countdown should display
*/
export function setCountdown (timeout, element, waitingTimer, text = '') {
	if (waitingTimer) {
		clearTimeout(waitingTimer);
	}
	waitingTimer = setInterval(() => {
		const duration = (timeout.getTime() - new Date().getTime()) / 1000;
		if (duration > 0) {
			element.text(text + parseDurationAsTimecode(duration));
		} else {
			element.text('');
		}
	}, 1000);
	return waitingTimer;
}


export function hasTimestampExpired (lastTimeStamp, allowedInterval) {
	let now = timestamp();
	return (now - lastTimeStamp) >= allowedInterval;
}

export function timestamp () {
	return window.performance && window.performance.now ? window.performance.now() : Date.now();
}
