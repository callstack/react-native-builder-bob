import path from 'path';
import fs from 'fs-extra';

const GRADLE_INVOKE_CODEGEN_TASK = `
def isNewArchitectureEnabled() {
  return rootProject.hasProperty("newArchEnabled") && rootProject.getProperty("newArchEnabled") == "true"
}

if (isNewArchitectureEnabled()) {
    // Since our library doesn't invoke codegen automatically we need to do it here.
    tasks.register('invokeLibraryCodegen', Exec) {
        workingDir "$rootDir/../../"
        commandLine "npx", "bob", "build", "--target", "codegen"
    }
    preBuild.dependsOn invokeLibraryCodegen
}`;

const XCODE_INVOKE_CODEGEN_ACTION = `
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Invoke Codegen"
               scriptText = "cd &quot;$WORKSPACE_PATH/../../../&quot; &amp;&amp; npx bob build --target codegen&#10;">
            </ActionContent>
         </ExecutionAction>
      </PreActions>`;

const PODSPEC_INVOKE_CODEGEN_SCRIPT = `
  pre_install do |installer|
    system("cd ../../ && npx bob build --target codegen")
  end
`;

/**
 * Codegen isn't invoked for libraries with `includesGeneratedCode` set to `true`.
 * This patches the example app to invoke library codegen on every app build.
 */
export async function patchExampleAppCodegen(
  libraryPath: string,
  projectName: string
) {
  const appBuildGradlePath = path.join(
    libraryPath,
    'example',
    'android',
    'app',
    'build.gradle'
  );
  const exampleAppBuildSchemePath = path.join(
    libraryPath,
    'example',
    'ios',
    `${projectName}Example.xcodeproj`,
    'xcshareddata',
    'xcschemes',
    `${projectName}Example.xcscheme`
  );
  const podfilePath = path.join(libraryPath, 'example', 'ios', 'Podfile');

  // Add a gradle task that runs before every build
  let appBuildGradle = (await fs.readFile(appBuildGradlePath)).toString();
  appBuildGradle += GRADLE_INVOKE_CODEGEN_TASK;

  await fs.writeFile(appBuildGradlePath, appBuildGradle);

  // Add an XCode prebuild action.
  const exampleAppBuildScheme = (await fs.readFile(exampleAppBuildSchemePath))
    .toString()
    .split('\n');
  // Used XCode and inspected the result to determine where it inserts the actions
  const actionTargetLineIndex = exampleAppBuildScheme.findIndex((line) =>
    line.includes('<BuildActionEntries>')
  );
  exampleAppBuildScheme.splice(
    actionTargetLineIndex,
    0,
    XCODE_INVOKE_CODEGEN_ACTION
  );

  await fs.writeFile(
    exampleAppBuildSchemePath,
    exampleAppBuildScheme.join('\n')
  );

  // Add a preinstall action to the podfile that invokes codegen
  const podfile = (await fs.readFile(podfilePath)).toString().split('\n');
  const podfilePostInstallIndex = podfile.findIndex((line) =>
    line.includes('post_install do |installer|')
  );
  podfile.splice(podfilePostInstallIndex, 0, PODSPEC_INVOKE_CODEGEN_SCRIPT);

  await fs.writeFile(podfilePath, podfile.join('\n'));
}
