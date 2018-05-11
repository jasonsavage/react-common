#!/usr/bin/env node

/**
 * imageimports.js node CLI script
 *
 * @desc imports images that are sent from the backend so they are compiled along with code base
 */

/* eslint no-console:off */

'use strict';

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const parseArgs = require('minimist');
const flatten = require('array-flatten');
const {outputTemplate} = require('./utils');

const IMPORT_TEMPLATE = 'export const {name} = require(\'{path}\');';

//run
process.exitCode = execute(parseArgs(process.argv.slice(2)));

function execute (args) {

	const errorMsg = validateArgs(args);
	if(errorMsg) {
		console.error(errorMsg);
		return 1; //error
	}

	// setup
	const dest = args.o || args.output;
	const remove = args.r || args.remove;
	const imgs = args._;

	//fix dir to be based on the same dir as script
	const DIR = __dirname;
	const destPath = path.join(DIR, dest);
	const destDir = path.parse(destPath).dir;
	// change image directory paths from relative to absolute
	const imgDirPaths = imgs.map(x => path.join(DIR, x));
	// grab all image files in each directory passed to this script
	let imgPaths = flatten(imgDirPaths.map((imgDir) => {
		// check for whitelist
		const whtPath = path.join(imgDir, 'whitelist.txt');
		return whitelistFilter(glob.sync(imgDir + '**/*.*(jpg|png|gif)'), whtPath, remove);
	}));

	let contents = imgPaths.map(x => IMPORT_TEMPLATE
		.replace(/\{name\}/g, getName(x))
		.replace(/\{path\}/g, getRelativeImportPath(destDir, x))
	);

	// build file and write to dest path
	fs.writeFileSync(destPath, outputTemplate('imageimports', contents.join('\n')) );

	console.log('finished!');
	return 0;
}

function validateArgs (args) {
	if(!(args.o || args.output)) {
		return 'missing required argument -o or --output';
	}
	if(!args._ || !args._.length) {
		return 'no image directories were passed to script';
	}
	return 0;
}

function whitelistFilter (fileArray, whitelistFilePath, unlink=false) {
	// load whitelist file
	if(whitelistFilePath && fs.existsSync(whitelistFilePath)) {
		const buffer = fs.readFileSync(whitelistFilePath).toString();
		const content = buffer.toString().replace(/\s/g, '');
		if(!content || !content.length) {
			console.log(whitelistFilePath + ' is empty, filter skipped');
			return fileArray; // skip filter
		}
		const whitelist = content.split(',');
		return fileArray.filter((x) => {
			if( whitelist.indexOf(path.basename(x)) === -1 ) {
				if(unlink) {
					// if image is not in the whitelist, remove it
					fs.unlink(x, (err) => {
						if(err) { throw err; }
						console.log('removed: ' + x);
					});
				}
				return false;
			}
			return true;
		});
	}
	return fileArray;
}

function getName (imgPath) {
	return path.parse(imgPath).name;
}

function getRelativeImportPath (destPath, imgPath) {
	return path.relative(destPath, imgPath)
		.replace(/\\/g, '/');
}

