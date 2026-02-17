"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAgentId = generateAgentId;
const CROCKFORD32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function encodeTime(time, length) {
    let remaining = time;
    const chars = Array(length);
    for (let i = length - 1; i >= 0; i--) {
        const mod = remaining % 32;
        chars[i] = CROCKFORD32.charAt(mod);
        remaining = Math.floor(remaining / 32);
    }
    return chars.join('');
}
function encodeRandom(length) {
    const chars = Array(length);
    for (let i = 0; i < length; i++) {
        const rand = Math.floor(Math.random() * 32);
        chars[i] = CROCKFORD32.charAt(rand);
    }
    return chars.join('');
}
function generateAgentId() {
    const time = Date.now();
    const timePart = encodeTime(time, 10);
    const randomPart = encodeRandom(16);
    return `agt-${timePart}${randomPart}`;
}
