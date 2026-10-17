/* ======================= 数据 ======================= */
const CAT_COLOR = {
  seafood:'linear-gradient(135deg,#2ec7f0,#0e9fc4)',
  veggie :'linear-gradient(135deg,#63d97e,#22ac52)',
  grain  :'linear-gradient(135deg,#ffcf62,#f5a623)',
  meat   :'linear-gradient(135deg,#ff9070,#f0552f)',
  spice  :'linear-gradient(135deg,#b990f5,#8348e0)',
};
const CAT_TAG = { seafood:'#0e9fc4', veggie:'#22ac52', grain:'#e39200', meat:'#f0552f', spice:'#8348e0' };

const CATEGORIES = [
  { id:'seafood', ico:'🐟', zh:'水产类',     en:'Seafood',              zone:'A' },
  { id:'veggie',  ico:'🥬', zh:'蔬菜水果类', en:'Vegetables & Fruits',  zone:'C' },
  { id:'grain',   ico:'🌾', zh:'粮油干货类', en:'Grain & Dry Goods',    zone:'D' },
  { id:'meat',    ico:'🥩', zh:'肉禽蛋类',   en:'Meat, Poultry & Eggs', zone:'B' },
  { id:'spice',   ico:'🧂', zh:'副食调料类', en:'Spices & Condiments',  zone:'E' },
];

const SHOPS = {
  seafood:[
    { nm:'阿明水产', en:"A-Ming Seafood", loc:'A1-01', ico:'🐠', intro:'每天凌晨四点亲自去码头收货，只卖当日最新鲜的海味。', introEn:'We source at the dock at 4 AM daily — only the freshest catch of the day.', today:['基围虾','花蟹','石斑鱼','生蚝'] },
    { nm:'海记鱼档', en:'Hai-Ji Fish Stall', loc:'A1-05', ico:'🐟', intro:'三代老字号，斩鱼快、卖鱼鲜，街坊都信得过。', introEn:'A three-generation family stall trusted by neighbors for fresh fish.', today:['带鱼','黄花鱼','多宝鱼','鲳鱼'] },
    { nm:'湾仔贝类', en:'Wanzai Shellfish', loc:'A2-02', ico:'🦪', intro:'自养自销的蚝排，肥美多汁，蒜蓉清蒸都好吃。', introEn:'Oyster rafts grown and sold by ourselves — plump and juicy.', today:['生蚝','扇贝','鲍鱼','蛏子'] },
    { nm:'深湾虾蟹行', en:'Shenwan Shrimp & Crab', loc:'A2-08', ico:'🦀', intro:'活虾活蟹现捞现卖，膏满黄肥才算数。', introEn:'Live shrimp and crab picked on the spot — only full-roe ones make the grade.', today:['斯里兰卡蟹','肉蟹','濑尿虾','基围虾'] },
    { nm:'渔业公司直供档', en:'Fishery Direct Stall', loc:'A3-01', ico:'🦑', intro:'渔船直供，没有中间商，价格实在分量足。', introEn:'Straight from fishing boats — no middlemen, generous portions.', today:['鱿鱼','章鱼','海虾','马鲛鱼'] },
  ],
  veggie:[
    { nm:'阿芳菜档', en:"A-Fang Greens", loc:'C1-03', ico:'🥬', intro:'本地菜地每天两趟新鲜直送，水灵灵不打蔫。', introEn:'Twice-daily deliveries from local farms — crisp and fresh.', today:['菜心','芥兰','生菜','番茄'] },
    { nm:'山货鲜果', en:'Mountain Fresh Fruits', loc:'C2-01', ico:'🍎', intro:'当季水果只挑甜的卖，不甜包退。', introEn:'We only sell sweet, in-season fruit — money back if not sweet.', today:['苹果','砂糖橘','香蕉','葡萄'] },
    { nm:'惠农瓜菜', en:'Huinong Melons & Greens', loc:'C1-08', ico:'🥒', intro:'自家菜园，化肥少、虫害少，吃得放心。', introEn:'Our own garden plots — low pesticide, safe to eat.', today:['青瓜','冬瓜','苦瓜','土豆'] },
    { nm:'菇菌世家', en:'Mushroom House', loc:'C2-06', ico:'🍄', intro:'专做各类新鲜菇菌，煲汤炒菜一样鲜。', introEn:'Specialists in fresh mushrooms — great for soup or stir-fry.', today:['香菇','金针菇','白玉菇','木耳'] },
  ],
  grain:[
    { nm:'泰香米行', en:'Thai Fragrant Rice Co.', loc:'D1-01', ico:'🍚', intro:'二十年老米行，只卖当季新米，陈米绝不掺。', introEn:'A 20-year rice shop selling only current-season new rice.', today:['泰国香米','丝苗米','东北大米','糯米'] },
    { nm:'油坊人家', en:'Oil Press House', loc:'D1-06', ico:'🫗', intro:'现榨花生油，浓香无添加，炒菜一勺香满屋。', introEn:'Freshly pressed peanut oil — rich, pure, no additives.', today:['花生油','菜籽油','玉米油','芝麻油'] },
    { nm:'南北干货', en:'North-South Dry Goods', loc:'D2-02', ico:'🦐', intro:'香菇虾米瑶柱，煲汤配料一站买齐。', introEn:'Dried mushrooms, shrimp and scallops — one stop for soup ingredients.', today:['干虾米','瑶柱','香菇','红枣'] },
    { nm:'杂粮铺子', en:'Wholegrain Shop', loc:'D2-09', ico:'🫘', intro:'五谷杂粮现磨现卖，粗粮细吃更健康。', introEn:'Freshly milled whole grains — healthy eating made easy.', today:['小米','红豆','黑芝麻','燕麦'] },
  ],
  meat:[
    { nm:'标哥猪肉', en:"Biao-Gor Pork", loc:'B1-02', ico:'🥩', intro:'本地土猪当天现宰，前排五花随你挑。', introEn:'Locally raised pigs slaughtered daily — pick your own cut.', today:['五花肉','排骨','猪脚','筒骨'] },
    { nm:'粤香烧腊', en:'Yuexiang Roast Meats', loc:'B1-07', ico:'🍗', intro:'秘制烧鹅叉烧，皮脆肉嫩，每天新鲜出炉。', introEn:'Secret-recipe roast goose and char siu — crispy skin, tender meat.', today:['烧鹅','叉烧','白切鸡','烧排骨'] },
    { nm:'好鸡坊', en:'Good Poultry', loc:'B2-01', ico:'🐔', intro:'清远走地鸡，鸡味浓，煲汤一流。', introEn:'Free-range Qingyuan chicken — rich flavor, perfect for soup.', today:['清远鸡','老母鸡','鸽子','鸭'] },
    { nm:'蛋当家', en:'Egg Master', loc:'B2-05', ico:'🥚', intro:'农家散养蛋，蛋黄红、蛋香足。', introEn:'Free-range farm eggs — deep-orange yolks, full aroma.', today:['土鸡蛋','咸鸭蛋','皮蛋','鹌鹑蛋'] },
  ],
  spice:[
    { nm:'川味香料行', en:'Sichuan Spice House', loc:'E1-01', ico:'🌶️', intro:'花椒辣椒直邮四川，麻香正宗。', introEn:'Sichuan peppercorns and chilies shipped direct — authentic mala aroma.', today:['花椒','干辣椒','八角','桂皮'] },
    { nm:'老陈酱园', en:'Old Chen Sauce Yard', loc:'E1-04', ico:'🫙', intro:'自家晒制酱油豆酱，日晒足一百八十天。', introEn:'House-brewed soy and bean sauces sun-dried for 180 days.', today:['生抽','老抽','黄豆酱','蚝油'] },
    { nm:'百味干货调料', en:'Hundred Flavours', loc:'E2-03', ico:'🧄', intro:'香料齐全，买多还送研磨服务。', introEn:'Full range of spices — free grinding service on bulk buys.', today:['蒜粉','胡椒粉','五香粉','咖喱粉'] },
  ],
};

/* 海鲜图鉴（不展示价格） */
const SEA_LIST = [
  { ico:'🐟', zh:'带鱼',  en:'Hairtail',    l1:'产地 <b>南海近海</b>',      l2:'特点 肉厚刺少',        l3:'推荐 香煎 / 红烧' },
  { ico:'🦐', zh:'基围虾', en:'Kiwei Shrimp', l1:'产地 <b>深圳本地养殖</b>', l2:'特点 壳薄肉弹',        l3:'推荐 白灼 / 蒜蓉蒸' },
  { ico:'🦀', zh:'花蟹',  en:'Flower Crab', l1:'产地 <b>湛江</b>',          l2:'特点 膏满黄肥',        l3:'推荐 清蒸 / 姜葱炒' },
  { ico:'🦪', zh:'生蚝',  en:'Oyster',      l1:'产地 <b>台山蚝排</b>',      l2:'特点 肥美多汁',        l3:'推荐 炭烧蒜蓉' },
  { ico:'🦑', zh:'鱿鱼',  en:'Squid',       l1:'产地 <b>南海</b>',          l2:'特点 爽脆弹牙',        l3:'推荐 白灼 / 爆炒' },
  { ico:'🐠', zh:'石斑鱼', en:'Grouper',    l1:'产地 <b>万山渔场</b>',      l2:'特点 肉质嫩滑',        l3:'推荐 清蒸原味' },
  { ico:'🐡', zh:'多宝鱼', en:'Turbot',     l1:'产地 <b>深水网箱养殖</b>',  l2:'特点 胶质丰富',        l3:'推荐 清蒸滋补' },
  { ico:'🐚', zh:'扇贝',  en:'Scallop',     l1:'产地 <b>大连</b>',          l2:'特点 贝肉饱满',        l3:'推荐 蒜蓉粉丝蒸' },
  { ico:'🦞', zh:'青龙虾', en:'Lobster',    l1:'产地 <b>进口鲜活</b>',      l2:'特点 虾膏金黄',        l3:'推荐 芝士焗 / 上汤' },
  { ico:'🐙', zh:'章鱼',  en:'Octopus',     l1:'产地 <b>南海近海</b>',      l2:'特点 弹嫩鲜香',        l3:'推荐 白灼蘸芥末' },
  { ico:'🥬', zh:'迟菜心', en:'Choy Sum',   l1:'产地 <b>增城菜地</b>',      l2:'特点 爽甜无渣',        l3:'推荐 蒜蓉清炒' },
  { ico:'🥩', zh:'土猪肉', en:'Free-range Pork', l1:'产地 <b>本地农户</b>', l2:'特点 肥瘦相间',        l3:'推荐 焖炖 / 小炒' },
];

/* ======================= 日期 ======================= */
(function(){
  const w = new Date();
  const pad = n => String(n).padStart(2,'0');
  const weeks = ['周日','周一','周二','周三','周四','周五','周六'];
  const weeksEn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  document.getElementById('dateText').textContent = `${w.getFullYear()}.${pad(w.getMonth()+1)}.${pad(w.getDate())}`;
  document.getElementById('weekZh').textContent = weeks[w.getDay()];
  document.getElementById('weekEn').textContent = weeksEn[w.getDay()];
})();

/* ============ 主页：商户信息自动循环滚动 + 触摸/鼠标拖动 ============ */
(function(){
  const track = document.getElementById('feedTrack');
  const feed = [];
  CATEGORIES.forEach(c=>SHOPS[c.id].forEach(s=>feed.push({cat:c, shop:s})));
  for(let i=feed.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [feed[i],feed[j]]=[feed[j],feed[i]]; }

  const cardHTML = f => `
    <div class="feed-card">
      <div class="av" style="background:${CAT_COLOR[f.cat.id]}">${f.shop.ico}</div>
      <div class="body">
        <div class="nm">${f.shop.nm}<small>${f.shop.en}</small></div>
        <div class="it">“${f.shop.intro}”</div>
      </div>
      <div class="tag" style="background:${CAT_TAG[f.cat.id]}">${f.cat.zh}</div>
      <div class="loc">${f.shop.loc}</div>
    </div>`;
  const html = feed.map(cardHTML).join('');
  track.innerHTML = html + html;

  const viewport = track.parentElement;
  let y = 0, half = 0, dragging = false, startY = 0, startY0 = 0;
  const SPEED = 0.42;
  function measure(){ half = track.scrollHeight / 2; }
  function wrap(){
    if(half <= 0) return;
    while(y > 0) y -= half;
    while(-y >= half) y += half;
  }
  measure(); window.addEventListener('resize', measure);

  let frame = 0;
  function loop(){
    if(!dragging){ y -= SPEED; wrap(); }
    track.style.transform = `translateY(${y}px)`;
    if(++frame % 90 === 0) measure();   /* 定期重新测量，防止字体/布局变化后错位 */
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* 自动滚动 + 触摸/鼠标拖动（拖动时暂停，松手 1.5 秒后恢复） */
  viewport.addEventListener('pointerdown', e=>{
    dragging = true; startY = e.clientY; startY0 = y;
    viewport.classList.add('dragging');
    try{ viewport.setPointerCapture(e.pointerId); }catch(_){}
  });
  viewport.addEventListener('pointermove', e=>{
    if(!dragging) return;
    y = startY0 + (e.clientY - startY);
    wrap();
  });
  function endDrag(){
    if(!dragging) return;
    viewport.classList.remove('dragging');
    const resumeAt = Date.now() + 1500;
    (function wait(){
      if(Date.now() < resumeAt) requestAnimationFrame(wait);
      else dragging = false;
    })();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('wheel', e=>{
    e.preventDefault(); y -= e.deltaY; wrap();
  }, {passive:false});
})();

/* ======================= 界面切换 ======================= */
let currentCat = null;
let currentScreen = 'scr-home';
let listFrom = 'scr-cat';   /* 商铺列表是从哪来的（分类页 or 小地图） */
/* 每层的上级页面（返回键目标） */
const BACK_TO = { 'scr-cat':'scr-home', 'scr-list':'scr-cat', 'scr-detail':'scr-list', 'scr-map':'scr-home' };

function go(id){
  currentScreen = id;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  /* 返回键：仅在非首页显示，固定在右下角（窄条上方） */
  document.getElementById('backDock').classList.toggle('show', id !== 'scr-home');
}
function goBack(){
  if(currentScreen === 'scr-list') return go(listFrom);
  go(BACK_TO[currentScreen] || 'scr-home');
}
/* ==========================================================================
   小地图：SK-Market 平面导览（按业态点击高亮 + 区域简介）
   ========================================================================== */
const BIZ = {
  seafood:{ nm:'水产海鲜', en:'SEAFOOD',        color:'#3D7DD8', cat:'seafood',
    desc:'海鲜档、冰鲜档、贝类档、河鲜档、虾蟹档、金鱼档等。A 区长档 1-38 号，活鲜冰鲜每日清晨到货，可现场挑选。' },
  meat:{    nm:'禽肉生鲜', en:'MEAT & POULTRY', color:'#E05252', cat:'meat',
    desc:'肉类档、冷间档、烧肉档、牛肉档等。家禽猪肉当日现宰现售，冷间统一保鲜，膏满黄肥才算数。' },
  produce:{ nm:'果蔬日配', en:'VEGGIE & FRUIT', color:'#3E9E4F', cat:'veggie',
    desc:'蔬菜档、水果档及果蔬分拣区。本地菜地与果园每日两配，叶菜瓜果水灵灵不打蔫。' },
  snack:{   nm:'熟食小吃', en:'DELI & SNACKS',  color:'#E8A23A', cat:null,
    desc:'熟食店、小吃店、豆制品档。烧腊卤味即买即食，是街坊们下午茶与晚饭加菜的好去处。' },
  dry:{     nm:'干货副食', en:'DRY GOODS',      color:'#A57C4F', cat:'grain',
    desc:'干货店、海味干货档、中西餐调料等。香菇虾米瑶柱，煲汤配料一站买齐。' },
  service:{ nm:'管理服务', en:'SERVICE',        color:'#F07B3F', cat:null,
    desc:'服务台与管理处：咨询、广播、投诉受理与失物招领，有需要随时找工作人员。' },
  public:{  nm:'楼梯 / 公共', en:'STAIRS / PUBLIC', color:'#8C97A3', cat:null,
    desc:'楼梯、消防通道与公共区域。请勿占用，保持畅通。' },
};

/* ---- 1F 平面数据（依据 SK-Market 一楼平面导览） ---- */
const FLOOR1 = [];
['海鲜档','海鲜档','冰鲜档','冰鲜档','贝类档','咸鱼档','河鲜档','虾蟹档','海味干货档']
  .forEach((nm,i)=>FLOOR1.push({x:76+i*68, y:28, w:62, h:48, t:'seafood', label:nm, fs:nm.length>4?11.5:14}));
['海鲜档','冰鲜档','贝类档','活鲜档','咸鱼档','河鲜档']
  .forEach((nm,i)=>FLOOR1.push({x:76+i*68, y:86, w:62, h:48, t:'seafood', label:nm}));
FLOOR1.push({x:76, y:150, w:600, h:60, t:'seafood', label:'海鲜档 · 长档（7-22号）',  sub:'货档密集 · 品项多样'});
FLOOR1.push({x:76, y:222, w:600, h:60, t:'seafood', label:'海鲜档 · 长档（23-38号）', sub:'活鲜经营 · 现场挑选'});
FLOOR1.push({x:76, y:294, w:600, h:60, t:'seafood', label:'冰鲜档 · 长档（1-14号）',  sub:'全场冰鲜供应'});
['海鲜档','河鲜档','贝类档','咸鱼档','河鲜档','金鱼档']
  .forEach((nm,i)=>FLOOR1.push({x:76+i*68, y:368, w:62, h:48, t:'seafood', label:nm}));
FLOOR1.push({x:16, y:150, w:50, h:100, t:'public', label:'楼梯', vert:true, hatch:true});
FLOOR1.push({x:16, y:262, w:50, h:190, t:'public', label:'消防通道 · A区主通道', vert:true, color:'#3D7DD8'});
FLOOR1.push({x:16, y:464, w:50, h:110, t:'public', label:'楼梯', vert:true, hatch:true});
FLOOR1.push({x:700,y:86,  w:40, h:390, t:'public', label:'消防通道', vert:true, hatch:true});
FLOOR1.push({x:748,y:86,  w:92, h:110, t:'meat',   label:'肉类档',   sub:'1-6号档口'});
FLOOR1.push({x:748,y:206, w:92, h:90,  t:'meat',   label:'冷间档',   sub:'1-6号档口'});
FLOOR1.push({x:748,y:306, w:92, h:80,  t:'snack',  label:'小吃店',   sub:'1-6号档口'});
FLOOR1.push({x:748,y:396, w:92, h:80,  t:'snack',  label:'豆制品档', sub:'1-8号档口'});
for(let i=0;i<5;i++) FLOOR1.push({x:858+i*68, y:28, w:62, h:46, t:'snack', label:'小吃店'});
FLOOR1.push({x:858, y:86,  w:152, h:100, t:'produce', label:'蔬菜档', sub:'1-12号档口 · 水果'});
FLOOR1.push({x:858, y:196, w:152, h:88,  t:'produce', label:'水果档', sub:'1-12号档口'});
FLOOR1.push({x:858, y:294, w:152, h:88,  t:'snack',   label:'熟食店', sub:'1-9号档口'});
FLOOR1.push({x:858, y:392, w:152, h:88,  t:'dry',     label:'干货店', sub:'1-10号档口'});
FLOOR1.push({x:858, y:490, w:152, h:88,  t:'seafood', label:'冻品店', sub:'1-8号档口'});
FLOOR1.push({x:1020,y:86,  w:152, h:100, t:'produce', label:'蔬菜档', sub:'13-24号档口 · 水果经营'});
FLOOR1.push({x:1020,y:196, w:152, h:88,  t:'snack',   label:'小吃店 · C区', sub:'6-12号档口'});
FLOOR1.push({x:1020,y:294, w:152, h:88,  t:'meat',    label:'烧肉档', sub:'11-18号档口'});
FLOOR1.push({x:1020,y:392, w:152, h:88,  t:'meat',    label:'牛肉档', sub:'3-8号档口'});
FLOOR1.push({x:1020,y:490, w:152, h:88,  t:'dry',     label:'中西餐调料', sub:'1-8号档口'});
FLOOR1.push({x:1182,y:86,  w:42, h:150, t:'public',  label:'楼梯', vert:true, hatch:true});
FLOOR1.push({x:1182,y:246, w:42, h:120, t:'service', label:'管理服务', vert:true});
FLOOR1.push({x:1182,y:376, w:42, h:202, t:'public',  label:'楼梯', vert:true, hatch:true});
FLOOR1.push({arrow:250},{arrow:560},{arrow:870});
FLOOR1.push({caption:'▲ 市场主入口（南边通道）MAIN ENTRANCE (SOUTH PASSAGE)'});

/* ---- 2F 平面数据（示意布局） ---- */
const FLOOR2 = [
  {x:20,  y:28,  w:430, h:250, t:'snack',   label:'熟食小吃区', sub:'1-20号档口', big:true},
  {x:470, y:28,  w:330, h:250, t:'dry',     label:'干货副食区', sub:'1-16号档口', big:true},
  {x:470, y:298, w:330, h:180, t:'dry',     label:'中西餐调料', sub:'1-12号档口'},
  {x:820, y:28,  w:220, h:180, t:'service', label:'管理办公',   sub:'管理处 · 服务台'},
  {x:820, y:228, w:220, h:120, t:'snack',   label:'小吃店 · C区', sub:'6-12号档口'},
  {x:820, y:368, w:220, h:110, t:'seafood', label:'冻品仓储',   sub:'1-10号档口'},
  {x:1060,y:28,  w:60,  h:450, t:'public',  label:'楼梯', vert:true, hatch:true},
  {x:20,  y:298, w:90,  h:180, t:'public',  label:'楼梯', vert:true, hatch:true},
  {x:130, y:298, w:300, h:180, t:'produce', label:'果蔬分拣区', sub:'员工使用 · STAFF ONLY'},
  {arrow:250},{arrow:560},{arrow:870},
  {caption:'▲ 扶梯 / 楼梯上二楼 ESCALATOR TO 2F'},
];

let curFloor = 1, selType = null;

function renderFloor(){
  const svg = document.getElementById('floorSvg');
  const zones = curFloor===1 ? FLOOR1 : FLOOR2;
  let s = `<defs>
    <pattern id="hatchPat" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="9" height="9" fill="#e6ebf1"/>
      <line x1="0" y1="0" x2="0" y2="9" stroke="#b9c4cf" stroke-width="2.5"/>
    </pattern>
  </defs>
  <rect width="1240" height="660" rx="18" fill="#ffffff" stroke="#e3eaf1" stroke-width="2"/>`;

  zones.forEach((z,i)=>{
    if(z.arrow !== undefined){
      s += `<g opacity=".8"><path d="M ${z.arrow} 624 L ${z.arrow} 588 M ${z.arrow-15} 603 L ${z.arrow} 586 L ${z.arrow+15} 603"
            stroke="#8C97A3" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      return;
    }
    if(z.caption !== undefined){
      s += `<text x="620" y="654" text-anchor="middle" fill="#8C97A3" font-size="16" font-weight="bold" letter-spacing="1">${z.caption}</text>`;
      return;
    }
    const dim = selType && z.t !== selType;
    const hi  = selType && z.t === selType;
    const fill = z.hatch ? 'url(#hatchPat)' : (z.color || BIZ[z.t].color);
    const txt  = z.hatch ? '#7d8b98' : '#ffffff';
    const cx = z.x + z.w/2, cy = z.y + z.h/2;
    s += `<g class="zone" data-i="${i}" opacity="${dim ? 0.22 : 1}">`;
    s += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="10" fill="${fill}"
          stroke="${hi ? '#0d3b45' : '#ffffff'}" stroke-width="${hi ? 4 : 3}" ${z.hatch ? 'stroke-dasharray="7 5"' : ''}/>`;
    if(z.vert){
      s += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${txt}"
            font-size="${z.fs||13}" font-weight="bold" letter-spacing="2" transform="rotate(-90 ${cx} ${cy})">${z.label}</text>`;
    } else if(z.sub){
      s += `<text x="${cx}" y="${cy - (z.big?2:7)}" text-anchor="middle" fill="${txt}"
            font-size="${z.big?25:17}" font-weight="bold">${z.label}</text>`;
      s += `<text x="${cx}" y="${cy + (z.big?27:18)}" text-anchor="middle" fill="${txt}" opacity=".92"
            font-size="${z.big?14:12.5}" font-weight="bold">${z.sub}</text>`;
    } else {
      s += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${txt}"
            font-size="${z.fs||14}" font-weight="bold">${z.label}</text>`;
    }
    s += `</g>`;
  });
  svg.innerHTML = s;
}

function applyLegend(){
  document.querySelectorAll('.lg-chip').forEach(c=>c.classList.toggle('on', c.dataset.t === selType));
}
function closeZoneCard(){ document.getElementById('zoneCard').classList.remove('show'); }

function showZoneCard(z){
  const b = BIZ[z.t];
  document.getElementById('zcDot').style.background = b.color;
  document.getElementById('zcType').textContent = `${b.nm} ${b.en}`;
  document.getElementById('zcNm').textContent = z.label;
  document.getElementById('zcSub').textContent = z.sub || (curFloor===1 ? '1F 一楼' : '2F 二楼');
  document.getElementById('zcDesc').textContent = b.desc;
  document.getElementById('zoneCard').classList.add('show');
}
function setFloor(n){
  curFloor = n; selType = null;
  closeZoneCard();
  document.getElementById('btnF1').classList.toggle('active', n===1);
  document.getElementById('btnF2').classList.toggle('active', n===2);
  document.getElementById('mapSub').textContent =
    n===1 ? '一楼平面导览 · 点击区域查看简介' : '二楼平面导览（示意）· 点击区域查看简介';
  renderFloor(); applyLegend();
}

/* 平面图点击：点空白清除高亮，点分区高亮同类 + 弹简介 */
document.getElementById('floorSvg').addEventListener('click', e=>{
  const g = e.target.closest ? e.target.closest('.zone') : null;
  if(!g){ selType = null; closeZoneCard(); renderFloor(); applyLegend(); return; }
  const z = (curFloor===1 ? FLOOR1 : FLOOR2)[+g.dataset.i];
  if(selType === z.t && document.getElementById('zoneCard').classList.contains('show')
     && document.getElementById('zcNm').textContent === z.label){
    selType = null; closeZoneCard();
  } else {
    selType = z.t;
    showZoneCard(z);
  }
  renderFloor(); applyLegend();
});

/* 业态图例渲染 + 点击高亮 */
(function(){
  const bar = document.getElementById('lgChips');
  bar.innerHTML = Object.entries(BIZ).map(([k,b])=>`
    <div class="lg-chip" data-t="${k}">
      <span class="lg-dot" style="background:${b.color}"></span>${b.nm}<small>${b.en}</small>
    </div>`).join('');
  bar.addEventListener('click', e=>{
    const chip = e.target.closest('.lg-chip'); if(!chip) return;
    selType = (selType === chip.dataset.t) ? null : chip.dataset.t;
    if(!selType) closeZoneCard();
    renderFloor(); applyLegend();
  });
})();

renderFloor(); applyLegend();
function openCategory(cat, from){
  currentCat = cat;
  listFrom = from || 'scr-cat';
  document.getElementById('listTitle').innerHTML =
    `${cat.ico} ${cat.zh}<small>${cat.en.toUpperCase()} · ZONE ${cat.zone}</small>`;
  const box = document.getElementById('shopScroll');
  box.innerHTML = SHOPS[cat.id].map((s,i)=>`
    <div class="shop-row" onclick="openShop(${i})">
      <div class="thumb" style="background:${CAT_COLOR[cat.id]}">${s.ico}</div>
      <div class="mid">
        <div class="nm">${s.nm}<small>${s.en}</small></div>
        <div class="intro">“${s.intro}”</div>
        <div class="intro en">"${s.introEn}"</div>
      </div>
      <div class="loc">${s.loc}</div>
    </div>`).join('');
  box.scrollTop = 0;
  go('scr-list');
}
function openShop(i){
  const s = SHOPS[currentCat.id][i];
  const g = CAT_COLOR[currentCat.id];
  document.getElementById('detailWrap').innerHTML = `
    <div class="detail-left">
      <div class="detail-head">
        <div class="nm">${s.nm}<small>${s.en}</small></div>
        <div class="loc">📍 ${s.loc}</div>
      </div>
      <div class="photo-strip">
        <div class="photo" style="background:${g}">${s.ico}<div class="cap">商户图片 Shop Photo 1</div></div>
        <div class="photo" style="background:linear-gradient(135deg,#ffffff,#e6f8f6)">${s.ico}<div class="cap">商户图片 Shop Photo 2</div></div>
      </div>
    </div>
    <div class="detail-right">
      <div class="panel">
        <div class="ph">🛒 今日售卖<small>TODAY'S SELLING</small></div>
        <div class="sell-tags">${s.today.map(t=>`<span>${t}</span>`).join('')}</div>
      </div>
      <div class="panel" style="flex:1">
        <div class="ph">💬 商户寄语<small>SHOPKEEPER'S WORDS</small></div>
        <div class="intro-quote">“${s.intro}”<span class="en">"${s.introEn}"</span></div>
      </div>
    </div>`;
  go('scr-detail');
}

/* 分类页渲染 */
document.getElementById('catGrid').innerHTML = CATEGORIES.map(c=>`
  <div class="cat-card" style="background:${CAT_COLOR[c.id]}" onclick='openCategory(${JSON.stringify(c)}, "scr-cat")'>
    <div class="cnt">${SHOPS[c.id].length} 家 stalls</div>
    <div class="ico">${c.ico}</div>
    <div class="nm">${c.zh}</div>
    <div class="en">${c.en}</div>
  </div>`).join('');

/* ============ 底部海鲜滚动条：自动循环 + 触摸/鼠标拖动 ============ */
(function(){
  const ticker = document.getElementById('ticker');
  const track  = document.getElementById('tickerTrack');
  const cardHTML = d => `
    <div class="sea-card">
      <div class="fish">${d.ico}</div>
      <div class="info">
        <div class="nm">${d.zh}<small>${d.en}</small></div>
        <div class="line">${d.l1}</div>
        <div class="line">${d.l2}</div>
        <div class="line">${d.l3}</div>
      </div>
    </div>`;
  track.innerHTML = SEA_LIST.map(cardHTML).join('') + SEA_LIST.map(cardHTML).join('');

  let offset = 0, half = 0, dragging = false, startX = 0, startOffset = 0;
  const SPEED = 0.65;

  function measure(){ half = track.scrollWidth / 2; }
  measure(); window.addEventListener('resize', measure);

  function loop(){
    if(!dragging){
      offset -= SPEED;
      if(half > 0 && -offset >= half) offset += half;
    }
    track.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  ticker.addEventListener('pointerdown', e=>{
    dragging = true; startX = e.clientX; startOffset = offset;
    ticker.classList.add('dragging');
    try{ ticker.setPointerCapture(e.pointerId); }catch(_){}
  });
  ticker.addEventListener('pointermove', e=>{
    if(!dragging) return;
    offset = startOffset + (e.clientX - startX);
    if(half > 0){
      while(offset > 0) offset -= half;
      while(-offset >= half) offset += half;
    }
  });
  function endDrag(){
    if(!dragging) return;
    ticker.classList.remove('dragging');
    const resumeAt = Date.now() + 1500;
    (function wait(){
      if(Date.now() < resumeAt) requestAnimationFrame(wait);
      else dragging = false;
    })();
  }
  ticker.addEventListener('pointerup', endDrag);
  ticker.addEventListener('pointercancel', endDrag);
  ticker.addEventListener('wheel', e=>{
    e.preventDefault();
    offset -= e.deltaY;
    if(half > 0){
      while(offset > 0) offset -= half;
      while(-offset >= half) offset += half;
    }
  }, {passive:false});
})();

/* ============ 商铺列表：触摸 / 鼠标拖动上下滚动 ============ */
(function(){
  const box = document.getElementById('shopScroll');
  let dragging = false, startY = 0, startTop = 0, moved = false;
  box.addEventListener('pointerdown', e=>{
    dragging = true; moved = false; startY = e.clientY; startTop = box.scrollTop;
    box.classList.add('dragging');
  });
  box.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dy = e.clientY - startY;
    if(Math.abs(dy) > 4) moved = true;
    box.scrollTop = startTop - dy;
  });
  function end(){
    if(!dragging) return;
    dragging = false; box.classList.remove('dragging');
    if(moved){
      const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
      box.addEventListener('click', stop, {capture:true, once:true});
    }
  }
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('pointerleave', end);
})();
