const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // 1. Add release signing configuration properties block inside signingConfigs
    const releaseSigningConfig = `
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE') && MYAPP_RELEASE_STORE_FILE) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }`;

    // Find signingConfigs block using regex to support various indentation/newlines.
    // We check if release exists specifically inside the signingConfigs block by verifying
    // that signingConfigs block does not already contain "release" inside it.
    const signingConfigsRegex = /signingConfigs\s*\{/;
    const hasReleaseInSigningConfigs = /signingConfigs\s*\{\s*release\s*\{/.test(contents);

    if (signingConfigsRegex.test(contents) && !hasReleaseInSigningConfigs) {
      contents = contents.replace(
        signingConfigsRegex,
        `signingConfigs {${releaseSigningConfig}`
      );
      console.log('[withAndroidSigning] Injected release block into signingConfigs');
    } else {
      console.log('[withAndroidSigning] signingConfigs block not found or release signing config already present');
    }

    // 2. Modify buildTypes.release to use the release signing config if available, otherwise debug
    const releaseSigningBinding = `signingConfig (project.hasProperty('MYAPP_RELEASE_STORE_FILE') && MYAPP_RELEASE_STORE_FILE ? signingConfigs.release : signingConfigs.debug)`;
    
    const buildTypesIndex = contents.indexOf('buildTypes {');
    if (buildTypesIndex !== -1) {
      const afterBuildTypes = contents.substring(buildTypesIndex);
      const releaseStartIndex = afterBuildTypes.indexOf('release {');
      if (releaseStartIndex !== -1) {
        const releaseBlockIndex = buildTypesIndex + releaseStartIndex;
        const afterReleaseBlock = contents.substring(releaseBlockIndex);
        
        if (afterReleaseBlock.includes('signingConfig signingConfigs.debug')) {
          const replacedAfterRelease = afterReleaseBlock.replace(
            'signingConfig signingConfigs.debug',
            releaseSigningBinding
          );
          contents = contents.substring(0, releaseBlockIndex) + replacedAfterRelease;
          console.log('[withAndroidSigning] Bound release buildTypes to dynamic signingConfig');
        } else {
          console.log('[withAndroidSigning] target signingConfig pattern already replaced or missing inside release block');
        }
      } else {
        console.log('[withAndroidSigning] release block not found inside buildTypes');
      }
    } else {
      console.log('[withAndroidSigning] buildTypes block not found');
    }

    config.modResults.contents = contents;
    return config;
  });
};
