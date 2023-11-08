import colors from 'picocolors';
import timeSpan from 'time-span';

import tokenize from './tokenizer.js';
import parse from './parser.js';
import compileAST from './compiler.js';
import logger from './logger.js';

/**
 * perform a compilation step
 * @param {string} name what this step does
 * @param {function} cb a 1-argument function to return the result of
 * @param {*} arg the argument to `cb`
 * @returns {*}
 */
function compilationStep (name, cb, arg) {
  let t = timeSpan();
  logger.info(`${name}...`);
  const result = cb(arg);
  logger.info(`${colors.green('finished')} in ${t()}ms`);
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
  logger.debug('tokens', tokens);

  // 2. create an AST from the tokens
  const AST = compilationStep('creating AST', parse, tokens);
  logger.debug('AST', AST);

  // 3. create HTML code from the AST
  const compiled = compilationStep('compiling AST', compileAST, AST);
  logger.debug('HTML output', compiled);

  return compiled;
}
