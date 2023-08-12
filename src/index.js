import tokenize from './tokenizer.js';
import parse from './parser.js';
import compileAST from './compiler.js';

/**
 * compile koneko code into HTML
 * @param {string} code
 * @returns {string}
 */
export default function compile (code) {
  // pollution
  globalThis.koneko = {
    objects: {}
  };

  code = code.trim()
    .split('\n')
    .map(line => line.replace(/;.*/gm, '').trim()) // clean
    .join('\n');

  console.log(code);

  // 1. tokenize the code
  console.log('tokenizing code...');
  const tokens = tokenize(code);
  console.log('finished');
  console.log(tokens);
  // 2. create an AST from the tokens
  console.log('creating AST...');
  const AST = parse(tokens);
  console.log('finished');
  console.dir(AST, { depth: null });
  // 3. create HTML code from the AST
  console.log('compiling AST...');
  const compiled = compileAST(AST);
  console.log('finished');
  console.log(compiled);

  return compiled;
}
