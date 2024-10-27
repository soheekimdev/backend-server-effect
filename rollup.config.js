import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import alias from '@rollup/plugin-alias';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname);

export default [
  {
    input: './src/index.mts',
    external: ['fs', 'path'], // Treat Node built-ins as external
    output: {
      file: './dist/index.mjs',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      resolve({
        extensions: [
          '.mjs',
          '.js',
          '.jsx',
          '.json',
          '.sass',
          '.scss',
          '.mts',
          '.ts',
        ],
      }),
      alias({
        entries: [
          { find: '@', replacement: path.resolve(projectRootDir, 'src') },
        ],
      }),
      commonjs({
        sourceMap: false,
      }), // Convert CommonJS to ES modules
      swc({
        swc: {
          sourceMaps: false,
        },
      }),
    ],
  },
];
