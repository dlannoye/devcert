"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const utils_1 = require("../utils");
const shared_1 = require("./shared");
const _1 = require(".");
const debug = debug_1.default('devcert:platforms:macos');
class MacOSPlatform {
    constructor() {
        this.FIREFOX_BUNDLE_PATH = '/Applications/Firefox.app';
        this.FIREFOX_BIN_PATH = path_1.default.join(this.FIREFOX_BUNDLE_PATH, 'Contents/MacOS/firefox');
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, 'Library/Application Support/Firefox/Profiles/*');
        this.HOST_FILE_PATH = '/etc/hosts';
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
            let hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!_1.domainExistsInHostFile(hostsFileContents, domain)) {
                utils_1.run(`echo '127.0.0.1  ${domain}' | sudo tee -a "${this.HOST_FILE_PATH}" > /dev/null`);
            }
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
            return utils_1.run('brew list').toString().indexOf('nss') > -1;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = MacOSPlatform;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6IkQ6L2NvZGUvZGV2Y2VydC8iLCJzb3VyY2VzIjpbInBsYXRmb3Jtcy9kYXJ3aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLDJCQUE0RjtBQUM1RiwwREFBZ0M7QUFDaEMsbURBQXVEO0FBQ3ZELG9DQUErQjtBQUUvQixxQ0FBNkY7QUFDN0Ysd0JBQXFEO0FBRXJELE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBR3JEO0lBQUE7UUFFVSx3QkFBbUIsR0FBRywyQkFBMkIsQ0FBQztRQUNsRCxxQkFBZ0IsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2pGLG9CQUFlLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO1FBRWhHLG1CQUFjLEdBQUcsWUFBWSxDQUFDO0lBeUV4QyxDQUFDO0lBdkVDOzs7Ozs7T0FNRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFFbkUsK0JBQStCO1lBQy9CLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1lBQ3pELFdBQUcsQ0FBQyx5R0FBMEcsZUFBZ0IsR0FBRyxDQUFDLENBQUM7WUFFbkksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5Qix3REFBd0Q7Z0JBQ3hELEtBQUssQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO2dCQUNqRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzt3QkFDakMsRUFBRSxDQUFDLENBQUMscUJB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aWxlU3luYyBhcyB3cml0ZUZpbGUsIGV4aXN0c1N5bmMgYXMgZXhpc3RzLCByZWFkRmlsZVN5bmMgYXMgcmVhZCB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IHsgc3luYyBhcyBjb21tYW5kRXhpc3RzIH0gZnJvbSAnY29tbWFuZC1leGlzdHMnO1xyXG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCB7IGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIsIG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCwgY2xvc2VGaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybSwgZG9tYWluRXhpc3RzSW5Ib3N0RmlsZSB9IGZyb20gJy4nO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6bWFjb3MnKTtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNPU1BsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xyXG5cclxuICBwcml2YXRlIEZJUkVGT1hfQlVORExFX1BBVEggPSAnL0FwcGxpY2F0aW9ucy9GaXJlZm94LmFwcCc7XHJcbiAgcHJpdmF0ZSBGSVJFRk9YX0JJTl9QQVRIID0gcGF0aC5qb2luKHRoaXMuRklSRUZPWF9CVU5ETEVfUEFUSCwgJ0NvbnRlbnRzL01hY09TL2ZpcmVmb3gnKTtcclxuICBwcml2YXRlIEZJUkVGT1hfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L0ZpcmVmb3gvUHJvZmlsZXMvKicpO1xyXG5cclxuICBwcml2YXRlIEhPU1RfRklMRV9QQVRIID0gJy9ldGMvaG9zdHMnO1xyXG5cclxuICAvKipcclxuICAgKiBtYWNPUyBpcyBwcmV0dHkgc2ltcGxlIC0ganVzdCBhZGQgdGhlIGNlcnRpZmljYXRlIHRvIHRoZSBzeXN0ZW0ga2V5Y2hhaW4sXHJcbiAgICogYW5kIG1vc3QgYXBwbGljYXRpb25zIHdpbGwgZGVsZWdhdGUgdG8gdGhhdCBmb3IgZGV0ZXJtaW5pbmcgdHJ1c3RlZFxyXG4gICAqIGNlcnRpZmljYXRlcy4gRmlyZWZveCwgb2YgY291cnNlLCBkb2VzIGl0J3Mgb3duIHRoaW5nLiBXZSBjYW4gdHJ5IHRvXHJcbiAgICogYXV0b21hdGljYWxseSBpbnN0YWxsIHRoZSBjZXJ0IHdpdGggRmlyZWZveCBpZiB3ZSBjYW4gdXNlIGNlcnR1dGlsIHZpYSB0aGVcclxuICAgKiBgbnNzYCBIb21lYnJldyBwYWNrYWdlLCBvdGhlcndpc2Ugd2UgZ28gbWFudWFsIHdpdGggdXNlci1mYWNpbmcgcHJvbXB0cy5cclxuICAgKi9cclxuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcclxuXHJcbiAgICAvLyBDaHJvbWUsIFNhZmFyaSwgc3lzdGVtIHV0aWxzXHJcbiAgICBkZWJ1ZygnQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBtYWNPUyBzeXN0ZW0ga2V5Y2hhaW4nKTtcclxuICAgIHJ1bihgc3VkbyBzZWN1cml0eSBhZGQtdHJ1c3RlZC1jZXJ0IC1kIC1yIHRydXN0Um9vdCAtayAvTGlicmFyeS9LZXljaGFpbnMvU3lzdGVtLmtleWNoYWluIC1wIHNzbCAtcCBiYXNpYyBcIiR7IGNlcnRpZmljYXRlUGF0aCB9XCJgKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0ZpcmVmb3hJbnN0YWxsZWQoKSkge1xyXG4gICAgICAvLyBUcnkgdG8gdXNlIGNlcnR1dGlsIHRvIGluc3RhbGwgdGhlIGNlcnQgYXV0b21hdGljYWxseVxyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBpbnN0YWxsIGRldGVjdGVkLiBBZGRpbmcgZGV2Y2VydCByb290IENBIHRvIEZpcmVmb3ggdHJ1c3Qgc3RvcmUnKTtcclxuICAgICAgaWYgKCF0aGlzLmlzTlNTSW5zdGFsbGVkKCkpIHtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCkge1xyXG4gICAgICAgICAgaWYgKGNvbW1hbmRFeGlzdHMoJ2JyZXcnKSkge1xyXG4gICAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBidXQgSG9tZWJyZXcgaXMgZGV0ZWN0ZWQuIFRyeWluZyB0byBpbnN0YWxsIGNlcnR1dGlsIHZpYSBIb21lYnJldy4uLmApO1xyXG4gICAgICAgICAgICBydW4oJ2JyZXcgaW5zdGFsbCBuc3MnKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRlYnVnKGBIb21lYnJldyBpc24ndCBpbnN0YWxsZWQsIHNvIHdlIGNhbid0IHRyeSB0byBpbnN0YWxsIGNlcnR1dGlsLiBGYWxsaW5nIGJhY2sgdG8gbWFudWFsIGNlcnRpZmljYXRlIGluc3RhbGxgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCh0aGlzLkZJUkVGT1hfQklOX1BBVEgsIGNlcnRpZmljYXRlUGF0aCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlYnVnKGBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGFuZCBza2lwQ2VydHV0aWxJbnN0YWxsIGlzIHRydWUsIHNvIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIGEgbWFudWFsIGluc3RhbGxgKVxyXG4gICAgICAgICAgcmV0dXJuIGF3YWl0IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCh0aGlzLkZJUkVGT1hfQklOX1BBVEgsIGNlcnRpZmljYXRlUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjZXJ0dXRpbFBhdGggPSBwYXRoLmpvaW4ocnVuKCdicmV3IC0tcHJlZml4IG5zcycpLnRvU3RyaW5nKCkudHJpbSgpLCAnYmluJywgJ2NlcnR1dGlsJyk7XHJcbiAgICAgIGF3YWl0IGNsb3NlRmlyZWZveCgpO1xyXG4gICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuRklSRUZPWF9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsIGNlcnR1dGlsUGF0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgaW5zdGFsbGVkLCBza2lwcGluZyBGaXJlZm94LXNwZWNpZmljIHN0ZXBzLi4uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgICBsZXQgaG9zdHNGaWxlQ29udGVudHMgPSByZWFkKHRoaXMuSE9TVF9GSUxFX1BBVEgsICd1dGY4Jyk7XHJcblxyXG4gICAgaWYgKCFkb21haW5FeGlzdHNJbkhvc3RGaWxlKGhvc3RzRmlsZUNvbnRlbnRzLCBkb21haW4pKSB7XHJcbiAgICAgIHJ1bihgZWNobyAnMTI3LjAuMC4xICAkeyBkb21haW4gfScgfCBzdWRvIHRlZSAtYSBcIiR7IHRoaXMuSE9TVF9GSUxFX1BBVEggfVwiID4gL2Rldi9udWxsYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyByZWFkUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gKGF3YWl0IHJ1bihgc3VkbyBjYXQgXCIke2ZpbGVwYXRofVwiYCkpLnRvU3RyaW5nKCkudHJpbSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgd3JpdGVQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpIHtcclxuICAgIGlmIChleGlzdHMoZmlsZXBhdGgpKSB7XHJcbiAgICAgIGF3YWl0IHJ1bihgc3VkbyBybSBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICAgIH1cclxuICAgIHdyaXRlRmlsZShmaWxlcGF0aCwgY29udGVudHMpO1xyXG4gICAgYXdhaXQgcnVuKGBzdWRvIGNob3duIDAgXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2htb2QgNjAwIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XHJcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuRklSRUZPWF9CVU5ETEVfUEFUSCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzTlNTSW5zdGFsbGVkKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIHJ1bignYnJldyBsaXN0JykudG9TdHJpbmcoKS5pbmRleE9mKCduc3MnKSA+IC0xO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufTsiXX0=