#!/usr/bin/env node

import fs from 'fs';

import compile from './src/index.js';
import serve from './src/server.js';

/**
 * koneko CLI
 */
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
  
  // compile
  const compiled = compile(code);
  // write to a file
  fs.writeFileSync(filename.slice(0, -7) + '.html', compiled);
  // spin up a server
  serve(filename.slice(0, -7) + '.html');
}

try {
  cli();
} catch (e) {
  console.log(e);
  process.exit(1);
}