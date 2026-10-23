(() => {
 'use strict';
 const key='eternaluxe-bag-v1',roots=[...document.querySelectorAll('[data-bag-content]')];
 let entries=[];
 try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))entries=saved;}catch{}
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 fetch(`assets/bag-catalog.json?v=${document.body.dataset.assetVersion||'1'}`).then(r=>{if(!r.ok)throw Error();return r.json();}).then(catalog=>{
  const products=new Map(catalog.map(p=>[p.id,p]));
  entries=entries.filter(e=>products.has(e?.id)&&Number.isInteger(e.quantity)&&e.quantity>0&&e.quantity<=20).slice(0,30);
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(entries));}catch{}};
  const summary=()=>entries.map(e=>`${products.get(e.id).name} × ${e.quantity}`).join('\n');
  function render(){
   const count=entries.reduce((n,e)=>n+e.quantity,0);
   document.querySelectorAll('.bag-button').forEach(e=>e.setAttribute('aria-label',`Open bag, ${count} ${count===1?'piece':'pieces'}`));
   roots.forEach(root=>{
    root.replaceChildren();
    if(!entries.length){root.append(node('p','Your bag is empty.'));const a=node('a','Explore the collection','text-link');a.href='collections.html';root.append(a);return;}
    const list=node('ul',null,'bag-items');
    entries.forEach(entry=>{
     const p=products.get(entry.id),li=node('li',null,'bag-item');
     const image=node('img');image.src=`assets/media/${p.image}.jpg`;image.alt=p.name;image.width=90;image.height=110;
     const detail=node('div'),a=node('a',p.name);a.href=`product-${p.id}.html`;detail.append(a);
     detail.append(node('p',p.price==null?'By consultation':`From $${p.price}${p.type==='subscription'?' / month':''}`));
     const label=node('label','Quantity'),qty=node('input');qty.type='number';qty.min='1';qty.max='20';qty.value=entry.quantity;qty.setAttribute('aria-label',`Quantity for ${p.name}`);
     qty.addEventListener('change',()=>{entry.quantity=Math.max(1,Math.min(20,Math.floor(Number(qty.value)||1)));save();render();});label.append(qty);detail.append(label);
     const remove=node('button','Remove','text-link');remove.type='button';remove.setAttribute('aria-label',`Remove ${p.name}`);remove.addEventListener('click',()=>{entries=entries.filter(e=>e.id!==entry.id);save();render();});detail.append(remove);
     li.append(image,detail);list.append(li);
    });
    root.append(list,node('p','Final pricing, delivery and any subscription terms are confirmed with the atelier before payment.','bag-note'));
    const send=node('a','Enquire about these pieces','button');send.href='enquiries.html?bag=1&project=An%20arrangement';root.append(send);
   });
  }
  document.querySelectorAll('[data-bag-add]').forEach(button=>button.addEventListener('click',()=>{
   const id=button.dataset.bagAdd;if(!products.has(id))return;
   const current=entries.find(e=>e.id===id);if(current)current.quantity=Math.min(20,current.quantity+1);else entries.push({id,quantity:1});save();render();
   const feedback=button.nextElementSibling;if(feedback?.classList.contains('bag-feedback'))feedback.textContent='Added to your bag.';
   const dialog=document.querySelector('#bag-dialog');if(dialog&&!dialog.open){dialog.addEventListener('close',()=>button.focus(),{once:true});dialog.showModal();}
  }));
  const form=document.querySelector('[data-form="enquiry"]');
  if(form&&new URLSearchParams(location.search).get('bag')==='1'&&entries.length){form.elements.message.value=`I would like to enquire about these pieces:\n\n${summary()}\n\nPlease confirm the designs, delivery and final quote.`;}
  render();
 }).catch(()=>{
  roots.forEach(root=>{root.replaceChildren(node('p','Your bag could not load. Please refresh or contact the atelier.'));});
  document.querySelectorAll('[data-bag-add]').forEach(button=>{button.disabled=true;button.textContent='Please refresh to add to bag';});
 });
})();
