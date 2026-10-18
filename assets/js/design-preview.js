// Imported only by the Vite development build after an explicit ?preview=design choice.
const previewImage = name => new URL(`assets/images/design-${name}.png`,document.baseURI).href;
const seafood=previewImage('seafood'),vegetables=previewImage('vegetables'),meat=previewImage('meat');
const categoryNames=['海鲜水产','蔬菜水果','肉禽蛋','粮油干货','副食调料'];
export const previewData={schemaVersion:'1.0',revision:0,market:{id:'design-preview',name:'蛇口市场'},categories:categoryNames.map((name,i)=>({id:`preview-${i}`,name,nameEn:''})),stalls:[
  ['水产商户示意','新鲜食材 · 丰富选择',seafood],['蔬果商户示意','多样品类 · 品质生活',vegetables],['肉禽商户示意','地道风味 · 烟火气息',meat]
].map(([name,intro,photo],i)=>({id:`design-${i}`,name,code:'示意',nameEn:'',intro,introEn:'',message:'此处用于展示审核发布后的商户寄语。当前内容仅为设计预览。',messageEn:'',goods:[categoryNames[i]],categoryId:`preview-${i}`,floorId:'',zoneId:'',photos:[{localUrl:photo}],designPreview:true})),floors:[],encyclopedia:[]};
