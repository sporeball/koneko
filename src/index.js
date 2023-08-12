import logUpdate from 'log-update';
import colors from 'picocolors';
import timeSpan from 'time-span';

import tokenize from './tokenizer.js';
import parse from './parser.js';
import compileAST from './compiler.js';

/**
 * compile koneko code into HTML
 * @param {string} code
 * @param {string[]} args
 * @returns {string}
 */
export default function compile (code, args) {
  // pollution
  globalThis.koneko = {
    debug: args.includes('--debug'),
    objects: {}
  };

  code = code.trim()
    .split('\n')
    .map(line => line.replace(/;.*/gm, '').trim()) // clean
    .join('\n');

  // 1. tokenize the code
  let t = timeSpan();
  logUpdate('tokenizing code...');
  const tokens = tokenize(code);
  logUpdate(`tokenizing code... ${colors.green('done')} (${t()}ms)`);
  logUpdate.done();
  if (args.includes('--debug')) {
    console.log(tokens);
  }

  // 2. create an AST from the tokens
  t = timeSpan();
  logUpdate('creating AST...');
  const AST = parse(tokens);
  logUpdate(`creating AST... ${colors.green('done')} (${t()}ms)`);
  logUpdate.done();
  if (args.includes('--debug')) {
    console.dir(AST, { depth: null });
  }

  // 3. create HTML code from the AST
  t = timeSpan();
  logUpdate('compiling AST...');
  const compiled = compileAST(AST);
  logUpdate(`compiling AST... ${colors.green('done')} (${t()}ms)`);
  logUpdate.done();
  if (args.includes('--debug')) {
    console.log(compiled);
  }

  return compiled;
}
