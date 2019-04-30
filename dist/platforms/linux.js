"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const shared_1 = require("./shared");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const _1 = require(".");
const debug = debug_1.default('devcert:platforms:linux');
class LinuxPlatform {
    constructor() {
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, '.mozilla/firefox/*');
        this.CHROME_NSS_DIR = path_1.default.join(process.env.HOME, '.pki/nssdb');
        this.FIREFOX_BIN_PATH = '/usr/bin/firefox';
        this.CHROME_BIN_PATH = '/usr/bin/google-chrome';
        this.HOST_FILE_PATH = '/etc/hosts';
    }
    /**
     * Linux is surprisingly difficult. There seems to be multiple system-wide
     * repositories for certs, so we copy ours to each. However, Firefox does it's
     * usual separate trust store. Plus Chrome relies on the NSS tooling (like
     * Firefox), but uses the user's NSS database, unlike Firefox (which uses a
     * separate Mozilla one). And since Chrome doesn't prompt the user with a GUI
     * flow when opening certs, if we can't use certutil to install our certificate
     * into the user's NSS database, we're out of luck.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug('Adding devcert root CA to Linux system-wide trust stores');
            // run(`sudo cp ${ certificatePath } /etc/ssl/certs/devcert.crt`);
            utils_1.run(`sudo cp ${certificatePath} /usr/local/share/ca-certificates/devcert.crt`);
            // run(`sudo bash -c "cat ${ certificatePath } >> /etc/ssl/certs/ca-certificates.crt"`);
            utils_1.run(`sudo update-ca-certificates`);
            if (this.isFirefoxInstalled()) {
                // Firefox
                debug('Firefox install detected: adding devcert root CA to Firefox-specific trust stores ...');
                if (!command_exists_1.sync('certutil')) {
                    if (options.skipCertutilInstall) {
                        debug('NSS tooling is not already installed, and `skipCertutil` is true, so falling back to manual certificate install for Firefox');
                        shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                    }
                    else {
                        debug('NSS tooling is not already installed. Trying to install NSS tooling now with `apt install`');
                        utils_1.run('sudo apt install libnss3-tools');
                        debug('Installing certificate into Firefox trust stores using NSS tooling');
                        yield shared_1.closeFirefox();
                        yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, 'certutil');
                    }
                }
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
            if (this.isChromeInstalled()) {
                debug('Chrome install detected: adding devcert root CA to Chrome trust store ...');
                if (!command_exists_1.sync('certutil')) {
                    user_interface_1.default.warnChromeOnLinuxWithoutCertutil();
                }
                else {
                    yield shared_1.closeFirefox();
                    yield shared_1.addCertificateToNSSCertDB(this.CHROME_NSS_DIR, certificatePath, 'certutil');
                }
            }
            else {
                debug('Chrome does not appear to be installed, skipping Chrome-specific steps...');
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
            return (yield utils_1.run(`sudo cat ${filepath}`)).toString().trim();
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
        return fs_1.existsSync(this.FIREFOX_BIN_PATH);
    }
    isChromeInstalled() {
        return fs_1.existsSync(this.CHROME_BIN_PATH);
    }
}
exports.default = LinuxPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludXguanMiLCJzb3VyY2VSb290IjoiRDovY29kZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL2xpbnV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3QjtBQUN4QiwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCxxQ0FBNkY7QUFDN0Ysb0NBQStCO0FBRS9CLCtFQUFtQztBQUNuQyx3QkFBcUQ7QUFFckQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFckQ7SUFBQTtRQUVVLG9CQUFlLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BFLG1CQUFjLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMzRCxxQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQztRQUN0QyxvQkFBZSxHQUFHLHdCQUF3QixDQUFDO1FBRTNDLG1CQUFjLEdBQUcsWUFBWSxDQUFDO0lBaUZ4QyxDQUFDO0lBL0VDOzs7Ozs7OztPQVFHO0lBQ0csZ0JBQWdCLENBQUMsZUFBdUIsRUFBRSxVQUFtQixFQUFFOztZQUVuRSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztZQUNsRSxrRUFBa0U7WUFDbEUsV0FBRyxDQUFDLFdBQVksZUFBZ0IsK0NBQStDLENBQUMsQ0FBQztZQUNqRix3RkFBd0Y7WUFDeEYsV0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFFbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixVQUFVO2dCQUNWLEtBQUssQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDO2dCQUMvRixFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FB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J3BhdGgnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jIGFzIGV4aXN0cywgcmVhZEZpbGVTeW5jIGFzIHJlYWQsIHdyaXRlRmlsZVN5bmMgYXMgd3JpdGVGaWxlIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XHJcbmltcG9ydCB7IGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIsIG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCwgY2xvc2VGaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xyXG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XHJcbmltcG9ydCB7IFBsYXRmb3JtLCBkb21haW5FeGlzdHNJbkhvc3RGaWxlIH0gZnJvbSAnLic7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnBsYXRmb3JtczpsaW51eCcpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGludXhQbGF0Zm9ybSBpbXBsZW1lbnRzIFBsYXRmb3JtIHtcclxuXHJcbiAgcHJpdmF0ZSBGSVJFRk9YX05TU19ESVIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSwgJy5tb3ppbGxhL2ZpcmVmb3gvKicpO1xyXG4gIHByaXZhdGUgQ0hST01FX05TU19ESVIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSwgJy5wa2kvbnNzZGInKTtcclxuICBwcml2YXRlIEZJUkVGT1hfQklOX1BBVEggPSAnL3Vzci9iaW4vZmlyZWZveCc7XHJcbiAgcHJpdmF0ZSBDSFJPTUVfQklOX1BBVEggPSAnL3Vzci9iaW4vZ29vZ2xlLWNocm9tZSc7XHJcblxyXG4gIHByaXZhdGUgSE9TVF9GSUxFX1BBVEggPSAnL2V0Yy9ob3N0cyc7XHJcblxyXG4gIC8qKlxyXG4gICAqIExpbnV4IGlzIHN1cnByaXNpbmdseSBkaWZmaWN1bHQuIFRoZXJlIHNlZW1zIHRvIGJlIG11bHRpcGxlIHN5c3RlbS13aWRlXHJcbiAgICogcmVwb3NpdG9yaWVzIGZvciBjZXJ0cywgc28gd2UgY29weSBvdXJzIHRvIGVhY2guIEhvd2V2ZXIsIEZpcmVmb3ggZG9lcyBpdCdzXHJcbiAgICogdXN1YWwgc2VwYXJhdGUgdHJ1c3Qgc3RvcmUuIFBsdXMgQ2hyb21lIHJlbGllcyBvbiB0aGUgTlNTIHRvb2xpbmcgKGxpa2VcclxuICAgKiBGaXJlZm94KSwgYnV0IHVzZXMgdGhlIHVzZXIncyBOU1MgZGF0YWJhc2UsIHVubGlrZSBGaXJlZm94ICh3aGljaCB1c2VzIGFcclxuICAgKiBzZXBhcmF0ZSBNb3ppbGxhIG9uZSkuIEFuZCBzaW5jZSBDaHJvbWUgZG9lc24ndCBwcm9tcHQgdGhlIHVzZXIgd2l0aCBhIEdVSVxyXG4gICAqIGZsb3cgd2hlbiBvcGVuaW5nIGNlcnRzLCBpZiB3ZSBjYW4ndCB1c2UgY2VydHV0aWwgdG8gaW5zdGFsbCBvdXIgY2VydGlmaWNhdGVcclxuICAgKiBpbnRvIHRoZSB1c2VyJ3MgTlNTIGRhdGFiYXNlLCB3ZSdyZSBvdXQgb2YgbHVjay5cclxuICAgKi9cclxuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcclxuXHJcbiAgICBkZWJ1ZygnQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBMaW51eCBzeXN0ZW0td2lkZSB0cnVzdCBzdG9yZXMnKTtcclxuICAgIC8vIHJ1bihgc3VkbyBjcCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSAvZXRjL3NzbC9jZXJ0cy9kZXZjZXJ0LmNydGApO1xyXG4gICAgcnVuKGBzdWRvIGNwICR7IGNlcnRpZmljYXRlUGF0aCB9IC91c3IvbG9jYWwvc2hhcmUvY2EtY2VydGlmaWNhdGVzL2RldmNlcnQuY3J0YCk7XHJcbiAgICAvLyBydW4oYHN1ZG8gYmFzaCAtYyBcImNhdCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSA+PiAvZXRjL3NzbC9jZXJ0cy9jYS1jZXJ0aWZpY2F0ZXMuY3J0XCJgKTtcclxuICAgIHJ1bihgc3VkbyB1cGRhdGUtY2EtY2VydGlmaWNhdGVzYCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNGaXJlZm94SW5zdGFsbGVkKCkpIHtcclxuICAgICAgLy8gRmlyZWZveFxyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBpbnN0YWxsIGRldGVjdGVkOiBhZGRpbmcgZGV2Y2VydCByb290IENBIHRvIEZpcmVmb3gtc3BlY2lmaWMgdHJ1c3Qgc3RvcmVzIC4uLicpO1xyXG4gICAgICBpZiAoIWNvbW1hbmRFeGlzdHMoJ2NlcnR1dGlsJykpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5za2lwQ2VydHV0aWxJbnN0YWxsKSB7XHJcbiAgICAgICAgICBkZWJ1ZygnTlNTIHRvb2xpbmcgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgYHNraXBDZXJ0dXRpbGAgaXMgdHJ1ZSwgc28gZmFsbGluZyBiYWNrIHRvIG1hbnVhbCBjZXJ0aWZpY2F0ZSBpbnN0YWxsIGZvciBGaXJlZm94Jyk7XHJcbiAgICAgICAgICBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkZWJ1ZygnTlNTIHRvb2xpbmcgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLiBUcnlpbmcgdG8gaW5zdGFsbCBOU1MgdG9vbGluZyBub3cgd2l0aCBgYXB0IGluc3RhbGxgJyk7XHJcbiAgICAgICAgICBydW4oJ3N1ZG8gYXB0IGluc3RhbGwgbGlibnNzMy10b29scycpO1xyXG4gICAgICAgICAgZGVidWcoJ0luc3RhbGxpbmcgY2VydGlmaWNhdGUgaW50byBGaXJlZm94IHRydXN0IHN0b3JlcyB1c2luZyBOU1MgdG9vbGluZycpO1xyXG4gICAgICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XHJcbiAgICAgICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuRklSRUZPWF9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsICdjZXJ0dXRpbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVidWcoJ0ZpcmVmb3ggZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgRmlyZWZveC1zcGVjaWZpYyBzdGVwcy4uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzQ2hyb21lSW5zdGFsbGVkKCkpIHtcclxuICAgICAgZGVidWcoJ0Nocm9tZSBpbnN0YWxsIGRldGVjdGVkOiBhZGRpbmcgZGV2Y2VydCByb290IENBIHRvIENocm9tZSB0cnVzdCBzdG9yZSAuLi4nKTtcclxuICAgICAgaWYgKCFjb21tYW5kRXhpc3RzKCdjZXJ0dXRpbCcpKSB7XHJcbiAgICAgICAgVUkud2FybkNocm9tZU9uTGludXhXaXRob3V0Q2VydHV0aWwoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhd2FpdCBjbG9zZUZpcmVmb3goKTtcclxuICAgICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuQ0hST01FX05TU19ESVIsIGNlcnRpZmljYXRlUGF0aCwgJ2NlcnR1dGlsJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlYnVnKCdDaHJvbWUgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgQ2hyb21lLXNwZWNpZmljIHN0ZXBzLi4uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgICBsZXQgaG9zdHNGaWxlQ29udGVudHMgPSByZWFkKHRoaXMuSE9TVF9GSUxFX1BBVEgsICd1dGY4Jyk7XHJcblxyXG4gICAgaWYgKCFkb21haW5FeGlzdHNJbkhvc3RGaWxlKGhvc3RzRmlsZUNvbnRlbnRzLCBkb21haW4pKSB7XHJcbiAgICAgIHJ1bihgZWNobyAnMTI3LjAuMC4xICAkeyBkb21haW4gfScgfCBzdWRvIHRlZSAtYSBcIiR7IHRoaXMuSE9TVF9GSUxFX1BBVEggfVwiID4gL2Rldi9udWxsYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyByZWFkUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gKGF3YWl0IHJ1bihgc3VkbyBjYXQgJHtmaWxlcGF0aH1gKSkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyB3cml0ZVByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xyXG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcclxuICAgICAgYXdhaXQgcnVuKGBzdWRvIHJtIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gICAgfVxyXG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XHJcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2hvd24gMCBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG1vZCA2MDAgXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XHJcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuRklSRUZPWF9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzQ2hyb21lSW5zdGFsbGVkKCkge1xyXG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkNIUk9NRV9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxufSJdfQ==