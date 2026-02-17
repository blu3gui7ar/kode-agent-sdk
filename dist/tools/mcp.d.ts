import type { ToolInstance } from './registry';
/**
 * MCP Transport 类型
 */
export type MCPTransportType = 'stdio' | 'sse' | 'http';
/**
 * MCP 连接配置
 */
export interface MCPConfig {
    /**
     * 传输类型
     */
    transport: MCPTransportType;
    /**
     * Stdio transport: 命令和参数
     */
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    /**
     * HTTP/SSE transport: URL
     */
    url?: string;
    /**
     * Server 名称（用于命名空间）
     */
    serverName?: string;
    /**
     * 包含的工具（白名单，不提供则全部包含）
     */
    include?: string[];
    /**
     * 排除的工具（黑名单）
     */
    exclude?: string[];
}
/**
 * 获取 MCP 工具
 *
 * 连接到 MCP 服务器并将其工具转换为 ToolInstance[]
 *
 * @example
 * ```ts
 * // Stdio transport
 * const tools = await getMCPTools({
 *   transport: 'stdio',
 *   command: 'uvx',
 *   args: ['mcp-server-git'],
 *   serverName: 'git'
 * });
 *
 * // HTTP/SSE transport
 * const tools = await getMCPTools({
 *   transport: 'sse',
 *   url: 'http://localhost:3000/mcp',
 *   serverName: 'company',
 *   include: ['search', 'summarize']
 * });
 * ```
 */
export declare function getMCPTools(config: MCPConfig): Promise<ToolInstance[]>;
/**
 * 断开 MCP 服务器连接
 */
export declare function disconnectMCP(serverName: string): Promise<void>;
/**
 * 断开所有 MCP 服务器连接
 */
export declare function disconnectAllMCP(): Promise<void>;
