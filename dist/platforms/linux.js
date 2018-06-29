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
            if (!hostsFileContents.includes(domain)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludXguanMiLCJzb3VyY2VSb290IjoiQzovU291cmNlL2RldmNlcnQvIiwic291cmNlcyI6WyJwbGF0Zm9ybXMvbGludXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLDJCQUE0RjtBQUM1RiwwREFBZ0M7QUFDaEMsbURBQXVEO0FBQ3ZELHFDQUE2RjtBQUM3RixvQ0FBK0I7QUFFL0IsK0VBQW1DO0FBR25DLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXJEO0lBQUE7UUFFVSxvQkFBZSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNwRSxtQkFBYyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDM0QscUJBQWdCLEdBQUcsa0JBQWtCLENBQUM7UUFDdEMsb0JBQWUsR0FBRyx3QkFBd0IsQ0FBQztRQUUzQyxtQkFBYyxHQUFHLFlBQVksQ0FBQztJQWdGeEMsQ0FBQztJQTlFQzs7Ozs7Ozs7T0FRRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFFbkUsS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7WUFDbEUsa0VBQWtFO1lBQ2xFLFdBQUcsQ0FBQyxXQUFZLGVBQWdCLCtDQUErQyxDQUFDLENBQUM7WUFDakYsd0ZBQXdGO1lBQ3hGLFdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBRW5DLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQzdCLFVBQVU7Z0JBQ1YsS0FBSyxDQUFDLHVGQUF1RixDQUFDLENBQUM7Z0JBQy9GLElBQUksQ0FBQyxxQkFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM5QixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTt3QkFDL0IsS0FBSyxDQUFDLDZIQUE2SCxDQUFDLENBQUM7d0JBQ3JJLGlDQUF3QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDbEU7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLDRGQUE0RixDQUFDLENBQUM7d0JBQ3BHLFdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO3dCQUN0QyxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQzt3QkFDNUUsTUFBTSxxQkFBWSxFQUFFLENBQUM7d0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7cUJBQ3BGO2lCQUNGO2FBQ0Y7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7YUFDdEY7WUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUM1QixLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztnQkFDbkYsSUFBSSxDQUFDLHFCQUFhLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQzlCLHdCQUFFLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztpQkFDdkM7cUJBQU07b0JBQ0wsTUFBTSxxQkFBWSxFQUFFLENBQUM7b0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ25GO2FBQ0Y7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7YUFDcEY7UUFDSCxDQUFDO0tBQUE7SUFFSyw0QkFBNEIsQ0FBQyxNQUFjOztZQUMvQyxJQUFJLGlCQUFpQixHQUFHLGlCQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN2QyxXQUFHLENBQUMsb0JBQXFCLE1BQU8sb0JBQXFCLElBQUksQ0FBQyxjQUFlLGVBQWUsQ0FBQyxDQUFDO2FBQzNGO1FBQ0gsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ3RDLE9BQU8sQ0FBQyxNQUFNLFdBQUcsQ0FBQyxZQUFZLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFSyxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLFFBQWdCOztZQUN6RCxJQUFJLGVBQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxXQUFHLENBQUMsWUFBWSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0Qsa0JBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUIsTUFBTSxXQUFHLENBQUMsaUJBQWlCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxXQUFHLENBQUMsbUJBQW1CLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUFBO0lBR08sa0JBQWtCO1FBQ3hCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsT0FBTyxlQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FFRjtBQXZGRCxnQ0F1RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYyBhcyBleGlzdHMsIHJlYWRGaWxlU3luYyBhcyByZWFkLCB3cml0ZUZpbGVTeW5jIGFzIHdyaXRlRmlsZSB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IHsgc3luYyBhcyBjb21tYW5kRXhpc3RzIH0gZnJvbSAnY29tbWFuZC1leGlzdHMnO1xyXG5pbXBvcnQgeyBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCLCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3gsIGNsb3NlRmlyZWZveCB9IGZyb20gJy4vc2hhcmVkJztcclxuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgVUkgZnJvbSAnLi4vdXNlci1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJy4nO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6bGludXgnKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbnV4UGxhdGZvcm0gaW1wbGVtZW50cyBQbGF0Zm9ybSB7XHJcblxyXG4gIHByaXZhdGUgRklSRUZPWF9OU1NfRElSID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUsICcubW96aWxsYS9maXJlZm94LyonKTtcclxuICBwcml2YXRlIENIUk9NRV9OU1NfRElSID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUsICcucGtpL25zc2RiJyk7XHJcbiAgcHJpdmF0ZSBGSVJFRk9YX0JJTl9QQVRIID0gJy91c3IvYmluL2ZpcmVmb3gnO1xyXG4gIHByaXZhdGUgQ0hST01FX0JJTl9QQVRIID0gJy91c3IvYmluL2dvb2dsZS1jaHJvbWUnO1xyXG5cclxuICBwcml2YXRlIEhPU1RfRklMRV9QQVRIID0gJy9ldGMvaG9zdHMnO1xyXG5cclxuICAvKipcclxuICAgKiBMaW51eCBpcyBzdXJwcmlzaW5nbHkgZGlmZmljdWx0LiBUaGVyZSBzZWVtcyB0byBiZSBtdWx0aXBsZSBzeXN0ZW0td2lkZVxyXG4gICAqIHJlcG9zaXRvcmllcyBmb3IgY2VydHMsIHNvIHdlIGNvcHkgb3VycyB0byBlYWNoLiBIb3dldmVyLCBGaXJlZm94IGRvZXMgaXQnc1xyXG4gICAqIHVzdWFsIHNlcGFyYXRlIHRydXN0IHN0b3JlLiBQbHVzIENocm9tZSByZWxpZXMgb24gdGhlIE5TUyB0b29saW5nIChsaWtlXHJcbiAgICogRmlyZWZveCksIGJ1dCB1c2VzIHRoZSB1c2VyJ3MgTlNTIGRhdGFiYXNlLCB1bmxpa2UgRmlyZWZveCAod2hpY2ggdXNlcyBhXHJcbiAgICogc2VwYXJhdGUgTW96aWxsYSBvbmUpLiBBbmQgc2luY2UgQ2hyb21lIGRvZXNuJ3QgcHJvbXB0IHRoZSB1c2VyIHdpdGggYSBHVUlcclxuICAgKiBmbG93IHdoZW4gb3BlbmluZyBjZXJ0cywgaWYgd2UgY2FuJ3QgdXNlIGNlcnR1dGlsIHRvIGluc3RhbGwgb3VyIGNlcnRpZmljYXRlXHJcbiAgICogaW50byB0aGUgdXNlcidzIE5TUyBkYXRhYmFzZSwgd2UncmUgb3V0IG9mIGx1Y2suXHJcbiAgICovXHJcbiAgYXN5bmMgYWRkVG9UcnVzdFN0b3JlcyhjZXJ0aWZpY2F0ZVBhdGg6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgZGVidWcoJ0FkZGluZyBkZXZjZXJ0IHJvb3QgQ0EgdG8gTGludXggc3lzdGVtLXdpZGUgdHJ1c3Qgc3RvcmVzJyk7XHJcbiAgICAvLyBydW4oYHN1ZG8gY3AgJHsgY2VydGlmaWNhdGVQYXRoIH0gL2V0Yy9zc2wvY2VydHMvZGV2Y2VydC5jcnRgKTtcclxuICAgIHJ1bihgc3VkbyBjcCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSAvdXNyL2xvY2FsL3NoYXJlL2NhLWNlcnRpZmljYXRlcy9kZXZjZXJ0LmNydGApO1xyXG4gICAgLy8gcnVuKGBzdWRvIGJhc2ggLWMgXCJjYXQgJHsgY2VydGlmaWNhdGVQYXRoIH0gPj4gL2V0Yy9zc2wvY2VydHMvY2EtY2VydGlmaWNhdGVzLmNydFwiYCk7XHJcbiAgICBydW4oYHN1ZG8gdXBkYXRlLWNhLWNlcnRpZmljYXRlc2ApO1xyXG5cclxuICAgIGlmICh0aGlzLmlzRmlyZWZveEluc3RhbGxlZCgpKSB7XHJcbiAgICAgIC8vIEZpcmVmb3hcclxuICAgICAgZGVidWcoJ0ZpcmVmb3ggaW5zdGFsbCBkZXRlY3RlZDogYWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBGaXJlZm94LXNwZWNpZmljIHRydXN0IHN0b3JlcyAuLi4nKTtcclxuICAgICAgaWYgKCFjb21tYW5kRXhpc3RzKCdjZXJ0dXRpbCcpKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCkge1xyXG4gICAgICAgICAgZGVidWcoJ05TUyB0b29saW5nIGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZCwgYW5kIGBza2lwQ2VydHV0aWxgIGlzIHRydWUsIHNvIGZhbGxpbmcgYmFjayB0byBtYW51YWwgY2VydGlmaWNhdGUgaW5zdGFsbCBmb3IgRmlyZWZveCcpO1xyXG4gICAgICAgICAgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94KHRoaXMuRklSRUZPWF9CSU5fUEFUSCwgY2VydGlmaWNhdGVQYXRoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVidWcoJ05TUyB0b29saW5nIGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZC4gVHJ5aW5nIHRvIGluc3RhbGwgTlNTIHRvb2xpbmcgbm93IHdpdGggYGFwdCBpbnN0YWxsYCcpO1xyXG4gICAgICAgICAgcnVuKCdzdWRvIGFwdCBpbnN0YWxsIGxpYm5zczMtdG9vbHMnKTtcclxuICAgICAgICAgIGRlYnVnKCdJbnN0YWxsaW5nIGNlcnRpZmljYXRlIGludG8gRmlyZWZveCB0cnVzdCBzdG9yZXMgdXNpbmcgTlNTIHRvb2xpbmcnKTtcclxuICAgICAgICAgIGF3YWl0IGNsb3NlRmlyZWZveCgpO1xyXG4gICAgICAgICAgYXdhaXQgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQih0aGlzLkZJUkVGT1hfTlNTX0RJUiwgY2VydGlmaWNhdGVQYXRoLCAnY2VydHV0aWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlYnVnKCdGaXJlZm94IGRvZXMgbm90IGFwcGVhciB0byBiZSBpbnN0YWxsZWQsIHNraXBwaW5nIEZpcmVmb3gtc3BlY2lmaWMgc3RlcHMuLi4nKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc0Nocm9tZUluc3RhbGxlZCgpKSB7XHJcbiAgICAgIGRlYnVnKCdDaHJvbWUgaW5zdGFsbCBkZXRlY3RlZDogYWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBDaHJvbWUgdHJ1c3Qgc3RvcmUgLi4uJyk7XHJcbiAgICAgIGlmICghY29tbWFuZEV4aXN0cygnY2VydHV0aWwnKSkge1xyXG4gICAgICAgIFVJLndhcm5DaHJvbWVPbkxpbnV4V2l0aG91dENlcnR1dGlsKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XHJcbiAgICAgICAgYXdhaXQgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQih0aGlzLkNIUk9NRV9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsICdjZXJ0dXRpbCcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWJ1ZygnQ2hyb21lIGRvZXMgbm90IGFwcGVhciB0byBiZSBpbnN0YWxsZWQsIHNraXBwaW5nIENocm9tZS1zcGVjaWZpYyBzdGVwcy4uLicpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW46IHN0cmluZykge1xyXG4gICAgbGV0IGhvc3RzRmlsZUNvbnRlbnRzID0gcmVhZCh0aGlzLkhPU1RfRklMRV9QQVRILCAndXRmOCcpO1xyXG4gICAgaWYgKCFob3N0c0ZpbGVDb250ZW50cy5pbmNsdWRlcyhkb21haW4pKSB7XHJcbiAgICAgIHJ1bihgZWNobyAnMTI3LjAuMC4xICAkeyBkb21haW4gfScgfCBzdWRvIHRlZSAtYSBcIiR7IHRoaXMuSE9TVF9GSUxFX1BBVEggfVwiID4gL2Rldi9udWxsYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyByZWFkUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gKGF3YWl0IHJ1bihgc3VkbyBjYXQgJHtmaWxlcGF0aH1gKSkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyB3cml0ZVByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xyXG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcclxuICAgICAgYXdhaXQgcnVuKGBzdWRvIHJtIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gICAgfVxyXG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XHJcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2hvd24gMCBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG1vZCA2MDAgXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XHJcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuRklSRUZPWF9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzQ2hyb21lSW5zdGFsbGVkKCkge1xyXG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkNIUk9NRV9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxufSJdfQ==