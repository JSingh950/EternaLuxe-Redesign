import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
const args=process.argv.slice(2);
if(!args.includes('--authorized')){console.error('Use --authorized only for an approved internal/legal export. Output contains pseudonymous consent evidence.');process.exit(1);}
const db=new DatabaseSync(path.join(process.env.DATA_DIR||'.runtime','eternaluxe.sqlite'),{readOnly:true});
for(const row of db.prepare('SELECT * FROM consent_events ORDER BY rowid').all())process.stdout.write(JSON.stringify({...row,policies:JSON.parse(row.policies),states:JSON.parse(row.states)})+'\n');
db.close();
