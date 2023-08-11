import { commands } from './commands.js';
import { typeOf } from "./util.js";

/**
 * evaluate an AST node
 * @param {object} ASTNode
 */
function evaluateASTNode (ASTNode) {
  switch (ASTNode.type) {
    case 'definition':
      return resolveDefinition(ASTNode);
    case 'command':
      return call(ASTNode);
    default:
      throw new Error(
        `compiler: no rule for evaluating AST node of type ${ASTNode.type}`
      );
  }
}

/**
 * resolve a definition, placing it in koneko's global space
 * @param {object} definition
 */
function resolveDefinition (definition) {
  let value;
  // get the value
  if (definition.value.type === 'command') {
    value = call(definition.value);
  } else if (definition.value.type === 'identifier') {
    value = resolveIdentifier(definition.value);
  } else {
    value = valueFromNode(definition.value);
  }
  // make sure that the stated and actual type match
  // the app type is a special case, as it takes a list
  if (definition.objectType === 'app') {
    // assert that a list was given
    if (typeOf(value) !== 'list') {
      throw new Error(
        `compiler: object of type app assigned value of type ${typeOf(value)}`
      )
    }
    // if this passes, change the type from 'list' to 'app'
    value.type = 'app';
  } else {
    if (typeOf(value) !== value.type) {
      throw new Error(
        `compiler: object of type ${value.type} assigned value of type ${typeOf(value)}`
      );
    }
  }
  // add the object to koneko's global space
  globalThis.koneko.objects[definition.identifier] = value;
  // console.log('objects:');
  // console.dir(globalThis.koneko.objects, { depth: null });
}

/**
 * resolve an identifier
 * @param {object} identifier
 */
export function resolveIdentifier (identifier) {
  // try to get the value of the identifier from koneko's global space
  // throw if it does not exist there
  const resolvedIdentifier = globalThis.koneko.objects[identifier.value];
  if (resolvedIdentifier === undefined) {
    throw new Error(`compiler: undefined identifier ${identifier.value}`);
  }
  if (identifier.attributes) {
    resolvedIdentifier.attributes = identifier.attributes;
  }
  return resolvedIdentifier;
}

/**
 * get a value from a node
 * if the node has been assigned attributes with an attribute list, this
 * function will keep them
 * @param {object} node
 */
function valueFromNode (node) {
  switch (node.type) {
    case 'int':
    case 'string':
      return node;
    case 'identifier':
      return resolveIdentifier(node);
    case 'list':
      const newNode = Object.assign({}, node);
      newNode.value = newNode.value.map(valueFromNode);
      return newNode;
  }
}

/**
 * call a command, returning a value
 * @param {object} command
 */
function call (command) {
  // 1. make sure the command exists
  if (!Object.keys(commands).includes(command.head)) {
    throw new Error(`command not found: ${command.head}`);
  }
  // 2. resolve the arguments
  const resolvedArgs = command.args.map(arg => {
    return valueFromNode(arg);
  });
  // 3. call the command with the resolved arguments
  return commands[command.head](resolvedArgs);
}

/**
 * return an element object's intermediate representation
 * @param {object} element
 * @returns {object}
 */
function elementIR (element) {
  const IR = {
    tag: 'p',
    value: undefined,
    styles: [],
  };
  if (element.type === 'string' || element.type === 'int') {
    IR.value = String(element.value);
  }
  for (const attribute of element.attributes || []) {
    if (attribute.value === 'big') {
      IR.tag = 'h1';
    }
    if (attribute.type === 'color') {
      IR.styles.push(`color: ${attribute.value}`);
    }
  }
  return IR;
}

/**
 * compile an AST to HTML
 * @param {object[]} AST
 * @returns {string}
 */
export default function compileAST (AST) {
  // evaluate each node in the AST
  for (const node of AST) {
    evaluateASTNode(node);
  }
  // the `render` command must be used somewhere in the program, to produce
  // a list of elements to render; otherwise, there is nothing to do
  if (globalThis.koneko.renderValue === undefined) {
    throw new Error('compiler: missing render command');
  }
  // console.log('render value:');
  // console.dir(globalThis.koneko.renderValue, { depth: null });
  // store the intermediate representation of every element to be rendered
  globalThis.koneko.renderValueIR = structuredClone(globalThis.koneko.renderValue)
    .map(element => {
      return elementIR(element);
    });
  console.log('IR:', globalThis.koneko.renderValueIR);
  // use the intermediate representations to turn each element into HTML
  let htmlElements = [];
  for (const element of globalThis.koneko.renderValueIR) {
    htmlElements.push(`<${element.tag} style="${element.styles.join('; ')}">${element.value}</${element.tag}>`);
  }
  // and return a complete document
  return `<html><body>${htmlElements.join('')}</body></html>` + '\n';
}