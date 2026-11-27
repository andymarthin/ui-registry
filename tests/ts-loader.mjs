import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TS_EXTENSIONS = ['.ts', '.tsx', '.mts', '/index.ts'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !path.extname(specifier) &&
      context.parentURL?.startsWith('file:')
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const basePath = path.resolve(parentDir, specifier);
      for (const ext of TS_EXTENSIONS) {
        const candidate = `${basePath}${ext}`;
        if (existsSync(candidate)) {
          return {
            url: pathToFileURL(candidate).href,
            shortCircuit: true,
          };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
