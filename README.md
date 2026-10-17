# 蛇口市场门口大屏 · Shekou Market Digital Signage

## 当前：后端接入版（2026-10-17）

保留原HTML/CSS/原生JS页面与视觉，已接入[蛇口市场后端](https://github.com/zackwang2006-hue/MarketInformationalization)。接口与小程序实现见[后端PR #10](https://github.com/zackwang2006-hue/MarketInformationalization/pull/10)；该PR未合并前使用feat/entrance-screen分支。下面旧说明中的硬编码示例、目录和双击预览属于历史记录，不是当前数据流程。

数据闭环：微信小程序上传真实门店照片/介绍 → 管理处审核 → 选择公开分类和名单并明确发布 → 门口屏约60秒读取快照。普通保存和审核通过均不等于上屏。没有发布时显示空态，不再使用原示例商户、OPEN状态或二楼示意布局。经营品类不是实时库存；无英文不自动翻译，无图明确缺图。

需要Node 22.12+。仓库根运行：

```powershell
npm.cmd ci
npm.cmd run dev
# http://127.0.0.1:5188/
npm.cmd run check
npm.cmd run build
npm.cmd audit
```

Vite仅用于开发代理/打包，没有Vue或新增运行库。开发与preview将/api代理到127.0.0.1:18088，需要已运行含新增接口的后端。config.js只存公开apiBase/marketId，默认同源/mkt_001，禁止写管理账号、密码或token。生产托管dist/并反代/api；跨域部署时同步后端CORS及APP_PUBLIC_BASE_URL，确保签名图片也可达。根config.js和sw.js是唯一源，构建时复制到dist，无重复public配置。

已接入公开接口GET /api/public/markets/{marketId}/entrance，包含分类、商户、图片、楼层区域和图鉴。正式字段见[OpenAPI](https://github.com/zackwang2006-hue/MarketInformationalization/blob/feat/entrance-screen/docs/api/openapi.json)及[交接说明](https://github.com/zackwang2006-hue/MarketInformationalization/blob/feat/entrance-screen/docs/entrance-integration.md)。不会匿名读取私人素材库，也不会在网页登录管理账号。

文字使用textContent/SVG DOM，不执行商户HTML。照片下载、哈希、解码及整份快照验证成功后才切换；失败保留旧版本。Service Worker/IndexedDB支持成功联网后的离线整页和Blob图片恢复，首次无缓存不能凭空恢复。HTTPS或localhost用于浏览器安全能力。两分钟无交互回首页，支持触摸/鼠标拖动/滚轮、减少动效和横竖屏详情。

源码也可经HTTP静态服务运行，但没有开发代理，需另设同源反代或真实API地址。支持子目录资源和Service Worker路径。GitHub Pages只托管静态页面，必须另配真实HTTPS后端及图片域名，不能填写电脑localhost；推送代码不代表已完成现场部署。不要用file://作为正式运行方式。

根目录是唯一维护源，shekou-market-screen/index.html只保留旧地址跳转。当前没有市场级设备配对/心跳/APPLIED上报，不能冒充店内屏；电视现场、触摸和断电仍待验收。停用资料联网后可过滤，离线可能仍保留原有效快照。

---

## 以下为初版历史介绍

市场门口竖屏/横屏大屏的交互展示页面，单页纯前端（HTML + CSS + 原生 JS），无构建、无依赖、开箱即用。

- 主屏比例建议：**1920 × 1080（16:9）全屏运行**
- 全程**中英双语**
- 顶部日期 / 星期 / 「蛇口市场 SHEKOU MARKET」标题在所有页面固定不变

---

## 功能一览

### 1. 首页
- 左侧「今日商户 Today's Stalls」信息流，纵向**自动循环滚动**，也支持**触摸拖动 / 鼠标拖动 / 滚轮**（拖动时暂停，松手 1.5 秒后恢复）
- 右侧两个导引入口：**小地图** / **摊位信息**

### 2. 摊位信息（分类）
五大类：水产类、蔬菜水果类、粮油干货类、肉禽蛋类、副食调料类

### 3. 商铺列表
- 某类别下所有商户，**上下滚动**，可触摸 / 鼠标拖动
- 每条含：商户名（中英）、一句话介绍、摊位编号

### 4. 商户详情
- 商户名称、位置编号、商户上传图片位（2 张）、今日售卖、商户寄语（中英）
- 返回按钮固定在页面右下角

### 5. 小地图（SK-Market 平面导览）
- 按业态配色：水产海鲜 / 禽肉生鲜 / 果蔬日配 / 熟食小吃 / 干货副食 / 管理服务 / 楼梯·公共
- **1F / 2F 切换**（2F 为示意布局，可替换为真实图纸）
- 点击任意分区或底部图例：**同类业态高亮、其余变暗**，并弹出该区域简介
- 地图只做「高亮 + 简介」，商户详情统一走「摊位信息」入口

### 6. 底部海鲜图鉴窄条
- 横向**自动循环滚动**，支持**触摸拖动 / 鼠标拖动 / 滚轮**
- 每个品种：图 + 名称（中英）+ 三行信息（产地 / 特点 / 推荐做法）
- **不展示价格**，方便后续接入真实内容

---

## 目录结构

```
shekou-market-screen/
├── index.html              # 页面结构
├── assets/
│   ├── css/
│   │   └── style.css       # 全部样式
│   └── js/
│       └── app.js          # 全部交互与数据
├── README.md
└── .gitignore
```

---

## 本地预览

直接双击 `index.html` 即可（无需服务器）。

也可以起一个本地静态服务：

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

然后访问 <http://localhost:8000>，按 F11 全屏查看大屏效果。

---

## 接入真实数据的位置

所有数据集中在 `assets/js/app.js` 顶部的几个对象里，改数据即可，不用动结构：

| 变量 | 作用 |
| --- | --- |
| `SEA_LIST` | 底部海鲜图鉴的品种、产地、特点、推荐做法 |
| `CATEGORIES` | 五大分类（名称、英文、图标、区域字母） |
| `SHOPS` | 各分类下的商户：名称、位置、图片图标、介绍、今日售卖 |
| `BIZ` | 小地图的 7 种业态（名称、配色、区域简介） |
| `FLOOR1` / `FLOOR2` | 一楼 / 二楼平面图的区块坐标与文字 |

商户图片目前使用色块 + 图标占位，替换成真实图片时，把详情页 `.photo` 里的内容换成 `<img>` 即可。

---

## 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "init: Shekou Market signage"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

然后在仓库 **Settings → Pages** 中选择 `main` 分支、目录 `/ (root)`，保存后即可通过
`https://<你的账号>.github.io/<仓库名>/` 访问。

---

## 说明

- 页面内所有商户、档口、价格类信息均为示例占位数据，正式上线前请替换为真实内容。
- 地图中的「主入口」文案为占位，可按现场实际通道名称修改（`FLOOR1` 中的 `caption`）。
- 代码无外部依赖、无网络请求，可离线运行。
