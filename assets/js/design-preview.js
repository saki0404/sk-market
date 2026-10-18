// Development-only fictional profiles; never imported into production.
const previewImage = name => new URL(`assets/images/design-${name}.png`,document.baseURI).href;
const categoryNames=['海鲜水产','蔬菜水果','肉禽蛋','粮油干货','副食调料'];
const merchants=[
 ['水产商户示意一','新鲜食材 · 丰富选择','seafood',0],
 ['蔬果商户示意一','多样品类 · 品质生活','vegetables',1],
 ['肉禽商户示意一','地道风味 · 烟火气息','meat',2],
 ['水产商户示意二','虾蟹贝类 · 鲜活好味','seafood-2',0],
 ['蔬果商户示意二','时令根茎 · 丰盛餐桌','vegetables-2',1],
 ['肉禽商户示意二','禽肉鲜品 · 家常美味','meat-2',2],
];
export const previewData={schemaVersion:'1.0',revision:0,market:{id:'design-preview',name:'蛇口市场'},categories:categoryNames.map((name,i)=>({id:`preview-${i}`,name,nameEn:''})),stalls:merchants.map(([name,intro,image,category],i)=>({id:`design-${i}`,name,code:'示意',nameEn:'',intro,introEn:'',message:'此处用于展示审核发布后的商户寄语。当前内容仅为设计预览。',messageEn:'',goods:[categoryNames[category]],categoryId:`preview-${category}`,floorId:'',zoneId:'',photos:[{localUrl:previewImage(image)}],designPreview:true})),floors:[],encyclopedia:[]};
