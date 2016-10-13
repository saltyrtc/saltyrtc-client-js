import typescript from 'rollup-plugin-typescript';
import fs from 'fs';

let p = JSON.parse(fs.readFileSync('package.json'));

export default {
    entry: 'saltyrtc/main.ts',
    dest: 'dist/saltyrtc-client.es2015.js',
    format: 'iife',
    moduleName: 'saltyrtc.client',
    sourceMap: false,
    treeshake: true,
    useStrict: true,
    plugins: [
        typescript({
            typescript: require('typescript')
        })
    ],
    banner: "/**\n" +
            " * saltyrtc-client-js v" + p.version + "\n" +
            " * " + p.description + "\n" +
            " * " + p.homepage + "\n" +
            " *\n" +
            " * Copyright (C) 2016 " + p.author + "\n" +
            " *\n" +
            " * This software may be modified and distributed under the terms\n" +
            " * of the MIT license:\n" +
            " * \n" +
            " * Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
            " * of this software and associated documentation files (the \"Software\"), to deal\n" +
            " * in the Software without restriction, including without limitation the rights\n" +
            " * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
            " * copies of the Software, and to permit persons to whom the Software is\n" +
            " * furnished to do so, subject to the following conditions:\n" +
            " * \n" +
            " * The above copyright notice and this permission notice shall be included in all\n" +
            " * copies or substantial portions of the Software.\n" +
            " * \n" +
            " * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
            " * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
            " * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
            " * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
            " * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
            " * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
            " * SOFTWARE.\n" +
            " */\n" +
            "'use strict';\n"
}
