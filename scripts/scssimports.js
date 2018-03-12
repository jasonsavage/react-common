#!/usr/bin/env node

/**
 * scssimports.js node CLI script
 *
 * @desc expands import statements written as @import "includes/*"; into a list of imports for all files in that directory, relative to main.scss
 * 		 this is based on gulp-sass-bulk-import (https://www.npmjs.com/package/gulp-sass-bulk-import)
 */

/* eslint no-console:off */

'use strict';

const path = require('path');
const fs = require('fs');

const GLOB_IMPORT_REGEX = /@import\s+['"]([\w-]*\/\*)['"];?/;

//run
process.exitCode = execute(process.argv);


function execute (args) {
	// setup
	//const nodePath = args[0];
	const scriptPath = args[1];
	const tpl = args[2];

	if( !tpl ) {
		return 1; //error
	}

	//fix dir to be based on the same dir as script
	const DIR = path.parse(scriptPath).dir;
	const tplPath = path.join(DIR, tpl);
	const destPath = path.join(DIR, tpl.replace('.tpl', ''));

	// load tpl file
	const tplRoot = path.dirname(tplPath);
	let contents = fs.readFileSync(tplPath).toString();
	let result;

	while((result = GLOB_IMPORT_REGEX.exec(contents)) !== null) {

		const importRule = result[0];
		const importDir = result[1].replace('*', '');

		// list all files in importDir
		const files = getFiles(path.join(tplRoot, importDir), [], /_\w+\.scss$/);
		// update contents with imports for each file in importDir
		contents = contents.replace(importRule, generateGroupImports(getRelativePaths(tplRoot, files)));
	}

	// build file and write to dest path
	contents = '/** GENERATED FILE **/\n\n' + contents + '\n';
	fs.writeFileSync(destPath, contents);

	console.log('finished!');
	return 0;
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

/**
 * Converts absolute file paths to relative ones based on from
 * @param {string} from
 * @param {array} files
 */
function getRelativePaths (from, files) {
	return files.map(fpath => path.relative(from, fpath));
}

function generateGroupImports (arr) {
	return arr.map(fpath => {
		let result = fpath
			.replace(/\\/g, '/')
			.replace(/\/_/g, '/')
			.replace(/.scss/g, '');
		return `@import '${result}';`;
	}).join('\n');
}
