import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    { 
      file: 'dist/index.esm.js', 
      format: 'esm', 
      sourcemap: true,
      exports: 'named'
    },
    { 
      file: 'dist/index.cjs.js', 
      format: 'cjs', 
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'PerfMonitor',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: ['web-vitals'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
    }),
    terser()
  ],
};

