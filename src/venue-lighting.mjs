// All coordinates share the room photograph's 1774 × 887 camera plane.
// Shadows belong to their arrangement, so opacity changes affect both together.
const feet={
 table:[1287,477,43,7],console:[950,364,29,3],pedestal:[1652,375,23,3],
 'coral-table':[1291,475,39,6],'coral-console':[932,366,22,3],'coral-pedestal':[1646,375,17,3],
 'jewel-table':[1281,474,49,7],'jewel-console':[939,364,29,3],'jewel-pedestal':[1644,373,17,3],
 'signature-table':[1070,651,39,5],'signature-console':[285,455,15,3],'signature-pedestal':[1632,450,28,3],
 'garden-table':[1070,651,30,5],'garden-console':[285,455,27,3],'garden-pedestal':[1632,450,15,3]
};

export function venueLighting(name){
 if(name==='moss'||name.endsWith('-wall')){
  const id=`mount-${name}`;
  return `<svg class="venue-lighting venue-wall-lighting" viewBox="0 0 1774 887" aria-hidden="true" focusable="false"><defs>
  <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
   <feGaussianBlur in="SourceAlpha" stdDeviation="1.1"/><feOffset dx="-1.4" dy="2.4" result="contact"/>
   <feFlood flood-color="#302317" flood-opacity=".64"/><feComposite in2="contact" operator="in" result="contactShade"/>
   <feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dx="-5" dy="7" result="cast"/>
   <feFlood flood-color="#493520" flood-opacity=".32"/><feComposite in2="cast" operator="in" result="castShade"/>
   <feGaussianBlur in="SourceAlpha" stdDeviation="8"/><feOffset dx="-9" dy="11" result="ambient"/>
   <feFlood flood-color="#503f2b" flood-opacity=".15"/><feComposite in2="ambient" operator="in" result="ambientShade"/>
   <feMerge><feMergeNode in="ambientShade"/><feMergeNode in="castShade"/><feMergeNode in="contactShade"/></feMerge>
  </filter></defs><image href="assets/scene/${name}.webp" width="1774" height="887" filter="url(#${id})"/></svg>`;
 }
 const foot=feet[name];
 if(!foot)return '';
 const [x,y,rx,ry]=foot;
 const part=name.split('-').at(-1),id=`light-${name}`;
 const flatten=part==='table'?.12:.035;
 const shear=part==='table'?.55:.48;
 const surface=part==='table'
  ? '<ellipse cx="1060" cy="650" rx="415" ry="32"/>'
  :part==='console'
   ? '<ellipse cx="265" cy="457" rx="205" ry="10"/>'
   : '<ellipse cx="1632" cy="450" rx="80" ry="8"/>';
 return `<svg class="venue-lighting" viewBox="0 0 1774 887" aria-hidden="true" focusable="false"><defs>
 <clipPath id="${id}-surface">${surface}</clipPath>
 <filter id="${id}-cast" x="-40%" y="-70%" width="180%" height="240%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .12 0 0 0 0 .095 0 0 0 0 .065 0 0 0 .4 0"/><feGaussianBlur stdDeviation="2.5"/></filter>
 <radialGradient id="${id}-contact"><stop stop-color="#281b10" stop-opacity=".78"/><stop offset=".42" stop-color="#392817" stop-opacity=".48"/><stop offset="1" stop-color="#392817" stop-opacity="0"/></radialGradient>
 <radialGradient id="${id}-bounce"><stop stop-color="#58402b" stop-opacity=".25"/><stop offset="1" stop-color="#58402b" stop-opacity="0"/></radialGradient>
 </defs><g clip-path="url(#${id}-surface)">
 <g filter="url(#${id}-cast)"><image href="assets/scene/${name}.webp" width="1774" height="887" transform="matrix(1 0 ${shear} ${-flatten} ${-shear*y} ${(1+flatten)*y})"/></g>
 <image href="assets/scene/${name}.webp" width="1774" height="887" opacity=".08" transform="matrix(1 0 0 -.09 0 ${1.09*y})"/>
 <ellipse cx="${x-rx*.35}" cy="${y-1}" rx="${rx*2.2}" ry="${ry*2.3}" fill="url(#${id}-bounce)"/>
 </g><ellipse cx="${x}" cy="${y}" rx="${rx*1.45}" ry="${ry}" fill="url(#${id}-contact)"/></svg>`;
}
