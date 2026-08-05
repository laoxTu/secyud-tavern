import {describe, it, expect} from 'vitest';
import {downloadFile} from "@/utils/download";

describe('Download', () => {
    const url = 'https://civitai.com/api/download/models/3067151';
    it('应当下载civitai模型', async () => {
        await downloadFile(url, "./download/test")
    })
    it('测试原始下载', async () => {
        const response = await fetch(url);
        console.info(response.status);
        console.info(response.statusText);
        console.info(response.ok);
        console.info(response.redirected);
    })

});