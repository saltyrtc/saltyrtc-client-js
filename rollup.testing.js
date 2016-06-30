import typescript from 'rollup-plugin-typescript';

export default {
    entry: 'tests/main.ts',
    dest: 'dist/tests.js',
    sourceMap: true,
    treeshake: false,
    useStrict: true,
    plugins: [
        typescript({
            tsconfig: false,
            target: 'ES2015',
            removeComments: false
        })
    ]
}
