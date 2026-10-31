// Development-only preview data; never imported into production.
import {seafoodItems} from './seafood-data.js';
import {merchantCategories,merchantStalls} from './merchant-data.js';
const encyclopedia=seafoodItems.map(k=>({id:k.id,name:k.name,nameEn:k.nameEn,category:k.category,categoryEn:k.categoryEn,alias:k.alias,aliasEn:k.aliasEn,scientificName:k.sci,taste:k.taste,tasteEn:k.tasteEn,season:k.season,seasonEn:k.seasonEn,cooking:k.cooking,cookingEn:k.cookingEn,origin:k.origin,originEn:k.originEn,photos:[{id:'k-'+k.id,localUrl:k.photo}]}));
// 商户来自「商户基础信息(2).xls」208 家：卡片只展示店名 / 档位号 / 经营品类
const stalls=merchantStalls.map(s=>({id:s.id,name:s.name,nameEn:'',code:s.code,goods:s.goods,goodsEn:s.goodsEn,categoryId:s.categoryId,floorId:'',zoneId:'',intro:'',introEn:'',message:'',messageEn:'',photos:[],designPreview:true}));
export const previewData={schemaVersion:'1.0',revision:0,market:{id:'design-preview',name:'蛇口市场'},categories:merchantCategories,stalls,floors:[],encyclopedia};
