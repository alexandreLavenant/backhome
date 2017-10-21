const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports =
{
    entry : './src/js/app.js',
    output :
    {
        filename : 'app.js',
        path : path.resolve(__dirname, 'public/js')
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
        new UglifyJSPlugin()
    ]
};