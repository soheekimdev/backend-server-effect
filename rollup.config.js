import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';

export default [
  {
    input: './src/index.mts',
    external: ['fs', 'path'], // Treat Node built-ins as external
    output: {
      file: './dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      swc(),
      resolve({
        ignoreMissingImports: true, // Ignore missing source map imports
      }), // Resolve modules in node_modules
      commonjs(), // Convert CommonJS to ES modules
    ],
  },
];
