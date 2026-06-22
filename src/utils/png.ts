/**
 * 支持 ArrayBuffer、Buffer、Uint8Array 输入
 */
export function splitPNGAndDataUniversal(input: any) {
    // 统一转为 Uint8Array
    let uint8;
    if (input instanceof ArrayBuffer) {
        uint8 = new Uint8Array(input);
    } else if (input instanceof Buffer) {
        uint8 = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    } else if (input instanceof Uint8Array) {
        uint8 = input;
    } else {
        throw new Error('不支持的输入类型');
    }

    // 查找 IEND
    let iendStart = -1;
    for (let i = uint8.length - 4; i >= 0; i--) {
        if (uint8[i] === 0x49 && uint8[i + 1] === 0x45 &&
            uint8[i + 2] === 0x4E && uint8[i + 3] === 0x44) {
            iendStart = i;
            break;
        }
    }

    if (iendStart === -1) {
        // 分离
        const imageData = null;
        const extraData = uint8;

        return {
            imageData,
            extraData,
            extraString: extraData.length > 0 ? new TextDecoder('utf-8').decode(extraData) : '',
            hasExtra: extraData.length > 0
        };
    }

    const iendEnd =  iendStart + 8;

    // 分离
    const imageData = uint8.subarray(0, iendEnd);
    const extraData = uint8.length > iendEnd ? uint8.subarray(iendEnd) : new Uint8Array(0);

    return {
        imageData,
        extraData,
        extraString: extraData.length > 0 ? new TextDecoder('utf-8').decode(extraData) : '',
        hasExtra: extraData.length > 0
    };
}