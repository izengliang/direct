/**
 * @typedef { (str:string, position:number, isChild:boolean)=> void | [string, ValueSlot] } SlotParser
 */

import { AttributeSlot } from "./attribute-slot.js";
import { PropertySlot } from "./property-slot.js";
import { ChildSlot } from "./child-slot.js";
import { ValueSlot } from "./value-slot.js";
import { EventSlot } from "./event-slot.js";
import { DirectiveSlot } from "./directive-slot.js";

/**
 * @type {SlotParser}
 */
const attributeSlotParser = (str, position, isChild) => {
  if (!isChild && /\s+(\w*)\s*=\s*$/.test(str)) {
    const attributeName = RegExp.$1;
    return [RegExp["$`"], new AttributeSlot(attributeName, position)];
  }
};

/**
 * @type {SlotParser}
 */
const propertySlotParser = (str, position, isChild) => {
  if (!isChild && /\s+\.(\w*)=\s*$/.test(str)) {
    const propertyName = RegExp.$1;
    return [RegExp["$`"], new PropertySlot(propertyName, position)];
  }
};

/**
 * @type {SlotParser}
 */
const eventSlotParser = (str, position, isChild) => {
  if (!isChild && /\s+@(\w*)\s*=\s*$/.test(str)) {
    const eventName = RegExp.$1;
    return [RegExp["$`"], new EventSlot(eventName, position)];
  }
};

/**
 * @type {SlotParser}
 */
const directiveSlotParser = (str, position, isChild) => {
  if (!isChild && !/\=\s*$/.test(str)) {
    return [str, new DirectiveSlot(position)];
  }
};

/**
 * @type {SlotParser}
 */
const childSlotParser = (str, position, isChild) => {
  if (isChild && !/\=\s*$/.test(str)) {
    return [str, new ChildSlot(position)];
  }
};

const slotParsers = [
  attributeSlotParser,
  propertySlotParser,
  directiveSlotParser,
  childSlotParser,
  eventSlotParser,
];

export {
  slotParsers,
  attributeSlotParser,
  propertySlotParser,
  eventSlotParser,
  directiveSlotParser,
  childSlotParser,
};
