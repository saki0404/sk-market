// Original, two-tone wayfinding pictograms. Color comes from the surrounding
// category; tinted planes add weight without competing with the map labels.
const tint=(d,opacity=.18)=>({d,fill:'currentColor','fill-opacity':opacity,stroke:'none',class:'map-pictogram-tint'});
const solid=d=>({d,fill:'currentColor',stroke:'none'});
const paths={
 all:[tint('M4 3.5h5.5v6H4zM14.5 3.5H20v6h-5.5zM4 14.5h5.5v6H4zM14.5 14.5H20v6h-5.5z'), 'M4 3.5h5.5v6H4zM14.5 3.5H20v6h-5.5zM4 14.5h5.5v6H4zM14.5 14.5H20v6h-5.5z'],
 seafood:[
  tint('M2.5 12c3.4-5.6 9.4-6.7 14-2.4l5-3v10.8l-5-3C11.9 18.7 5.9 17.6 2.5 12Z'),
  tint('m16.5 9.6 5-3v10.8l-5-3c.9-1.6.9-3.2 0-4.8Z',.22),
  'M2.5 12c3.4-5.6 9.4-6.7 14-2.4l5-3v10.8l-5-3C11.9 18.7 5.9 17.6 2.5 12ZM14.6 8.2c-1.7 2.3-1.7 5.3 0 7.6M8.5 7.4 11 4l2.3 3.3',
  solid('M7 10.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z')
 ],
 produce:[
  tint('M11.5 16.5C5.3 16.1 3 11.6 3.5 5c6.4.2 10 3.4 8 11.5ZM11.5 10.5c0-5 2.6-7.8 7-8-.1 3.6-1.8 6.4-6.2 7.9'),
  tint('M15.3 20.9c-3.6 0-5.4-3-5-5.8.3-2.7 2.7-4.2 5-2.8 2.3-1.4 4.7.1 5 2.8.4 2.8-1.4 5.8-5 5.8Z',.22),
  'M10.1 16.3C5.5 15.5 3 11.3 3.5 5c5.7.2 9 2.7 8.3 7.6M7 9l4.5 6M11.5 10.5c0-5 2.6-7.8 7-8-.1 3.6-1.8 6.4-6.2 7.9M15.3 20.9c-3.6 0-5.4-3-5-5.8.3-2.7 2.7-4.2 5-2.8 2.3-1.4 4.7.1 5 2.8.4 2.8-1.4 5.8-5 5.8ZM15.3 12.3v-2.2M13.4 11.5l1.9 1 1.9-1'
 ],
 meat:[
  tint('M8 4.2c4.4-2.6 10.3-.5 12 3.7 1.8 4.5-.8 10.2-5.7 11.9-4.6 1.6-10.7-.5-11.2-4.7-.5-3.7 3-4.6 3.3-7 .1-1.8.4-3.2 1.6-3.9Z'),
  'M8 4.2c4.4-2.6 10.3-.5 12 3.7 1.8 4.5-.8 10.2-5.7 11.9-4.6 1.6-10.7-.5-11.2-4.7-.5-3.7 3-4.6 3.3-7 .1-1.8.4-3.2 1.6-3.9ZM10.4 7.7c2.6-1.5 5.9.3 6 3 .1 2.7-2.4 5.2-5 5.1-2.5-.1-4-1.9-3-4.2.6-1.6.8-3.1 2-3.9Z',
  solid('M12.3 10.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z')
 ],
 pantry:[
  tint('M3.5 9.5h17l-2 11h-13l-2-11Z'),
  tint('M3.5 9.5h17l-.6 3H4.1l-.6-3Z',.22),
  'M3.5 9.5h17l-2 11h-13l-2-11ZM7 9.5l5-6 5 6M2.5 9.5h19M8 14v3M12 14v3M16 14v3'
 ],
 cooked:[
  tint('M3 12.5h18c-.6 4.8-3.8 7.5-9 7.5s-8.4-2.7-9-7.5Z'),
  tint('M3 12.5h18l-.7 2.5H3.7L3 12.5Z',.22),
  'M3 12.5h18c-.6 4.8-3.8 7.5-9 7.5s-8.4-2.7-9-7.5ZM7.5 20v1h9v-1M7 4c-2.2 2 2.2 3 0 5M12 2.5c-2.2 2.5 2.2 3.8 0 6.5M17 4c-2.2 2 2.2 3 0 5'
 ],
 stairs:[
  tint('M3.5 20.5h5.7v-5.7h5.6V9.2h5.7v11.3h-17Z',.22),
  'M3.5 20.5h5.7v-5.7h5.6V9.2h5.7M3.5 11l7.5-7.5M5.5 3.5H11V9'
 ],
 access:[
  tint('M9.5 10a5.8 5.8 0 1 0 5.5 8.8L9.5 10Z'),
  solid('M10.8 2a1.8 1.8 0 1 0 0 3.6A1.8 1.8 0 0 0 10.8 2Z'),
  'M10.5 7v7h6l3.8 6M10.5 9.5H16M7 10.3a6 6 0 1 0 7.8 8.6M17 14l1.5 5.5H21'
 ],
 search:[tint('M18.5 10.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0'), 'M16.5 16.5 21 21M18.5 10.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0'],
 arrow:['M4 12h16M14 6l6 6-6 6'],
 chevron:['m9 5 7 7-7 7'],
 pin:[tint('M19 9c0 5.3-7 12-7 12S5 14.3 5 9a7 7 0 0 1 14 0Z'), 'M19 9c0 5.3-7 12-7 12S5 14.3 5 9a7 7 0 0 1 14 0ZM14.5 9a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0'],
 cold:[
  tint('m12 5.5 5.6 3.3v6.4L12 18.5l-5.6-3.3V8.8L12 5.5Z'),
  'M12 2.5v19M3.8 7.3l16.4 9.4M3.8 16.7l16.4-9.4M9 4l3 3 3-3M9 20l3-3 3 3M4 10.5l4-1-1-4M17 18.5l-1-4 4-1M7 18.5l1-4-4-1M20 10.5l-4-1 1-4'
 ],
 exit:[tint('M4 3.5h6v17H4v-17Z'), 'M10 3.5H4v17h6M10 12h11M16.5 7.5 21 12l-4.5 4.5'],
 fruit:[
  tint('M12 7.5C7.5 3.5 2.7 7.3 4 13c1.3 5.6 4.8 8.5 8 6.5 3.2 2 6.7-.9 8-6.5 1.3-5.7-3.5-9.5-8-5.5Z'),
  tint('M12 6C8.8 6 7 4.7 7 2.5c3.2 0 5 1.4 5 3.5Z',.22),
  'M12 7.5C7.5 3.5 2.7 7.3 4 13c1.3 5.6 4.8 8.5 8 6.5 3.2 2 6.7-.9 8-6.5 1.3-5.7-3.5-9.5-8-5.5ZM12 7.5c0-3 1-4.5 3-5M12 6C8.8 6 7 4.7 7 2.5c3.2 0 5 1.4 5 3.5'
 ],
 beef:[
  tint('M5.2 8c-1.3-2-2.2-2.5-3.2-2 .1 2.7 1.1 4.2 3.4 4.5L7 5.5h10l1.6 5c2.3-.3 3.3-1.8 3.4-4.5-1-.5-1.9 0-3.2 2L19 12l-2 7H7l-2-7 .2-4Z'),
  tint('M8 14.5h8v6H8v-6Z',.22),
  'M5 8c-.9-1.7-1.8-2.3-3-2 .1 3 1.3 4.5 3.8 4.5M19 8c.9-1.7 1.8-2.3 3-2-.1 3-1.3 4.5-3.8 4.5M7 5.5l-2 6L7 19h10l2-7.5-2-6H7ZM8 14.5h8v6H8z',
  solid('M8.4 10a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8ZM15.6 10a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8ZM10 16.5a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4ZM14 16.5a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4Z')
 ],
 chicken:[
  tint('M8 11c-3.1-4 1-8.6 5.5-7.1 4.7 1.6 5.4 7.6 1 10.1-2 1.2-3.7 1.1-5.3.3L8 11Z'),
  'M8 11c-3.1-4 1-8.6 5.5-7.1 4.7 1.6 5.4 7.6 1 10.1-2 1.2-3.7 1.1-5.3.3L5.5 18M6.5 17l-2-2c-2-1-3 1.3-1.7 2.6-.6 1.7 1.1 3.1 2.5 1.8l1.2-2.4Z'
 ],
 shellfish:[
  tint('M12 20c-3.2 0-8.8-6.2-9-10.2C2.8 6.1 5.4 4 8 5c1.1-2.7 6.9-2.7 8 0 2.6-1 5.2 1.1 5 4.8-.2 4-5.8 10.2-9 10.2Z'),
  'M12 20c-3.2 0-8.8-6.2-9-10.2C2.8 6.1 5.4 4 8 5c1.1-2.7 6.9-2.7 8 0 2.6-1 5.2 1.1 5 4.8-.2 4-5.8 10.2-9 10.2ZM12 6v14M7 8l5 12M17 8l-5 12M5 12l7 8M19 12l-7 8'
 ],
 tofu:[
  tint('M3.5 8.5 10 5l6.5 3.5v8L10 20l-6.5-3.5v-8Z'),
  tint('M3.5 8.5 10 12v8l-6.5-3.5v-8ZM12.5 3.5 16 2l5 3v7.5l-2 1V7l-6.5-3.5Z',.22),
  'M3.5 8.5 10 5l6.5 3.5v8L10 20l-6.5-3.5v-8ZM3.5 8.5 10 12l6.5-3.5M10 12v8M12.5 3.5 16 2l5 3v7.5l-2 1M12.5 3.5 19 7l2-2'
 ],
 'zoom-in':['M4 12h16M12 4v16'],
 'zoom-out':['M4 12h16'],
 overview:[tint('M3.5 4.5 9 2.5v17l-5.5 2v-17ZM15 4.5l5.5-2v17l-5.5 2v-17Z'), 'M3.5 4.5 9 2.5l6 2 5.5-2v17L15 21.5l-6-2-5.5 2v-17ZM9 2.5v17M15 4.5v17'],
 expand:['M9 3.5H3.5V9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15'],
 collapse:['M3.5 9H9V3.5M15 3.5V9h5.5M20.5 15H15v5.5M9 20.5V15H3.5']
};
paths.facilities=paths.stairs;
paths.vegetable=paths.produce;
paths.vegetables=paths.produce;
paths.pork=paths.meat;
paths.snacks=paths.cooked;
paths.roast=paths.cooked;
paths.frozen=paths.cold;
paths.seasoning=paths.pantry;
paths.grocery=paths.pantry;
paths.dry=paths.pantry;
paths.sundries=paths.pantry;
paths.chilled=paths.seafood;
paths.pond=paths.seafood;
paths.river=paths.seafood;
paths.fishers=paths.seafood;
paths.oysters=paths.shellfish;

export function glyph(kind,ns='http://www.w3.org/2000/svg'){
 const svg=document.createElementNS(ns,'svg');
 for(const [key,value]of Object.entries({viewBox:'0 0 24 24','aria-hidden':'true',fill:'none',stroke:'currentColor','stroke-width':'1.65','stroke-linecap':'round','stroke-linejoin':'round',focusable:'false'}))svg.setAttribute(key,value);
 for(const entry of paths[kind]||paths.all){
  const p=document.createElementNS(ns,'path'),attrs=typeof entry==='string'?{d:entry}:entry;
  for(const [key,value]of Object.entries(attrs))p.setAttribute(key,value);
  svg.append(p);
 }
 return svg;
}
