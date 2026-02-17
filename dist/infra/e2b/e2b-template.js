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
exports.E2BTemplateBuilder = void 0;
/**
 * Build E2B custom templates.
 * Uses E2B Template API to create pre-configured sandbox environments.
 */
class E2BTemplateBuilder {
    /**
     * Build a template from config.
     * @returns Build result containing templateId
     */
    static async build(config, opts) {
        const { Template } = await Promise.resolve().then(() => __importStar(require('e2b')));
        let template;
        switch (config.base) {
            case 'python':
                template = Template().fromPythonImage(config.baseVersion || '3');
                break;
            case 'node':
                template = Template().fromNodeImage(config.baseVersion || '20');
                break;
            case 'debian':
                template = Template().fromDebianImage(config.baseVersion);
                break;
            case 'ubuntu':
                template = Template().fromUbuntuImage(config.baseVersion);
                break;
            case 'custom':
                if (!config.dockerfile)
                    throw new Error('Custom base requires dockerfile content');
                template = Template().fromDockerfile(config.dockerfile);
                break;
            default:
                template = Template().fromBaseImage();
        }
        if (config.aptPackages?.length) {
            template = template.aptInstall(config.aptPackages);
        }
        if (config.pipPackages?.length) {
            template = template.pipInstall(config.pipPackages);
        }
        if (config.npmPackages?.length) {
            template = template.npmInstall(config.npmPackages, { g: true });
        }
        if (config.buildCommands?.length) {
            template = template.runCmd(config.buildCommands);
        }
        if (config.workDir) {
            template = template.setWorkdir(config.workDir);
        }
        const buildInfo = await Template.build(template, {
            alias: config.alias,
            cpuCount: config.cpuCount || 2,
            memoryMB: config.memoryMB || 512,
            apiKey: opts?.apiKey,
            onBuildLogs: opts?.onLog ? (log) => opts.onLog(String(log)) : undefined,
        });
        return {
            templateId: buildInfo.templateId || config.alias,
            alias: config.alias,
        };
    }
    /**
     * Check if a template alias already exists.
     */
    static async exists(alias, opts) {
        const { Template } = await Promise.resolve().then(() => __importStar(require('e2b')));
        return await Template.aliasExists(alias, { apiKey: opts?.apiKey });
    }
}
exports.E2BTemplateBuilder = E2BTemplateBuilder;
