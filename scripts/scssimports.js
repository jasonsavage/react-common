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
const {outputTemplate, getFiles} = require('./utils');

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
	fs.writeFileSync(destPath, outputTemplate('scssimports', contents, true) );

	console.log('finished!');
	return 0;
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
