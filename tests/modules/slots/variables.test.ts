import {describe, it, expect} from 'vitest';
import {messageUtils} from "@/modules/models";
import {SlotMessageBase} from "@/modules/models/message";

function makeHistory(): SlotMessageBase {
    return {content: '原内容', variables: [{op: 'add', path: '/a', value: {}}], properties: {}};
}

describe('extractVariableChanges', () => {
    it('空字符串时清空 variables 和 content', () => {
        const history = makeHistory();
        messageUtils.setContent(history, '');
        expect(history.variables).toEqual([]);
        expect(history.content).toBe('');
    });

    it('纯空白文本时清空 variables 和 content', () => {
        const history = makeHistory();
        messageUtils.setContent(history, '   \n\t  ');
        expect(history.variables).toEqual([]);
        expect(history.content).toBe('');
    });

    it('未传 text 时清空 variables 和 content', () => {
        const history = makeHistory();
        messageUtils.setContent(history, undefined);
        expect(history.variables).toEqual([]);
        expect(history.content).toBe('');
    });

    it('没有 variable_changes 标签时 variables 为空, content 保留去除首尾空白后的文本', () => {
        const history = makeHistory();
        messageUtils.setContent(history, '  这是一句普通的话。  ');
        expect(history.variables).toEqual([]);
        expect(history.content).toBe('这是一句普通的话。');
    });

    it('单个对象块被解析为变更项', () => {
        const history = makeHistory();
        messageUtils.setContent(history, '回复。<variable_changes>{"op":"update","path":"/player/hp","value":80}</variable_changes>');
        expect(history.variables).toEqual([{op: 'update', path: '/player/hp', value: 80}]);
        expect(history.content).toBe('回复。');
    });

    it('数组块中的多个合法项全部被解析', () => {
        const history = makeHistory();
        const text = '战斗继续。<variable_changes>[{"op":"update","path":"/player/hp","value":80},{"op":"update","path":"/player/mp","value":50},{"op":"remove","path":"/player/status"}]</variable_changes>';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([
            {op: 'update', path: '/player/hp', value: 80},
            {op: 'update', path: '/player/mp', value: 50},
            {op: 'remove', path: '/player/status'},
        ]);
        expect(history.content).toBe('战斗继续。');
    });

    it('数组中混入的非法项会被过滤掉', () => {
        const history = makeHistory();
        const text = '<variable_changes>[{"op":"update","path":"/a","value":1},"hello",{"op":"remove"},123,{"path":"/b"}]</variable_changes>';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([{op: 'update', path: '/a', value: 1}]);
    });

    it('缺少 value 的项只要 op 和 path 合法也会保留', () => {
        const history = makeHistory();
        messageUtils.setContent(history, '<variable_changes>{"op":"remove","path":"/player/buff"}</variable_changes>');
        expect(history.variables).toEqual([{op: 'remove', path: '/player/buff'}]);
    });

    it('多个块会合并解析, 顺序保持', () => {
        const history = makeHistory();
        const text = '你受伤了。<variable_changes>{"op":"update","path":"/hp","value":80}</variable_changes>随后获得增益。<variable_changes>{"op":"add","path":"/buffs/shield"}</variable_changes>';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([
            {op: 'update', path: '/hp', value: 80},
            {op: 'add', path: '/buffs/shield'},
        ]);
        expect(history.content).toBe('你受伤了。随后获得增益。');
    });

    it('块内 JSON 非法时跳过该块并移除标签, 不影响其他块', () => {
        const history = makeHistory();
        const text = '开头<variable_changes>{not valid json}</variable_changes>中间<variable_changes>{"op":"update","path":"/a","value":1}</variable_changes>结尾';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([{op: 'update', path: '/a', value: 1}]);
        expect(history.content).toBe('开头中间结尾');
    });

    it('块内 JSON 为纯数字/字符串时不产生变更项, 标签仍被移除', () => {
        const history = makeHistory();
        const text = '<variable_changes>12345</variable_changes>text';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([]);
        expect(history.content).toBe('text');
    });

    it('块内容含换行和首尾空白时也能正确解析', () => {
        const history = makeHistory();
        const text = '<variable_changes>\n  [\n    {"op":"update","path":"/player/hp","value":80}\n  ]\n</variable_changes>';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([{op: 'update', path: '/player/hp', value: 80}]);
        expect(history.content).toBe('');
    });

    it('块前后文本保留, 输入首尾空白在替换前被去除', () => {
        const history = makeHistory();
        const text = '  她缓缓抬起头。  <variable_changes>{"op":"update","path":"/mood","value":"平静"}</variable_changes>  ';
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([{op: 'update', path: '/mood', value: '平静'}]);
        // 注意: 实现只在 replace 前 trim, 块前紧邻的空格会残留
        expect(history.content).toBe('她缓缓抬起头。  ');
    });

    // 用户提供的实际数据(多字段、嵌套对象、数组)
    const userChanges = [
        {op: 'add', path: 'relatedDates', value: [{year: 2024, month: 1, day: 3}]},
        {op: 'add', path: 'story/location', value: '小镇'},
        {op: 'add', path: 'story/currentTime', value: '清晨8点'},
        {op: 'add', path: 'story/dayCount', value: 3},
        {op: 'add', path: 'story/scene', value: '新住户刚来到小镇第三天，早晨有人敲门'},
        {
            op: 'add',
            path: 'story/characters/stranger',
            value: {name: '未知', appearance: '陌生面孔', action: '敲门问候'}
        },
    ];

    it('用户数据包裹在 <variable_changes> 标签内时能全部解析', () => {
        const history = makeHistory();
        const text = `叙述内容。<variable_changes>${JSON.stringify(userChanges)}</variable_changes>`;
        messageUtils.setContent(history, text);
        expect(history.variables).toHaveLength(6);
        expect(history.variables).toEqual(userChanges);
        expect(history.content).toBe('叙述内容。');
    });

    it('裸 JSON 数组不带标签时 results 为空(根因复现)', () => {
        const history = makeHistory();
        const text = JSON.stringify(userChanges);
        messageUtils.setContent(history, text);
        expect(history.variables).toEqual([]);
        // 内容原样保留, 因为没有标签被移除
        expect(history.content).toBe(text);
    });
});
