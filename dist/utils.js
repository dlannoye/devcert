"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const tmp_1 = __importDefault(require("tmp"));
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const sudo_prompt_1 = __importDefault(require("sudo-prompt"));
const constants_1 = require("./constants");
const debug = debug_1.default('devcert:util');
function openssl(cmd) {
    return run(`openssl ${cmd}`, {
        stdio: 'pipe',
        env: Object.assign({
            RANDFILE: path_1.default.join(constants_1.configPath('.rnd'))
        }, process.env)
    });
}
exports.openssl = openssl;
function run(cmd, options = {}) {
    debug(`exec: \`${cmd}\``);
    return child_process_1.execSync(cmd, options);
}
exports.run = run;
function waitForUser() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.on('data', resolve);
    });
}
exports.waitForUser = waitForUser;
function reportableError(message) {
    return new Error(`${message} | This is a bug in devcert, please report the issue at https://github.com/davewasmer/devcert/issues`);
}
exports.reportableError = reportableError;
function mktmp() {
    // discardDescriptor because windows complains the file is in use if we create a tmp file
    // and then shell out to a process that tries to use it
    return tmp_1.default.fileSync({ discardDescriptor: true }).name;
}
exports.mktmp = mktmp;
function sudo(cmd) {
    return new Promise((resolve, reject) => {
        sudo_prompt_1.default.exec(cmd, { name: 'devcert' }, (err, stdout, stderr) => {
            let error = err || (typeof stderr === 'string' && stderr.trim().length > 0 && new Error(stderr));
            error ? reject(error) : resolve(stdout);
        });
    });
}
exports.sudo = sudo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiQzovU291cmNlL2RldmNlcnQvIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlEQUEwRDtBQUMxRCw4Q0FBc0I7QUFDdEIsa0RBQWdDO0FBQ2hDLGdEQUF3QjtBQUN4Qiw4REFBcUM7QUFFckMsMkNBRXFCO0FBRXJCLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxpQkFBd0IsR0FBVztJQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVksR0FBSSxFQUFFLEVBQUU7UUFDN0IsS0FBSyxFQUFFLE1BQU07UUFDYixHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNqQixRQUFRLEVBQUUsY0FBSSxDQUFDLElBQUksQ0FBQyxzQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQztLQUNoQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBUEQsMEJBT0M7QUFFRCxhQUFvQixHQUFXLEVBQUUsVUFBMkIsRUFBRTtJQUM1RCxLQUFLLENBQUMsV0FBWSxHQUFJLElBQUksQ0FBQyxDQUFDO0lBQzVCLE1BQU0sQ0FBQyx3QkFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBSEQsa0JBR0M7QUFFRDtJQUNFLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUxELGtDQUtDO0FBRUQseUJBQWdDLE9BQWU7SUFDN0MsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsT0FBTyxzR0FBc0csQ0FBQyxDQUFDO0FBQ3JJLENBQUM7QUFGRCwwQ0FFQztBQUVEO0lBQ0UseUZBQXlGO0lBQ3pGLHVEQUF1RDtJQUN2RCxNQUFNLENBQUMsYUFBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFKRCxzQkFJQztBQUVELGNBQXFCLEdBQVc7SUFDOUIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLHFCQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLEdBQWlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQixFQUFFLEVBQUU7WUFDNUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUU7WUFDbEcsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBELG9CQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMsIEV4ZWNTeW5jT3B0aW9ucyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgdG1wIGZyb20gJ3RtcCc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgc3Vkb1Byb21wdCBmcm9tICdzdWRvLXByb21wdCc7XHJcblxyXG5pbXBvcnQge1xyXG4gIGNvbmZpZ1BhdGgsXHJcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDp1dGlsJyk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3BlbnNzbChjbWQ6IHN0cmluZykge1xyXG4gIHJldHVybiBydW4oYG9wZW5zc2wgJHsgY21kIH1gLCB7XHJcbiAgICBzdGRpbzogJ3BpcGUnLFxyXG4gICAgZW52OiBPYmplY3QuYXNzaWduKHtcclxuICAgICAgUkFOREZJTEU6IHBhdGguam9pbihjb25maWdQYXRoKCcucm5kJykpXHJcbiAgICB9LCBwcm9jZXNzLmVudilcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihjbWQ6IHN0cmluZywgb3B0aW9uczogRXhlY1N5bmNPcHRpb25zID0ge30pIHtcclxuICBkZWJ1ZyhgZXhlYzogXFxgJHsgY21kIH1cXGBgKTtcclxuICByZXR1cm4gZXhlY1N5bmMoY21kLCBvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JVc2VyKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgcHJvY2Vzcy5zdGRpbi5yZXN1bWUoKTtcclxuICAgIHByb2Nlc3Muc3RkaW4ub24oJ2RhdGEnLCByZXNvbHZlKTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydGFibGVFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcclxuICByZXR1cm4gbmV3IEVycm9yKGAke21lc3NhZ2V9IHwgVGhpcyBpcyBhIGJ1ZyBpbiBkZXZjZXJ0LCBwbGVhc2UgcmVwb3J0IHRoZSBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vZGF2ZXdhc21lci9kZXZjZXJ0L2lzc3Vlc2ApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWt0bXAoKSB7XHJcbiAgLy8gZGlzY2FyZERlc2NyaXB0b3IgYmVjYXVzZSB3aW5kb3dzIGNvbXBsYWlucyB0aGUgZmlsZSBpcyBpbiB1c2UgaWYgd2UgY3JlYXRlIGEgdG1wIGZpbGVcclxuICAvLyBhbmQgdGhlbiBzaGVsbCBvdXQgdG8gYSBwcm9jZXNzIHRoYXQgdHJpZXMgdG8gdXNlIGl0XHJcbiAgcmV0dXJuIHRtcC5maWxlU3luYyh7IGRpc2NhcmREZXNjcmlwdG9yOiB0cnVlIH0pLm5hbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWRvKGNtZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIHN1ZG9Qcm9tcHQuZXhlYyhjbWQsIHsgbmFtZTogJ2RldmNlcnQnIH0sIChlcnI6IEVycm9yIHwgbnVsbCwgc3Rkb3V0OiBzdHJpbmcgfCBudWxsLCBzdGRlcnI6IHN0cmluZyB8IG51bGwpID0+IHtcclxuICAgICAgbGV0IGVycm9yID0gZXJyIHx8ICh0eXBlb2Ygc3RkZXJyID09PSAnc3RyaW5nJyAmJiBzdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgJiYgbmV3IEVycm9yKHN0ZGVycikpIDtcclxuICAgICAgZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShzdGRvdXQpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuIl19