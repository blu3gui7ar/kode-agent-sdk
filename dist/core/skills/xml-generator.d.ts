/**
 * Skills 元数据XML生成器
 *
 * 设计原则 (UNIX哲学):
 * - 简洁: 只负责生成XML格式的skills元数据
 * - 模块化: 单一职责，易于测试和维护
 * - 兼容: 完全兼容openskills项目的XML格式
 */
import type { SkillMetadata } from './types';
/**
 * 生成skills元数据XML格式（参考openskills）
 */
export declare function generateSkillsMetadataXml(skills: SkillMetadata[]): string;
