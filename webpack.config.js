const Encore = require('@symfony/webpack-encore');
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath('public/build/')
    .setPublicPath('/build')
    .setManifestKeyPrefix('build/')
    .addEntry('cafecrew_application', './assets/src/main.tsx')
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.23';
    })
    .enableTypeScriptLoader(function (_) {})
    .enableReactPreset()
    .enableIntegrityHashes(Encore.isProduction())
    .enableForkedTypeScriptTypesChecking()
    .enablePostCssLoader();

const config = Encore.getWebpackConfig();

config.resolve.alias = {
    '@': path.resolve(__dirname, 'assets/src'),
};

config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
});

config.plugins.push(
    new WorkboxPlugin.GenerateSW({
        swDest: 'service-worker.js',
        clientsClaim: true,
        skipWaiting: true,
    }),
);

if (!Encore.isProduction()) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
