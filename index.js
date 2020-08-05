const HtmlWebpackPlugin = require('html-webpack-plugin');
const Parse = require('./src/parse');

function ServerTemplatePlugin(options) {
    // 使用配置（options）设置插件实例
}

ServerTemplatePlugin.prototype.apply = function (compiler) {
    var self = this;
    compiler.hooks.compilation.tap('ServerTemplatePlugin', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync('ServerTemplatePlugin', (data, cb) => {

            let options = data.plugin.options;
            if (options.serverSide === true) {
                Parse.run(data.html, function (ret) {
                    data.html = ret;
                    cb(null, data);
                });
            } else {
                cb(null, data);
            }

        })

    })

};



module.exports = ServerTemplatePlugin;