"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxFactory = void 0;
const sandbox_1 = require("./sandbox");
const e2b_sandbox_1 = require("./e2b/e2b-sandbox");
class SandboxFactory {
    constructor() {
        this.factories = new Map();
        this.factories.set('local', (config) => new sandbox_1.LocalSandbox(config));
        this.factories.set('e2b', (config) => new e2b_sandbox_1.E2BSandbox(config));
    }
    register(kind, factory) {
        this.factories.set(kind, factory);
    }
    create(config) {
        const factory = this.factories.get(config.kind);
        if (!factory) {
            throw new Error(`Sandbox factory not registered: ${config.kind}`);
        }
        return factory(config);
    }
    async createAsync(config) {
        const sandbox = this.create(config);
        if (config.kind === 'e2b' && sandbox instanceof e2b_sandbox_1.E2BSandbox) {
            await sandbox.init();
        }
        return sandbox;
    }
}
exports.SandboxFactory = SandboxFactory;
