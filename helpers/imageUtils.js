import Path from '../Path';
import _ from 'underscore';

export const DEFAULT_PROFILE_IMAGE = 'profile_generic.png';

/**
 * helps to prevent users from hacking the FE and running malicious scripts
 * NOTE: this removes non-word characters from the string
 * ...  (ex. ..\..\..\myvirus.txt -> myvirustxt.png)
 * @param filename
 * @returns {string}
 */
export function sanitizeFilename (filename='') {

	if (filename.match(/\.gif/)) {
		return filename.replace(/\.gif/, '').replace(/\W/g, '') + '.gif';
	} else if (filename.match(/\.jpg/)) {
		return filename.replace(/\.jpg/, '').replace(/\W/g, '') + '.jpg';
	}

	return filename.replace(/\.png/, '').replace(/\W/g, '') + '.png';
}


export function getProfileImagePath (obj, small = false) {
	let filename;

	if (obj && !_.isString(obj) && obj.image) {
		filename = obj.image;
	} else if (_.isString(obj)) {
		filename = obj;
	}

	if (!filename) {
		filename = DEFAULT_PROFILE_IMAGE;
	}

	return Path.assets(sanitizeFilename(filename));
}

