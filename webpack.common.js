const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const outputPath = 'public/js';
const publicPath = '/static/js/';

module.exports =
{
    entry :
    {
        'main' : ['./src/js/main.js'],
        'app'  : ['./src/js/app.js']
    },
    output :
    {
        filename : '[name].js',
        path : path.resolve(__dirname, outputPath),
        publicPath : publicPath
    },
    module :
    {
        rules : 
        [
            {
                test : /\.css$/,
                use :
                [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test : /\.(woff|woff2|eot|ttf|otf)$/,
                use :
                [
                    'file-loader'
                ] 
            }
        ]
    },
    plugins :
    [
        new CleanWebpackPlugin([outputPath])
    ]   
};