import tokenize from './tokenizer.js';
import parse from './parser.js';

export default function run (code) {
  code = code.trim()
    .split('\n')
    .map(line => line.replace(/;.*/gm, '').trim()) // clean
    .join('\n');

    console.log(code);

    const tokens = tokenize(code);
    console.log(tokens);
    const AST = parse(tokens);
    console.log(AST);
}