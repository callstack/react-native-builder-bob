import path from 'path';
import dedent from 'dedent';
import type { TemplateConfiguration } from './template';
import kleur from 'kleur';

export function printNonLocalLibNextSteps(config: TemplateConfiguration) {
  const platforms = {
    ios: { name: 'iOS', color: 'cyan' },
    android: { name: 'Android', color: 'green' },
    ...(config.example === 'expo'
      ? ({ web: { name: 'Web', color: 'blue' } } as const)
      : null),
  } as const;

  console.log(
    dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

        ${kleur.gray('$')} yarn
      ${Object.entries(platforms)
        .map(
          ([script, { name, color }]) => `
      ${kleur[color](`Run the example app on ${kleur.bold(name)}`)}${kleur.gray(
        ':'
      )}

        ${kleur.gray('$')} yarn example ${script}`
        )
        .join('\n')}

      ${kleur.yellow(
        `See ${kleur.bold('CONTRIBUTING.md')} for more details. Good luck!`
      )}
    `)
  );
}

export function printLocalLibNextSteps({
  folder,
  config,
  linkedLocalLibrary,
  addedNitro,
  packageManager,
}: {
  folder: string;
  config: TemplateConfiguration;
  linkedLocalLibrary: boolean;
  addedNitro: boolean;
  packageManager: string;
}) {
  console.log(
    dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

      ${
        (linkedLocalLibrary
          ? `- Run ${kleur.blue(
              `${packageManager} install`
            )} to link the library\n`
          : `- Link the library at ${kleur.blue(
              path.relative(process.cwd(), folder)
            )} based on your project setup\n`) +
        (config.project.moduleConfig === 'nitro-modules' && !addedNitro
          ? `- Run ${kleur.blue(
              `${packageManager} add react-native-nitro-modules`
            )} to install nitro modules \n`
          : '') +
        `- Run ${kleur.blue(
          'pod install --project-directory=ios'
        )} to install dependencies with CocoaPods\n` +
        `- Run ${kleur.blue('npx react-native run-android')} or ${kleur.blue(
          'npx react-native run-ios'
        )} to build and run the app\n` +
        `- Import from ${kleur.blue(
          config.project.slug
        )} and use it in your app.`
      }

      ${kleur.yellow(`Good luck!`)}
    `)
  );
}

export function printErrorHelp(message: string, error: Error) {
  console.log('\n');

  if (message) {
    console.log(message);
  } else {
    console.log(
      `An unknown error occurred. See ${kleur.blue('--help')} for usage guide.`
    );
  }

  if (error) {
    console.log('\n');

    throw error;
  }
}

export function printUsedRNVersion(
  version: string,
  config: TemplateConfiguration
) {
  if (config.example === 'vanilla') {
    console.log(
      `${kleur.blue('ℹ')} Using untested ${kleur.cyan(
        `react-native@${version}`
      )} for the example`
    );
  } else {
    console.warn(
      `${kleur.yellow(
        '⚠'
      )} Ignoring --react-native-version for unsupported example type: ${kleur.cyan(
        config.example
      )}`
    );
  }
}
