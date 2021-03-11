import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian', 'fs', 'path'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
  ],
  onwarn: function(warning, warner){
    if (warning.code === 'CIRCULAR_DEPENDENCY'){
        if(warning.importer && warning.importer.startsWith('node_modules\\')){
            return;
        }
    }
    warner(warning);
  }
};