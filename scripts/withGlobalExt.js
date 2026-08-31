const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withGlobalExt(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const extBlock = `
// [Global Ext config]
ext {
    ndkVersion = "27.1.12297006"
}

task patchReactNative(type: Exec) {
    commandLine 'node', "\${rootDir}/../scripts/patch-react-native.js"
}

allprojects {
    afterEvaluate { project ->
        if (project.tasks.findByName('preBuild')) {
            project.tasks.named('preBuild') {
                dependsOn rootProject.tasks.named('patchReactNative')
            }
        }
    }
}
`;

    if (!contents.includes('[Global Ext config]')) {
      contents = extBlock + contents;
      console.log('[withGlobalExt] Injected global NDK version and auto-patch task');
    }

    config.modResults.contents = contents;
    return config;
  });
};
