import { resolveIdentifier } from "./compiler.js";

const choose = function (args) {
  // TODO: assert that there is one argument of type list
  const [list] = args;
  return list.value[Math.floor(Math.random() * list.value.length)];
}

const render = function (args) {
  const [app] = args;
  globalThis.koneko.renderValue = structuredClone(app.value);
}

export const commands = {
  choose,
  render
}