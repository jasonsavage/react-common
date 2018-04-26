// import modules
import React, {PureComponent} from 'react';
import _ from 'underscore';
import {r} from 'helpers/bkpUtils';
import GameLoopApi, {UPDATE} from 'api/GameLoopApi';
import {timestamp, hasTimestampExpired} from 'helpers/timeUtils';


const LIGHT_UPDATE_INTERVAL = 100;
const LIGHT_SIZE = 15;
const LIGHT_SPACING = 10;

/**
 * LightsFrame
 * @desc
 */
class LightsFrame extends PureComponent {

	constructor (props) {
		super(props);
		this.state = {width: 0, height: 0};

		_.bindAll(this, 'update', 'updateLights');
	}

	componentDidMount () {
		this.isComponentMounted = true;
		this.$lights = [...this.$lights0, ...this.$lights1, ...this.$lights2.reverse(), ...this.$lights3.reverse()];
		this.lightIndex = 0;
		this.lastTimestamp = timestamp();
		GameLoopApi.addListener(UPDATE, this.update);
	}

	componentDidUpdate () {
		// get updated lights ref
		this.$lights = [...this.$lights0, ...this.$lights1, ...this.$lights2.reverse(), ...this.$lights3.reverse()];
	}

	componentWillUnmount () {
		this.isComponentMounted = false;
		GameLoopApi.removeListener(UPDATE, this.update);
		this.$lights = [];
	}

	measure (callback) {
		if(!this.$component) { return; }

		const width = this.$component.outerWidth();
		const height = this.$component.outerHeight();

		if(width !== this.state.width || height !== this.state.height) {
			this.setState({width, height}, callback);
		} else {
			callback();
		}
	}

	update () {
		if(!this.isComponentMounted) { return; }

		if (hasTimestampExpired(this.lastTimestamp, LIGHT_UPDATE_INTERVAL)) {
			this.lastTimestamp = timestamp();

			// make sure this component hasn't changed size
			// and update the state of each light
			this.measure(this.updateLights);
		}
	}

	updateLights () {
		this.lightIndex = (this.lightIndex === 0) ? 1 : 0;
		this.$lights.forEach(($light, i) => {

			const alt = (this.lightIndex === 0) ? (i % 2 === 0) : (i % 2 !== 0);
			if (alt) {
				$light.addClass('led-on');
			} else {
				$light.removeClass('led-on');
			}
		});
	}

	renderLights (className, lightCount, j) {
		return (
			<div className={ className }>
				{ _.range(lightCount).map((i) => {
					return (<div key={i} ref={ r(this, '$lights' + j, i) } className="led" />);
				}) }
			</div>
		);
	}

	render () {
		const {width, height} = this.state;
		let lightCount1 = 0, lightCount2 = 0;

		this.$lights0 = [];
		this.$lights1 = [];
		this.$lights2 = [];
		this.$lights3 = [];

		if(width && height) {
			const lightSize = (LIGHT_SIZE + LIGHT_SPACING);
			const componentWidth = width - 40;
			const componentHeight = height - 30;
			lightCount1 = Math.floor(componentWidth/lightSize);
			lightCount2 = Math.floor(componentHeight/lightSize);
		}

		return (
			<div ref={r(this, '$component')}
				 className="lights-frame">
				{ this.renderLights('row-top', lightCount1, 0) }
				{ this.renderLights('row-right', lightCount2, 1) }
				{ this.renderLights('row-bottom', lightCount1, 2) }
				{ this.renderLights('row-left', lightCount2, 3) }
			</div>
		);
	}
}

//export module
export default LightsFrame;
