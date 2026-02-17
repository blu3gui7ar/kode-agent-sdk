"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalToolRegistry = exports.ToolRegistry = void 0;
class ToolRegistry {
    constructor() {
        this.factories = new Map();
    }
    register(id, factory) {
        this.factories.set(id, factory);
    }
    has(id) {
        return this.factories.has(id);
    }
    create(id, config) {
        const factory = this.factories.get(id);
        if (!factory) {
            throw new Error(`Tool not registered: ${id}`);
        }
        return factory(config);
    }
    list() {
        return Array.from(this.factories.keys());
    }
}
exports.ToolRegistry = ToolRegistry;
exports.globalToolRegistry = new ToolRegistry();
