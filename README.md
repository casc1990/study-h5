# Study H5 - 小学课后强化学习助手

移动端 H5 应用，通过上传学习资料（视频/图片/PDF），AI 自动识别知识点，生成闯关式练习题。

## 功能特性

- 📤 **资料上传**：支持视频、图片、PDF 格式
- 🤖 **AI 分析**：
  - 视频：Whisper 语音转文字 → VLM 提取知识点
  - 图片：MiniMax VLM 直接分析
  - PDF：文本提取 → 知识点整理
- 🎮 **闯关游戏**：选择题/填空题 → 即时反馈 → 连击奖励
- 📊 **学习统计**：打卡日历、正确率、学科分布

## 技术栈

- **前端**：Vue 3 + Vant 4 + TypeScript
- **后端**：Cloudflare Pages Functions + D1 Database
- **AI 服务**：
  - APIMart Whisper-1（音频转文字）
  - MiniMax VLM（视觉理解）
  - GPT-4o-mini（题目生成）
- **部署**：Cloudflare Pages

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 部署到 Cloudflare Pages

```bash
# 1. 初始化 D1 数据库
wrangler d1 execute study-h5-db --file=schema.sql --local

# 2. 部署
npm run deploy
```

## 项目结构

```
study-h5/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue    # 首页
│   │   ├── Upload.vue  # 上传资料
│   │   ├── Study.vue   # 学习详情
│   │   ├── Challenge.vue # 闯关答题
│   │   └── Stats.vue   # 学习统计
│   ├── router/         # 路由配置
│   ├── assets/         # 静态资源
│   └── main.ts         # 入口文件
├── functions/          # Cloudflare Pages Functions
│   ├── api/           # API 路由
│   └── handlers/      # 请求处理
├── public/            # 公共资源
├── schema.sql         # D1 数据库结构
└── wrangler.toml      # Cloudflare 配置
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传资料，生成闯关 |
| `/api/challenge/:id` | GET | 获取闯关详情 |
| `/api/stats` | GET | 获取学习统计 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `APIMART_TOKEN` | APIMart API Token（用于 Whisper） |
| `MINIMAX_TOKEN` | MiniMax API Token（用于 VLM） |
| `OPENAI_API_KEY` | OpenAI API Key（备用） |
| `DB` | Cloudflare D1 数据库 |
| `ASSETS` | Cloudflare R2 存储 |

## TODO

- [ ] 完善视频音频提取流程
- [ ] 实现 PDF 文本提取
- [ ] 添加更多题型（连线题、排序题）
- [ ] 家长端：查看孩子学习报告
- [ ] 错题本功能
- [ ] 学习打卡提醒

## License

MIT