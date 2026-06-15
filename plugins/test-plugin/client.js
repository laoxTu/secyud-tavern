/**
 * Test Plugin — 最简单的客户端插件
 * 被加载时打印日志到浏览器控制台
 */
export default function register() {
    console.info("[test-plugin] ✅ 客户端插件已加载！");
    console.info("[test-plugin] 当前 URL:", window.location.href);
    console.info("[test-plugin] 插件系统测试成功 🎉");
}
