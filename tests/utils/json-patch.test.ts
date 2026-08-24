import {afterEach, beforeEach, describe, it} from 'vitest';
import {patch} from "@/utils/json-patch";


describe('extractVariableChanges', () => {
    let variable = {};

    beforeEach(() => {
        variable = {
            "charas": {},
        };
    });
    afterEach(() => {
        console.log(JSON.stringify(variable));
    })

    it('add array', () => {
        patch(variable, [{"op": "replace", "path": "/charas/小柔/name", "value": "小柔"}]);
    });
});
