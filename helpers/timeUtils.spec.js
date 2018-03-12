import {
	parseDurationAsTimecode,
	hasTimestampExpired,
	timestamp
} from 'helpers/timeUtils';


describe('timeUtils.js', () => {
	// NOTE: compared results at http://www.gummydev.com/timecode/
	describe('parseDurationAsTimecode', () => {
		it('should convert a timestamp into a string on minutes and seconds', () => {
			//given
			const lastTimeStamp = 234 * 1000;
			//when
			const result = parseDurationAsTimecode(lastTimeStamp);
			//then
			expect(result).toEqual('03:54');
		});

		it('should add hours if the timestamp is over 60 minutes', () => {
			//given
			const lastTimeStamp = 8965 * 1000;
			//when
			const result = parseDurationAsTimecode(lastTimeStamp);
			//then
			expect(result).toEqual('02:29:25');
		});

	});

	describe('setCountdown', () => {
		// TODO: finish test
	});

	describe('hasTimestampExpired', () => {
		it('should return false if timestamp is NOT larger than allowedInterval', () => {
			//given
			const lastTimeStamp = timestamp() - 1000;
			const allowedInterval = 2000;
			//when
			const result = hasTimestampExpired(lastTimeStamp, allowedInterval);
			//then
			expect(result).toBeFalsy();
		});
		it('should return true if timestamp is larger than allowedInterval', () => {
			//given
			const lastTimeStamp = timestamp() - 2000;
			const allowedInterval = 2000;
			//when
			const result = hasTimestampExpired(lastTimeStamp, allowedInterval);
			//then
			expect(result).toBeTruthy();
		});
	});

	describe('timestamp', () => {
		it('should call window.performance.now if window.performance is available', () => {
			//given
			window.performance = {now: () => {}};
			spyOn(window.performance, 'now');
			//when
			timestamp();
			//then
			expect(window.performance.now).toHaveBeenCalled();
		});
		it('should call Date.now if window.performance is NOT available', () => {
			//given
			window.performance = null;
			spyOn(Date, 'now');
			//when
			timestamp();
			//then
			expect(Date.now).toHaveBeenCalled();
		});
	});
});
