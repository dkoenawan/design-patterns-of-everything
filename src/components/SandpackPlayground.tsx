import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
} from '@codesandbox/sandpack-react';

interface SandpackPlaygroundProps {
  files: Record<string, string>;
  entry?: string;
  title?: string;
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
  return (
    <div style={wrapStyle}>
      {title && <p style={labelStyle}>{title}</p>}
      <SandpackProvider
        files={files}
        theme={atlasTheme}
        template="vanilla-ts"
        options={{ activeFile: entry, visibleFiles: Object.keys(files) }}
      >
        <SandpackLayout style={{ borderRadius: 0, border: '0.5px solid rgba(212,177,94,0.35)' }}>
          <SandpackCodeEditor showLineNumbers showTabs style={{ height: 380 }} />
          <SandpackPreview style={{ height: 380 }} showOpenInCodeSandbox={false} />
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
