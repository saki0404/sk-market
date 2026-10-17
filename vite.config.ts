import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  base:'./', publicDir:false,
  plugins:[{name:'copy-runtime-settings',writeBundle(output){for(const file of ['config.js','sw.js'])copyFileSync(resolve(root,file),resolve(output.dir||resolve(root,'dist'),file));}}],
  server:{proxy:{'/api':'http://127.0.0.1:18088'}},
  preview:{proxy:{'/api':'http://127.0.0.1:18088'}}
});
