#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const paths = {
  palettesDir: path.join(rootDir, 'palettes'),
  rules: path.join(rootDir, 'palettes', '_derivation-rules.json'),
  vscodeThemesDir: path.join(rootDir, 'editors', 'vscode', 'themes'),
  zedThemesDir: path.join(rootDir, 'editors', 'zed', 'themes')
};

const vscodeFileById = {
  asahi: 'Asahi-color-theme.json',
  karesansui: 'Karesansui-color-theme.json',
  tasogare: 'Tasogare-color-theme.json',
  kokedera: 'KokeDera-color-theme.json',
  kurosumi: 'KuroSumi-color-theme.json',
  kachiiro: 'Kachiiro-color-theme.json'
};

const TERMINAL_BASE_KEYS = [
  'ansiBlack',
  'ansiRed',
  'ansiGreen',
  'ansiYellow',
  'ansiBlue',
  'ansiMagenta',
  'ansiCyan',
  'ansiWhite'
];

function clamp(v) {
  return Math.min(255, Math.max(0, Math.round(v)));
}

function toHex(v) {
  return v.toString(16).toUpperCase().padStart(2, '0');
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').slice(0, 6);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function adjustHex(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  return `#${toHex(clamp(r * factor))}${toHex(clamp(g * factor))}${toHex(clamp(b * factor))}`;
}

function mixHex(hexA, hexB, ratio) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = 1 - ratio;
  return `#${toHex(clamp(a.r * r + b.r * ratio))}${toHex(clamp(a.g * r + b.g * ratio))}${toHex(clamp(a.b * r + b.b * ratio))}`;
}

function withAlpha(hex, alphaHex) {
  return `${hex.slice(0, 7)}${alphaHex}`;
}

function stripAlpha(hex) {
  return hex.slice(0, 7);
}

async function loadRules() {
  const raw = await readFile(paths.rules, 'utf8');
  return JSON.parse(raw);
}

async function loadPalettes(order) {
  const entries = await readdir(paths.palettesDir);
  const files = entries.filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  const map = new Map();

  for (const file of files) {
    const raw = await readFile(path.join(paths.palettesDir, file), 'utf8');
    const palette = JSON.parse(raw);
    map.set(palette.id, palette);
  }

  const ordered = [];
  for (const id of order) {
    const palette = map.get(id);
    if (!palette) {
      throw new Error(`Palette '${id}' referenced in rules was not found.`);
    }
    ordered.push(palette);
  }
  return ordered;
}

function buildVscodeTheme(palette, tokenScopes) {
  const { name, appearance, slots, overrides = {} } = palette;
  const border = overrides.border ?? withAlpha(slots.fg, '33');
  const selectionBackground = overrides.selectionBackground ?? withAlpha(slots.accent, '4D');
  const lineHighlightBackground = overrides.lineHighlightBackground ?? withAlpha(slots.panelBg, '66');
  const activityBarForeground = overrides.activityBarForeground ?? slots.fg;
  const cursorForeground = overrides.cursorForeground ?? slots.accent;
  const typeColor = overrides.typeColor ?? slots.accent;
  const terminal = overrides.terminal ?? {
    ansiBlack: slots.bg,
    ansiRed: slots.accent,
    ansiGreen: slots.string,
    ansiYellow: slots.variable,
    ansiBlue: slots.function,
    ansiMagenta: slots.accent,
    ansiCyan: slots.string,
    ansiWhite: slots.fg
  };

  const colors = {
    'editor.background': slots.bg,
    'editor.foreground': slots.fg,
    'activityBar.background': slots.panelBg,
    'activityBar.foreground': activityBarForeground,
    'sideBar.background': slots.sidebarBg,
    'sideBar.foreground': slots.fg,
    'editor.selectionBackground': selectionBackground,
    'editor.lineHighlightBackground': lineHighlightBackground,
    'editorCursor.foreground': cursorForeground,
    'editorGroup.border': border,
    'sideBar.border': border,
    'activityBar.border': border,
    'statusBar.background': slots.panelBg,
    'statusBar.foreground': slots.fg,
    'titleBar.activeBackground': slots.panelBg,
    'titleBar.activeForeground': slots.fg,
    'titleBar.inactiveBackground': slots.panelBg,
    'titleBar.inactiveForeground': withAlpha(slots.fg, '99'),
    'terminal.ansiBlack': terminal.ansiBlack,
    'terminal.ansiRed': terminal.ansiRed,
    'terminal.ansiGreen': terminal.ansiGreen,
    'terminal.ansiYellow': terminal.ansiYellow,
    'terminal.ansiBlue': terminal.ansiBlue,
    'terminal.ansiMagenta': terminal.ansiMagenta,
    'terminal.ansiCyan': terminal.ansiCyan,
    'terminal.ansiWhite': terminal.ansiWhite
  };

  const tokenColors = [
    {
      scope: tokenScopes.comment,
      settings: { foreground: slots.muted, fontStyle: 'italic' }
    },
    {
      scope: tokenScopes.keyword,
      settings: { foreground: slots.accent }
    },
    {
      scope: tokenScopes.string,
      settings: { foreground: slots.string }
    },
    {
      scope: tokenScopes.function,
      settings: { foreground: slots.function }
    },
    {
      scope: tokenScopes.variable,
      settings: { foreground: slots.variable }
    },
    {
      scope: tokenScopes.type,
      settings: { foreground: typeColor, fontStyle: 'bold' }
    },
    {
      scope: tokenScopes.property,
      settings: { foreground: slots.accent }
    },
    {
      scope: tokenScopes.heading,
      settings: { foreground: slots.accent, fontStyle: 'bold' }
    },
    {
      scope: tokenScopes.bold,
      settings: { fontStyle: 'bold' }
    },
    {
      scope: tokenScopes.italic,
      settings: { fontStyle: 'italic' }
    },
    {
      scope: tokenScopes.raw,
      settings: { foreground: slots.string }
    },
    {
      scope: tokenScopes.quote,
      settings: { foreground: slots.muted, fontStyle: 'italic' }
    },
    {
      scope: tokenScopes.link,
      settings: { foreground: slots.function, fontStyle: 'underline' }
    }
  ];

  return {
    name,
    type: appearance,
    colors,
    tokenColors
  };
}

function buildZedTheme(palette) {
  const { name, appearance, slots, overrides = {} } = palette;
  const terminalBase = overrides.terminal ?? {
    ansiBlack: slots.bg,
    ansiRed: slots.accent,
    ansiGreen: slots.string,
    ansiYellow: slots.variable,
    ansiBlue: slots.function,
    ansiMagenta: slots.accent,
    ansiCyan: slots.string,
    ansiWhite: slots.fg
  };

  const zedAnsi = {
    'terminal.ansi.black': terminalBase.ansiBlack,
    'terminal.ansi.red': terminalBase.ansiRed,
    'terminal.ansi.green': terminalBase.ansiGreen,
    'terminal.ansi.yellow': terminalBase.ansiYellow,
    'terminal.ansi.blue': terminalBase.ansiBlue,
    'terminal.ansi.magenta': terminalBase.ansiMagenta,
    'terminal.ansi.cyan': terminalBase.ansiCyan,
    'terminal.ansi.white': terminalBase.ansiWhite
  };

  for (const key of TERMINAL_BASE_KEYS) {
    const color = terminalBase[key];
    const normalized = key.replace('ansi', '').toLowerCase();
    zedAnsi[`terminal.ansi.bright_${normalized}`] = adjustHex(color, 1.2);
    zedAnsi[`terminal.ansi.dim_${normalized}`] = adjustHex(color, 0.8);
  }

  const selection = overrides.selectionBackground ?? withAlpha(slots.accent, '4D');
  const playerCursor = overrides.playerCursor ?? stripAlpha(selection);
  const mutedText = overrides.zedTextMuted ?? mixHex(slots.muted, slots.fg, 0.55);
  const mutedIcon = overrides.zedIconMuted ?? mixHex(slots.muted, slots.fg, 0.65);
  const terminalForeground = overrides.terminalForeground ?? slots.fg;
  const terminalBackground = overrides.terminalBackground ?? slots.bg;

  return {
    name,
    appearance,
    style: {
      'background': slots.bg,
      'border': overrides.border ?? withAlpha(slots.fg, '33'),
      'panel.background': slots.panelBg,
      'surface.background': slots.bg,
      'title_bar.background': slots.panelBg,
      'toolbar.background': slots.panelBg,
      'status_bar.background': slots.panelBg,
      'tab_bar.background': slots.panelBg,
      'tab.inactive_background': slots.sidebarBg,
      'tab.active_background': slots.bg,
      'element.background': slots.sidebarBg,
      'element.hover': withAlpha(slots.fg, '1A'),
      'element.active': withAlpha(slots.fg, '26'),
      'ghost_element.background': withAlpha(slots.panelBg, '00'),
      'ghost_element.hover': withAlpha(slots.fg, '14'),
      'ghost_element.active': withAlpha(slots.fg, '1F'),
      'text': slots.fg,
      'text.muted': mutedText,
      'text.accent': slots.accent,
      'icon': slots.fg,
      'icon.muted': mutedIcon,
      'editor.background': slots.bg,
      'editor.foreground': slots.fg,
      'editor.gutter.background': slots.sidebarBg,
      'editor.line_number': slots.muted,
      'editor.active_line_number': slots.fg,
      'editor.hover_line.background': overrides.lineHighlightBackground ?? withAlpha(slots.panelBg, '66'),
      'editor.document_highlight.read_background': selection,
      'editor.document_highlight.write_background': selection,
      'link_text.hover': slots.function,
      'terminal.background': terminalBackground,
      'terminal.ansi.background': terminalBackground,
      'terminal.foreground': terminalForeground,
      'terminal.bright_foreground': adjustHex(terminalForeground, 1.12),
      'terminal.dim_foreground': adjustHex(terminalForeground, 0.88),
      error: terminalBase.ansiRed,
      warning: terminalBase.ansiYellow,
      info: terminalBase.ansiBlue,
      hint: terminalBase.ansiCyan,
      created: terminalBase.ansiGreen,
      modified: terminalBase.ansiYellow,
      deleted: terminalBase.ansiRed,
      players: [
        {
          cursor: playerCursor,
          selection
        }
      ],
      syntax: {
        keyword: { color: slots.accent },
        function: { color: slots.function },
        type: { color: overrides.typeColor ?? slots.accent, font_weight: 700 },
        constant: { color: overrides.typeColor ?? slots.accent, font_weight: 700 },
        property: { color: slots.accent },
        variable: { color: slots.variable },
        string: { color: slots.string },
        comment: { color: slots.muted, font_style: 'italic' },
        tag: { color: slots.accent },
        title: { color: slots.accent, font_weight: 700 },
        emphasis: { font_style: 'italic' },
        'emphasis.strong': { font_weight: 700 },
        link_uri: { color: slots.function },
        link_text: { color: slots.function }
      },
      ...zedAnsi
    }
  };
}

async function buildVscode(palettes, rules) {
  await mkdir(paths.vscodeThemesDir, { recursive: true });
  for (const palette of palettes) {
    const fileName = vscodeFileById[palette.id];
    if (!fileName) {
      throw new Error(`No VS Code output file mapping configured for '${palette.id}'.`);
    }
    const theme = buildVscodeTheme(palette, rules.vscode.tokenScopes);
    await writeFile(path.join(paths.vscodeThemesDir, fileName), `${formatVscodeTheme(theme)}\n`);
  }
}

async function buildZed(palettes) {
  await mkdir(paths.zedThemesDir, { recursive: true });
  const family = {
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: 'Ukiyo Tone',
    author: 'Mohit Sharma',
    themes: palettes.map((palette) => buildZedTheme(palette))
  };
  await writeFile(path.join(paths.zedThemesDir, 'ukiyo-tone.json'), `${JSON.stringify(family, null, 2)}\n`);
}

async function main() {
  const target = process.argv[2] ?? 'all';
  const rules = await loadRules();
  const palettes = await loadPalettes(rules.themeOrder);

  if (target === 'all' || target === 'vscode') {
    await buildVscode(palettes, rules);
    console.log('Built VS Code themes.');
  }

  if (target === 'all' || target === 'zed') {
    await buildZed(palettes);
    console.log('Built Zed theme family.');
  }

  if (!['all', 'vscode', 'zed'].includes(target)) {
    throw new Error(`Unknown build target '${target}'. Use: all | vscode | zed`);
  }
}

main().catch((error) => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});

function formatVscodeTheme(theme) {
  const lines = [];
  lines.push('{');
  lines.push(`  "name": ${JSON.stringify(theme.name)},`);
  lines.push(`  "type": ${JSON.stringify(theme.type)},`);
  lines.push('  "colors": {');

  const colorEntries = Object.entries(theme.colors);
  colorEntries.forEach(([key, value], index) => {
    const suffix = index === colorEntries.length - 1 ? '' : ',';
    lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(value)}${suffix}`);
  });

  lines.push('  },');
  lines.push('  "tokenColors": [');
  theme.tokenColors.forEach((token, tokenIndex) => {
    const tokenSuffix = tokenIndex === theme.tokenColors.length - 1 ? '' : ',';
    lines.push('    {');
    lines.push(`      "scope": [${token.scope.map((scope) => JSON.stringify(scope)).join(', ')}],`);
    lines.push('      "settings": {');
    const settingEntries = Object.entries(token.settings);
    settingEntries.forEach(([key, value], settingIndex) => {
      const settingSuffix = settingIndex === settingEntries.length - 1 ? '' : ',';
      lines.push(`        ${JSON.stringify(key)}: ${JSON.stringify(value)}${settingSuffix}`);
    });
    lines.push('      }');
    lines.push(`    }${tokenSuffix}`);
  });
  lines.push('  ]');
  lines.push('}');

  return lines.join('\n');
}
