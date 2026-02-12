import nextPlugin from "eslint-config-next";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
    ],
  },
  ...nextPlugin,
];

export default config;
