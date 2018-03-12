import _ from 'underscore';
import ueFunctions from 'ueFunctions';

const SEEK_SPEED = 0.3;
const DEFAULT_PLAYER_VARS = {
	enablejsapi: 1, //enable control by JS
	disablekb: 1, // stops keyboard commands that could cause issues
	fs: 0, // hides the fullscreen button in the control bar
	iv_load_policy: 2, // hide video annotations
	modestbranding: 1, // hide YouTube logo in the control bar
	rel: 0, // don't show related videos
	showinfo: 0, //hide all video information,
	controls: ueFunctions.getIsGameRunningInCoherent() ? 0 : 1
};

let YouTubeApi = {
	getYouTubeUrls: function (htmlContent) {
		// eslint-disable-next-line
		let matches = htmlContent.match(/(www\.youtube\.com[^"?]*)/g);
		return matches && matches.length ? matches.map(url => '//' + url) : [];
	},

	getVideoIdFromEmbedUrl: embedUrl => {
		// fetch video id from: https://www.youtube.com/embed/SvXg5-61wpk9o
		// match anything after embed/ to the / or end of line
		// eslint-disable-next-line
		let matches = embedUrl.match(/embed\/([^\/\s\?]+)/);
		return matches && matches.length ? matches[1] : null;
	},

	// gamepad support utils
	getGamepadPlayPauseMethod: player => {
		// return wrapper function
		return () => {
			// should help verify that this is a real YT player object
			if (player && player.getPlayerState) {
				let playerState = player.getPlayerState();
				if (playerState === 1) {
					player.pauseVideo();
				} else {
					player.playVideo();
				}
			}
		};
	},

	getGamepadSeekMethod: player => {
		let seekAmount = 0,
			seekStartTime = -1,
			seekAmountTimer = null;

		// return wrapper function
		return value => {
			clearTimeout(seekAmountTimer);

			// should help verify that this is a real YT player object
			if (player && player.pauseVideo) {
				//stop video
				player.pauseVideo();

				if (seekStartTime === -1) {
					seekStartTime = player.getCurrentTime();
				}
				// tally up seek amount until they let go of the stick
				seekAmount += value * SEEK_SPEED; //dampen
				player.seekTo(seekStartTime + seekAmount);

				seekAmountTimer = setTimeout(() => {
					player.playVideo();
					seekAmount = 0;
					seekStartTime = -1;
				}, 100);
			}
		};
	},

	getPlayerOptions: () => {
		return _.keys(DEFAULT_PLAYER_VARS)
			.map(name => '' + name + '=' + DEFAULT_PLAYER_VARS[name])
			.join('&');
	}
};

export default YouTubeApi;
