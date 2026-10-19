// User-supplied first-floor drawing, 2026-10-19. Coordinates locate broad
// reference areas only; they are never used to assign a published merchant.
export const referencePlan={width:1888,height:1334,focus:{x:380,y:390,width:1320,height:590},west:{x:130,y:120,width:210,height:865}};
const entries=[
 ['seafood','海鲜档','Seafood','#28658c',[[401,574,166,94],[596,575,262,65],[596,669,260,66],[447,776,118,85]]],
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
export const referenceAreas=entries.map(([id,title,titleEn,color,boxes])=>({id,title,titleEn,color,facility:['stairs','access'].includes(id),boxes:boxes.map(([x,y,width,height])=>({x,y,width,height}))}));
