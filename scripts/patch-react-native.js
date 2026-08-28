const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Patch 1: graphicsConversions.h (std::format → std::to_string) ────────────

function patchGraphicsConversions(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`[Patch] File not found: ${filePath}`);
      return false;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('return std::format("{}%", dimension.value);')) {
      content = content.replace(
        'return std::format("{}%", dimension.value);',
        'return std::to_string(dimension.value) + "%";'
      );
      fs.chmodSync(filePath, 0o666);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[Patch] Successfully patched ${filePath}`);
      return true; // patched — Gradle cache must be cleared
    } else {
      console.log(`[Patch] Already patched or pattern not found in ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`[Patch] Could not patch ${filePath}: ${err.message}`);
    return false;
  }
}

// ─── Patch 2: generate-specs-cli-executor.js (codegen ENOENT race) ────────────
// The codegen script calls readdirSync on outputDirectory before the generator
// has created it, causing an ENOENT crash for react-native-safe-area-context.
// We guard the readdirSync with an existence check.

function patchCodegenExecutor(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`[Patch] Codegen executor not found: ${filePath}`);
      return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    const buggyBlock = `    const files = fs.readdirSync(outputDirectory);
    const jniOutputDirectory = \`\${outputDirectory}/jni/react/renderer/components/\${libraryName}\`;
    fs.mkdirSync(jniOutputDirectory, {recursive: true});
    files
      .filter(f => f.endsWith('.h') || f.endsWith('.cpp'))
      .forEach(f => {
        fs.renameSync(\`\${outputDirectory}/\${f}\`, \`\${jniOutputDirectory}/\${f}\`);
      });`;

    const fixedBlock = `    // [Patched] Guard against outputDirectory not existing when no files were generated
    const jniOutputDirectory = \`\${outputDirectory}/jni/react/renderer/components/\${libraryName}\`;
    fs.mkdirSync(jniOutputDirectory, {recursive: true});
    if (fs.existsSync(outputDirectory)) {
      const files = fs.readdirSync(outputDirectory);
      files
        .filter(f => f.endsWith('.h') || f.endsWith('.cpp'))
        .forEach(f => {
          fs.renameSync(\`\${outputDirectory}/\${f}\`, \`\${jniOutputDirectory}/\${f}\`);
        });
    }`;

    if (content.includes(buggyBlock)) {
      content = content.replace(buggyBlock, fixedBlock);
      fs.chmodSync(filePath, 0o666);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[Patch] Successfully patched codegen executor: ${filePath}`);
    } else if (content.includes('[Patched]')) {
      console.log(`[Patch] Codegen executor already patched.`);
    } else {
      console.log(`[Patch] Codegen executor pattern not found — may have changed in this RN version.`);
    }
  } catch (err) {
    console.error(`[Patch] Could not patch codegen executor: ${err.message}`);
  }
}

// ─── Gradle transforms cache clear ────────────────────────────────────────────
// Called only when graphicsConversions.h was actually re-patched, to prevent
// the "immutable workspace modified" error on subsequent builds.

function clearGradleTransformsCache() {
  const homeDir = os.homedir();
  const gradleCacheBase = path.join(homeDir, '.gradle', 'caches');

  if (!fs.existsSync(gradleCacheBase)) return;

  try {
    const versions = fs.readdirSync(gradleCacheBase);
    for (const version of versions) {
      if (!/^\d+\.\d+/.test(version)) continue;
      const transformsDir = path.join(gradleCacheBase, version, 'transforms');
      if (fs.existsSync(transformsDir)) {
        fs.rmSync(transformsDir, { recursive: true, force: true });
        console.log(`[Patch] Cleared Gradle transforms cache: ${transformsDir}`);
      }
    }
  } catch (err) {
    console.warn(`[Patch] Could not clear Gradle transforms cache: ${err.message}`);
  }
}

// ─── Patch 3: graphicsConversions.h in Gradle transforms cache (AAR prefab) ───
// The build uses headers extracted from the react-android AAR in the Gradle
// cache, NOT the ones in node_modules. We must patch those too.

function patchGradleTransformsCacheHeaders() {
  const homeDir = os.homedir();
  const gradleCacheBase = path.join(homeDir, '.gradle', 'caches');

  if (!fs.existsSync(gradleCacheBase)) return;

  const TARGET = path.join('react', 'renderer', 'core', 'graphicsConversions.h');

  try {
    const versions = fs.readdirSync(gradleCacheBase);
    for (const version of versions) {
      if (!/^\d+\.\d+/.test(version)) continue;
      const majorVersion = parseInt(version.split('.')[0], 10);
      if (majorVersion > 10) continue;
      const transformsDir = path.join(gradleCacheBase, version, 'transforms');
      if (!fs.existsSync(transformsDir)) continue;

      // Walk: transforms/<hash>/transformed/react-android-*/prefab/modules/reactnative/include/...
      const hashes = fs.readdirSync(transformsDir);
      for (const hash of hashes) {
        let transformedDir = path.join(transformsDir, hash, 'transformed');
        if (!fs.existsSync(transformedDir)) {
          transformedDir = path.join(transformsDir, hash, 'workspace', 'transformed');
        }
        if (!fs.existsSync(transformedDir)) continue;

        const artifacts = fs.readdirSync(transformedDir);
        for (const artifact of artifacts) {
          if (!artifact.startsWith('react-android-')) continue;
          const headerPath = path.join(
            transformedDir, artifact,
            'prefab', 'modules', 'reactnative', 'include',
            TARGET
          );
          if (fs.existsSync(headerPath)) {
            patchGraphicsConversions(headerPath);
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[Patch] Error scanning Gradle cache: ${err.message}`);
  }
}

// ─── Run patches ──────────────────────────────────────────────────────────────

const rnRoot = path.join(__dirname, '..', 'node_modules', 'react-native');

// Patch 1: node_modules copy
const graphicsConversionsPath = path.join(
  rnRoot,
  'ReactCommon', 'react', 'renderer', 'core', 'graphicsConversions.h'
);
const wasPatched = patchGraphicsConversions(graphicsConversionsPath);
if (wasPatched) {
  clearGradleTransformsCache();
}

// Patch 2: codegen executor ENOENT fix
const codegenExecutorPath = path.join(
  rnRoot,
  'scripts', 'codegen', 'generate-specs-cli-executor.js'
);
patchCodegenExecutor(codegenExecutorPath);

// Patch 3: Gradle cache AAR prefab headers (the ones actually compiled against)
patchGradleTransformsCacheHeaders();

// Patch 4: react-native-reanimated template constraint fix (unified primary template and concepts fix)
function patchReanimatedInterpolator() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const reanimatedDir = path.join(nodeModulesDir, 'react-native-reanimated', 'Common', 'cpp', 'reanimated');

  // 1. Add #include <concepts> to CSSValue.h
  const cssValuePath = path.join(reanimatedDir, 'CSS', 'common', 'values', 'CSSValue.h');
  if (fs.existsSync(cssValuePath)) {
    let content = fs.readFileSync(cssValuePath, 'utf8');
    if (!content.includes('#include <concepts>')) {
      content = content.replace('#pragma once', '#pragma once\r\n\r\n#include <concepts>');
      fs.writeFileSync(cssValuePath, content, 'utf8');
      console.log('[Patch] Added <concepts> to CSSValue.h');
    }
  }

  // 2. Add #include <concepts> to StyleOperation.h
  const styleOpPath = path.join(reanimatedDir, 'CSS', 'interpolation', 'operations', 'StyleOperation.h');
  if (fs.existsSync(styleOpPath)) {
    let content = fs.readFileSync(styleOpPath, 'utf8');
    if (!content.includes('#include <concepts>')) {
      content = content.replace('#pragma once', '#pragma once\r\n\r\n#include <concepts>');
      fs.writeFileSync(styleOpPath, content, 'utf8');
      console.log('[Patch] Added <concepts> to StyleOperation.h');
    }
  }

  // 3. Patch TransformOperationInterpolator.h
  const headerPath = path.join(reanimatedDir, 'CSS', 'interpolation', 'transforms', 'TransformOperationInterpolator.h');
  if (fs.existsSync(headerPath)) {
    let content = fs.readFileSync(headerPath, 'utf8');
    
    // Check if already fully patched
    if (content.includes('// Base implementation for simple and resolvable operations') && !content.includes('return {};')) {
      console.log('[Patch] Reanimated interpolator header already patched to unified form.');
    } else {
      const primaryTemplateRegex = /\/\/ Base implementation for simple operations[\s\S]*?class TransformOperationInterpolator[\s\S]*?public\s+StyleOperationInterpolator[\s\S]*?\{[\s\S]*?\};/;
      const specializationRegex = /\/\/ Specialization for resolvable operations[\s\S]*?class TransformOperationInterpolator\s*<\s*TOperation\s*>[\s\S]*?};/;

      const unifiedReplacement = `// Base implementation for simple and resolvable operations
template <typename TOperation>
class TransformOperationInterpolator : public StyleOperationInterpolator {
 public:
  using StyleOperationInterpolator::StyleOperationInterpolator;

  TransformOperationInterpolator(
      const std::shared_ptr<TOperation> &defaultOperation,
      ResolvableValueInterpolatorConfig config)
      : StyleOperationInterpolator(defaultOperation), config_(std::move(config)) {}

  std::unique_ptr<StyleOperation> interpolate(
      double progress,
      const std::shared_ptr<StyleOperation> &from,
      const std::shared_ptr<StyleOperation> &to,
      const StyleOperationsInterpolationContext &context) const override {
    if constexpr (ResolvableOp<TOperation>) {
      const auto &fromOp = *std::static_pointer_cast<TOperation>(from);
      const auto &toOp = *std::static_pointer_cast<TOperation>(to);

      return std::make_unique<TOperation>(
          fromOp.value.interpolate(progress, toOp.value, getResolvableValueContext(context)));
    } else {
      const auto &fromOp = *std::static_pointer_cast<TOperation>(from);
      const auto &toOp = *std::static_pointer_cast<TOperation>(to);
      return std::make_unique<TOperation>(fromOp.value.interpolate(progress, toOp.value));
    }
  }

  std::shared_ptr<StyleOperation> resolveOperation(
      const std::shared_ptr<StyleOperation> &operation,
      const StyleOperationsInterpolationContext &context) const override {
    if constexpr (ResolvableOp<TOperation>) {
      const auto &resolvableOp = std::static_pointer_cast<TOperation>(operation);
      const auto &resolved = resolvableOp->value.resolve(getResolvableValueContext(context));

      if (!resolved.has_value()) {
        throw std::invalid_argument(
            "[Reanimated] Cannot resolve resolvable operation: " + operation->getOperationName() +
            " for node with tag: " + std::to_string(context.node->getTag()));
      }

      return std::make_shared<TOperation>(resolved.value());
    } else {
      return StyleOperationInterpolator::resolveOperation(operation, context);
    }
  }

 protected:
  const ResolvableValueInterpolatorConfig config_{};

  ResolvableValueInterpolationContext getResolvableValueContext(
      const StyleOperationsInterpolationContext &context) const {
    return ResolvableValueInterpolationContext{
        .node = context.node,
        .fallbackInterpolateThreshold = context.fallbackInterpolateThreshold,
        .viewStylesRepository = context.viewStylesRepository,
        .relativeProperty = config_.relativeProperty,
        .relativeTo = config_.relativeTo};
  }
};`;

      if (primaryTemplateRegex.test(content)) {
        content = content.replace(primaryTemplateRegex, unifiedReplacement);
        content = content.replace(specializationRegex, '');
        fs.writeFileSync(headerPath, content, 'utf8');
        console.log('[Patch] Successfully patched TransformOperationInterpolator.h');
      } else {
        console.warn('[Patch] Could not find primary template target pattern in Reanimated interpolator header');
      }
    }
  }

  // 4. Patch TransformOperationInterpolator.cpp
  const cppPath = path.join(reanimatedDir, 'CSS', 'interpolation', 'transforms', 'TransformOperationInterpolator.cpp');
  if (fs.existsSync(cppPath)) {
    let content = fs.readFileSync(cppPath, 'utf8');
    const outOfLineInterpolateRegex = /\/\/ Base implementation for simple operations[\s\S]*?std::unique_ptr\s*<\s*StyleOperation\s*>\s*TransformOperationInterpolator\s*<\s*TOperation\s*>\s*::\s*interpolate[\s\S]*?\n\}/;
    const outOfLineSpecializationRegex = /(\/\/ Specialization for resolvable operations\s*)?template\s*<\s*ResolvableOp\s+TOperation\s*>[\s\S]*?(?=\/\/ Rotate operations)/;

    let modified = false;
    if (outOfLineInterpolateRegex.test(content)) {
      content = content.replace(outOfLineInterpolateRegex, '');
      modified = true;
      console.log('[Patch] Successfully removed out-of-line interpolate definition from TransformOperationInterpolator.cpp');
    }
    if (outOfLineSpecializationRegex.test(content)) {
      content = content.replace(outOfLineSpecializationRegex, '');
      modified = true;
      console.log('[Patch] Successfully removed out-of-line specialization definitions from TransformOperationInterpolator.cpp');
    }

    if (modified) {
      fs.writeFileSync(cppPath, content, 'utf8');
    } else {
      console.log('[Patch] Out-of-line definitions already removed or not found in TransformOperationInterpolator.cpp');
    }
  }
}

// ─── Patch 5: react-native-screens CMakeLists.txt (c++_shared link fix for NDK 27) ───
function patchScreensCMake() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const cmakePath = path.join(nodeModulesDir, 'react-native-screens', 'android', 'CMakeLists.txt');
  if (fs.existsSync(cmakePath)) {
    let content = fs.readFileSync(cmakePath, 'utf8');
    if (content.includes('fbjni::fbjni') && !content.includes('c++_shared')) {
      content = content.replace(
        /android\s*\)/,
        'android\n    c++_shared\n)'
      );
      fs.writeFileSync(cmakePath, content, 'utf8');
      console.log('[Patch] Added c++_shared link target to react-native-screens CMakeLists.txt');
    } else {
      console.log('[Patch] react-native-screens CMakeLists.txt already patched or target pattern not found.');
    }
  }
}

// ─── Patch 6: react-native-worklets CMakeLists.txt (c++_shared link fix for NDK 27) ───
function patchWorkletsCMake() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const cmakePath = path.join(nodeModulesDir, 'react-native-worklets', 'android', 'CMakeLists.txt');
  if (fs.existsSync(cmakePath)) {
    let content = fs.readFileSync(cmakePath, 'utf8');
    if (content.includes('fbjni::fbjni') && !content.includes('c++_shared')) {
      content = content.replace(
        'fbjni::fbjni)',
        'fbjni::fbjni c++_shared)'
      );
      fs.writeFileSync(cmakePath, content, 'utf8');
      console.log('[Patch] Added c++_shared link target to react-native-worklets CMakeLists.txt');
    } else {
      console.log('[Patch] react-native-worklets CMakeLists.txt already patched or target pattern not found.');
    }
  }
}

patchReanimatedInterpolator();
patchScreensCMake();
patchWorkletsCMake();

console.log('[Patch] Complete.');
