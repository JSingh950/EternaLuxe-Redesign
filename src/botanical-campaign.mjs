// The owner's actual arrangements remain intact; backgrounds and plinths are layout.
const dimensions={1:[862,1515],2:[1040,1258],3:[942,1398],4:[772,1407],5:[1040,1223],6:[1020,1281]};
const arrangement=(number,alt)=>`<picture class="campaign-arrangement"><source media="(max-width:700px)" srcset="assets/brand/campaign-arrangement-${number}-640.webp"><img src="assets/brand/campaign-arrangement-${number}-1040.webp" width="${dimensions[number][0]}" height="${dimensions[number][1]}" alt="${alt}" loading="lazy" decoding="async"></picture>`;

// Each story uses the owner's intact composition, on a surface with contact shadow.
const stories={
 house:{number:1,tone:'rose',eyebrow:'The House philosophy',lines:['Every stem.','An intention.'],copy:'A branch, a vessel, the quiet between flowers. Our creative language draws on ikebana: a sensitivity to line, balance and the relationship between a composition and its surroundings.',alt:'Pink and white flowers and trailing greenery in a tall blue-and-white ceramic vase',href:'house.html#ikebana',cta:'Explore our inspiration',sectionId:'house-philosophy'},
 collections:{number:2,tone:'blush',eyebrow:'A study in balance',lines:['Let the','room breathe.'],copy:'An arching stem. A sculptural vessel. A composition considered around the space it will inhabit. Share your setting and explore a direction with the atelier.',alt:'Two mauve calla lilies, pink flowers and a sweeping green branch in a black sculptural vase',href:'enquiries.html?project=An%20arrangement',cta:'Find your composition'},
 atelier:{number:4,tone:'sage',eyebrow:'Palette · Placement · Proportion',lines:['Made for','your space.'],copy:'A quiet corner or a statement entrance. We consider the vessel, the silhouette and the architecture together, shaping a botanical direction around your room.',alt:'Mauve calla lilies, red dahlias and fine green branches in a white Eternaluxe vessel',href:'enquiries.html?project=Residential',cta:'Begin a commission'},
 club:{number:6,tone:'blush',eyebrow:'The Floral Club',lines:['A new mood.','Every month.'],copy:'Bring a different perspective to a familiar space. Choose your scale, then confirm the palette, materials and delivery details with the atelier.',alt:'Pink carnations and dahlias, red flowers and leafy branches in a tall clear glass vase',href:'enquiries.html?project=Floral%20Club',cta:'Discuss your monthly service'}
};
export function editorialCampaign(key){
 const story=stories[key];if(!story)throw Error(`Unknown campaign: ${key}`);
 const id=`${key}-campaign-title`;
 return `<section class="editorial-campaign editorial-campaign--${story.tone} editorial-campaign--${key}" ${story.sectionId?`id="${story.sectionId}"`:''} aria-labelledby="${id}">
  <div class="editorial-curve" aria-hidden="true"><svg viewBox="0 0 1600 120" preserveAspectRatio="none" focusable="false"><path d="M0 70C380 160 1020-60 1600 60V120H0Z"/></svg></div>
  <article class="campaign-panel editorial-campaign-panel" data-campaign>
   <div class="campaign-copy" data-content-safe><p class="eyebrow">${story.eyebrow}</p><h2 id="${id}">${story.lines.map(line=>`<span>${line}</span>`).join('')}</h2><p>${story.copy}</p><a class="text-link" href="${story.href}">${story.cta}<span aria-hidden="true">↗</span></a></div>
   <figure class="campaign-stage"><div class="campaign-color-field" aria-hidden="true"></div><div class="campaign-plinth" aria-hidden="true"></div><div class="campaign-object" data-campaign-object>${arrangement(story.number,story.alt)}</div></figure>
  </article>
 </section>`;
}

export function botanicalCampaign(){
 return `<section class="botanical-campaign" aria-label="Floral compositions, considered in every detail">
  <article class="campaign-panel campaign-panel--blue" data-campaign aria-labelledby="campaign-blue-title">
   <div class="campaign-copy" data-content-safe>
    <p class="eyebrow">Sculptural arrangements</p>
    <h2 id="campaign-blue-title"><span>A softer </span><span>kind of </span><span>statement.</span></h2>
    <p>Composed for the spaces you love.</p>
    <a class="text-link" href="collections.html">Explore the collection <span aria-hidden="true">↗</span></a>
   </div>
   <figure class="campaign-stage" aria-label="Blue hydrangeas and white orchids, composed on a stone plinth">
    <div class="campaign-color-field" aria-hidden="true"></div>
    <div class="campaign-plinth" aria-hidden="true"></div>
    <div class="campaign-object" data-campaign-object>${arrangement(3,'Blue hydrangeas and white orchids with an arching green stem in an Eternaluxe ceramic vessel')}</div>
   </figure>
  </article>
  <div class="campaign-seam" aria-hidden="true"><svg viewBox="0 0 1600 220" preserveAspectRatio="none" focusable="false"><path d="M0 20C480 230 1130 20 1600 210V220H0Z"/></svg></div>
  <article class="campaign-panel campaign-panel--blush" data-campaign aria-labelledby="campaign-blush-title">
   <figure class="campaign-stage" aria-label="Pink flowers and sculptural foliage in a pebble-filled glass vase">
    <div class="campaign-color-field" aria-hidden="true"></div>
    <div class="campaign-plinth" aria-hidden="true"></div>
    <div class="campaign-object" data-campaign-object>${arrangement(5,'Pink calla lilies, pale tulips, peach dahlias and sweeping ferns in a glass vase filled with dark pebbles')}</div>
   </figure>
   <div class="campaign-copy" data-content-safe>
    <p class="eyebrow">Composed by nature</p>
    <h2 id="campaign-blush-title"><span>Form. </span><span>Feeling. </span><span>Flowers.</span></h2>
    <a class="text-link" href="atelier.html">Discover the Atelier <span aria-hidden="true">↗</span></a>
   </div>
   <div class="campaign-detail" aria-hidden="true"><img src="assets/brand/campaign-arrangement-5-640.webp" alt="" width="640" height="753" loading="lazy" decoding="async"></div>
  </article>
 </section>`;
}
