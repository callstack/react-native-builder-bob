import styles from './Hero.module.css';
import { Button } from '@callstack/rspress-theme';
import { CodeBlockRuntime } from '@rspress/core/theme';
import { transformerNotationHighlight } from '@shikijs/transformers';

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
          <div className={styles.feature}>
            <h2 className={styles.featureTitle}>Create</h2>
            <p className={styles.featureDescription}>
              Scaffold a new React Native library with everything
              pre-configured. Choose between templates such as Turbo Modules or
              Nitro Modules.
            </p>
            <div className={styles.codeBlock}>
              <CodeBlockRuntime
                lang="sh"
                code={`npx create-react-native-library@latest`}
                shikiOptions={{
                  transformers: [transformerNotationHighlight()],
                }}
              />
            </div>
            <Button href="/create">Learn more</Button>
          </div>

          <div className={styles.feature}>
            <h2 className={styles.featureTitle}>Build</h2>
            <p className={styles.featureDescription}>
              Compile your React Native library to work with multiple tools.
              Support Metro, Webpack, Vite, NodeJS & more with a single build.
            </p>
            <div className={styles.codeBlock}>
              <CodeBlockRuntime
                lang="sh"
                code={`npx react-native-builder-bob@latest init`}
                shikiOptions={{
                  transformers: [transformerNotationHighlight()],
                }}
              />
            </div>
            <Button href="/build">Learn more</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
