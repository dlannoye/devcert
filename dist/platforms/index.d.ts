import { Options } from '../index';
export interface Platform {
    addToTrustStores(certificatePath: string, options?: Options): Promise<void>;
    addDomainToHostFileIfMissing(domain: string): Promise<void>;
    readProtectedFile(filepath: string): Promise<string>;
    writeProtectedFile(filepath: string, contents: string): Promise<void>;
}
export declare function domainExistsInHostFile(hostFileContents: string, domain: string): boolean;
declare const _default: Platform;
export default _default;
