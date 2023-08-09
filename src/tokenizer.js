// object of match values for the different token types
const T = {
};

function stringMatch (value, matcher) {
  if (typeof matcher === 'string') {
    return (
      value.match(new RegExp('^' + escape(matcher), 'g')) || []
    )[0];
  }
  if (matcher instanceof RegExp) {
    return (value.match(matcher) || [])[0];
  }
}

/**
 * tokenize a string containing koneko code
 * @param {string} code
 * @returns {object[]}
 */
export default function tokenize (code) {
  let tokens = [];
  // while there is still code to tokenize...
  while (code.length > 0) {
    // find the first expression
    const expr = Object.entries(T)
      // which the code matches,
      .find(entry => {
        return stringMatch(code, entry[1]) !== undefined;
      });
    // throwing if there is no such expression.
    if (expr === undefined) {
      throw new Error('tokenizer: no matching token type found');
    }
    const [type, matcher] = expr;
    // use the match to make a token...
    const match = stringMatch(code, matcher);
    tokens.push({
      type,
      value: match
    });
    // then remove the match from the code.
    code = code.slice(match.length);
    // console.log(tokens);
  }
  // keep all tokens except for whitespace.
  tokens = tokens.filter(token => token.type !== 'whitespace');
  return tokens;
}