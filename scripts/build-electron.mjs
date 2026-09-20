// electron-builder unpacks ~500 files (electron.exe, locales, dlls) into
// `release/win-unpacked.tmp` and then renames the directory. On Windows this
// briefly needs zero open handles anywhere in that tree, and VS Code's
// workspace file watcher (which recursively watches the whole repo) grabs a
// handle on the freshly created files/directories often enough to make that
// rename fail with EPERM/EBUSY. Building into an OS temp dir outside the
// workspace sidesteps the watcher entirely; only the finished installer is
// copied back into the repo afterward (a single file write, not a directory
// rename, so it isn't affected).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// `shell: true` is needed on Windows to resolve npm/npx (.cmd shims); all
// arguments here are static and internally controlled, so this is safe.
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

const outDir = mkdtempSync(path.join(tmpdir(), 'frame-annotator-release-'));
try {
  execFileSync('npx', ['electron-builder', `--config.directories.output=${outDir}`], {
    stdio: 'inherit',
    shell: true,
  });

  const releaseDir = path.resolve('release');
  const skip = new Set(['win-unpacked', 'builder-debug.yml']);
  for (const entry of readdirSync(outDir)) {
    if (skip.has(entry)) continue;
    cpSync(path.join(outDir, entry), path.join(releaseDir, entry), { recursive: true });
  }
  console.log(`\nInstaller copied to ${releaseDir}`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
