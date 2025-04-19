FROM node:18.20.7-alpine
LABEL authors="shenting"
# 改用阿里源提高稳定性
WORKDIR /app

# 使用阿里源提升安装速度（可选）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建工具
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libpq \
    postgresql-libs \
    git \
    bash

# 拷贝 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖（包含 devDependencies）
RUN npm install

# 拷贝完整源码
COPY . .

# 默认执行命令
CMD ["npm", "run", "dev"]