"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const url_1 = tslib_1.__importDefault(require("url"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const get_port_1 = tslib_1.__importDefault(require("get-port"));
const http_1 = tslib_1.__importDefault(require("http"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const child_process_1 = require("child_process");
const debug = debug_1.default('devcert:platforms:shared');
/**
 *  Given a directory or glob pattern of directories, attempt to install the
 *  CA certificate to each directory containing an NSS database.
 */
function addCertificateToNSSCertDB(nssDirGlob, certPath, certutilPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`trying to install certificate into NSS databases in ${nssDirGlob}`);
        glob_1.sync(nssDirGlob).forEach((potentialNSSDBDir) => {
            debug(`checking to see if ${potentialNSSDBDir} is a valid NSS database directory`);
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert8.db'))) {
                debug(`Found legacy NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
            }
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert9.db'))) {
                debug(`Found modern NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "sql:${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
            }
        });
        debug(`finished scanning & installing certificate in NSS databases in ${nssDirGlob}`);
    });
}
exports.addCertificateToNSSCertDB = addCertificateToNSSCertDB;
/**
 *  Check to see if Firefox is still running, and if so, ask the user to close
 *  it. Poll until it's closed, then return.
 *
 * This is needed because Firefox appears to load the NSS database in-memory on
 * startup, and overwrite on exit. So we have to ask the user to quite Firefox
 * first so our changes don't get overwritten.
 */
function closeFirefox() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (isFirefoxOpen()) {
            yield user_interface_1.default.closeFirefoxBeforeContinuing();
            while (isFirefoxOpen()) {
                yield sleep(50);
            }
        }
    });
}
exports.closeFirefox = closeFirefox;
/**
 * Check if Firefox is currently open
 */
function isFirefoxOpen() {
    // NOTE: We use some Windows-unfriendly methods here (ps) because Windows
    // never needs to check this, because it doesn't update the NSS DB
    // automaticaly.
    assert_1.default(constants_1.isMac || constants_1.isLinux, 'checkForOpenFirefox was invoked on a platform other than Mac or Linux');
    return child_process_1.execSync('ps aux').indexOf('firefox') > -1;
}
function sleep(ms) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
/**
 * Firefox manages it's own trust store for SSL certificates, which can be
 * managed via the certutil command (supplied by NSS tooling packages). In the
 * event that certutil is not already installed, and either can't be installed
 * (Windows) or the user doesn't want to install it (skipCertutilInstall:
 * true), it means that we can't programmatically tell Firefox to trust our
 * root CA certificate.
 *
 * There is a recourse though. When a Firefox tab is directed to a URL that
 * responds with a certificate, it will automatically prompt the user if they
 * want to add it to their trusted certificates. So if we can't automatically
 * install the certificate via certutil, we instead start a quick web server
 * and host our certificate file. Then we open the hosted cert URL in Firefox
 * to kick off the GUI flow.
 *
 * This method does all this, along with providing user prompts in the terminal
 * to walk them through this process.
 */
function openCertificateInFirefox(firefoxPath, certPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug('Adding devert to Firefox trust stores manually. Launching a webserver to host our certificate temporarily ...');
        let port = yield get_port_1.default();
        let server = http_1.default.createServer((req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let { pathname } = url_1.default.parse(req.url);
            if (pathname === '/certificate') {
                res.writeHead(200, { 'Content-type': 'application/x-x509-ca-cert' });
                res.write(fs_1.readFileSync(certPath));
                res.end();
            }
            else {
                res.writeHead(200);
                res.write(yield user_interface_1.default.firefoxWizardPromptPage(`http://localhost:${port}/certificate`));
                res.end();
            }
        })).listen(port);
        debug('Certificate server is up. Printing instructions for user and launching Firefox with hosted certificate URL');
        yield user_interface_1.default.startFirefoxWizard(`http://localhost:${port}`);
        utils_1.run(`${firefoxPath} http://localhost:${port}`);
        yield user_interface_1.default.waitForFirefoxWizard();
        server.close();
    });
}
exports.openCertificateInFirefox = openCertificateInFirefox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IkM6L1NvdXJjZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL3NoYXJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsc0RBQXNCO0FBQ3RCLDBEQUFnQztBQUNoQyw0REFBNEI7QUFDNUIsZ0VBQStCO0FBQy9CLHdEQUF3QjtBQUN4QiwrQkFBb0M7QUFDcEMsMkJBQW9FO0FBQ3BFLG9DQUErQjtBQUMvQiw0Q0FBOEM7QUFDOUMsK0VBQW1DO0FBQ25DLGlEQUFpRDtBQUVqRCxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV0RDs7O0dBR0c7QUFDSCxtQ0FBZ0QsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFlBQW9COztRQUN4RyxLQUFLLENBQUMsdURBQXdELFVBQVcsRUFBRSxDQUFDLENBQUM7UUFDN0UsV0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDN0MsS0FBSyxDQUFDLHNCQUF1QixpQkFBa0Isb0NBQW9DLENBQUMsQ0FBQztZQUNyRixJQUFJLGVBQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssQ0FBQyxnQ0FBaUMsaUJBQWtCLDBCQUEwQixDQUFDLENBQUE7Z0JBQ3BGLFdBQUcsQ0FBQyxHQUFJLFlBQWEsV0FBWSxpQkFBa0IsaUJBQWtCLFFBQVMsYUFBYSxDQUFDLENBQUM7YUFDOUY7WUFDRCxJQUFJLGVBQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssQ0FBQyxnQ0FBaUMsaUJBQWtCLDBCQUEwQixDQUFDLENBQUE7Z0JBQ3BGLFdBQUcsQ0FBQyxHQUFJLFlBQWEsZUFBZ0IsaUJBQWtCLGlCQUFrQixRQUFTLGFBQWEsQ0FBQyxDQUFDO2FBQ2xHO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsa0VBQW1FLFVBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUFBO0FBZEQsOERBY0M7QUFFRDs7Ozs7OztHQU9HO0FBQ0g7O1FBQ0UsSUFBSSxhQUFhLEVBQUUsRUFBRTtZQUNuQixNQUFNLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUN4QyxPQUFNLGFBQWEsRUFBRSxFQUFFO2dCQUNyQixNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqQjtTQUNGO0lBQ0gsQ0FBQztDQUFBO0FBUEQsb0NBT0M7QUFFRDs7R0FFRztBQUNIO0lBQ0UseUVBQXlFO0lBQ3pFLGtFQUFrRTtJQUNsRSxnQkFBZ0I7SUFDaEIsZ0JBQU0sQ0FBQyxpQkFBSyxJQUFJLG1CQUFPLEVBQUUsdUVBQXVFLENBQUMsQ0FBQztJQUNsRyxPQUFPLHdCQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxlQUFxQixFQUFVOztRQUM3QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsa0NBQStDLFdBQW1CLEVBQUUsUUFBZ0I7O1FBQ2xGLEtBQUssQ0FBQywrR0FBK0csQ0FBQyxDQUFDO1FBQ3ZILElBQUksSUFBSSxHQUFHLE1BQU0sa0JBQU8sRUFBRSxDQUFDO1FBQzNCLElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsQ0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDaEQsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksUUFBUSxLQUFLLGNBQWMsRUFBRTtnQkFDL0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLEVBQUUsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRSxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1g7aUJBQU07Z0JBQ0wsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLHdCQUFFLENBQUMsdUJBQXVCLENBQUMsb0JBQXFCLElBQUssY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQixLQUFLLENBQUMsNEdBQTRHLENBQUMsQ0FBQztRQUNwSCxNQUFNLHdCQUFFLENBQUMsa0JBQWtCLENBQUMsb0JBQXFCLElBQUssRUFBRSxDQUFDLENBQUM7UUFDMUQsV0FBRyxDQUFDLEdBQUksV0FBWSxxQkFBc0IsSUFBSyxFQUFFLENBQUMsQ0FBQztRQUNuRCxNQUFNLHdCQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBcEJELDREQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcclxuaW1wb3J0IGdldFBvcnQgZnJvbSAnZ2V0LXBvcnQnO1xyXG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcclxuaW1wb3J0IHsgc3luYyBhcyBnbG9iIH0gZnJvbSAnZ2xvYic7XHJcbmltcG9ydCB7IHJlYWRGaWxlU3luYyBhcyByZWFkRmlsZSwgZXhpc3RzU3luYyBhcyBleGlzdHMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IHJ1biB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgaXNNYWMsIGlzTGludXggfSBmcm9tICcuLi9jb25zdGFudHMnO1xyXG5pbXBvcnQgVUkgZnJvbSAnLi4vdXNlci1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBleGVjU3luYyBhcyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnBsYXRmb3JtczpzaGFyZWQnKTtcclxuXHJcbi8qKlxyXG4gKiAgR2l2ZW4gYSBkaXJlY3Rvcnkgb3IgZ2xvYiBwYXR0ZXJuIG9mIGRpcmVjdG9yaWVzLCBhdHRlbXB0IHRvIGluc3RhbGwgdGhlXHJcbiAqICBDQSBjZXJ0aWZpY2F0ZSB0byBlYWNoIGRpcmVjdG9yeSBjb250YWluaW5nIGFuIE5TUyBkYXRhYmFzZS5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKG5zc0Rpckdsb2I6IHN0cmluZywgY2VydFBhdGg6IHN0cmluZywgY2VydHV0aWxQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBkZWJ1ZyhgdHJ5aW5nIHRvIGluc3RhbGwgY2VydGlmaWNhdGUgaW50byBOU1MgZGF0YWJhc2VzIGluICR7IG5zc0Rpckdsb2IgfWApO1xyXG4gIGdsb2IobnNzRGlyR2xvYikuZm9yRWFjaCgocG90ZW50aWFsTlNTREJEaXIpID0+IHtcclxuICAgIGRlYnVnKGBjaGVja2luZyB0byBzZWUgaWYgJHsgcG90ZW50aWFsTlNTREJEaXIgfSBpcyBhIHZhbGlkIE5TUyBkYXRhYmFzZSBkaXJlY3RvcnlgKTtcclxuICAgIGlmIChleGlzdHMocGF0aC5qb2luKHBvdGVudGlhbE5TU0RCRGlyLCAnY2VydDguZGInKSkpIHtcclxuICAgICAgZGVidWcoYEZvdW5kIGxlZ2FjeSBOU1MgZGF0YWJhc2UgaW4gJHsgcG90ZW50aWFsTlNTREJEaXIgfSwgYWRkaW5nIGNlcnRpZmljYXRlIC4uLmApXHJcbiAgICAgIHJ1bihgJHsgY2VydHV0aWxQYXRoIH0gLUEgLWQgXCIkeyBwb3RlbnRpYWxOU1NEQkRpciB9XCIgLXQgJ0MsLCcgLWkgJHsgY2VydFBhdGggfSAtbiBkZXZjZXJ0YCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZXhpc3RzKHBhdGguam9pbihwb3RlbnRpYWxOU1NEQkRpciwgJ2NlcnQ5LmRiJykpKSB7XHJcbiAgICAgIGRlYnVnKGBGb3VuZCBtb2Rlcm4gTlNTIGRhdGFiYXNlIGluICR7IHBvdGVudGlhbE5TU0RCRGlyIH0sIGFkZGluZyBjZXJ0aWZpY2F0ZSAuLi5gKVxyXG4gICAgICBydW4oYCR7IGNlcnR1dGlsUGF0aCB9IC1BIC1kIFwic3FsOiR7IHBvdGVudGlhbE5TU0RCRGlyIH1cIiAtdCAnQywsJyAtaSAkeyBjZXJ0UGF0aCB9IC1uIGRldmNlcnRgKTtcclxuICAgIH1cclxuICB9KTtcclxuICBkZWJ1ZyhgZmluaXNoZWQgc2Nhbm5pbmcgJiBpbnN0YWxsaW5nIGNlcnRpZmljYXRlIGluIE5TUyBkYXRhYmFzZXMgaW4gJHsgbnNzRGlyR2xvYiB9YCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgQ2hlY2sgdG8gc2VlIGlmIEZpcmVmb3ggaXMgc3RpbGwgcnVubmluZywgYW5kIGlmIHNvLCBhc2sgdGhlIHVzZXIgdG8gY2xvc2VcclxuICogIGl0LiBQb2xsIHVudGlsIGl0J3MgY2xvc2VkLCB0aGVuIHJldHVybi5cclxuICpcclxuICogVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBGaXJlZm94IGFwcGVhcnMgdG8gbG9hZCB0aGUgTlNTIGRhdGFiYXNlIGluLW1lbW9yeSBvblxyXG4gKiBzdGFydHVwLCBhbmQgb3ZlcndyaXRlIG9uIGV4aXQuIFNvIHdlIGhhdmUgdG8gYXNrIHRoZSB1c2VyIHRvIHF1aXRlIEZpcmVmb3hcclxuICogZmlyc3Qgc28gb3VyIGNoYW5nZXMgZG9uJ3QgZ2V0IG92ZXJ3cml0dGVuLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlRmlyZWZveCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoaXNGaXJlZm94T3BlbigpKSB7XHJcbiAgICBhd2FpdCBVSS5jbG9zZUZpcmVmb3hCZWZvcmVDb250aW51aW5nKCk7XHJcbiAgICB3aGlsZShpc0ZpcmVmb3hPcGVuKCkpIHtcclxuICAgICAgYXdhaXQgc2xlZXAoNTApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIEZpcmVmb3ggaXMgY3VycmVudGx5IG9wZW5cclxuICovXHJcbmZ1bmN0aW9uIGlzRmlyZWZveE9wZW4oKSB7XHJcbiAgLy8gTk9URTogV2UgdXNlIHNvbWUgV2luZG93cy11bmZyaWVuZGx5IG1ldGhvZHMgaGVyZSAocHMpIGJlY2F1c2UgV2luZG93c1xyXG4gIC8vIG5ldmVyIG5lZWRzIHRvIGNoZWNrIHRoaXMsIGJlY2F1c2UgaXQgZG9lc24ndCB1cGRhdGUgdGhlIE5TUyBEQlxyXG4gIC8vIGF1dG9tYXRpY2FseS5cclxuICBhc3NlcnQoaXNNYWMgfHwgaXNMaW51eCwgJ2NoZWNrRm9yT3BlbkZpcmVmb3ggd2FzIGludm9rZWQgb24gYSBwbGF0Zm9ybSBvdGhlciB0aGFuIE1hYyBvciBMaW51eCcpO1xyXG4gIHJldHVybiBleGVjKCdwcyBhdXgnKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlcikge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG4vKipcclxuICogRmlyZWZveCBtYW5hZ2VzIGl0J3Mgb3duIHRydXN0IHN0b3JlIGZvciBTU0wgY2VydGlmaWNhdGVzLCB3aGljaCBjYW4gYmVcclxuICogbWFuYWdlZCB2aWEgdGhlIGNlcnR1dGlsIGNvbW1hbmQgKHN1cHBsaWVkIGJ5IE5TUyB0b29saW5nIHBhY2thZ2VzKS4gSW4gdGhlXHJcbiAqIGV2ZW50IHRoYXQgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgZWl0aGVyIGNhbid0IGJlIGluc3RhbGxlZFxyXG4gKiAoV2luZG93cykgb3IgdGhlIHVzZXIgZG9lc24ndCB3YW50IHRvIGluc3RhbGwgaXQgKHNraXBDZXJ0dXRpbEluc3RhbGw6XHJcbiAqIHRydWUpLCBpdCBtZWFucyB0aGF0IHdlIGNhbid0IHByb2dyYW1tYXRpY2FsbHkgdGVsbCBGaXJlZm94IHRvIHRydXN0IG91clxyXG4gKiByb290IENBIGNlcnRpZmljYXRlLlxyXG4gKlxyXG4gKiBUaGVyZSBpcyBhIHJlY291cnNlIHRob3VnaC4gV2hlbiBhIEZpcmVmb3ggdGFiIGlzIGRpcmVjdGVkIHRvIGEgVVJMIHRoYXRcclxuICogcmVzcG9uZHMgd2l0aCBhIGNlcnRpZmljYXRlLCBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgcHJvbXB0IHRoZSB1c2VyIGlmIHRoZXlcclxuICogd2FudCB0byBhZGQgaXQgdG8gdGhlaXIgdHJ1c3RlZCBjZXJ0aWZpY2F0ZXMuIFNvIGlmIHdlIGNhbid0IGF1dG9tYXRpY2FsbHlcclxuICogaW5zdGFsbCB0aGUgY2VydGlmaWNhdGUgdmlhIGNlcnR1dGlsLCB3ZSBpbnN0ZWFkIHN0YXJ0IGEgcXVpY2sgd2ViIHNlcnZlclxyXG4gKiBhbmQgaG9zdCBvdXIgY2VydGlmaWNhdGUgZmlsZS4gVGhlbiB3ZSBvcGVuIHRoZSBob3N0ZWQgY2VydCBVUkwgaW4gRmlyZWZveFxyXG4gKiB0byBraWNrIG9mZiB0aGUgR1VJIGZsb3cuXHJcbiAqXHJcbiAqIFRoaXMgbWV0aG9kIGRvZXMgYWxsIHRoaXMsIGFsb25nIHdpdGggcHJvdmlkaW5nIHVzZXIgcHJvbXB0cyBpbiB0aGUgdGVybWluYWxcclxuICogdG8gd2FsayB0aGVtIHRocm91Z2ggdGhpcyBwcm9jZXNzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveChmaXJlZm94UGF0aDogc3RyaW5nLCBjZXJ0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZGVidWcoJ0FkZGluZyBkZXZlcnQgdG8gRmlyZWZveCB0cnVzdCBzdG9yZXMgbWFudWFsbHkuIExhdW5jaGluZyBhIHdlYnNlcnZlciB0byBob3N0IG91ciBjZXJ0aWZpY2F0ZSB0ZW1wb3JhcmlseSAuLi4nKTtcclxuICBsZXQgcG9ydCA9IGF3YWl0IGdldFBvcnQoKTtcclxuICBsZXQgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICBsZXQgeyBwYXRobmFtZSB9ID0gdXJsLnBhcnNlKHJlcS51cmwpO1xyXG4gICAgaWYgKHBhdGhuYW1lID09PSAnL2NlcnRpZmljYXRlJykge1xyXG4gICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0JyB9KTtcclxuICAgICAgcmVzLndyaXRlKHJlYWRGaWxlKGNlcnRQYXRoKSk7XHJcbiAgICAgIHJlcy5lbmQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwKTtcclxuICAgICAgcmVzLndyaXRlKGF3YWl0IFVJLmZpcmVmb3hXaXphcmRQcm9tcHRQYWdlKGBodHRwOi8vbG9jYWxob3N0OiR7IHBvcnQgfS9jZXJ0aWZpY2F0ZWApKTtcclxuICAgICAgcmVzLmVuZCgpO1xyXG4gICAgfVxyXG4gIH0pLmxpc3Rlbihwb3J0KTtcclxuICBkZWJ1ZygnQ2VydGlmaWNhdGUgc2VydmVyIGlzIHVwLiBQcmludGluZyBpbnN0cnVjdGlvbnMgZm9yIHVzZXIgYW5kIGxhdW5jaGluZyBGaXJlZm94IHdpdGggaG9zdGVkIGNlcnRpZmljYXRlIFVSTCcpO1xyXG4gIGF3YWl0IFVJLnN0YXJ0RmlyZWZveFdpemFyZChgaHR0cDovL2xvY2FsaG9zdDokeyBwb3J0IH1gKTtcclxuICBydW4oYCR7IGZpcmVmb3hQYXRoIH0gaHR0cDovL2xvY2FsaG9zdDokeyBwb3J0IH1gKTtcclxuICBhd2FpdCBVSS53YWl0Rm9yRmlyZWZveFdpemFyZCgpO1xyXG4gIHNlcnZlci5jbG9zZSgpO1xyXG59XHJcbiJdfQ==