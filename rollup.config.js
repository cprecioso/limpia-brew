// @ts-check

import commonjs from "@rollup/plugin-commonjs"
import nodeResolve from "@rollup/plugin-node-resolve"
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
  plugins: [
    ts({ transpiler: "babel" }),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    terser({ module: true, toplevel: true })
  ],
  external: [...require("module").builtinModules]
}

export default options
