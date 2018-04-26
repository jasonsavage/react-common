const path = require('path');
const fs = require('fs');
const moment = require('moment');


const OUTPUT_TEMPLATE = '/* eslint-disable */\n/**\n * GENERATED FILE \n * @script npm run {script} \n * @generated {date}\n */\n\n{contents}\n';
const OUTPUT_TEMPLATE_CSS = '///\n// GENERATED FILE \n// @script npm run {script} \n// @generated {date}\n//\n\n{contents}\n';

function outputTemplate (script, contents, css=false) {
	return ( css ? OUTPUT_TEMPLATE_CSS : OUTPUT_TEMPLATE)
		.replace(/\{script\}/, script)
		.replace(/\{date\}/, moment().format('MMMM Do YYYY, h:mm a'))
		.replace(/\{contents\}/, contents);
}

/**
 * Recursively loop though directory and find all files whose name matches pattern
 * @param {string} dir
 * @param {array} files
 * @param {RegExp} pattern
 * @returns {array}
 */
function getFiles (dir, files, pattern) {
	fs.readdirSync(dir).forEach(name => {
		let dirPath = path.join(dir, name);
		let stat = fs.statSync(dirPath);

		if(stat.isDirectory()) {
			getFiles(dirPath, files, pattern);
		} else {
			if(pattern.test(name)) {
				files.push(dirPath);
			}
		}
	});
	return files;
}

module.exports = {
	outputTemplate: outputTemplate,
	getFiles: getFiles
};

