// 下载文件
import promise from "fs/promises";
import {fileExists} from "next/dist/lib/file-exists";
import path from "path";
import fs from "fs";

export async function ensureDir(dir: string) {
    try {
        await promise.access(dir);
    } catch (err) {
        await promise.mkdir(dir, {recursive: true});
    }
}

export async function downloadFile(url: string, dest: string, init?: any) {
    if (await fileExists(dest)) return;
    await ensureDir(path.dirname(dest));
    console.log(`⬇️ download: ${url} to ${dest}`);
    const response = await fetch(url, init);

    if (!response.ok) {
        console.error(`download failed: ${response.status} ${response.statusText}`);
        return;
    }

    const totalBytes = parseInt(response.headers.get('content-length') as string, 10);
    let downloadedBytes = 0;
    // 创建可写流
    const fileStream = fs.createWriteStream(dest);

    // 使用流式读取
    const reader = response.body!.getReader();

    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            downloadedBytes += value.length;
            if (totalBytes) {
                const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1);
                const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`⏳ download: ${percent}% (${downloadedMB}MB / ${totalMB}MB)`);
            }

            // 写入文件
            await new Promise((resolve, reject) => {
                fileStream.write(value, (err) => {
                    if (err) reject(err);
                    else resolve(null);
                });
            });
        }

        // 关闭流
        await new Promise((resolve, reject) => {
            fileStream.end((err: any) => {
                if (err) reject(err);
                else resolve(null);
            });
        });

        console.log('\n✅ download successfully!');
    } catch (err) {
        fileStream.destroy();
        throw err;
    }
}
