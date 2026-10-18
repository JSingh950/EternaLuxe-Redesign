// Proposed directions, not completed Eternaluxe projects or purchasable products.
export const wallConcepts=[
 {id:'framed-moss',name:'Framed Moss Art',image:'framed-moss',alt:'Concept: emerald and olive moss artwork in a slim champagne frame above a stone bench',style:'green',format:'framed-moss'},
 {id:'floral-relief',name:'Sculptural Floral Relief',image:'floral-relief',alt:'Concept: blush, coral and plum floral relief mounted above a walnut console',style:'blush plum scarlet mixed',format:'floral-relief'},
 {id:'modular-panels',name:'Modular Botanical Panels',image:'modular-panels',alt:'Concept: three framed botanical panels with plum, amber and blush accents',style:'green plum amber blush mixed',format:'modular-panels'}
].map(p=>({...p,concept:true,size:'Bespoke',type:'commission',occasion:'interiors',price:null}));
export const tableConcepts=[
 {id:'coral-table',name:'Coral & Scarlet',image:'coral-table',alt:'Concept: coral and scarlet poppies with orange flowers in a bronze bowl on travertine',style:'scarlet amber blush mixed'},
 {id:'plum-table',name:'Plum & Blush',image:'plum-table',alt:'Concept: plum callas and orchids with blush blooms in a champagne vase on walnut',style:'plum blush'},
 {id:'jewel-table',name:'The Jewel Composition',image:'jewel-table',alt:'Concept: blue, violet, yellow and coral flowers in a charcoal bowl on marble',style:'blue amber plum mixed'}
].map(p=>({...p,concept:true,size:'Bespoke',type:'commission',occasion:'interiors',price:null,format:'table'}));
export const concepts=[...wallConcepts,...tableConcepts];

