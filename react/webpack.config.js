var webpack = require("webpack");
// var path = require("path");

module.exports = {
    entry: {
        app: "./src/app.jsx"
    },
    output: {
        filename: "app/js/[name].js",
        sourceMapFilename: "app/js/source.js"
    },
    node: { // csv library needs this
      fs: "empty",
      child_process: "empty"
    }, 
    module: {
        loaders: [
            {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            }
        ]
    },
    // NB - externals commented out to solve problem with conflicting versions of react with material-ui
    //  ... the downside being needing a require in every file that uses react.
    // externals: {
    //     //don't bundle the 'react' npm package with our bundle.js
    //     //but get it from a global 'React' variable
    //     'react': 'React'
    // },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    devtool: 'sourcemap'
}