/* eslint-disable no-unused-vars, max-len */
import {
	locId,
	locText,
	generateIntlId
} from 'helpers/localeUtils';


describe('localeUtils.js', () => {
	/**
	 * Should run a test on all function exported from localeUtils.js
	 */

	// NOTE: method just calls generateIntlId which is tested below
	//describe('locId', () => {});

	describe('locText', () => {
		it('should get the matching message from the intl object based on the id generated by the supplied string', () => {
			//given
			const messages = { The_quick_brown_fox: 'jumped over the lazy dog'};
			const intl = { formatMessage: (data) => messages[data.id] };
			const msg = 'The quick brown fox';
			spyOn(intl, 'formatMessage').and.callThrough();
			//when
			const result = locText(intl, msg);
			//then
			expect(intl.formatMessage).toHaveBeenCalled();
			expect(result).toEqual('jumped over the lazy dog');
		});
	});

	describe('generateIntlId', () => {
		it('should generate a locale id from the specified string', () => {
			//given
			//when
			const result = generateIntlId('The quick brown fox');
			//then
			expect(result).toEqual('The_quick_brown_fox');
		});
		it('should parse out non word and {}[],.;: characters from string', () => {
			//given
			const str = 'Th.e {qui,ck} [b]ro@w?n: fo;x';
			//when
			const result = generateIntlId(str);
			//then
			expect(result).toEqual('The_quick_brown_fox');
		});
	});
});
