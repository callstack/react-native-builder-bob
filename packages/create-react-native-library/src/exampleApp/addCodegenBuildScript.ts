import path from 'path';
import fs from 'fs-extra';

// This is added to the example app's build.gradle file to invoke codegen before every build
const GRADLE_INVOKE_CODEGEN_TASK = `
def isNewArchitectureEnabled() {
  return rootProject.hasProperty("newArchEnabled") && rootProject.getProperty("newArchEnabled") == "true"
}

if (isNewArchitectureEnabled()) {
    // Since our library doesn't invoke codegen automatically we need to do it here.
    tasks.register('invokeLibraryCodegen', Exec) {
      workingDir "$rootDir/../../"
      def isWindows = System.getProperty('os.name').toLowerCase().contains('windows')

      if (isWindows) {
        commandLine 'cmd', '/c', 'npx bob build --target codegen'
      } else {
        commandLine 'sh', '-c', 'npx bob build --target codegen'
      }
    }
    preBuild.dependsOn invokeLibraryCodegen
}`;

// You need to have the files before calling pod install otherwise they won't be registered in your pod.
// So we add a pre_install hook to the podfile that invokes codegen
const PODSPEC_INVOKE_CODEGEN_SCRIPT = `
  pre_install do |installer|
    system("cd ../../ && npx bob build --target codegen")
  end
`;

/**
 * Codegen isn't invoked for libraries with `includesGeneratedCode` set to `true`.
 * This patches the example app to invoke library codegen on every app build.
 */
export async function addCodegenBuildScript(libraryPath: string) {
  const appBuildGradlePath = path.join(
    libraryPath,
    'example',
    'android',
    'app',
    'build.gradle'
  );
  const podfilePath = path.join(libraryPath, 'example', 'ios', 'Podfile');

  // Add a gradle task that runs before every build
  let appBuildGradle = (await fs.readFile(appBuildGradlePath)).toString();
  appBuildGradle += GRADLE_INVOKE_CODEGEN_TASK;

  await fs.writeFile(appBuildGradlePath, appBuildGradle);

  // Add a preinstall action to the podfile that invokes codegen
  const podfile = (await fs.readFile(podfilePath)).toString().split('\n');
  const podfilePostInstallIndex = podfile.findIndex((line) =>
    line.includes('post_install do |installer|')
  );
  podfile.splice(podfilePostInstallIndex, 0, PODSPEC_INVOKE_CODEGEN_SCRIPT);

  await fs.writeFile(podfilePath, podfile.join('\n'));
}
