// Development-only fictional profiles; never imported into production.
const previewImage = name => new URL(`assets/images/design-${name}.png`,document.baseURI).href;
const categoryNames=[['海鲜水产','Seafood'],['蔬菜水果','Fresh Produce'],['肉禽蛋','Meat & Eggs'],['粮油干货','Grains & Pantry'],['副食调料','Condiments']];
const merchants=[
 ['水产商户示意一','Seafood Stall One','新鲜食材 · 丰富选择','Fresh picks · Wide choice','seafood',0],
 ['蔬果商户示意一','Produce Stall One','多样品类 · 品质生活','Variety · Quality life','vegetables',1],
 ['肉禽商户示意一','Meat Stall One','地道风味 · 烟火气息','Local flavors · Market vibes','meat',2],
 ['水产商户示意二','Seafood Stall Two','虾蟹贝类 · 鲜活好味','Shrimp, crab & shellfish','seafood-2',0],
 ['蔬果商户示意二','Produce Stall Two','时令根茎 · 丰盛餐桌','Seasonal roots · Full tables','vegetables-2',1],
 ['肉禽商户示意二','Meat Stall Two','禽肉鲜品 · 家常美味','Fresh poultry · Home taste','meat-2',2],
];
const encyclopedia=[
 {name:'波士顿龙虾',nameEn:'Boston Lobster',scientificName:'Homarus americanus',origin:'北美冷水海域，肉质紧实弹牙',features:'壳薄肉厚，鲜甜味浓',cooking:'清蒸或蒜蓉粉丝蒸，突出原味',photos:[{id:'k-0',localUrl:previewImage('seafood')}]},
 {name:'兰花蟹',nameEn:'Flower Crab',scientificName:'Portunus pelagicus',origin:'南海近海渔场，现捞现卖',features:'蟹肉细嫩，膏黄饱满',cooking:'姜葱炒或避风塘炒，香气十足',photos:[{id:'k-1',localUrl:previewImage('seafood-2')}]},
 {name:'生蚝',nameEn:'Oyster',scientificName:'Crassostrea gigas',origin:'近海洁净养殖场，肥美多汁',features:'蚝肉饱满，带海洋矿物风味',cooking:'炭烤蒜蓉或酥炸蚝仔烙',photos:[{id:'k-2',localUrl:previewImage('seafood')}]},
 {name:'石斑鱼',nameEn:'Grouper',scientificName:'Epinephelus coioides',origin:'温带礁区海捕，活力十足',features:'胶质丰富，鱼肉清甜细嫩',cooking:'清蒸后淋热油与豉油',photos:[{id:'k-3',localUrl:previewImage('seafood-2')}]},
];
export const previewData={schemaVersion:'1.0',revision:0,market:{id:'design-preview',name:'蛇口市场'},categories:categoryNames.map(([name,nameEn],i)=>({id:`preview-${i}`,name,nameEn})),stalls:merchants.map(([name,nameEn,intro,introEn,image,category],i)=>({id:`design-${i}`,name,code:'示意',nameEn,intro,introEn,message:'此处用于展示审核发布后的商户寄语。当前内容仅为设计预览。',messageEn:'A sample note shown for design preview only.',goods:[categoryNames[category][0]],categoryId:`preview-${category}`,floorId:'',zoneId:'',photos:[{localUrl:previewImage(image)}],designPreview:true})),floors:[],encyclopedia};
