// tests/insert-preset.ts
import {createPreset} from "@/db/repositories/preset-repository";

const testPreset = {
    id: "test.cat-girl",
    name: "测试猫娘预设",
    description: "一个测试用的猫娘角色预设",
    version: "1.0.0",
    author: "test",
    type: ["character", "world"],
    tags: ["猫娘", "测试"],
    requires: [],
    lorebooks: [],
    regexes: [],
    styles: [],
    scripts: [],
};


(async () => {
    try {
        const id = await createPreset(testPreset);
        console.log("插入成功:", id);
    } catch (error) {
        console.error("插入失败:", error);
    }
})();