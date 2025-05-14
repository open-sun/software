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
│   ├── public 
│   ├── src # 前端源代码
│       ├── components # 组件  
│       ├── pages # 页面
│       ├── App.tsx # 入口文件
│       ├── index.tsx # 渲染入口
│   ├── package.json # 前端依赖
```