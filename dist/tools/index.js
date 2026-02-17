"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScriptsTool = exports.createSkillsTool = exports.builtin = exports.globalToolRegistry = exports.ToolRegistry = exports.disconnectAllMCP = exports.disconnectMCP = exports.getMCPTools = exports.extractTools = exports.defineTools = exports.defineTool = exports.tools = exports.tool = void 0;
// 统一的工具定义 API (v2.0 推荐)
var tool_1 = require("./tool");
Object.defineProperty(exports, "tool", { enumerable: true, get: function () { return tool_1.tool; } });
Object.defineProperty(exports, "tools", { enumerable: true, get: function () { return tool_1.tools; } });
// 简化的工具定义 API (保留兼容)
var define_1 = require("./define");
Object.defineProperty(exports, "defineTool", { enumerable: true, get: function () { return define_1.defineTool; } });
Object.defineProperty(exports, "defineTools", { enumerable: true, get: function () { return define_1.defineTools; } });
Object.defineProperty(exports, "extractTools", { enumerable: true, get: function () { return define_1.extractTools; } });
// MCP 集成
var mcp_1 = require("./mcp");
Object.defineProperty(exports, "getMCPTools", { enumerable: true, get: function () { return mcp_1.getMCPTools; } });
Object.defineProperty(exports, "disconnectMCP", { enumerable: true, get: function () { return mcp_1.disconnectMCP; } });
Object.defineProperty(exports, "disconnectAllMCP", { enumerable: true, get: function () { return mcp_1.disconnectAllMCP; } });
// 工具注册表
var registry_1 = require("./registry");
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return registry_1.ToolRegistry; } });
Object.defineProperty(exports, "globalToolRegistry", { enumerable: true, get: function () { return registry_1.globalToolRegistry; } });
// 内置工具
exports.builtin = __importStar(require("./builtin"));
// Skills 工具
var skills_1 = require("./skills");
Object.defineProperty(exports, "createSkillsTool", { enumerable: true, get: function () { return skills_1.createSkillsTool; } });
var scripts_1 = require("./scripts");
Object.defineProperty(exports, "createScriptsTool", { enumerable: true, get: function () { return scripts_1.createScriptsTool; } });
