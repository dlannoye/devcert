"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const fs_1 = require("fs");
const shared_1 = require("./shared");
const _1 = require(".");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:windows');
let encryptionKey;
class WindowsPlatform {
    constructor() {
        this.HOST_FILE_PATH = 'C:\\Windows\\System32\\Drivers\\etc\\hosts';
    }
    /**
     * Windows is at least simple. Like macOS, most applications will delegate to
     * the system trust store, which is updated with the confusingly named
     * `certutil` exe (not the same as the NSS/Mozilla certutil). Firefox does it's
     * own thing as usual, and getting a copy of NSS certutil onto the Windows
     * machine to try updating the Firefox store is basically a nightmare, so we
     * don't even try it - we just bail out to the GUI.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // IE, Chrome, system utils
            debug('adding devcert root to Windows OS trust store');
            try {
                utils_1.run(`certutil -addstore -user root ${certificatePath}`);
            }
            catch (e) {
                e.output.map((buffer) => {
                    if (buffer) {
                        console.log(buffer.toString());
                    }
                });
            }
            debug('adding devcert root to Firefox trust store');
            // Firefox (don't even try NSS certutil, no easy install for Windows)
            try {
                yield shared_1.openCertificateInFirefox('start firefox', certificatePath);
            }
            catch (_a) {
                // Ignore exception, most likely Firefox doesn't exist.
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!_1.domainExistsInHostFile(hostsFileContents, domain)) {
                yield utils_1.sudo(`echo 127.0.0.1  ${domain} >> ${this.HOST_FILE_PATH}`);
            }
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            // Try to decrypt the file
            try {
                return this.decrypt(fs_1.readFileSync(filepath, 'utf8'), encryptionKey);
            }
            catch (e) {
                // If it's a bad password, clear the cached copy and retry
                if (e.message.indexOf('bad decrypt') >= -1) {
                    encryptionKey = null;
                    return yield this.readProtectedFile(filepath);
                }
                throw e;
            }
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            let encryptedContents = this.encrypt(contents, encryptionKey);
            fs_1.writeFileSync(filepath, encryptedContents);
        });
    }
    encrypt(text, key) {
        let cipher = crypto_1.default.createCipher('aes256', new Buffer(key));
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    }
    decrypt(encrypted, key) {
        let decipher = crypto_1.default.createDecipher('aes256', new Buffer(key));
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }
}
exports.default = WindowsPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luMzIuanMiLCJzb3VyY2VSb290IjoiRDovY29kZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL3dpbjMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBEQUFnQztBQUNoQyw0REFBNEI7QUFDNUIsMkJBQWtFO0FBRWxFLHFDQUFvRDtBQUNwRCx3QkFBcUQ7QUFDckQsb0NBQXFDO0FBQ3JDLCtFQUFtQztBQUVuQyxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUV2RCxJQUFJLGFBQXFCLENBQUM7QUFFMUI7SUFBQTtRQUVVLG1CQUFjLEdBQUcsNENBQTRDLENBQUM7SUEwRXhFLENBQUM7SUF4RUM7Ozs7Ozs7T0FPRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFDbkUsMkJBQTJCO1lBQzNCLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFBO1lBQ3RELElBQUksQ0FBQztnQkFDSCxXQUFHLENBQUMsaUNBQWtDLGVBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUU7b0JBQzlCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDakMsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQTtZQUNuRCxxRUFBcUU7WUFDckUsSUFBSSxDQUFDO2dCQUNILE1BQU0saUNBQXdCLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxJQUFELENBQUM7Z0JBQ1AsdURBQXVEO1lBQ3pELENBQUM7UUFDSCxDQUFDO0tBQUE7SUFFSyw0QkFBNEIsQ0FBQyxNQUFjOztZQUMvQyxNQUFNLGlCQUFpQixHQUFHLGlCQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUU1RCxFQUFFLENBQUMsQ0FBQyxDQUFDLHlCQUFzQixDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxZQUFJLENBQUMsbUJBQW9CLE1BQU8sT0FBUSxJQUFJLENBQUMsY0FBZSxFQUFFLENBQUMsQ0FBQztZQUN4RSxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsYUFBYSxHQUFHLE1BQU0sd0JBQUUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQzFELENBQUM7WUFDRCwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDO2dCQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzdELENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLDBEQUEwRDtnQkFDMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLENBQUM7WUFDVixDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixhQUFhLEdBQUcsTUFBTSx3QkFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDMUQsQ0FBQztZQUNELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUQsa0JBQUssQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7SUFFTyxPQUFPLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFDdkMsSUFBSSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTyxPQUFPLENBQUMsU0FBaUIsRUFBRSxHQUFXO1FBQzVDLElBQUksUUFBUSxHQUFHLGdCQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBRUY7QUE1RUQsa0NBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xyXG5pbXBvcnQgeyB3cml0ZUZpbGVTeW5jIGFzIHdyaXRlLCByZWFkRmlsZVN5bmMgYXMgcmVhZCB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IHsgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybSwgZG9tYWluRXhpc3RzSW5Ib3N0RmlsZSB9IGZyb20gJy4nO1xyXG5pbXBvcnQgeyBydW4sIHN1ZG8gfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnBsYXRmb3Jtczp3aW5kb3dzJyk7XHJcblxyXG5sZXQgZW5jcnlwdGlvbktleTogc3RyaW5nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2luZG93c1BsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xyXG5cclxuICBwcml2YXRlIEhPU1RfRklMRV9QQVRIID0gJ0M6XFxcXFdpbmRvd3NcXFxcU3lzdGVtMzJcXFxcRHJpdmVyc1xcXFxldGNcXFxcaG9zdHMnO1xyXG5cclxuICAvKipcclxuICAgKiBXaW5kb3dzIGlzIGF0IGxlYXN0IHNpbXBsZS4gTGlrZSBtYWNPUywgbW9zdCBhcHBsaWNhdGlvbnMgd2lsbCBkZWxlZ2F0ZSB0b1xyXG4gICAqIHRoZSBzeXN0ZW0gdHJ1c3Qgc3RvcmUsIHdoaWNoIGlzIHVwZGF0ZWQgd2l0aCB0aGUgY29uZnVzaW5nbHkgbmFtZWRcclxuICAgKiBgY2VydHV0aWxgIGV4ZSAobm90IHRoZSBzYW1lIGFzIHRoZSBOU1MvTW96aWxsYSBjZXJ0dXRpbCkuIEZpcmVmb3ggZG9lcyBpdCdzXHJcbiAgICogb3duIHRoaW5nIGFzIHVzdWFsLCBhbmQgZ2V0dGluZyBhIGNvcHkgb2YgTlNTIGNlcnR1dGlsIG9udG8gdGhlIFdpbmRvd3NcclxuICAgKiBtYWNoaW5lIHRvIHRyeSB1cGRhdGluZyB0aGUgRmlyZWZveCBzdG9yZSBpcyBiYXNpY2FsbHkgYSBuaWdodG1hcmUsIHNvIHdlXHJcbiAgICogZG9uJ3QgZXZlbiB0cnkgaXQgLSB3ZSBqdXN0IGJhaWwgb3V0IHRvIHRoZSBHVUkuXHJcbiAgICovXHJcbiAgYXN5bmMgYWRkVG9UcnVzdFN0b3JlcyhjZXJ0aWZpY2F0ZVBhdGg6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAvLyBJRSwgQ2hyb21lLCBzeXN0ZW0gdXRpbHNcclxuICAgIGRlYnVnKCdhZGRpbmcgZGV2Y2VydCByb290IHRvIFdpbmRvd3MgT1MgdHJ1c3Qgc3RvcmUnKVxyXG4gICAgdHJ5IHtcclxuICAgICAgcnVuKGBjZXJ0dXRpbCAtYWRkc3RvcmUgLXVzZXIgcm9vdCAkeyBjZXJ0aWZpY2F0ZVBhdGggfWApO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBlLm91dHB1dC5tYXAoKGJ1ZmZlcjogQnVmZmVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGJ1ZmZlcikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYnVmZmVyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBkZWJ1ZygnYWRkaW5nIGRldmNlcnQgcm9vdCB0byBGaXJlZm94IHRydXN0IHN0b3JlJylcclxuICAgIC8vIEZpcmVmb3ggKGRvbid0IGV2ZW4gdHJ5IE5TUyBjZXJ0dXRpbCwgbm8gZWFzeSBpbnN0YWxsIGZvciBXaW5kb3dzKVxyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94KCdzdGFydCBmaXJlZm94JywgY2VydGlmaWNhdGVQYXRoKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBJZ25vcmUgZXhjZXB0aW9uLCBtb3N0IGxpa2VseSBGaXJlZm94IGRvZXNuJ3QgZXhpc3QuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBob3N0c0ZpbGVDb250ZW50cyA9IHJlYWQodGhpcy5IT1NUX0ZJTEVfUEFUSCwgJ3V0ZjgnKTtcclxuXHJcbiAgICBpZiAoIWRvbWFpbkV4aXN0c0luSG9zdEZpbGUoaG9zdHNGaWxlQ29udGVudHMsIGRvbWFpbikpIHtcclxuICAgICAgYXdhaXQgc3VkbyhgZWNobyAxMjcuMC4wLjEgICR7IGRvbWFpbiB9ID4+ICR7IHRoaXMuSE9TVF9GSUxFX1BBVEggfWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVhZFByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBpZiAoIWVuY3J5cHRpb25LZXkpIHtcclxuICAgICAgZW5jcnlwdGlvbktleSA9IGF3YWl0IFVJLmdldFdpbmRvd3NFbmNyeXB0aW9uUGFzc3dvcmQoKTtcclxuICAgIH1cclxuICAgIC8vIFRyeSB0byBkZWNyeXB0IHRoZSBmaWxlXHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kZWNyeXB0KHJlYWQoZmlsZXBhdGgsICd1dGY4JyksIGVuY3J5cHRpb25LZXkpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvLyBJZiBpdCdzIGEgYmFkIHBhc3N3b3JkLCBjbGVhciB0aGUgY2FjaGVkIGNvcHkgYW5kIHJldHJ5XHJcbiAgICAgIGlmIChlLm1lc3NhZ2UuaW5kZXhPZignYmFkIGRlY3J5cHQnKSA+PSAtMSkge1xyXG4gICAgICAgIGVuY3J5cHRpb25LZXkgPSBudWxsO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoKTtcclxuICAgICAgfVxyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgd3JpdGVQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpIHtcclxuICAgIGlmICghZW5jcnlwdGlvbktleSkge1xyXG4gICAgICBlbmNyeXB0aW9uS2V5ID0gYXdhaXQgVUkuZ2V0V2luZG93c0VuY3J5cHRpb25QYXNzd29yZCgpO1xyXG4gICAgfVxyXG4gICAgbGV0IGVuY3J5cHRlZENvbnRlbnRzID0gdGhpcy5lbmNyeXB0KGNvbnRlbnRzLCBlbmNyeXB0aW9uS2V5KTtcclxuICAgIHdyaXRlKGZpbGVwYXRoLCBlbmNyeXB0ZWRDb250ZW50cyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGVuY3J5cHQodGV4dDogc3RyaW5nLCBrZXk6IHN0cmluZykge1xyXG4gICAgbGV0IGNpcGhlciA9IGNyeXB0by5jcmVhdGVDaXBoZXIoJ2FlczI1NicsIG5ldyBCdWZmZXIoa2V5KSk7XHJcbiAgICByZXR1cm4gY2lwaGVyLnVwZGF0ZSh0ZXh0LCAndXRmOCcsICdoZXgnKSArIGNpcGhlci5maW5hbCgnaGV4Jyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRlY3J5cHQoZW5jcnlwdGVkOiBzdHJpbmcsIGtleTogc3RyaW5nKSB7XHJcbiAgICBsZXQgZGVjaXBoZXIgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXIoJ2FlczI1NicsIG5ldyBCdWZmZXIoa2V5KSk7XHJcbiAgICByZXR1cm4gZGVjaXBoZXIudXBkYXRlKGVuY3J5cHRlZCwgJ2hleCcsICd1dGY4JykgKyBkZWNpcGhlci5maW5hbCgndXRmOCcpO1xyXG4gIH1cclxuXHJcbn0iXX0=