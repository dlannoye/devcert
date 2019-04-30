import { Options } from '../index';


export interface Platform {
   addToTrustStores(certificatePath: string, options?: Options): Promise<void>;
   addDomainToHostFileIfMissing(domain: string): Promise<void>;
   readProtectedFile(filepath: string): Promise<string>;
   writeProtectedFile(filepath: string, contents: string): Promise<void>;
}

export function domainExistsInHostFile(hostFileContents: string, domain: string): boolean {
    const isPresent = hostFileContents
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(item => item === domain).length > 0;
   return isPresent;
}

const PlatformClass = require(`./${ process.platform }`).default;
export default new PlatformClass() as Platform;
