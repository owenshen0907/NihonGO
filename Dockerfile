# 使用稳定且轻量的 Node.js Alpine 镜像
FROM node:18.20.7-alpine

LABEL author="shenting"

# 设置工作目录
WORKDIR /app

# 改用阿里源提升依赖下载速度
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装必要构建工具（支持 pg / ts-node 等依赖编译）
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libpq \
    postgresql-libs \
    git \
    bash

# 设置开发环境，确保 devDependencies 被安装
ENV NODE_ENV=development

# 复制依赖定义文件
COPY package.json package-lock.json* ./

# 安装所有依赖（包括 devDependencies）
RUN npm install --include=dev

# 复制项目全部文件
COPY . .

# 显示 ts-node 是否成功安装（用于调试）
RUN ls -la node_modules/.bin && node -p "require('ts-node/package.json').version"

# 暴露端口（默认 Next.js）
EXPOSE 3000

# 启动命令（先初始化 DB，再启动 Dev 服务器）
CMD ["npm", "run", "dev"]