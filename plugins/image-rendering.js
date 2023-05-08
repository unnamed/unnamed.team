/*!
 * TailwindCSS plugin to add image-rendering
 * utility classes
 */
const plugin = require('tailwindcss/plugin');

module.exports = plugin.withOptions(options => ({ addUtilities }) => {
  const values = [ 'auto', 'crisp-edges', 'pixelated' ];

  // noinspection JSUnresolvedReference
  if (options && options.allowExperimentalValues) {
    values.push('smooth', 'high-quality');
  }

  const utilities = {};
  for (const value of values) {
    utilities[`.rendering-${value}`] = {
      imageRendering: value
    };
  }

  addUtilities(utilities);
});