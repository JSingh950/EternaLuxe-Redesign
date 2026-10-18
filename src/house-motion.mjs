// All sixteen owner-supplied photographs and three original films, deliberately sequenced.
export function houseMotion(img){
 const lanes=[
  ['scarlet-sculpture','green-study','orchid-console','film:orchid-film','ivory-salon','white-composition'],
  ['window-garden','amber-composition','film:house-film','branch-study','botanical-wall','garden-light'],
  ['house-portrait','ceramic-study','plum-study','film:ikebana-film','signature-orchids','branch-composition','night-garden']
 ];
 const frame=(id,i,duplicate)=>{
  const film=id.startsWith('film:');const key=film?id.slice(5):id;
  const media=film?`<video data-motion-video="${key}" muted loop playsinline preload="none" poster="assets/media/${key}-poster.jpg" aria-label="Eternaluxe ${key.replaceAll('-',' ')}"></video>`:img(id).replaceAll('80vw','32vw').replaceAll('100vw','65vw');
  const dimensions=media.match(/width="(\d+)" height="(\d+)"/);
  const ratio=film?(key==='house-film'?'16/9':'9/16'):(dimensions?`${dimensions[1]}/${dimensions[2]}`:'4/5');
  return `<figure class="motion-frame motion-frame-${i%3}" style="aspect-ratio:${ratio}" ${duplicate?'aria-hidden="true"':''}>${media}</figure>`;
 };
 return `<section class="house-motion" aria-labelledby="motion-title"><header class="motion-heading"><div><p class="eyebrow">The Eternaluxe collection</p><h2 id="motion-title">A world in composition.</h2></div><p>Flowers. Objects. Spaces.<br>The many expressions of the House.</p></header><div class="motion-canvas is-static" data-house-motion>${lanes.map((lane,row)=>`<div class="motion-lane"><div class="motion-track" data-direction="${row===1?1:-1}">${[false,true].map(copy=>`<div class="motion-group" ${copy?'aria-hidden="true"':''}>${lane.map((id,i)=>frame(id,i,copy)).join('')}</div>`).join('')}</div></div>`).join('')}<button class="film-toggle" data-motion-toggle aria-label="Pause moving collection" aria-pressed="true" hidden><span aria-hidden="true">Ⅱ</span></button></div></section>`;
}
