const commands = [
  'choose',
  'render'
];

/**
 * return whether a string is a type keyword
 * @param {string} str 
 */
export function isTypeKeyword (str) {
  return (
    str === 'int' ||
    str === 'str' ||
    str === 'app'
  );
}

export function isCommandKeyword (str) {
  return commands.includes(str);
}