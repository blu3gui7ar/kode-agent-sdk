import { Sandbox, SandboxKind } from './sandbox';
export type SandboxFactoryFn = (config: Record<string, any>) => Sandbox;
export declare class SandboxFactory {
    private factories;
    constructor();
    register(kind: SandboxKind, factory: SandboxFactoryFn): void;
    create(config: {
        kind: SandboxKind;
    } & Record<string, any>): Sandbox;
    createAsync(config: {
        kind: SandboxKind;
    } & Record<string, any>): Promise<Sandbox>;
}
