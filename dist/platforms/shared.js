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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IkQ6L2NvZGUvZGV2Y2VydC8iLCJzb3VyY2VzIjpbInBsYXRmb3Jtcy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLHNEQUFzQjtBQUN0QiwwREFBZ0M7QUFDaEMsNERBQTRCO0FBQzVCLGdFQUErQjtBQUMvQix3REFBd0I7QUFDeEIsK0JBQW9DO0FBQ3BDLDJCQUFvRTtBQUNwRSxvQ0FBK0I7QUFDL0IsNENBQThDO0FBQzlDLCtFQUFtQztBQUNuQyxpREFBaUQ7QUFFakQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFdEQ7OztHQUdHO0FBQ0gsbUNBQWdELFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQjs7UUFDeEcsS0FBSyxDQUFDLHVEQUF3RCxVQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLFdBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQzdDLEtBQUssQ0FBQyxzQkFBdUIsaUJBQWtCLG9DQUFvQyxDQUFDLENBQUM7WUFDckYsRUFBRSxDQUFDLENBQUMsZUFBTSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELEtBQUssQ0FBQyxnQ0FBaUMsaUJBQWtCLDBCQUEwQixDQUFDLENBQUE7Z0JBQ3BGLFdBQUcsQ0FBQyxHQUFJLFlBQWEsV0FBWSxpQkFBa0IsaUJBQWtCLFFBQVMsYUFBYSxDQUFDLENBQUM7WUFDL0YsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxLQUFLLENBQUMsZ0NBQWlDLGlCQUFrQiwwQkFBMEIsQ0FBQyxDQUFBO2dCQUNwRixXQUFHLENBQUMsR0FBSSxZQUFhLGVBQWdCLGlCQUFrQixpQkFBa0IsUUFBUyxhQUFhLENBQUMsQ0FBQztZQUNuRyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsa0VBQW1FLFVBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUFBO0FBZEQsOERBY0M7QUFFRDs7Ozs7OztHQU9HO0FBQ0g7O1FBQ0UsRUFBRSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sd0JBQUUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQ3hDLE9BQU0sYUFBYSxFQUFFLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0NBQUE7QUFQRCxvQ0FPQztBQUVEOztHQUVHO0FBQ0g7SUFDRSx5RUFBeUU7SUFDekUsa0VBQWtFO0lBQ2xFLGdCQUFnQjtJQUNoQixnQkFBTSxDQUFDLGlCQUFLLElBQUksbUJBQU8sRUFBRSx1RUFBdUUsQ0FBQyxDQUFDO0lBQ2xHLE1BQU0sQ0FBQyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRUQsZUFBcUIsRUFBVTs7UUFDN0IsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsa0NBQStDLFdBQW1CLEVBQUUsUUFBZ0I7O1FBQ2xGLEtBQUssQ0FBQywrR0FBK0csQ0FBQyxDQUFDO1FBQ3ZILElBQUksSUFBSSxHQUFHLE1BQU0sa0JBQU8sRUFBRSxDQUFDO1FBQzNCLElBQUksTUFBTSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsQ0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDaEQsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSw0QkFBNEIsRUFBRSxDQUFDLENBQUM7Z0JBQ3JFLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLHdCQUFFLENBQUMsdUJBQXVCLENBQUMsb0JBQXFCLElBQUssY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUMsQ0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyw0R0FBNEcsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sd0JBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBcUIsSUFBSyxFQUFFLENBQUMsQ0FBQztRQUMxRCxXQUFHLENBQUMsR0FBSSxXQUFZLHFCQUFzQixJQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sd0JBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFwQkQsNERBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcclxuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xyXG5pbXBvcnQgZ2V0UG9ydCBmcm9tICdnZXQtcG9ydCc7XHJcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xyXG5pbXBvcnQgeyBzeW5jIGFzIGdsb2IgfSBmcm9tICdnbG9iJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIGFzIHJlYWRGaWxlLCBleGlzdHNTeW5jIGFzIGV4aXN0cyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBpc01hYywgaXNMaW51eCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XHJcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XHJcbmltcG9ydCB7IGV4ZWNTeW5jIGFzIGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOnNoYXJlZCcpO1xyXG5cclxuLyoqXHJcbiAqICBHaXZlbiBhIGRpcmVjdG9yeSBvciBnbG9iIHBhdHRlcm4gb2YgZGlyZWN0b3JpZXMsIGF0dGVtcHQgdG8gaW5zdGFsbCB0aGVcclxuICogIENBIGNlcnRpZmljYXRlIHRvIGVhY2ggZGlyZWN0b3J5IGNvbnRhaW5pbmcgYW4gTlNTIGRhdGFiYXNlLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIobnNzRGlyR2xvYjogc3RyaW5nLCBjZXJ0UGF0aDogc3RyaW5nLCBjZXJ0dXRpbFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGRlYnVnKGB0cnlpbmcgdG8gaW5zdGFsbCBjZXJ0aWZpY2F0ZSBpbnRvIE5TUyBkYXRhYmFzZXMgaW4gJHsgbnNzRGlyR2xvYiB9YCk7XHJcbiAgZ2xvYihuc3NEaXJHbG9iKS5mb3JFYWNoKChwb3RlbnRpYWxOU1NEQkRpcikgPT4ge1xyXG4gICAgZGVidWcoYGNoZWNraW5nIHRvIHNlZSBpZiAkeyBwb3RlbnRpYWxOU1NEQkRpciB9IGlzIGEgdmFsaWQgTlNTIGRhdGFiYXNlIGRpcmVjdG9yeWApO1xyXG4gICAgaWYgKGV4aXN0cyhwYXRoLmpvaW4ocG90ZW50aWFsTlNTREJEaXIsICdjZXJ0OC5kYicpKSkge1xyXG4gICAgICBkZWJ1ZyhgRm91bmQgbGVnYWN5IE5TUyBkYXRhYmFzZSBpbiAkeyBwb3RlbnRpYWxOU1NEQkRpciB9LCBhZGRpbmcgY2VydGlmaWNhdGUgLi4uYClcclxuICAgICAgcnVuKGAkeyBjZXJ0dXRpbFBhdGggfSAtQSAtZCBcIiR7IHBvdGVudGlhbE5TU0RCRGlyIH1cIiAtdCAnQywsJyAtaSAkeyBjZXJ0UGF0aCB9IC1uIGRldmNlcnRgKTtcclxuICAgIH1cclxuICAgIGlmIChleGlzdHMocGF0aC5qb2luKHBvdGVudGlhbE5TU0RCRGlyLCAnY2VydDkuZGInKSkpIHtcclxuICAgICAgZGVidWcoYEZvdW5kIG1vZGVybiBOU1MgZGF0YWJhc2UgaW4gJHsgcG90ZW50aWFsTlNTREJEaXIgfSwgYWRkaW5nIGNlcnRpZmljYXRlIC4uLmApXHJcbiAgICAgIHJ1bihgJHsgY2VydHV0aWxQYXRoIH0gLUEgLWQgXCJzcWw6JHsgcG90ZW50aWFsTlNTREJEaXIgfVwiIC10ICdDLCwnIC1pICR7IGNlcnRQYXRoIH0gLW4gZGV2Y2VydGApO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRlYnVnKGBmaW5pc2hlZCBzY2FubmluZyAmIGluc3RhbGxpbmcgY2VydGlmaWNhdGUgaW4gTlNTIGRhdGFiYXNlcyBpbiAkeyBuc3NEaXJHbG9iIH1gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqICBDaGVjayB0byBzZWUgaWYgRmlyZWZveCBpcyBzdGlsbCBydW5uaW5nLCBhbmQgaWYgc28sIGFzayB0aGUgdXNlciB0byBjbG9zZVxyXG4gKiAgaXQuIFBvbGwgdW50aWwgaXQncyBjbG9zZWQsIHRoZW4gcmV0dXJuLlxyXG4gKlxyXG4gKiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIEZpcmVmb3ggYXBwZWFycyB0byBsb2FkIHRoZSBOU1MgZGF0YWJhc2UgaW4tbWVtb3J5IG9uXHJcbiAqIHN0YXJ0dXAsIGFuZCBvdmVyd3JpdGUgb24gZXhpdC4gU28gd2UgaGF2ZSB0byBhc2sgdGhlIHVzZXIgdG8gcXVpdGUgRmlyZWZveFxyXG4gKiBmaXJzdCBzbyBvdXIgY2hhbmdlcyBkb24ndCBnZXQgb3ZlcndyaXR0ZW4uXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VGaXJlZm94KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGlmIChpc0ZpcmVmb3hPcGVuKCkpIHtcclxuICAgIGF3YWl0IFVJLmNsb3NlRmlyZWZveEJlZm9yZUNvbnRpbnVpbmcoKTtcclxuICAgIHdoaWxlKGlzRmlyZWZveE9wZW4oKSkge1xyXG4gICAgICBhd2FpdCBzbGVlcCg1MCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgRmlyZWZveCBpcyBjdXJyZW50bHkgb3BlblxyXG4gKi9cclxuZnVuY3Rpb24gaXNGaXJlZm94T3BlbigpIHtcclxuICAvLyBOT1RFOiBXZSB1c2Ugc29tZSBXaW5kb3dzLXVuZnJpZW5kbHkgbWV0aG9kcyBoZXJlIChwcykgYmVjYXVzZSBXaW5kb3dzXHJcbiAgLy8gbmV2ZXIgbmVlZHMgdG8gY2hlY2sgdGhpcywgYmVjYXVzZSBpdCBkb2Vzbid0IHVwZGF0ZSB0aGUgTlNTIERCXHJcbiAgLy8gYXV0b21hdGljYWx5LlxyXG4gIGFzc2VydChpc01hYyB8fCBpc0xpbnV4LCAnY2hlY2tGb3JPcGVuRmlyZWZveCB3YXMgaW52b2tlZCBvbiBhIHBsYXRmb3JtIG90aGVyIHRoYW4gTWFjIG9yIExpbnV4Jyk7XHJcbiAgcmV0dXJuIGV4ZWMoJ3BzIGF1eCcpLmluZGV4T2YoJ2ZpcmVmb3gnKSA+IC0xO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzbGVlcChtczogbnVtYmVyKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaXJlZm94IG1hbmFnZXMgaXQncyBvd24gdHJ1c3Qgc3RvcmUgZm9yIFNTTCBjZXJ0aWZpY2F0ZXMsIHdoaWNoIGNhbiBiZVxyXG4gKiBtYW5hZ2VkIHZpYSB0aGUgY2VydHV0aWwgY29tbWFuZCAoc3VwcGxpZWQgYnkgTlNTIHRvb2xpbmcgcGFja2FnZXMpLiBJbiB0aGVcclxuICogZXZlbnQgdGhhdCBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGFuZCBlaXRoZXIgY2FuJ3QgYmUgaW5zdGFsbGVkXHJcbiAqIChXaW5kb3dzKSBvciB0aGUgdXNlciBkb2Vzbid0IHdhbnQgdG8gaW5zdGFsbCBpdCAoc2tpcENlcnR1dGlsSW5zdGFsbDpcclxuICogdHJ1ZSksIGl0IG1lYW5zIHRoYXQgd2UgY2FuJ3QgcHJvZ3JhbW1hdGljYWxseSB0ZWxsIEZpcmVmb3ggdG8gdHJ1c3Qgb3VyXHJcbiAqIHJvb3QgQ0EgY2VydGlmaWNhdGUuXHJcbiAqXHJcbiAqIFRoZXJlIGlzIGEgcmVjb3Vyc2UgdGhvdWdoLiBXaGVuIGEgRmlyZWZveCB0YWIgaXMgZGlyZWN0ZWQgdG8gYSBVUkwgdGhhdFxyXG4gKiByZXNwb25kcyB3aXRoIGEgY2VydGlmaWNhdGUsIGl0IHdpbGwgYXV0b21hdGljYWxseSBwcm9tcHQgdGhlIHVzZXIgaWYgdGhleVxyXG4gKiB3YW50IHRvIGFkZCBpdCB0byB0aGVpciB0cnVzdGVkIGNlcnRpZmljYXRlcy4gU28gaWYgd2UgY2FuJ3QgYXV0b21hdGljYWxseVxyXG4gKiBpbnN0YWxsIHRoZSBjZXJ0aWZpY2F0ZSB2aWEgY2VydHV0aWwsIHdlIGluc3RlYWQgc3RhcnQgYSBxdWljayB3ZWIgc2VydmVyXHJcbiAqIGFuZCBob3N0IG91ciBjZXJ0aWZpY2F0ZSBmaWxlLiBUaGVuIHdlIG9wZW4gdGhlIGhvc3RlZCBjZXJ0IFVSTCBpbiBGaXJlZm94XHJcbiAqIHRvIGtpY2sgb2ZmIHRoZSBHVUkgZmxvdy5cclxuICpcclxuICogVGhpcyBtZXRob2QgZG9lcyBhbGwgdGhpcywgYWxvbmcgd2l0aCBwcm92aWRpbmcgdXNlciBwcm9tcHRzIGluIHRoZSB0ZXJtaW5hbFxyXG4gKiB0byB3YWxrIHRoZW0gdGhyb3VnaCB0aGlzIHByb2Nlc3MuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94KGZpcmVmb3hQYXRoOiBzdHJpbmcsIGNlcnRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBkZWJ1ZygnQWRkaW5nIGRldmVydCB0byBGaXJlZm94IHRydXN0IHN0b3JlcyBtYW51YWxseS4gTGF1bmNoaW5nIGEgd2Vic2VydmVyIHRvIGhvc3Qgb3VyIGNlcnRpZmljYXRlIHRlbXBvcmFyaWx5IC4uLicpO1xyXG4gIGxldCBwb3J0ID0gYXdhaXQgZ2V0UG9ydCgpO1xyXG4gIGxldCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgIGxldCB7IHBhdGhuYW1lIH0gPSB1cmwucGFyc2UocmVxLnVybCk7XHJcbiAgICBpZiAocGF0aG5hbWUgPT09ICcvY2VydGlmaWNhdGUnKSB7XHJcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnQnIH0pO1xyXG4gICAgICByZXMud3JpdGUocmVhZEZpbGUoY2VydFBhdGgpKTtcclxuICAgICAgcmVzLmVuZCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzLndyaXRlSGVhZCgyMDApO1xyXG4gICAgICByZXMud3JpdGUoYXdhaXQgVUkuZmlyZWZveFdpemFyZFByb21wdFBhZ2UoYGh0dHA6Ly9sb2NhbGhvc3Q6JHsgcG9ydCB9L2NlcnRpZmljYXRlYCkpO1xyXG4gICAgICByZXMuZW5kKCk7XHJcbiAgICB9XHJcbiAgfSkubGlzdGVuKHBvcnQpO1xyXG4gIGRlYnVnKCdDZXJ0aWZpY2F0ZSBzZXJ2ZXIgaXMgdXAuIFByaW50aW5nIGluc3RydWN0aW9ucyBmb3IgdXNlciBhbmQgbGF1bmNoaW5nIEZpcmVmb3ggd2l0aCBob3N0ZWQgY2VydGlmaWNhdGUgVVJMJyk7XHJcbiAgYXdhaXQgVUkuc3RhcnRGaXJlZm94V2l6YXJkKGBodHRwOi8vbG9jYWxob3N0OiR7IHBvcnQgfWApO1xyXG4gIHJ1bihgJHsgZmlyZWZveFBhdGggfSBodHRwOi8vbG9jYWxob3N0OiR7IHBvcnQgfWApO1xyXG4gIGF3YWl0IFVJLndhaXRGb3JGaXJlZm94V2l6YXJkKCk7XHJcbiAgc2VydmVyLmNsb3NlKCk7XHJcbn1cclxuIl19