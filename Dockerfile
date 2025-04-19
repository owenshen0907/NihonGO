FROM node:18.20.7-alpine
LABEL authors="shenting"

# 设置工作目录
WORKDIR /app

# 使用阿里源加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libpq \
    postgresql-libs \
    git \
    bash

# 拷贝依赖清单
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 拷贝代码
COPY . .

# 验证 ts-node 是否存在（调试用）
RUN node -p "require('ts-node/package.json').version"

# 默认运行命令（开发环境）
CMD ["yarn", "dev"]