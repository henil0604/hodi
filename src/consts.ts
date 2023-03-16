import Filic from 'filic';
import { getArgs } from '@/utils/getArgs.js';
import fsExtra from 'fs-extra/esm';
import * as Path from 'path';

export const fs = Filic.create().asDir;

export const kitsPath = getArgs().kits as string || process.env.kits as string || Path.resolve(process.env.HOME || "", ".kits");

if (fsExtra.pathExistsSync(kitsPath) === false) {
    fsExtra.mkdirpSync(kitsPath)
}

export const $Kits = Filic.create(kitsPath).asDir;
