import { Button } from '@callstack/rspress-theme';
import { getCustomMDXComponent } from '@rspress/core/theme';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <div className="rp-relative">
      <div
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        className={`rp-overflow-hidden rp-max-w-6xl ${styles.container}`}
      >
        <div className={styles.heroMain}>
          <h1 className={styles.heroName}>
            Create & build React Native libraries
          </h1>
        </div>

        <div className={styles.featureList}>
          <Feature
            title="Create"
            description="Scaffold a new React Native library with everything pre-configured. Choose between templates such as Turbo Modules or"
            code={`npx create-react-native-library@latest`}
            link="/react-native-builder-bob/create"
          />
          <Feature
            title="Build"
            description="Compile your React Native library to work with multiple tools. Support Metro, Webpack, Vite, NodeJS & more with a single build."
            code={`npx react-native-builder-bob@latest init`}
            link="/react-native-builder-bob/build"
          />
        </div>
      </div>
    </div>
  );
}

const { pre: Pre } = getCustomMDXComponent();

function Feature({
  title,
  description,
  code,
  link,
}: {
  title: string;
  description: string;
  code: string;
  link: string;
}) {
  return (
    <div className={styles.feature}>
      <h2 className={styles.featureTitle}>{title}</h2>
      <p className={styles.featureDescription}>{description}</p>
      <div className={styles.codeBlock}>
        <Pre
          lang="bash"
          className="shiki css-variables"
          style={{
            backgroundColor: 'var(--shiki-background)',
            color: 'var(--shiki-foreground)',
          }}
        >
          <code style={{ whiteSpace: 'pre' }}>
            {code.split(' ').map((part, index) => {
              return (
                <span
                  style={{
                    color:
                      index === 0
                        ? 'var(--shiki-token-function)'
                        : 'var(--shiki-token-string)',
                  }}
                >
                  {part}{' '}
                </span>
              );
            })}
          </code>
        </Pre>
      </div>
      <Button href={link}>Learn more</Button>
    </div>
  );
}
