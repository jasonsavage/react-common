import Promise from 'bluebird';

const IFRAME_URL = 'https://www.youtube.com/iframe_api';

class YouTubeIframeLoader {
	constructor () {
		this.YT = null;
	}

	load () {
		if (this.YT) {
			return Promise.resolve(this.YT);
		}

		return new Promise(accept => {
			let tag = document.createElement('script'),
				firstScriptTag = document.getElementsByTagName('script')[0];

			// when the iframe_api script has been added to the page, it will trigger this callback
			window.onYouTubeIframeAPIReady = () => {
				window.onYouTubeIframeAPIReady = null;
				this.YT = window.YT;
				accept(this.YT);
			};

			// Add the YouTube iframe api to the current page
			tag.src = IFRAME_URL;
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		});
	}
}

export default new YouTubeIframeLoader();
