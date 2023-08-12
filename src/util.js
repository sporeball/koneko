import { commands } from "./commands.js";

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

/**
 * return whether a string is a command keyword
 * @param {string} str
 * @returns 
 */
export function isCommandKeyword (str) {
  return Object.keys(commands).includes(str);
}

/**
 * return the type of a value
 * @param {any} value
 */
export function typeOf (value) {
  if (typeof value === 'object' && value.type !== undefined) {
    return value.type;
  }
  if (value === undefined) {
    return 'none';
  }
  // TODO: typeOfNumber
  if (typeof value === 'number') {
    return 'int';
  }
  if (typeof value === 'string') {
    return 'string';
  }
  if (Array.isArray(value)) {
    return 'list';
  }
}

/**
 * escape special characters in a string
 * useful anywhere that `String.prototype.match` is being used
 * @param {string} str
 */
export function escape (str) {
  return str.replace(/[.*+?^$()[\]{}|\\]/g, match => '\\' + match);
}