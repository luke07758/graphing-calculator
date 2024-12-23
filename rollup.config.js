import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { string } from "rollup-plugin-string";
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/Graph.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    }
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    resolve(),
    string({
      include: '**/worker.js'
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', {
          runtime: 'automatic'
        }]
      ],
      extensions: ['.js']
    }),
    commonjs(),
    postcss({
      modules: true,
      extract: true,
      plugins: [autoprefixer()]
    }),
    terser()
  ]
};