#!/usr/bin/env node

import fs from 'fs';

import run from './src/index.js';

function cli () {
  let code;
  let filename = process.argv[2];
  if (filename === undefined) {
    throw new Error('no filename given');
  }
  if (!filename.endsWith('.koneko')) {
    throw new Error('invalid filetype')
  }
  // read
  try {
    code = fs.readFileSync(filename, { encoding: 'utf-8' });
  } catch (e) {
    throw new Error('file not found');
  }
  
  // parse
  run(code);
}

try {
  cli();
} catch (e) {
  console.log(e);
  process.exit(1);
}