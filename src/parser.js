import { isCommandKeyword, isTypeKeyword } from "./util.js";

/**
 * parse an integer
 * @param {object[]} tokens
 */
function parseInteger (tokens) {
  const integer = tokens.shift();
  return {
    type: 'int',
    value: Number(integer.value)
  };
}

/**
 * parse a string
 * @param {object[]} tokens
 */
function parseString (tokens) {
  const string = tokens.shift();
  return {
    type: 'string',
    value: string.value.slice(1, -1)
  };
}
/**
 * parse an open parenthesis
 * produces a long identifier
 * @param {object[]} tokens
 */
function parseOpenParen (tokens) {
  tokens.shift(); // skip the parenthesis
  let identifiers = [];
  while (true) {
    // if the next token is a newline, the closing parenthesis is missing
    if (tokens[0] === undefined || tokens[0]?.type === 'newline') {
      throw new Error('unmatched parenthesis');
    }
    // if the next token is a short identifier, add it to the long identifier
    if (tokens[0] && tokens[0].type === 'identifier') {
      identifiers.push(tokens.shift().value);
      continue;
    }
    // if the next token is a closing parenthesis, break out of the loop
    if (tokens[0] && tokens[0].type === 'closeParen') {
      tokens.shift();
      break;
    }
    throw new Error(`invalid token in long identifier: ${tokens[0].value}`)
  }
  if (identifiers.length === 0) {
    throw new Error('empty long identifier');
  }
  return {
    type: 'identifier',
    value: identifiers.join(' ')
  };
}

/**
 * parse an open bracket
 * produces a list
 * @param {object[]} tokens
 */
function parseOpenBracket (tokens) {
  tokens.shift(); // skip the open bracket
  const list = [];
  while (true) {
    // if there are no more tokens, the array is missing a closing bracket
    if (tokens[0] === undefined) {
      throw new Error('unmatched bracket');
    }
    // if the first token remaining is a newline, skip it
    if (tokens[0].type === 'newline') {
      tokens.shift();
      continue;
    }
    // if the first token remaining is a comma, the list items are not properly
    // separated
    if (tokens[0].type === 'comma') {
      throw new Error('misplaced comma in list');
    }
    // if the first token remaining is not a close bracket, take the result of
    // eating some tokens and add it to the list
    if (tokens[0].type !== 'closeBracket') {
      list.push(eat(tokens));
    }
    // now, if the first token remaining is a newline, skip it
    if (tokens[0] && tokens[0].type === 'newline') {
      tokens.shift();
    }
    // now, if the first token remaining is a close bracket, that's the end of
    // the list; skip and break
    if (tokens[0] && tokens[0].type === 'closeBracket') {
      tokens.shift();
      break;
    }
    // if it is a comma, skip it
    else if (tokens[0] && tokens[0].type === 'comma') {
      tokens.shift();
      // now, if the first token remaining is a close bracket, the comma
      // is extraneous
      if (tokens[0] && tokens[0].type === 'closeBracket') {
        throw new Error('misplaced comma in list');
      }
    }
    // in any other case, the current and next list item are not properly
    // separated
    else {
      throw new Error('list items not properly separated');
    }
  }
  return {
    type: 'list',
    value: list
  }
}

/**
 * parse an open brace
 * produces an attribute list, applied to an object
 * TODO: don't repeat yourself
 * @param {object[]} tokens
 */
function parseOpenBrace (tokens) {
  tokens.shift(); // skip the open brace
  const attributes = [];
  while (true) {
    // if there are no more tokens, the attribute list is missing a closing brace
    if (tokens[0] === undefined) {
      throw new Error('unmatched brace');
    }
    // if the first token remaining is a newline, skip it
    if (tokens[0].type === 'newline') {
      tokens.shift();
      continue;
    }
    // if the first token remaining is a comma, the attribute list items are
    // not properly separated
    if (tokens[0].type === 'comma') {
      throw new Error('misplaced comma in attribute list');
    }
    // if the first token remaining is not a close bracket, take the result of
    // eating some tokens and add it to the list
    // this will be checked for validity later
    if (tokens[0].type !== 'closeBrace') {
      attributes.push(eat(tokens));
    }
    // now, if the first token remaining is a newline, skip it
    if (tokens[0] && tokens[0].type === 'newline') {
      tokens.shift();
    }
    // now, if the first token remaining is a close brace, that's the end of
    // the attribute list; skip and break
    if (tokens[0] && tokens[0].type === 'closeBrace') {
      tokens.shift();
      break;
    }
    // if it is a comma, skip it
    else if (tokens[0] && tokens[0].type === 'comma') {
      tokens.shift();
      // now, if the first token remaining is a close brace, the comma
      // is extraneous
      if (tokens[0] && tokens[0].type === 'closeBrace') {
        throw new Error('misplaced comma in attribute list');
      }
    }
    // in any other case, the current and next attribute list item are not
    // properly separated
    else {
      throw new Error('attribute list items not properly separated');
    }
  }
  // now, the attribute list is finished.
  // we need to verify that all of its attributes are valid...
  if (!attributes.every(attribute => {
    return (
      attribute.type === 'identifier' ||
      attribute.type === 'color'
    )
  })) {
    throw new Error('invalid attribute in attribute list');
  }
  // and that it is actually being applied to a valid object
  if (tokens[0] === undefined) {
    throw new Error('bare attribute list');
  }
  const object = eat(tokens);
  // TODO: should lists be allowed to have attribute lists applied to them?
  // TODO: object.type allowed to be 'element' only
  if (
    object.type !== 'identifier'
    && object.type !== 'int'
    && object.type !== 'string'
  ) {
    throw new Error(
      `cannot apply attribute list (found object of type ${object.type})`
    );
  }
  // if both are true, return an AST node with the attributes applied
  return {
    type: object.type,
    value: object.value,
    attributes
  };
}

/**
 * parse a command keyword
 * produces a command
 * @param {object[]} tokens
 */
function parseCommand (tokens) {
  const head = tokens.shift().value;
  const args = [];
  while (true) {
    if (tokens[0] === undefined) {
      break;
    }
    if (tokens[0].type === 'newline') {
      break;
    }
    args.push(eat(tokens));
  }
  return {
    type: 'command',
    head,
    args
  }
}

/**
 * parse a type keyword
 * produces a definition
 * @param {object[]} tokens
 */
function parseType (tokens) {
  const type = tokens.shift().value;
  if (tokens[0] === undefined) {
    throw new Error(`bare token: ${type.value}`)
  }
  const identifier = eat(tokens).value;
  if (tokens[0]?.type !== 'equals') {
    throw new Error('missing equals sign');
  }
  tokens.shift();
  const value = eat(tokens);
  if (tokens[0] && tokens[0].type !== 'newline') {
    throw new Error('extra tokens found on right-hand side of definition');
  }
  return {
    type: 'definition',
    objectType: type,
    identifier,
    value
  }
}

/**
 * parse a short identifier
 * produces either a definition, command, or short identifier, depending on
 * the value
 * @param {object[]} tokens
 */
function parseIdentifier (tokens) {
  const identifier = tokens[0].value;
  if (isTypeKeyword(identifier)) {
    return parseType(tokens);
  }
  if (isCommandKeyword(identifier)) {
    return parseCommand(tokens);
  }
  tokens.shift();
  return {
    type: 'identifier',
    value: identifier
  }
}

/**
 * take an array of tokens, and remove some of them from the start,
 * producing a structure
 * @param {object[]} tokens
 * @returns {object}
 */
function eat (tokens) {
  switch (tokens[0].type) {
    case 'integer':
      return parseInteger(tokens);
    case 'string':
      return parseString(tokens);
    case 'openParen':
      return parseOpenParen(tokens);
    case 'openBracket':
      return parseOpenBracket(tokens);
    case 'openBrace':
      return parseOpenBrace(tokens);
    case 'newline':
      return tokens.shift();
    case 'color':
      return tokens.shift();
    case 'identifier':
      return parseIdentifier(tokens);
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