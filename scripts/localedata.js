#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the localdata command.
 */

/* eslint no-console:off */

'use strict';

const path = require('path');
const fs = require('fs');

// should match <Text />, locText(), and locId()
const TAG_PATTERN = /(<Text[^\/>]+\/>|locText\([^\)]+\)|locId\([^\)]+\))/g;

const MSG_PATTERN = /msg="(.*)"/;
const VAL_PATTERN = /locText\([\w,\s]+['"](.+)['"]\)/;
const ID_PATTERN = /locId\(['"](.+)['"]\)/;


//run
process.exitCode = execute(process.argv);


function execute (args) {
	// setup
	//const nodePath = args[0];
	const scriptPath = args[1];
	const src = args[2];
	const dest = args[3];

	if( !src && !dest ) {
		return 1; //error
	}

	//fix dir to be based on the same dir as script
	const DIR = path.parse(scriptPath).dir;
	const srcPath = path.join(DIR, src);
	const destPath = path.join(DIR, dest);

	// create localData object
	let localData = {};

	// collect all files in the srcPath folder
	// and filter out all *.js files
	let files = getFiles(srcPath, [], /\.js$/);

	// run regex on each file and find any <Text msg="" /> or Text.value() tags
	files.forEach(filepath => {
		// load content sync
		let buffer = fs.readFileSync(filepath);
		let content = buffer.toString();
		const matches = content.match(TAG_PATTERN);
		if(matches && matches.length) {

			matches.forEach(tag => {
				// match <Text msg="" />
				matchAndAddToLocalData(tag, MSG_PATTERN, localData);
				// match Text.value()
				matchAndAddToLocalData(tag, VAL_PATTERN, localData);
				// match Text.id()
				matchAndAddToLocalData(tag, ID_PATTERN, localData);
			});
		}
	});

	// build expected json format
	let content = JSON.stringify({locale: 'en', currency: 'USD', content: localData}, null, '\t');
	content = '/** GENERATED FILE **/\n/* eslint-disable quotes, max-len */\n\nmodule.exports = ' + content + ';\n';

	fs.writeFileSync(destPath, content);
	console.log('finished!');
	return 0;
}

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

function matchAndAddToLocalData(tag, pattern, localData) {
	let msg = tag.match(pattern);
	if(msg && msg.length) {
		// store id and string
		const id = generateIntlId(msg[1]);
		if(id && id.length) {
			localData[generateIntlId(msg[1])] = msg[1];
		}
	}
}

function generateIntlId (value) {
	return value
		.replace(/\s/g, '_')
		.replace(/[\W\{\[\}\]\,\.\;\:]/g, '') //eslint-disable-line
		.substring(0, 50);
}
