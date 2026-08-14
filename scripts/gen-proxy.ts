import {pathExists} from "@/utils/fs-extention";
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from "url";
import promise from "fs/promises";

await extractApiRoutes();

async function extractApiList(fullpath: string, prefix: string = '') {
    const res: string[] = [];
    if (await pathExists(fullpath))
        await extractFromDir(fullpath, prefix);
    return res;

    async function extractFromDir(fullpath: string, prefix: string = '') {
        const filename = path.join(fullpath, "route.ts");
        if (await pathExists(filename)) {
            res.push(prefix);
        }
        const subPaths =
            (await fs.readdir(fullpath, {withFileTypes: true}))
                .filter((file) => file.isDirectory());
        for (const subPath of subPaths) {
            const routeName = subPath.name
                .replace("[", '{')
                .replace("]", "}");
            await extractFromDir(path.join(fullpath, subPath.name), `${prefix}/${routeName}`);
        }
    }
}

async function extractApiRoutes() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const root = path.resolve(__dirname, '..');
    const apiDir = path.join(root, 'src', 'app', 'api');
    const apis = await extractApiList(apiDir, "");
    await promise.writeFile(path.join(root, 'src', 'client-schema.ts'),
        `const apiPath = ${JSON.stringify(apis)} as const;export type ApiPath = typeof apiPath[number];`);
}
