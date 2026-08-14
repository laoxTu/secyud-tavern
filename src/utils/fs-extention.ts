
import promise from "fs/promises";
export async function pathExists(path: string) {
    try {
        await promise.access(path);
        return true;
    } catch (err) {
        return false;
    }
}

export async function ensureDir(dir: string) {
    try {
        await promise.access(dir);
    } catch (err) {
        await promise.mkdir(dir, {recursive: true});
    }
}