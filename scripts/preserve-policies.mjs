import fs from 'node:fs/promises';
await fs.mkdir('src/policies',{recursive:true});
for(const key of ['terms','privacy','cookies','shipping','refunds','accessibility']){
 const target=`src/policies/${key}.html`;
 try { await fs.access(target); } catch {
  const html=await fs.readFile(`dist/${key}.html`,'utf8');
  const match=html.match(/<article class="policy-content">([\s\S]*?)<\/article>/);
  if(!match)throw new Error(`Policy not found: ${key}`);
  await fs.writeFile(target,match[1]);
 }
}
