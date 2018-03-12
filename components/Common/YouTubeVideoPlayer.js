// import modules
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import _ from 'underscore';
import $ from 'jquery';
import ueFunctions from 'ueFunctions';
import Preloader from 'components/Common/Preloader';
import YouTubeApi from 'api/YouTubeApi';
import YouTubeIframeLoader from 'api/YouTubeIframeLoader';
import { r, noop } from 'helpers/bkpUtils';

const VIDEO_LOAD_DELAY = 1000;

/**
 * YouTubeVideoPlayer
 * @desc
 */
class YouTubeVideoPlayer extends Component {
	constructor (props) {
		super(props);
		this.player = null;
		this.isPlaying = false;

		this.state = {
			// if the game is running in coherent, do a fake load before rendering video
			isLoadingVideo: ueFunctions.getIsGameRunningInCoherent()
		};

		_.bindAll(this, 'handlePlayerReady', 'handlePlayerStateChange');
	}

	componentDidMount () {
		if (ueFunctions.getIsGameRunningInCoherent()) {
			// NOTE: this is so Coherent has some time between Youtube videos to clean up memory
			this.pendingVideoLoad = setTimeout(() => {
				/*eslint-disable react/no-did-mount-set-state */
				this.setState({ isLoadingVideo: false });
			}, VIDEO_LOAD_DELAY);
		} else {
			this.setupYouTubePlayer();
		}
	}

	componentWillReceiveProps (nextProps) {
		if (this.player && nextProps.videoId !== this.props.videoId) {
			this.player.loadVideoById(nextProps.videoId);
		}
	}

	shouldComponentUpdate () {
		// we don't want this component to re-render the iframe, it will break everything
		// (unless running in coherent doing the fake load)
		return this.state.isLoadingVideo;
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevState.isLoadingVideo && !this.state.isLoadingVideo) {
			this.setupYouTubePlayer();
		}
	}

	componentWillUnmount () {
		this.player = null;
		clearTimeout(this.pendingVideoLoad);
	}

	setupYouTubePlayer () {
		// move iframe off screen to load to avoid the strange transparent "hole" that appears through the UI
		// ... when the iframe content is loading
		this.$iframe.css({ position: 'absolute', top: -9999, left: -9999 });

		YouTubeIframeLoader.load().then(YT => {
			this.player = new YT.Player('player', {
				events: {
					onReady: this.handlePlayerReady,
					onStateChange: this.handlePlayerStateChange
				}
			});
		});
	}

	getStyle () {
		return {
			width: this.props.width,
			height: this.props.height,
			overflow: 'hidden',
			background: 'black',
			margin: '0 auto'
		};
	}

	handlePlayerReady (evt) {
		// now it is safe to move it back into view
		this.$iframe.css({ position: 'static', top: 0, left: 0 });
		this.$preloader.css({ display: 'none' });

		this.props.onReady(evt);
	}

	handlePlayerStateChange (evt) {
		let YT = YouTubeIframeLoader.YT;
		//keep window in focus so the keyboard events continue to work
		$(window).focus();

		//NOTE: video may go into buffer state and then it will go back to play state, which will
		// ... trigger onPlay multiple times instead of what we want which is each time the user presses play
		if (evt.data === YT.PlayerState.PLAYING && !this.isPlaying) {
			this.isPlaying = true;
			this.props.onPlay(evt);
		} else if (evt.data === YT.PlayerState.PAUSED) {
			this.isPlaying = false;
			this.props.onPause(evt);
		} else if (evt.data === YT.PlayerState.ENDED) {
			this.isPlaying = false;
			this.props.onComplete(evt);
		}
	}

	render () {
		let { isLoadingVideo } = this.state,
			{ videoId, width, height } = this.props,
			query = YouTubeApi.getPlayerOptions();

		return (
			<div className="youtube-video-player" style={this.getStyle()}>
				<div ref={r(this, '$preloader')} className="centered-panel">
					<Preloader />
				</div>
				{!isLoadingVideo ? (
					<iframe
						ref={r(this, '$iframe')}
						title="player"
						id="player"
						type="text/html"
						width={width}
						height={height}
						src={`https://www.youtube.com/embed/${videoId}?${query}`}
						frameBorder="0"
						autoFocus="false"
					/>
				) : null}
			</div>
		);
	}
}

// prop type validation
YouTubeVideoPlayer.propTypes = {
	height: PropTypes.number,
	onComplete: PropTypes.func,
	onPause: PropTypes.func,
	onPlay: PropTypes.func,
	onReady: PropTypes.func,
	videoId: PropTypes.string,
	width: PropTypes.number
};

// prop defaults
YouTubeVideoPlayer.defaultProps = {
	height: 390,
	onComplete: noop,
	onPause: noop,
	onPlay: noop,
	onReady: noop,
	videoId: null,
	width: 640
};

//export module
export default YouTubeVideoPlayer;
