// Independently drawn customer wayfinding diagram based on the supplied plan.
// Geometry is schematic; no merchant is assigned by matching a name or category.
export const referencePlan={width:1400,height:720,focus:{x:0,y:0,width:1400,height:720}};
export const annexPlan={width:360,height:880,focus:{x:0,y:0,width:360,height:880}};
export const mapFamilies=[
 {id:'all',title:'全部',en:'All',color:'#718678'},
 {id:'seafood',title:'买海鲜',en:'Seafood',color:'#5b9fbb'},
 {id:'produce',title:'买蔬果',en:'Produce',color:'#87aa67'},
 {id:'meat',title:'买肉禽',en:'Meat',color:'#d6887d'},
 {id:'pantry',title:'副食调料',en:'Pantry',color:'#bea15a'},
 {id:'cooked',title:'熟食小吃',en:'Ready to eat',color:'#d5a16a'},
 {id:'facilities',title:'出入与设施',en:'Facilities',color:'#82958b'}
];
const entries=[
 ['seafood','海鲜档','Seafood','#28658c',[[401,574,166,94],[596,575,262,65],[596,669,260,66],[447,776,118,85],[677,770,180,69],[680,841,61,98],[875,577,80,64],[470,474,66,65],[855,474,98,65],[411,410,210,31],[762,410,70,31]]],
 ['chilled','冰鲜档','Chilled seafood','#20bdc3',[[976,473,100,66],[1098,473,100,66],[1221,473,125,66]]],
 ['shellfish','贝壳档','Shellfish','#26958e',[[561,474,123,31],[714,474,117,31]]],
 ['pond','塘鱼档','Pond fish','#8980fb',[[858,409,211,31]]],
 ['river','河鲜档','River seafood','#66d5ef',[[1071,409,71,31]]],
 ['oysters','生蚝档','Oysters','#6ca8ba',[[812,842,45,96]]],
 ['fishers','流动渔民档','Fishers’ stalls','#4994cf',[[595,771,59,167],[875,770,82,166],[253,668,66,267]]],
 ['cold','冰库','Cold storage','#78c7d8',[[188,251,102,98]]],
 ['pork','猪肉档','Pork','#f35e61',[[1367,714,98,105],[1367,849,99,69]]],
 ['beef','牛肉档','Beef','#fa7c42',[[1224,713,116,108]]],
 ['chicken','光鸡档','Poultry','#ffd0bb',[[1284,409,69,32]]],
 ['vegetables','蔬菜档','Vegetables','#98c578',[[1370,473,90,67],[1481,473,90,67],[1594,473,69,67]]],
 ['fruit','水果档','Fruit','#adbf73',[[1580,863,48,38]]],
 ['snacks','小吃店','Snacks','#ffcc73',[[1575,574,91,158],[1092,802,74,105],[1224,849,116,69]]],
 ['roast','烧腊卤味店','Roast & braised foods','#ff9c68',[[1449,410,65,31],[1588,410,73,31],[1502,575,71,50],[1502,671,48,62]]],
 ['other','其他','Other','#e0e772',[]],
 ['grocery','副食品','Groceries','#ffe368',[[1368,574,98,114]]],
 ['seasoning','中西餐调料','Seasonings','#b8dfb3',[[742,842,68,96],[1504,734,70,42]]],
 ['frozen','冻品店','Frozen foods','#59a470',[[1125,577,62,152],[1228,576,113,63]]],
 ['dry','干货店','Dried goods','#f5f7a4',[]],
 ['sundries','杂货店','General goods','#bcebd9',[]],
 ['tofu','鱼丸豆制品','Fish balls & tofu','#ff8992',[[1068,577,57,152],[1000,777,39,75],[1156,811,32,62]]],
 ['stairs','楼梯','Stairs','#82786b',[[406,668,86,111],[1037,792,63,66],[1573,669,61,108],[1632,792,48,116]]],
 ['access','无障碍通道','Accessible passages','#5d7052',[[1437,934,74,44],[1657,925,35,56]]]
];

const families={seafood:'seafood',chilled:'seafood',shellfish:'seafood',pond:'seafood',river:'seafood',oysters:'seafood',fishers:'seafood',cold:'facilities',pork:'meat',beef:'meat',chicken:'meat',vegetables:'produce',fruit:'produce',snacks:'cooked',roast:'cooked',other:'pantry',grocery:'pantry',seasoning:'pantry',frozen:'pantry',dry:'pantry',sundries:'pantry',tofu:'pantry',stairs:'facilities',access:'facilities'};
const shortNames={seafood:'海鲜',chilled:'冰鲜',shellfish:'贝类',pond:'塘鱼',river:'河鲜',oysters:'生蚝',fishers:'渔民鲜货',cold:'冰库',pork:'猪肉',beef:'牛肉',chicken:'禽类',vegetables:'蔬菜',fruit:'水果',snacks:'小吃',roast:'烧腊',grocery:'副食品',seasoning:'调料',frozen:'冻品',tofu:'鱼丸豆品',stairs:'楼梯',access:'无障碍'};
const aliases={seafood:'鱼 虾 蟹 海鱼 seafood fish shrimp crab',chilled:'鱼 冰鲜 冷鲜',shellfish:'蛤蜊 蚬 贝壳 扇贝',pond:'淡水鱼 鲫鱼 鲩鱼',river:'河虾 淡水鱼',oysters:'蚝 生蚝 牡蛎',fishers:'鱼虾 蟹 海鲜',pork:'猪肉 排骨 瘦肉',beef:'牛肉 牛腩',chicken:'鸡 鸭 禽肉',vegetables:'菜 青菜 番茄 土豆',fruit:'水果 苹果 香蕉',snacks:'吃饭 小吃 早餐',roast:'烧腊 卤味 熟食',grocery:'副食品 食品',seasoning:'调料 酱油 盐 油',frozen:'冻品 冷冻',dry:'干货',sundries:'杂货',tofu:'鱼丸 豆腐 豆制品',stairs:'上楼 下楼 楼梯',access:'轮椅 无障碍 进出 通道'};
export const referenceAreas=entries.map(([id,title,titleEn,_color,boxes])=>{
 const family=families[id],palette=mapFamilies.find(f=>f.id===family);
 return {id,title,titleEn,short:shortNames[id]||title,family,color:palette.color,description:aliases[id]||title,facility:family==='facilities',boxes:boxes.map(([x,y,width,height])=>x<350?{x:x-120,y:y-80,width,height,plan:'annex'}:{x:x-360,y:y-350,width,height,plan:'main'})};
});
export const mainEntrances=[{x:225,y:620},{x:518,y:620},{x:625,y:620},{x:735,y:620},{x:850,y:620},{x:1007,y:620}];
export function areaBounds(area,plan='main') {return area.boxes.filter(b=>b.plan===plan);}
