import { resolveIdentifier } from "./compiler.js";

const choice = function (args) {
  // TODO: assert that there is one argument of type list
  const [list] = args;
  return {
    type: 'choice',
    value: list.value
  };
}

const render = function (args) {
  const [app] = args;
  globalThis.koneko.renderValue = structuredClone(app.value);
}

export const commands = {
  choice,
  render
}