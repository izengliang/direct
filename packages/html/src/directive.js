// import { ValueSlot } from "./value-slots/value-slot.js";

class Directive {
  /**
   * @param {ValueSlot} slot
   */
  constructor(slot) {
    this.slot = slot;
  }

  render(...args) {
    return;
  }

  destory() {}
}

/**
 * @typedef {{args: any[], C: typeof Directive ,  isDirectiveResult:true } } DirectiveResult
 * @param {typeof Directive} C
 * @return {()=>DirectiveResult}
 */
const directive = (C) => {
  return (...args) => ({ args, C, isDirectiveResult: true });
};

/**
 *
 * @param {DirectiveResult} d
 */
const runDirective = (slot, d, num = 0) => {
  let instance;
  if ((instance = slot._directives[num])) {
    if (instance.C !== d.C) {
      instance.destory();
    }
  } else {
    instance = new d.C(slot);
    instance.C = d.C;
    slot._directives[num] = instance;
  }
  const args = d.args.map((arg) => {
    if (arg.isDirectiveResult) {
      return runDirective(slot, arg, ++num);
    }
    return arg;
  });

  if (num === 0) {
    slot._directiveResult = d;
    const noEmptyList = slot._directives.filter((d) => !!d);
    if (noEmptyList.length < slot._directives.length) {
      const emptyList = slot._directives.slice(noEmptyList.length);
      emptyList.forEach((d) => {
        d.destory();
      });
      slot._directives = noEmptyList;
    }
  }
  return instance.render(...args);
};

export { Directive, runDirective, directive };
