import '../css/map-preview.css';
import {createMarketMap} from './market-map.js';
// Empty merchant list is intentional: the reference diagram is not a publication.
const data={stalls:[],categories:[],floors:[]};
const map=createMarketMap({data,state:{source:'reference'},onMerchant:()=>{}});
document.getElementById('map-root').append(map.element);
window.addEventListener('pagehide',()=>map.destroy(),{once:true});
