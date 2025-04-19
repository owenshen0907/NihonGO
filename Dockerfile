FROM node:18.20.7-alpine
LABEL authors="shenting"
# 改用阿里源提高稳定性
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装基础构建工具
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libpq \
    postgresql-libs \
    git \
    bash

# 创建挂载点目录（容器中用于挂载你的项目）
WORKDIR /app

# 默认命令为进入 shell（也可改为启动脚本）
CMD ["/bin/sh"]