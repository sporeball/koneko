#!/usr/bin/env node

import fs from 'fs';

import colors from 'picocolors';

import compile from './src/index.js';
import serve from './src/server.js';

/**
 * koneko CLI
 */
function cli () {
  let code;
  const filename = process.argv[2];
  const args = process.argv.slice(3);
  if (filename === undefined) {
    throw new Error('no filename given');
  }
  if (!filename.endsWith('.koneko')) {
    throw new Error('invalid filetype');
  }
  // read
  try {
    code = fs.readFileSync(filename, { encoding: 'utf-8' });
  } catch (e) {
    throw new Error('file not found');
  }

  // TODO: if you really want to do this, maybe get rid of the comments in this
  // function instead?
  // if (code.trim() === '') {
  //   console.log('there is nothing to do');
  //   return;
  // }

  // compile
  const compiled = compile(code, args);
  // write to a file
  fs.writeFileSync(filename.slice(0, -7) + '.html', compiled);
  console.log(`wrote output to ${colors.cyan(filename.slice(0, -7) + '.html')}`);
  // spin up a server
  if (args.includes('--serve')) {
    serve(filename.slice(0, -7) + '.html');
  }
}

try {
  cli();
} catch (e) {
  console.log(e);
  process.exit(1);
}
