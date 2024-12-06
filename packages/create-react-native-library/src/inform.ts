import path from 'path';
import fs from 'fs-extra';
import dedent from 'dedent';
import type { TemplateConfiguration } from './template';
import kleur from 'kleur';

export async function printNextSteps(
  local: boolean,
  folder: string,
  config: TemplateConfiguration
) {
  if (local) {
    let linked;

    const packageManager = (await fs.pathExists(
      path.join(process.cwd(), 'yarn.lock')
    ))
      ? 'yarn'
      : 'npm';

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      const isReactNativeProject = Boolean(
        packageJson.dependencies?.['react-native']
      );

      if (isReactNativeProject) {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies[config.project.slug] =
          packageManager === 'yarn'
            ? `link:./${path.relative(process.cwd(), folder)}`
            : `file:./${path.relative(process.cwd(), folder)}`;

        await fs.writeJSON(packageJsonPath, packageJson, {
          spaces: 2,
        });

        linked = true;
      }
    }

    console.log(
      dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

      ${
        (linked
          ? `- Run ${kleur.blue(
              `${packageManager} install`
            )} to link the library\n`
          : `- Link the library at ${kleur.blue(
              path.relative(process.cwd(), folder)
            )} based on your project setup\n`) +
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
  } else {
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

      ${
        config.project.nitro
          ? kleur.blue(
              `Read the ${kleur.bold(
                'Nitro Modules'
              )} docs at ${kleur.underline('https://nitro.margelo.com/docs')}
              `
            )
          : ''
      }
      ${kleur.yellow(
        `See ${kleur.bold('CONTRIBUTING.md')} for more details. Good luck!`
      )}
    `)
    );
  }
}

export function printErrorHelp(message: string, error: Error) {
  console.log('\n');

  if (error) {
    console.log(kleur.red(error.message));
    throw error;
  }

  if (message) {
    console.log(kleur.red(message));
  } else {
    console.log(
      kleur.red(`An unknown error occurred. See '--help' for usage guide.`)
    );
  }

  process.exit(1);
}

export function printUsedRNVersion(
  version: string,
  config: TemplateConfiguration
) {
  if (config.example === 'vanilla') {
    console.log(
      `${kleur.blue('ℹ')} Using ${kleur.cyan(
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
