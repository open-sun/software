# 安装依赖
前后端环境配置，根目录下运行
```bash
./setup.sh
```


# 前后端启动

**保证mysql数据库启动并且与`backend/app.py`匹配**

一键启动前后端，根目录下运行
```bash
./start.sh
```

## 单独启动后端


backend目录下
```bash
python app.py
```



## 单独启动前端

有包更改时运行，frontend目录下
```bash
npm install
```

正常启动
```bash
npm start
```

## 结构讲解
```bash
├── backend
│   ├── app.py
│   ├── models.py # 数据库模型定义
│   ├── requirements.txt # 后端依赖
├── doc/             # 项目文档目录
│   ├── 前端/        # 前端文档：结构说明、组件说明
│   ├── 后端/        # 后端文档：结构说明、接口文档
│   ├── 环境/        # 环境配置与依赖说明
│   ├── 要求/        # 项目功能需求文档
│   ├── 软件开发文档草稿/ # 项目文档初稿
│   └── 规范.md      # 编码规范与项目统一约定
├── frontend
│   ├── node_modules # npm 安装的依赖包
│   ├── public 
│   │   ├── favicon.ico # 网站图标
│   │   ├── index.html # HTML 模板文件
│   │   └── manifest.json # PWA 配置文件
│   ├── src # 前端源代码
│   │   ├── assets # 存放静态资源（如图片、字体等）
│   │   │   ├── images # 图片资源
│   │   │   └── fonts # 字体资源
│   │   ├── components # 可复用组件
│   │   │   ├── example # 示例组件
│   │   │   ├── AnimatedTextChart.tsx
│   │   │   ├── AuthContext.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HoverRainfallChart.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LineAreaChart.tsx
│   │   │   ├── MarketDataTable.tsx
│   │   │   ├── RainfallChart.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── WeatherCard.tsx
│   │   ├── pages # 页面组件
│   │   │   ├── dashboard.tsx
│   │   │   ├── datacenter.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── LineArea.tsx
│   │   │   ├── login.tsx
│   │   │   ├── maininfo.tsx
│   │   │   ├── management.tsx
│   │   │   ├── MapTest.tsx
│   │   │   ├── MarketData.tsx
│   │   │   ├── register.tsx
│   │   │   ├── UnderwaterSystem.tsx
│   │   │   ├── WaterDataViewer.tsx
│   │   │   └── WaterQuality.tsx
│   │   ├── services # 服务层（API 请求等）
│   │   ├── App.css # 全局样式文件
│   │   ├── App.test.tsx # App 组件测试文件
│   │   ├── App.tsx # 应用入口组件
│   │   ├── index.css # 样式文件
│   │   ├── index.tsx # 渲染入口文件
│   │   └── logo.svg # logo 图标
│   ├── package.json # 前端依赖配置文件
│   ├── .gitignore # git 忽略文件配置
│   ├── README.md # 项目说明文档
│   └── tsconfig.json # TypeScript 配置文件
├── .gitignore       # Git 忽略配置

```



## 项目文档说明

项目文档位于 `doc/` 目录，包含以下部分：

* `前端/`：前端结构及组件功能说明
* `后端/`：后端结构与接口规范
* `环境/`：运行环境配置及依赖说明
* `要求/`：功能与非功能性需求文档
* `软件开发文档草稿/`：软件工程相关文稿初稿
* `规范.md`：开发规范、命名约定、代码风格等说明

## 开发规范

请遵循 [`doc/规范.md`](./doc/规范.md) 中的代码风格与提交规范，以确保代码整洁性与协作效率。



