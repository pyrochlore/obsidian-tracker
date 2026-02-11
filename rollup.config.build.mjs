import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript({
        // Added these lines to fix a rollup error: "Path of Typescript compiler option 'outDir' must be located inside Rollup 'dir' option."
      tsconfig: 'tsconfig.json',
      rootDir: 'src',
        // outDir must be a subdirectory of Rollup's output.dir ('.') to satisfy @rollup/plugin-typescript's validation. 
        // 'dist' is a placeholder, since TypeScript doesn't emit files here. Rollup handles all output.
        // (there might be more elegant ways to deal with this - just not quite sure how.)
      outDir: 'dist'
    }),
    nodeResolve({browser: true}),
    commonjs(),
    terser()
  ],
  onwarn: function(warning, warner){
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      if (warning.importer && warning.importer.startsWith('node_modules')) {
        console.warn(`(!) Circular dependency: ${warning.importer}`);
      }
    } else {
      warner(warning);
    }
  }
};