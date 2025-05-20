## 安装依赖
前后端环境配置，根目录下运行
```bash
./setup.sh
```


# 前后端启动

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
```