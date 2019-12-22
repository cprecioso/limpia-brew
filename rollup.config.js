// @ts-check

import ts from "@wessberg/rollup-plugin-ts"
import { terser } from "rollup-plugin-terser"

/** @type { import("rollup").RollupOptions } */
const options = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    banner: "#!/usr/bin/env node"
  },
  plugins: [ts(), terser({ toplevel: true })],
  external: [
    ...require("module").builtinModules,
    ...Object.keys(require("./package.json").dependencies)
  ]
}

export default options
