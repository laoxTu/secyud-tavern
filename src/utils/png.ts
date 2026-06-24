/**
 * 支持 ArrayBuffer、Buffer、Uint8Array 输入
 */
export function splitPNGAndDataUniversal(input: Uint8Array) {
    // 查找 IEND
    let iendStart = -1;
    for (let i = input.length - 4; i >= 0; i--) {
        if (input[i] === 0x49 && input[i + 1] === 0x45 &&
            input[i + 2] === 0x4E && input[i + 3] === 0x44) {
            iendStart = i;
            break;
        }
    }

    if (iendStart === -1) {
        // 分离
        const imageData = null;
        const extraData = input;

        return {
            imageData,
            extraData,
        };
    }

    const iendEnd = iendStart + 8;

    // 分离
    const imageData = input.subarray(0, iendEnd);
    const extraData = input.length > iendEnd ? input.subarray(iendEnd) : new Uint8Array(0);

    return {
        imageData,
        extraData,
    };
}