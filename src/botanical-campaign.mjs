// The owner's actual arrangements remain intact; backgrounds and plinths are layout.
const arrangement=(number,alt)=>`<picture class="campaign-arrangement"><source media="(max-width:700px)" srcset="assets/brand/campaign-arrangement-${number}-640.webp"><img src="assets/brand/campaign-arrangement-${number}-1040.webp" width="${number===3?942:1040}" height="${number===3?1398:1223}" alt="${alt}" loading="lazy" decoding="async"></picture>`;

export function botanicalCampaign(){
 return `<section class="botanical-campaign" aria-label="Floral compositions, considered in every detail">
  <article class="campaign-panel campaign-panel--blue" data-campaign aria-labelledby="campaign-blue-title">
   <div class="campaign-copy" data-content-safe>
    <p class="eyebrow">Sculptural arrangements</p>
    <h2 id="campaign-blue-title"><span>A softer </span><span>kind of </span><span>statement.</span></h2>
    <p>Composed for the spaces you love.</p>
    <a class="text-link" href="collections.html?collection=table">Explore the collection <span aria-hidden="true">↗</span></a>
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
