"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const certificate_authority_1 = tslib_1.__importDefault(require("./certificate-authority"));
const certificates_1 = tslib_1.__importDefault(require("./certificates"));
const user_interface_1 = tslib_1.__importDefault(require("./user-interface"));
const debug = debug_1.default('devcert');
/**
 * Request an SSL certificate for the given app name signed by the devcert root
 * certificate authority. If devcert has previously generated a certificate for
 * that app name on this machine, it will reuse that certificate.
 *
 * If this is the first time devcert is being run on this machine, it will
 * generate and attempt to install a root certificate authority.
 *
 * Returns a promise that resolves with { key, cert }, where `key` and `cert`
 * are Buffers with the contents of the certificate private key and certificate
 * file, respectively
 */
function certificateFor(domain, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Certificate requested for ${domain}. Skipping certutil install: ${Boolean(options.skipCertutilInstall)}. Skipping hosts file: ${Boolean(options.skipHostsFile)}`);
        if (options.ui) {
            Object.assign(user_interface_1.default, options.ui);
        }
        if (!constants_1.isMac && !constants_1.isLinux && !constants_1.isWindows) {
            throw new Error(`Platform not supported: "${process.platform}"`);
        }
        if (!command_exists_1.sync('openssl')) {
            throw new Error('OpenSSL not found: OpenSSL is required to generate SSL certificates - make sure it is installed and available in your PATH');
        }
        let domainKeyPath = constants_1.pathForDomain(domain, `private-key.key`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        if (!fs_1.existsSync(constants_1.rootCAKeyPath)) {
            debug('Root CA is not installed yet, so it must be our first run. Installing root CA ...');
            yield certificate_authority_1.default(options);
        }
        if (!fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`))) {
            debug(`Can't find certificate file for ${domain}, so it must be the first request for ${domain}. Generating and caching ...`);
            yield certificates_1.default(domain);
        }
        if (!options.skipHostsFile) {
            yield platforms_1.default.addDomainToHostFileIfMissing(domain);
        }
        debug(`Returning domain certificate`);
        return {
            key: fs_1.readFileSync(domainKeyPath),
            cert: fs_1.readFileSync(domainCertPath)
        };
    });
}
exports.certificateFor = certificateFor;
function hasCertificateFor(domain) {
    return fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`));
}
exports.hasCertificateFor = hasCertificateFor;
function configuredDomains() {
    return fs_1.readdirSync(constants_1.domainsDir);
}
exports.configuredDomains = configuredDomains;
function removeDomain(domain) {
    return rimraf_1.default.sync(constants_1.pathForDomain(domain));
}
exports.removeDomain = removeDomain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiQzovU291cmNlL2RldmNlcnQvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCw0REFBNEI7QUFDNUIsMkNBT3FCO0FBQ3JCLG9FQUEwQztBQUMxQyw0RkFBa0U7QUFDbEUsMEVBQXVEO0FBQ3ZELDhFQUFxRDtBQUVyRCxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFRckM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCx3QkFBcUMsTUFBYyxFQUFFLFVBQW1CLEVBQUU7O1FBQ3hFLEtBQUssQ0FBQyw2QkFBOEIsTUFBTyxnQ0FBaUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBRSwwQkFBMkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0ssSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO1lBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyx3QkFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksQ0FBQyxpQkFBSyxJQUFJLENBQUMsbUJBQU8sSUFBSSxDQUFDLHFCQUFTLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNkIsT0FBTyxDQUFDLFFBQVMsR0FBRyxDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLENBQUMscUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDRIQUE0SCxDQUFDLENBQUM7U0FDL0k7UUFFRCxJQUFJLGFBQWEsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELElBQUksY0FBYyxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxDQUFDLG1GQUFtRixDQUFDLENBQUM7WUFDM0YsTUFBTSwrQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxlQUFNLENBQUMseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxFQUFFO1lBQ3JELEtBQUssQ0FBQyxtQ0FBb0MsTUFBTyx5Q0FBMEMsTUFBTyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2xJLE1BQU0sc0JBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMxQixNQUFNLG1CQUFlLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUN0QyxPQUFPO1lBQ0wsR0FBRyxFQUFFLGlCQUFRLENBQUMsYUFBYSxDQUFDO1lBQzVCLElBQUksRUFBRSxpQkFBUSxDQUFDLGNBQWMsQ0FBQztTQUMvQixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBckNELHdDQXFDQztBQUVELDJCQUFrQyxNQUFjO0lBQzlDLE9BQU8sZUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBRkQsOENBRUM7QUFFRDtJQUNFLE9BQU8sZ0JBQU8sQ0FBQyxzQkFBVSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDhDQUVDO0FBRUQsc0JBQTZCLE1BQWM7SUFDekMsT0FBTyxnQkFBTSxDQUFDLElBQUksQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVhZEZpbGVTeW5jIGFzIHJlYWRGaWxlLCByZWFkZGlyU3luYyBhcyByZWFkZGlyLCBleGlzdHNTeW5jIGFzIGV4aXN0cyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IHsgc3luYyBhcyBjb21tYW5kRXhpc3RzIH0gZnJvbSAnY29tbWFuZC1leGlzdHMnO1xyXG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XHJcbmltcG9ydCB7XHJcbiAgaXNNYWMsXHJcbiAgaXNMaW51eCxcclxuICBpc1dpbmRvd3MsXHJcbiAgcGF0aEZvckRvbWFpbixcclxuICBkb21haW5zRGlyLFxyXG4gIHJvb3RDQUtleVBhdGhcclxufSBmcm9tICcuL2NvbnN0YW50cyc7XHJcbmltcG9ydCBjdXJyZW50UGxhdGZvcm0gZnJvbSAnLi9wbGF0Zm9ybXMnO1xyXG5pbXBvcnQgaW5zdGFsbENlcnRpZmljYXRlQXV0aG9yaXR5IGZyb20gJy4vY2VydGlmaWNhdGUtYXV0aG9yaXR5JztcclxuaW1wb3J0IGdlbmVyYXRlRG9tYWluQ2VydGlmaWNhdGUgZnJvbSAnLi9jZXJ0aWZpY2F0ZXMnO1xyXG5pbXBvcnQgVUksIHsgVXNlckludGVyZmFjZSB9IGZyb20gJy4vdXNlci1pbnRlcmZhY2UnO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydCcpO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcclxuICBza2lwQ2VydHV0aWxJbnN0YWxsPzogdHJ1ZSxcclxuICBza2lwSG9zdHNGaWxlPzogdHJ1ZSxcclxuICB1aT86IFVzZXJJbnRlcmZhY2VcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlcXVlc3QgYW4gU1NMIGNlcnRpZmljYXRlIGZvciB0aGUgZ2l2ZW4gYXBwIG5hbWUgc2lnbmVkIGJ5IHRoZSBkZXZjZXJ0IHJvb3RcclxuICogY2VydGlmaWNhdGUgYXV0aG9yaXR5LiBJZiBkZXZjZXJ0IGhhcyBwcmV2aW91c2x5IGdlbmVyYXRlZCBhIGNlcnRpZmljYXRlIGZvclxyXG4gKiB0aGF0IGFwcCBuYW1lIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbCByZXVzZSB0aGF0IGNlcnRpZmljYXRlLlxyXG4gKlxyXG4gKiBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIGRldmNlcnQgaXMgYmVpbmcgcnVuIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbFxyXG4gKiBnZW5lcmF0ZSBhbmQgYXR0ZW1wdCB0byBpbnN0YWxsIGEgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXHJcbiAqXHJcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB7IGtleSwgY2VydCB9LCB3aGVyZSBga2V5YCBhbmQgYGNlcnRgXHJcbiAqIGFyZSBCdWZmZXJzIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBjZXJ0aWZpY2F0ZSBwcml2YXRlIGtleSBhbmQgY2VydGlmaWNhdGVcclxuICogZmlsZSwgcmVzcGVjdGl2ZWx5XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2VydGlmaWNhdGVGb3IoZG9tYWluOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSkge1xyXG4gIGRlYnVnKGBDZXJ0aWZpY2F0ZSByZXF1ZXN0ZWQgZm9yICR7IGRvbWFpbiB9LiBTa2lwcGluZyBjZXJ0dXRpbCBpbnN0YWxsOiAkeyBCb29sZWFuKG9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCkgfS4gU2tpcHBpbmcgaG9zdHMgZmlsZTogJHsgQm9vbGVhbihvcHRpb25zLnNraXBIb3N0c0ZpbGUpIH1gKTtcclxuXHJcbiAgaWYgKG9wdGlvbnMudWkpIHtcclxuICAgIE9iamVjdC5hc3NpZ24oVUksIG9wdGlvbnMudWkpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFpc01hYyAmJiAhaXNMaW51eCAmJiAhaXNXaW5kb3dzKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBsYXRmb3JtIG5vdCBzdXBwb3J0ZWQ6IFwiJHsgcHJvY2Vzcy5wbGF0Zm9ybSB9XCJgKTtcclxuICB9XHJcblxyXG4gIGlmICghY29tbWFuZEV4aXN0cygnb3BlbnNzbCcpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09wZW5TU0wgbm90IGZvdW5kOiBPcGVuU1NMIGlzIHJlcXVpcmVkIHRvIGdlbmVyYXRlIFNTTCBjZXJ0aWZpY2F0ZXMgLSBtYWtlIHN1cmUgaXQgaXMgaW5zdGFsbGVkIGFuZCBhdmFpbGFibGUgaW4geW91ciBQQVRIJyk7XHJcbiAgfVxyXG5cclxuICBsZXQgZG9tYWluS2V5UGF0aCA9IHBhdGhGb3JEb21haW4oZG9tYWluLCBgcHJpdmF0ZS1rZXkua2V5YCk7XHJcbiAgbGV0IGRvbWFpbkNlcnRQYXRoID0gcGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKTtcclxuXHJcbiAgaWYgKCFleGlzdHMocm9vdENBS2V5UGF0aCkpIHtcclxuICAgIGRlYnVnKCdSb290IENBIGlzIG5vdCBpbnN0YWxsZWQgeWV0LCBzbyBpdCBtdXN0IGJlIG91ciBmaXJzdCBydW4uIEluc3RhbGxpbmcgcm9vdCBDQSAuLi4nKTtcclxuICAgIGF3YWl0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eShvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIGlmICghZXhpc3RzKHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCkpKSB7XHJcbiAgICBkZWJ1ZyhgQ2FuJ3QgZmluZCBjZXJ0aWZpY2F0ZSBmaWxlIGZvciAkeyBkb21haW4gfSwgc28gaXQgbXVzdCBiZSB0aGUgZmlyc3QgcmVxdWVzdCBmb3IgJHsgZG9tYWluIH0uIEdlbmVyYXRpbmcgYW5kIGNhY2hpbmcgLi4uYCk7XHJcbiAgICBhd2FpdCBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlKGRvbWFpbik7XHJcbiAgfVxyXG5cclxuICBpZiAoIW9wdGlvbnMuc2tpcEhvc3RzRmlsZSkge1xyXG4gICAgYXdhaXQgY3VycmVudFBsYXRmb3JtLmFkZERvbWFpblRvSG9zdEZpbGVJZk1pc3NpbmcoZG9tYWluKTtcclxuICB9XHJcblxyXG4gIGRlYnVnKGBSZXR1cm5pbmcgZG9tYWluIGNlcnRpZmljYXRlYCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGtleTogcmVhZEZpbGUoZG9tYWluS2V5UGF0aCksXHJcbiAgICBjZXJ0OiByZWFkRmlsZShkb21haW5DZXJ0UGF0aClcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGFzQ2VydGlmaWNhdGVGb3IoZG9tYWluOiBzdHJpbmcpIHtcclxuICByZXR1cm4gZXhpc3RzKHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlZERvbWFpbnMoKSB7XHJcbiAgcmV0dXJuIHJlYWRkaXIoZG9tYWluc0Rpcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVEb21haW4oZG9tYWluOiBzdHJpbmcpIHtcclxuICByZXR1cm4gcmltcmFmLnN5bmMocGF0aEZvckRvbWFpbihkb21haW4pKTtcclxufSJdfQ==