const path = require('path');
module.exports = {
    watch: true,
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },

    entry: {
      index: './src/index.ts',
      board: './src/board.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
};