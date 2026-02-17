"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTemplateRegistry = void 0;
class AgentTemplateRegistry {
    constructor() {
        this.templates = new Map();
    }
    register(template) {
        if (!template.id)
            throw new Error('Template id is required');
        if (!template.systemPrompt || !template.systemPrompt.trim()) {
            throw new Error(`Template ${template.id} must provide a non-empty systemPrompt`);
        }
        this.templates.set(template.id, template);
    }
    bulkRegister(templates) {
        for (const tpl of templates) {
            this.register(tpl);
        }
    }
    has(id) {
        return this.templates.has(id);
    }
    get(id) {
        const tpl = this.templates.get(id);
        if (!tpl) {
            throw new Error(`Template not found: ${id}`);
        }
        return tpl;
    }
    list() {
        return Array.from(this.templates.values());
    }
}
exports.AgentTemplateRegistry = AgentTemplateRegistry;
