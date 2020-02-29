"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const utils_1 = require("../utils");
const shared_1 = require("./shared");
const debug = debug_1.default('devcert:platforms:macos');
class MacOSPlatform {
    constructor() {
        this.FIREFOX_BUNDLE_PATH = '/Applications/Firefox.app';
        this.FIREFOX_BIN_PATH = path_1.default.join(this.FIREFOX_BUNDLE_PATH, 'Contents/MacOS/firefox');
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, 'Library/Application Support/Firefox/Profiles/*');
    }
    /**
     * macOS is pretty simple - just add the certificate to the system keychain,
     * and most applications will delegate to that for determining trusted
     * certificates. Firefox, of course, does it's own thing. We can try to
     * automatically install the cert with Firefox if we can use certutil via the
     * `nss` Homebrew package, otherwise we go manual with user-facing prompts.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Chrome, Safari, system utils
            debug('Adding devcert root CA to macOS system keychain');
            utils_1.run(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain -p ssl -p basic "${certificatePath}"`);
            if (this.isFirefoxInstalled()) {
                // Try to use certutil to install the cert automatically
                debug('Firefox install detected. Adding devcert root CA to Firefox trust store');
                if (!this.isNSSInstalled()) {
                    if (!options.skipCertutilInstall) {
                        if (command_exists_1.sync('brew')) {
                            debug(`certutil is not already installed, but Homebrew is detected. Trying to install certutil via Homebrew...`);
                            utils_1.run('brew install nss');
                        }
                        else {
                            debug(`Homebrew isn't installed, so we can't try to install certutil. Falling back to manual certificate install`);
                            return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                        }
                    }
                    else {
                        debug(`certutil is not already installed, and skipCertutilInstall is true, so we have to fall back to a manual install`);
                        return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                    }
                }
                let certutilPath = path_1.default.join(utils_1.run('brew --prefix nss').toString().trim(), 'bin', 'certutil');
                yield shared_1.closeFirefox();
                yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, certutilPath);
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // No need to check if the domain is present, as hostile will handle the case where the domain is already in the host file.
            utils_1.run(`sudo "${process.execPath}" "${require.resolve('hostile/bin/cmd')}" set 127.0.0.1 ${domain}`);
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield utils_1.run(`sudo cat "${filepath}"`)).toString().trim();
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fs_1.existsSync(filepath)) {
                yield utils_1.run(`sudo rm "${filepath}"`);
            }
            fs_1.writeFileSync(filepath, contents);
            yield utils_1.run(`sudo chown 0 "${filepath}"`);
            yield utils_1.run(`sudo chmod 600 "${filepath}"`);
        });
    }
    isFirefoxInstalled() {
        return fs_1.existsSync(this.FIREFOX_BUNDLE_PATH);
    }
    isNSSInstalled() {
        try {
            return utils_1.run('brew list -1').toString().includes('\nnss\n');
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = MacOSPlatform;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6IkY6L2Fkb2Jpbi1kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL2Rhcndpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsMkJBQXNFO0FBQ3RFLDBEQUFnQztBQUNoQyxtREFBdUQ7QUFDdkQsb0NBQStCO0FBRS9CLHFDQUE2RjtBQUc3RixNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVyRDtJQUFBO1FBRVUsd0JBQW1CLEdBQUcsMkJBQTJCLENBQUM7UUFDbEQscUJBQWdCLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNqRixvQkFBZSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztJQXFFMUcsQ0FBQztJQW5FQzs7Ozs7O09BTUc7SUFDRyxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLFVBQW1CLEVBQUU7O1lBRW5FLCtCQUErQjtZQUMvQixLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztZQUN6RCxXQUFHLENBQUMseUdBQTBHLGVBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBRW5JLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQzdCLHdEQUF3RDtnQkFDeEQsS0FBSyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUU7d0JBQ2hDLElBQUkscUJBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDekIsS0FBSyxDQUFDLHlHQUF5RyxDQUFDLENBQUM7NEJBQ2pILFdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3lCQUN6Qjs2QkFBTTs0QkFDTCxLQUFLLENBQUMsMkdBQTJHLENBQUMsQ0FBQzs0QkFDbkgsT0FBTyxNQUFNLGlDQUF3QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQzt5QkFDL0U7cUJBQ0Y7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLGlIQUFpSCxDQUFDLENBQUE7d0JBQ3hILE9BQU8sTUFBTSxpQ0FBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7cUJBQy9FO2lCQUNGO2dCQUNELElBQUksWUFBWSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsV0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RixNQUFNLHFCQUFZLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxrQ0FBeUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUN0RjtpQkFBTTtnQkFDTCxLQUFLLENBQUMsNkVBQTZFLENBQUMsQ0FBQzthQUN0RjtRQUNILENBQUM7S0FBQTtJQUVLLDRCQUE0QixDQUFDLE1BQWM7O1lBQy9DLDJIQUEySDtZQUMzSCxXQUFHLENBQUMsU0FBUyxPQUFPLENBQUMsUUFBUSxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEcsQ0FBQztLQUFBO0lBQ0ssaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ3RDLE9BQU8sQ0FBQyxNQUFNLFdBQUcsQ0FBQyxhQUFhLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFSyxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLFFBQWdCOztZQUN6RCxJQUFJLGVBQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxXQUFHLENBQUMsWUFBWSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0Qsa0JBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUIsTUFBTSxXQUFHLENBQUMsaUJBQWlCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxXQUFHLENBQUMsbUJBQW1CLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUFBO0lBRU8sa0JBQWtCO1FBQ3hCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTyxjQUFjO1FBQ3BCLElBQUk7WUFDRixPQUFPLFdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0NBRUY7QUF6RUQsZ0NBeUVDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyB3cml0ZUZpbGVTeW5jIGFzIHdyaXRlRmlsZSwgZXhpc3RzU3luYyBhcyBleGlzdHMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCB7IHN5bmMgYXMgY29tbWFuZEV4aXN0cyB9IGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcclxuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCLCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3gsIGNsb3NlRmlyZWZveCB9IGZyb20gJy4vc2hhcmVkJztcclxuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOm1hY29zJyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNPU1BsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xyXG5cclxuICBwcml2YXRlIEZJUkVGT1hfQlVORExFX1BBVEggPSAnL0FwcGxpY2F0aW9ucy9GaXJlZm94LmFwcCc7XHJcbiAgcHJpdmF0ZSBGSVJFRk9YX0JJTl9QQVRIID0gcGF0aC5qb2luKHRoaXMuRklSRUZPWF9CVU5ETEVfUEFUSCwgJ0NvbnRlbnRzL01hY09TL2ZpcmVmb3gnKTtcclxuICBwcml2YXRlIEZJUkVGT1hfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L0ZpcmVmb3gvUHJvZmlsZXMvKicpO1xyXG5cclxuICAvKipcclxuICAgKiBtYWNPUyBpcyBwcmV0dHkgc2ltcGxlIC0ganVzdCBhZGQgdGhlIGNlcnRpZmljYXRlIHRvIHRoZSBzeXN0ZW0ga2V5Y2hhaW4sXHJcbiAgICogYW5kIG1vc3QgYXBwbGljYXRpb25zIHdpbGwgZGVsZWdhdGUgdG8gdGhhdCBmb3IgZGV0ZXJtaW5pbmcgdHJ1c3RlZFxyXG4gICAqIGNlcnRpZmljYXRlcy4gRmlyZWZveCwgb2YgY291cnNlLCBkb2VzIGl0J3Mgb3duIHRoaW5nLiBXZSBjYW4gdHJ5IHRvXHJcbiAgICogYXV0b21hdGljYWxseSBpbnN0YWxsIHRoZSBjZXJ0IHdpdGggRmlyZWZveCBpZiB3ZSBjYW4gdXNlIGNlcnR1dGlsIHZpYSB0aGVcclxuICAgKiBgbnNzYCBIb21lYnJldyBwYWNrYWdlLCBvdGhlcndpc2Ugd2UgZ28gbWFudWFsIHdpdGggdXNlci1mYWNpbmcgcHJvbXB0cy5cclxuICAgKi9cclxuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcclxuXHJcbiAgICAvLyBDaHJvbWUsIFNhZmFyaSwgc3lzdGVtIHV0aWxzXHJcbiAgICBkZWJ1ZygnQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBtYWNPUyBzeXN0ZW0ga2V5Y2hhaW4nKTtcclxuICAgIHJ1bihgc3VkbyBzZWN1cml0eSBhZGQtdHJ1c3RlZC1jZXJ0IC1kIC1yIHRydXN0Um9vdCAtayAvTGlicmFyeS9LZXljaGFpbnMvU3lzdGVtLmtleWNoYWluIC1wIHNzbCAtcCBiYXNpYyBcIiR7IGNlcnRpZmljYXRlUGF0aCB9XCJgKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0ZpcmVmb3hJbnN0YWxsZWQoKSkge1xyXG4gICAgICAvLyBUcnkgdG8gdXNlIGNlcnR1dGlsIHRvIGluc3RhbGwgdGhlIGNlcnQgYXV0b21hdGljYWxseVxyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBpbnN0YWxsIGRldGVjdGVkLiBBZGRpbmcgZGV2Y2VydCByb290IENBIHRvIEZpcmVmb3ggdHJ1c3Qgc3RvcmUnKTtcclxuICAgICAgaWYgKCF0aGlzLmlzTlNTSW5zdGFsbGVkKCkpIHtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCkge1xyXG4gICAgICAgICAgaWYgKGNvbW1hbmRFeGlzdHMoJ2JyZXcnKSkge1xyXG4gICAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBidXQgSG9tZWJyZXcgaXMgZGV0ZWN0ZWQuIFRyeWluZyB0byBpbnN0YWxsIGNlcnR1dGlsIHZpYSBIb21lYnJldy4uLmApO1xyXG4gICAgICAgICAgICBydW4oJ2JyZXcgaW5zdGFsbCBuc3MnKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRlYnVnKGBIb21lYnJldyBpc24ndCBpbnN0YWxsZWQsIHNvIHdlIGNhbid0IHRyeSB0byBpbnN0YWxsIGNlcnR1dGlsLiBGYWxsaW5nIGJhY2sgdG8gbWFudWFsIGNlcnRpZmljYXRlIGluc3RhbGxgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCh0aGlzLkZJUkVGT1hfQklOX1BBVEgsIGNlcnRpZmljYXRlUGF0aCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlYnVnKGBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGFuZCBza2lwQ2VydHV0aWxJbnN0YWxsIGlzIHRydWUsIHNvIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIGEgbWFudWFsIGluc3RhbGxgKVxyXG4gICAgICAgICAgcmV0dXJuIGF3YWl0IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCh0aGlzLkZJUkVGT1hfQklOX1BBVEgsIGNlcnRpZmljYXRlUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjZXJ0dXRpbFBhdGggPSBwYXRoLmpvaW4ocnVuKCdicmV3IC0tcHJlZml4IG5zcycpLnRvU3RyaW5nKCkudHJpbSgpLCAnYmluJywgJ2NlcnR1dGlsJyk7XHJcbiAgICAgIGF3YWl0IGNsb3NlRmlyZWZveCgpO1xyXG4gICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuRklSRUZPWF9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsIGNlcnR1dGlsUGF0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgaW5zdGFsbGVkLCBza2lwcGluZyBGaXJlZm94LXNwZWNpZmljIHN0ZXBzLi4uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7ICAgIFxyXG4gICAgLy8gTm8gbmVlZCB0byBjaGVjayBpZiB0aGUgZG9tYWluIGlzIHByZXNlbnQsIGFzIGhvc3RpbGUgd2lsbCBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGRvbWFpbiBpcyBhbHJlYWR5IGluIHRoZSBob3N0IGZpbGUuXHJcbiAgICBydW4oYHN1ZG8gXCIke3Byb2Nlc3MuZXhlY1BhdGh9XCIgXCIke3JlcXVpcmUucmVzb2x2ZSgnaG9zdGlsZS9iaW4vY21kJyl9XCIgc2V0IDEyNy4wLjAuMSAke2RvbWFpbn1gKTtcclxuICB9XHJcbiAgYXN5bmMgcmVhZFByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIChhd2FpdCBydW4oYHN1ZG8gY2F0IFwiJHtmaWxlcGF0aH1cImApKS50b1N0cmluZygpLnRyaW0oKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHdyaXRlUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XHJcbiAgICBpZiAoZXhpc3RzKGZpbGVwYXRoKSkge1xyXG4gICAgICBhd2FpdCBydW4oYHN1ZG8gcm0gXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgICB9XHJcbiAgICB3cml0ZUZpbGUoZmlsZXBhdGgsIGNvbnRlbnRzKTtcclxuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG93biAwIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gICAgYXdhaXQgcnVuKGBzdWRvIGNobW9kIDYwMCBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNGaXJlZm94SW5zdGFsbGVkKCkge1xyXG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkZJUkVGT1hfQlVORExFX1BBVEgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc05TU0luc3RhbGxlZCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBydW4oJ2JyZXcgbGlzdCAtMScpLnRvU3RyaW5nKCkuaW5jbHVkZXMoJ1xcbm5zc1xcbicpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufTsiXX0=