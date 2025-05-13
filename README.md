## 安装依赖
后端进入目录后，执行以下命令安装依赖：
```bash
pip install -r requirements.txt
```
前端
```bash
npm install
```
## 启动后端
```bash
python app.py
```
## 启动前端
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