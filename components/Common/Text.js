// import modules
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { generateIntlId } from 'helpers/localeUtils';


/**
 * Text
 * @desc Use anywhere there is text on the screen and the text will be auto localize when used in conjunction with the localdata.js script
 *
 * ====================
 * IMPORTANT: Avoid using an expression for the 'msg' prop, it will not be correctly parsed by the localdata.js script
 * @example:
 * 	avoid this:
 * 		<Text msg={ isFocused ? 'Hello' : 'Goodbye' } />
 *
 * 	instead do this:
 * 		{ isFocused ? (<T\ext msg="Hello" />):(<T\ext msg="Goodbye" />) }
 * 	or:
 * 		<Text id={ isFocused ? l\ocId('Hello') : l\ocId('Goodbye') } />
 *
 * 	====================
 * 	for reference these 2 usages will produce the same result
 * 	<Text msg="Hello" />
 * 	<Text id={ locId('Hello') } />
 */
class Text extends PureComponent {

	render () {
		const { intl, id, msg, values } = this.props;
		const intlId = id || generateIntlId(msg);
		// NOTE: formatMessage will throw a warning if the string is not found which we want for now
		const value = intl.formatMessage({ id: intlId }, values);

		// check for multi line messages
		if(value && value.indexOf('|') !== -1) {
			const lines = value.toString().split('|');
			return (
				<span>
					{ lines.map((line, index) => <p key={index}>{line}</p>) }
				</span>
			);
		}
		// default, do the same thing as <FormattedMessage />
		return ( <span>{ value }</span> );
	}
}

// prop type validation
Text.propTypes = {
	id: PropTypes.string,
	intl: intlShape,
	// NOTE: see above
	msg: PropTypes.string,
	values: PropTypes.object
};

// prop defaults
Text.defaultProps = {
	msg: '',
	values: {}
};

//export module
export default injectIntl(Text);
