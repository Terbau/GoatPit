/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require("windy-radix-palette"),
  ],
  safelist: [
    {
      pattern: /text-(red|green|blue|indigo)-(1|11|12)/,
    },
    {
      pattern: /border-(red|green|blue|indigo)-(7|8|9)/,
      variants: ["hover"],
    },
    {
      pattern: /bg-(red|green|blue|indigo)-(9|10)/,
      variants: ["hover"],
    },
  ]
}
