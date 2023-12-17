/**
 *
 * @param {Backbone.Model} model
 * @param {string} attribute
 */
export const watch = (model, attribute) => {
  return {
    isWatch: true,
    model,
    attribute,
  };
};
