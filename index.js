const Parse = require('./src/parse');

function ServerTemplatePlugin(options) {
    // 使用配置（options）设置插件实例
}

ServerTemplatePlugin.prototype.apply = function (compiler) {
    var self = this;
    // html-webpack-plugin-before-html-generation
    // html-webpack-plugin-before-html-processing
    // html-webpack-plugin-alter-asset-tags
    // html-webpack-plugin-after-html-processing
    // html-webpack-plugin-after-emit
    compiler.plugin('compilation', function (compilation) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap('ServerTemplatePlugin', function (htmlPluginData) {
            let options = htmlPluginData.plugin.options;
            if (options.serverSide === true) {
                var html = htmlPluginData.html;
                Parse.run(html, function (ret) {
                    htmlPluginData.html = ret;
                });
            }

        });
        // compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
        //     let options = htmlPluginData.plugin.options;
        //     if (options.serverSide === true) {
        //         var html = htmlPluginData.html;
        //         ParseTemplate.run(html, function (ret) {
        //             htmlPluginData.html = ret;
        //             callback(null, htmlPluginData);
        //         })
        //     } else {
        //         callback(null, htmlPluginData);
        //     }
        // });
    });


};



module.exports = ServerTemplatePlugin;