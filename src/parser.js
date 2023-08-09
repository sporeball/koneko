/**
 * take an array of tokens, and remove some of them from the start,
 * producing a structure
 * @param {object[]} tokens
 * @returns {object}
 */
function eat (tokens) {
  switch (tokens[0].type) {

  }
  throw new Error(`parser: no matching rule found: ${tokens[0].type}`)
}

/**
 * parse a flat list of koneko tokens
 * @param {object[]} tokens
 * @returns {object}
 */
export default function parse (tokens) {
  let tree = [];
  while (tokens.length > 0) {
    tree.push(eat(tokens));
  }
  tree = tree.filter(node => node.type !== 'newline');
  return tree;
}