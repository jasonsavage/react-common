import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import GameLoopApi, {UPDATE} from 'api/GameLoopApi';
import {timestamp, hasTimestampExpired} from 'helpers/timeUtils';

/**
 * Flipbook
 * @desc
 */

//module definition
class Flipbook extends PureComponent {

	constructor (props) {
		super(props);
		this.state = {};

		this.step = this.step.bind(this);
	}

	componentWillMount () {
		this.setState( this.measure() );
	}

	componentDidMount () {
		this.lastTimestamp = timestamp();
		GameLoopApi.addListener(UPDATE, this.step);
	}

	componentWillUpdate (nextProps) {
		// if any of the props changed, need to re-measure sprite sheet
		if(this.props.sheetWidth !== nextProps.sheetWidth
			|| this.props.sheetHeight !== nextProps.sheetHeight
			|| this.props.sheetColumns !== nextProps.sheetColumns
			|| this.props.sheetRows !== nextProps.sheetRows) {
			this.lastTimestamp = timestamp();
			this.setState( this.measure() );
		}
	}

	componentWillUnmount () {
		GameLoopApi.removeListener(UPDATE, this.step);
	}

	measure () {
		const {sheetWidth, sheetColumns, sheetHeight, sheetRows, fps} = this.props;

		return {
			frameWidth: Math.floor(sheetWidth / sheetColumns),
			frameHeight: Math.floor(sheetHeight / sheetRows),
			gridIndex: [0, 0],
			frameDuration: 1000 / fps,
			isEnded: false
		};
	}

	// view event listeners
	step () {
		const {isVisible, loop, sheetColumns, sheetRows} = this.props;
		const {gridIndex, frameDuration, isEnded} = this.state;
		const now = timestamp();

		let nextColumnIndex = gridIndex[0] + 1;
		let nextRowIndex = gridIndex[1];

		if ( ! isVisible && ! isEnded ) {
			// stop looping until we are visible again
			return;
		}

		// check time
		if (hasTimestampExpired(this.lastTimestamp, frameDuration)) {
			this.lastTimestamp = now;

			// animate frame row right to left
			if (nextColumnIndex >= sheetColumns) {
				nextRowIndex = gridIndex[1] + 1;
				nextColumnIndex = 0;

				if (nextRowIndex >= sheetRows) {
					nextColumnIndex = 0;
					nextRowIndex = 0;

					if ( ! loop ) {
						this.setState({gridIndex: [0, 0], isEnded: true});
					}
				}
			}

			// NOTE: this triggers componentWillUpdate so be careful not to cause an infinite loop
			this.setState({ gridIndex: [nextColumnIndex, nextRowIndex] });
		}
	}

	render () {
		const {sheet, className} = this.props;
		const {frameWidth, frameHeight, gridIndex} = this.state;
		const flipbookStyle = {
			width: frameWidth,
			height: frameHeight,
			backgroundImage: `url('${sheet}')`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: `-${gridIndex[0] * frameWidth}px -${gridIndex[1] * frameHeight}px`
		};

		return <div className={ className } style={ flipbookStyle } />;
	}
}

// prop type validation
Flipbook.propTypes = {
	className: PropTypes.string,
	fps: PropTypes.number,
	isVisible: PropTypes.bool,
	loop: PropTypes.bool,
	sheet: PropTypes.string,
	sheetColumns: PropTypes.number,
	sheetHeight: PropTypes.number,
	sheetRows: PropTypes.number,
	sheetWidth: PropTypes.number
};

Flipbook.defaultProps = {
	fps: 1,
	loop: true,
	isVisible: true
};

//export module
export default Flipbook;
