import { slotParsers } from "./value-slots/index.js";

/**
 * @param { { slotParser: import("./value-slots/index.js").SlotParser }[] } plugins
 */
const use = (...plugins) => {
  const slotParserArr = [];
  for (let plugin of plugins) {
    slotParserArr.push(plugin.slotParser);
  }
  slotParsers.unshift(...slotParserArr);
};
export { use };
