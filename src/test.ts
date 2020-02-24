//import {certificateFor} from './index';
import {sudo} from './utils';
import {certificateFor} from './index';

console.log(`${process.execPath} ${require.resolve('hostile/bin/cmd')} set 127.0.0.1 foo.foo`)


sudo(`"${process.execPath}" "${require.resolve('hostile/bin/cmd')}" set 127.0.0.1 foo.foo`);

certificateFor('foo.bar');
//certificateFor("foo.foo", {skipCertutilInstall:true});
