// import modules
import React from 'react';
import _ from 'underscore';
import $ from 'jquery';

/**
 * Version
 * @desc Toggles the Perforce CL number when you press CTRL + ALT+ F.
 * NOTE: The file version.js is auto updated with the correct CL when the whole game package is built and deployed
 */
//module definition
class Version extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			isOpen: false
		};

		_.bindAll(this, 'handleKeyDown');
	}

	componentDidMount () {
		$(window).on('keydown', this.handleKeyDown);
	}

	componentWillUnmount () {
		$(window).off('keydown', this.handleKeyDown);
	}

	handleKeyDown (evt) {
		if (evt.ctrlKey && evt.altKey && evt.keyCode === 70) {
			this.setState({
				isOpen: !this.state.isOpen
			});
		}
	}

	hasBuildVersion () {
		return typeof window.FE_BUILD_VERSION !== 'undefined' && window.FE_BUILD_VERSION !== null && window.FE_BUILD_VERSION !== '';
	}

	render () {
		// NOTE: the css for this is in _html_body.scss
		return this.state.isOpen && this.hasBuildVersion() ? <p className="version">FE BUILD ({window.FE_BUILD_VERSION})</p> : null;
	}
}

//export module
export default Version;
