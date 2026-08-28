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
      const transformsDir = path.join(gradleCacheBase, version, 'transforms');
      if (!fs.existsSync(transformsDir)) continue;

      // Walk: transforms/<hash>/transformed/react-android-*/prefab/modules/reactnative/include/...
      const hashes = fs.readdirSync(transformsDir);
      for (const hash of hashes) {
        const transformedDir = path.join(transformsDir, hash, 'transformed');
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

console.log('[Patch] Complete.');
