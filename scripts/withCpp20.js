const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withCpp20(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // We want to inject/replace externalNativeBuild inside defaultConfig with full C++20 and STL settings.
    const cpp20Config = `
        externalNativeBuild {
            cmake {
                cppFlags "-std=c++20"
                arguments "-DANDROID_STL=c++_shared", "-DCMAKE_TRY_COMPILE_TARGET_TYPE=STATIC_LIBRARY"
            }
        }`;

    // Let's check if externalNativeBuild already exists inside defaultConfig.
    // If it does, we replace the entire externalNativeBuild.cmake block.
    if (contents.includes('cppFlags "-std=c++17"') || contents.includes("cppFlags '-std=c++17'")) {
      contents = contents.replace(/cppFlags\s*['"]-std=c\+\+17['"]/, 'cppFlags "-std=c++20"');
      // Ensure ANDROID_STL is present
      if (!contents.includes('DANDROID_STL=c++_shared')) {
        contents = contents.replace(
          'cppFlags "-std=c++20"',
          'cppFlags "-std=c++20"\n                arguments "-DANDROID_STL=c++_shared", "-DCMAKE_TRY_COMPILE_TARGET_TYPE=STATIC_LIBRARY"'
        );
      }
      console.log('[withCpp20] Updated existing C++ settings to C++20');
    } else if (contents.includes('cppFlags "-std=c++20"') || contents.includes("cppFlags '-std=c++20'")) {
      // Ensure ANDROID_STL is present
      if (!contents.includes('DANDROID_STL=c++_shared')) {
        contents = contents.replace(
          /cppFlags\s*['"]-std=c\+\+20['"]/,
          'cppFlags "-std=c++20"\n                arguments "-DANDROID_STL=c++_shared", "-DCMAKE_TRY_COMPILE_TARGET_TYPE=STATIC_LIBRARY"'
        );
        console.log('[withCpp20] Appended missing STL arguments to C++20 settings');
      } else {
        console.log('[withCpp20] C++20 and STL are already configured');
      }
    } else {
      // If no externalNativeBuild is present at all, inject the full block inside defaultConfig
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {${cpp20Config}`
      );
      console.log('[withCpp20] Injected full C++20 and STL externalNativeBuild settings');
    }

    config.modResults.contents = contents;
    return config;
  });
};
