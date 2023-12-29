const html = (strings, ...values) => {
  return { strings, values, isTemplateResult: true };
};
export { html };
