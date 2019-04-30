"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const password_prompt_1 = tslib_1.__importDefault(require("password-prompt"));
const utils_1 = require("./utils");
const DefaultUI = {
    getWindowsEncryptionPassword() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield password_prompt_1.default('devcert password (http://bit.ly/devcert-what-password?):');
        });
    },
    warnChromeOnLinuxWithoutCertutil() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.warn(`
      WARNING: It looks like you have Chrome installed, but you specified
      'skipCertutilInstall: true'. Unfortunately, without installing
      certutil, it's impossible get Chrome to trust devcert's certificates
      The certificates will work, but Chrome will continue to warn you that
      they are untrusted.
    `);
        });
    },
    closeFirefoxBeforeContinuing() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Please close Firefox before continuing');
        });
    },
    startFirefoxWizard(certificateHost) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`
      devcert was unable to automatically configure Firefox. You'll need to
      complete this process manually. Don't worry though - Firefox will walk
      you through it.

      When you're ready, hit any key to continue. Firefox will launch and
      display a wizard to walk you through how to trust the devcert
      certificate. When you are finished, come back here and we'll finish up.

      (If Firefox doesn't start, go ahead and start it and navigate to
      ${certificateHost} in a new tab.)

      If you are curious about why all this is necessary, check out
      https://github.com/davewasmer/devcert#how-it-works

      <Press any key to launch Firefox wizard>
    `);
            yield utils_1.waitForUser();
        });
    },
    firefoxWizardPromptPage(certificateURL) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return `
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${certificateURL}" />
        </head>
      </html>
    `;
        });
    },
    waitForFirefoxWizard() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`
      Launching Firefox ...

      Great! Once you've finished the Firefox wizard for adding the devcert
      certificate, just hit any key here again and we'll wrap up.

      <Press any key to continue>
    `);
            yield utils_1.waitForUser();
        });
    }
};
exports.default = DefaultUI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiRDovY29kZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsidXNlci1pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOEVBQTZDO0FBQzdDLG1DQUFzQztBQVd0QyxNQUFNLFNBQVMsR0FBa0I7SUFDekIsNEJBQTRCOztZQUNoQyxNQUFNLENBQUMsTUFBTSx5QkFBYyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7UUFDMUYsQ0FBQztLQUFBO0lBQ0ssZ0NBQWdDOztZQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDOzs7Ozs7S0FNWixDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFDSyw0QkFBNEI7O1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFDSyxrQkFBa0IsQ0FBQyxlQUFlOztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7O1FBVVAsZUFBZ0I7Ozs7OztLQU1wQixDQUFDLENBQUM7WUFDSCxNQUFNLG1CQUFXLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFDSyx1QkFBdUIsQ0FBQyxjQUFzQjs7WUFDbEQsTUFBTSxDQUFDOzs7dURBRzRDLGNBQWM7OztLQUdoRSxDQUFDO1FBQ0osQ0FBQztLQUFBO0lBQ0ssb0JBQW9COztZQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDOzs7Ozs7O0tBT1gsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxtQkFBVyxFQUFFLENBQUM7UUFDdEIsQ0FBQztLQUFBO0NBQ0YsQ0FBQTtBQUVELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXNzd29yZFByb21wdCBmcm9tICdwYXNzd29yZC1wcm9tcHQnO1xyXG5pbXBvcnQgeyB3YWl0Rm9yVXNlciB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVc2VySW50ZXJmYWNlIHtcclxuICBnZXRXaW5kb3dzRW5jcnlwdGlvblBhc3N3b3JkKCk6IFByb21pc2U8c3RyaW5nPjtcclxuICB3YXJuQ2hyb21lT25MaW51eFdpdGhvdXRDZXJ0dXRpbCgpOiBQcm9taXNlPHZvaWQ+O1xyXG4gIGNsb3NlRmlyZWZveEJlZm9yZUNvbnRpbnVpbmcoKTogUHJvbWlzZTx2b2lkPjtcclxuICBzdGFydEZpcmVmb3hXaXphcmQoY2VydGlmaWNhdGVIb3N0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xyXG4gIGZpcmVmb3hXaXphcmRQcm9tcHRQYWdlKGNlcnRpZmljYXRlVVJMOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XHJcbiAgd2FpdEZvckZpcmVmb3hXaXphcmQoKTogUHJvbWlzZTx2b2lkPjtcclxufVxyXG5cclxuY29uc3QgRGVmYXVsdFVJOiBVc2VySW50ZXJmYWNlID0ge1xyXG4gIGFzeW5jIGdldFdpbmRvd3NFbmNyeXB0aW9uUGFzc3dvcmQoKSB7XHJcbiAgICByZXR1cm4gYXdhaXQgcGFzc3dvcmRQcm9tcHQoJ2RldmNlcnQgcGFzc3dvcmQgKGh0dHA6Ly9iaXQubHkvZGV2Y2VydC13aGF0LXBhc3N3b3JkPyk6Jyk7XHJcbiAgfSxcclxuICBhc3luYyB3YXJuQ2hyb21lT25MaW51eFdpdGhvdXRDZXJ0dXRpbCgpIHtcclxuICAgIGNvbnNvbGUud2FybihgXHJcbiAgICAgIFdBUk5JTkc6IEl0IGxvb2tzIGxpa2UgeW91IGhhdmUgQ2hyb21lIGluc3RhbGxlZCwgYnV0IHlvdSBzcGVjaWZpZWRcclxuICAgICAgJ3NraXBDZXJ0dXRpbEluc3RhbGw6IHRydWUnLiBVbmZvcnR1bmF0ZWx5LCB3aXRob3V0IGluc3RhbGxpbmdcclxuICAgICAgY2VydHV0aWwsIGl0J3MgaW1wb3NzaWJsZSBnZXQgQ2hyb21lIHRvIHRydXN0IGRldmNlcnQncyBjZXJ0aWZpY2F0ZXNcclxuICAgICAgVGhlIGNlcnRpZmljYXRlcyB3aWxsIHdvcmssIGJ1dCBDaHJvbWUgd2lsbCBjb250aW51ZSB0byB3YXJuIHlvdSB0aGF0XHJcbiAgICAgIHRoZXkgYXJlIHVudHJ1c3RlZC5cclxuICAgIGApO1xyXG4gIH0sXHJcbiAgYXN5bmMgY2xvc2VGaXJlZm94QmVmb3JlQ29udGludWluZygpIHtcclxuICAgIGNvbnNvbGUubG9nKCdQbGVhc2UgY2xvc2UgRmlyZWZveCBiZWZvcmUgY29udGludWluZycpO1xyXG4gIH0sXHJcbiAgYXN5bmMgc3RhcnRGaXJlZm94V2l6YXJkKGNlcnRpZmljYXRlSG9zdCkge1xyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBkZXZjZXJ0IHdhcyB1bmFibGUgdG8gYXV0b21hdGljYWxseSBjb25maWd1cmUgRmlyZWZveC4gWW91J2xsIG5lZWQgdG9cclxuICAgICAgY29tcGxldGUgdGhpcyBwcm9jZXNzIG1hbnVhbGx5LiBEb24ndCB3b3JyeSB0aG91Z2ggLSBGaXJlZm94IHdpbGwgd2Fsa1xyXG4gICAgICB5b3UgdGhyb3VnaCBpdC5cclxuXHJcbiAgICAgIFdoZW4geW91J3JlIHJlYWR5LCBoaXQgYW55IGtleSB0byBjb250aW51ZS4gRmlyZWZveCB3aWxsIGxhdW5jaCBhbmRcclxuICAgICAgZGlzcGxheSBhIHdpemFyZCB0byB3YWxrIHlvdSB0aHJvdWdoIGhvdyB0byB0cnVzdCB0aGUgZGV2Y2VydFxyXG4gICAgICBjZXJ0aWZpY2F0ZS4gV2hlbiB5b3UgYXJlIGZpbmlzaGVkLCBjb21lIGJhY2sgaGVyZSBhbmQgd2UnbGwgZmluaXNoIHVwLlxyXG5cclxuICAgICAgKElmIEZpcmVmb3ggZG9lc24ndCBzdGFydCwgZ28gYWhlYWQgYW5kIHN0YXJ0IGl0IGFuZCBuYXZpZ2F0ZSB0b1xyXG4gICAgICAkeyBjZXJ0aWZpY2F0ZUhvc3QgfSBpbiBhIG5ldyB0YWIuKVxyXG5cclxuICAgICAgSWYgeW91IGFyZSBjdXJpb3VzIGFib3V0IHdoeSBhbGwgdGhpcyBpcyBuZWNlc3NhcnksIGNoZWNrIG91dFxyXG4gICAgICBodHRwczovL2dpdGh1Yi5jb20vZGF2ZXdhc21lci9kZXZjZXJ0I2hvdy1pdC13b3Jrc1xyXG5cclxuICAgICAgPFByZXNzIGFueSBrZXkgdG8gbGF1bmNoIEZpcmVmb3ggd2l6YXJkPlxyXG4gICAgYCk7XHJcbiAgICBhd2FpdCB3YWl0Rm9yVXNlcigpO1xyXG4gIH0sXHJcbiAgYXN5bmMgZmlyZWZveFdpemFyZFByb21wdFBhZ2UoY2VydGlmaWNhdGVVUkw6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIGBcclxuICAgICAgPGh0bWw+XHJcbiAgICAgICAgPGhlYWQ+XHJcbiAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwicmVmcmVzaFwiIGNvbnRlbnQ9XCIwOyB1cmw9JHtjZXJ0aWZpY2F0ZVVSTH1cIiAvPlxyXG4gICAgICAgIDwvaGVhZD5cclxuICAgICAgPC9odG1sPlxyXG4gICAgYDtcclxuICB9LFxyXG4gIGFzeW5jIHdhaXRGb3JGaXJlZm94V2l6YXJkKCkge1xyXG4gICAgY29uc29sZS5sb2coYFxyXG4gICAgICBMYXVuY2hpbmcgRmlyZWZveCAuLi5cclxuXHJcbiAgICAgIEdyZWF0ISBPbmNlIHlvdSd2ZSBmaW5pc2hlZCB0aGUgRmlyZWZveCB3aXphcmQgZm9yIGFkZGluZyB0aGUgZGV2Y2VydFxyXG4gICAgICBjZXJ0aWZpY2F0ZSwganVzdCBoaXQgYW55IGtleSBoZXJlIGFnYWluIGFuZCB3ZSdsbCB3cmFwIHVwLlxyXG5cclxuICAgICAgPFByZXNzIGFueSBrZXkgdG8gY29udGludWU+XHJcbiAgICBgKVxyXG4gICAgYXdhaXQgd2FpdEZvclVzZXIoKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERlZmF1bHRVSTsiXX0=