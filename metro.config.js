const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SVG를 소스 파일로 처리
config.resolver.sourceExts.push('svg');

module.exports = config;