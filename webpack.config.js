const Encore = require('@symfony/webpack-encore');
const path = require('path');
const { InjectManifest } = require('workbox-webpack-plugin');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .setManifestKeyPrefix('build/')

    .addEntry('daily_brew_application', './assets/src/main.tsx')

    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())

    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.38';
    })

    .enableTypeScriptLoader()
    .enableReactPreset()
    .enableIntegrityHashes(Encore.isProduction())
    .enableForkedTypeScriptTypesChecking()
    .enablePostCssLoader()
;

const config = Encore.getWebpackConfig();

config.resolve.alias = {
    '@': path.resolve(__dirname, 'assets/src'),
};

if (Encore.isProduction()) {
    config.plugins.push(
        new InjectManifest({
            swSrc: path.resolve(__dirname, 'assets/src/sw.ts'),
            swDest: '../sw.js',
            exclude: [/\.map$/, /^manifest.*\.js$/],
        })
    );
}

module.exports = config;
