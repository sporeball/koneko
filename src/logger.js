import colors from 'picocolors';

/**
 * return a pretty string given a log level
 * @param {string} level
 * @returns {string}
 */
function levelString (level) {
  switch (level) {
    case 'error':
      return colors.red('[e]');
    case 'warn':
      return colors.yellow('[w]');
    case 'info':
      return colors.cyan('[i]');
    case 'debug':
      return colors.gray('[d]');
  }
}

/**
 * log a single value at the specified level
 * @param {*} value
 * @param {string} level
 */
function log (value, level) {
  if (typeof value === 'object') {
    console.dir(value, { depth: null });
  } else {
    console.log(`${levelString(level)} ${value}`);
  }
}

/**
 * builder function for logging at a certain level
 * the function returned accepts either of the following signatures:
 * - string
 * - string, any
 * that is, if an actual value is to be logged, the first argument must
 * describe what it is
 * @param {string} level
 * @returns {function}
 */
function builder (level) {
  return function (...values) {
    if (level === 'debug' && globalThis.koneko.debug === false) {
      return;
    }
    const [value1, value2] = values;
    if (values.length === 1) {
      log(value1, level);
    } else if (values.length === 2) {
      if (typeof value1 === 'string' && typeof value2 === 'object') {
        log(`${value1}:`, level);
        log(value2, level);
      } else {
        log(`${value1}: ${value2}`, level);
      }
    } else {
      throw new Error('logger: invalid number of arguments');
    }
  };
}

export default {
  error: builder('error'),
  warn: builder('warn'),
  info: builder('info'),
  debug: builder('debug'),
};
