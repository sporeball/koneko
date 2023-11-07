import logUpdate from 'log-update';
import colors from 'picocolors';
import timeSpan from 'time-span';

import tokenize from './tokenizer.js';
import parse from './parser.js';
import compileAST from './compiler.js';

/**
 * perform a compilation step
 * @param {string} name what this step does
 * @param {function} cb a 1-argument function to return the result of
 * @param {*} arg the argument to `cb`
 * @returns {*}
 */
function compilationStep (name, cb, arg) {
  let t = timeSpan();
  logUpdate(`${name}...`);
  const result = cb(arg);
  logUpdate(`${name}... ${colors.green('done')} (${t()}ms)`);
  logUpdate.done();
  return result;
}

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
  const tokens = compilationStep('tokenizing code', tokenize, code);
  if (args.includes('--debug')) {
    console.log(tokens);
  }

  // 2. create an AST from the tokens
  const AST = compilationStep('creating AST', parse, tokens);
  if (args.includes('--debug')) {
    console.dir(AST, { depth: null });
  }

  // 3. create HTML code from the AST
  const compiled = compilationStep('compiling AST', compileAST, AST);
  if (args.includes('--debug')) {
    console.log(compiled);
  }

  return compiled;
}
