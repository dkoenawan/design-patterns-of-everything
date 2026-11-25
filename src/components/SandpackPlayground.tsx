import { useEffect } from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackLayout,
  useSandpack,
} from '@codesandbox/sandpack-react';

interface SandpackPlaygroundProps {
  files: Record<string, string>;
  /** File shown first, and the first one run. */
  entry?: string;
  title?: string;
}

/**
 * Each template's bundler entry. The playground owns this file (it is never
 * shown as a tab) and points it at whichever example tab is open, so the
 * "before" and "after" files both run, one at a time.
 *
 * - `.ts` examples are scripts whose output is `console.log`, so they run in
 *   `vanilla-ts` and the right-hand pane is a console.
 * - `.tsx` examples `export default` a React component, so they run in
 *   `react-ts` and the right-hand pane is the rendered preview.
 */
const RUNNERS = {
  'vanilla-ts': {
    path: '/index.ts',
    code: (mod: string) => `import "${mod}";\n`,
  },
  'react-ts': {
    path: '/index.tsx',
    // No StrictMode: its double render would inflate the render counts the
    // state-management example displays.
    code: (mod: string) =>
      `import { createRoot } from "react-dom/client";\n` +
      `import App from "${mod}";\n\n` +
      `createRoot(document.getElementById("root")!).render(<App />);\n`,
  },
} as const;

type Template = keyof typeof RUNNERS;

const templateFor = (entry: string): Template =>
  entry.endsWith('.tsx') ? 'react-ts' : 'vanilla-ts';

/** "/after.ts" → "./after" */
const toModule = (path: string) => '.' + path.replace(/\.tsx?$/, '');

/** Re-points the runner at the open tab whenever the reader switches tabs. */
function RunActiveFile({ template, files }: { template: Template; files: string[] }) {
  const { sandpack } = useSandpack();
  const { activeFile, updateFile } = sandpack;
  const runner = RUNNERS[template];
  useEffect(() => {
    if (!files.includes(activeFile)) return;
    const code = runner.code(toModule(activeFile));
    if (sandpack.files[runner.path]?.code !== code) updateFile(runner.path, code);
    // sandpack.files is read only to skip redundant updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, runner, updateFile, files]);
  return null;
}

// Celestial Atlas theme mapped to Sandpack's custom theme format.
const atlasTheme = {
  colors: {
    surface1: '#0d1120',
    surface2: '#141928',
    surface3: '#1c2235',
    clickable: '#a39570',
    base: '#e8dcb8',
    disabled: '#5a4f33',
    hover: '#d4b15e',
    accent: '#d4b15e',
    error: '#c46a55',
    errorSurface: '#2a1515',
  },
  syntax: {
    plain: '#e8dcb8',
    comment: { color: '#5a4f33', fontStyle: 'italic' as const },
    keyword: '#d4b15e',
    tag: '#7aa3d4',
    punctuation: '#a39570',
    definition: '#f1d98a',
    property: '#9ec48a',
    static: '#c8a4d4',
    string: '#9ec48a',
  },
  font: {
    body: "'JetBrains Mono', 'Courier New', monospace",
    mono: "'JetBrains Mono', 'Courier New', monospace",
    size: '13px',
    lineHeight: '1.6',
  },
};

export default function SandpackPlayground({
  files,
  entry = '/index.ts',
  title,
}: SandpackPlaygroundProps) {
  const template = templateFor(entry);
  const runner = RUNNERS[template];
  const visibleFiles = Object.keys(files);
  return (
    <div style={wrapStyle}>
      {title && <p style={labelStyle}>{title}</p>}
      <SandpackProvider
        files={{ ...files, [runner.path]: runner.code(toModule(entry)) }}
        theme={atlasTheme}
        template={template}
        options={{ activeFile: entry, visibleFiles }}
      >
        <RunActiveFile template={template} files={visibleFiles} />
        <SandpackLayout style={{ borderRadius: 0, border: '0.5px solid rgba(212,177,94,0.35)' }}>
          <SandpackCodeEditor showLineNumbers showTabs style={{ height: 380 }} />
          {template === 'react-ts' ? (
            <SandpackPreview style={{ height: 380 }} showOpenInCodeSandbox={false} />
          ) : (
            <SandpackConsole
              standalone
              resetOnPreviewRestart
              showSyntaxError
              style={{ height: 380 }}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  margin: '32px 0',
  fontFamily: "'JetBrains Mono', monospace",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontStyle: 'normal',
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#a39570',
  marginBottom: '10px',
};
