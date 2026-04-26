# Mio Bakery 迭代与阿里云发布说明

这个项目现在适合按“本地开发 -> Git 记录版本 -> 一键发布到阿里云 ECS”的方式迭代。

## 日常怎么改

1. 本地先改功能和页面。
2. 本地检查：

```bash
npm run build
```

3. 本地打开预览确认：

```bash
npm run dev
npm run api
```

顾客端是 `http://127.0.0.1:5173/`，后台是 `http://127.0.0.1:5173/admin`。

## 怎么发布到阿里云

第一次先复制一份配置：

```bash
cp .env.production.example .env.production
```

如果 ECS 公网 IP 以后变了，就改 `.env.production` 里的 `ECS_HOST`。

发布命令：

```bash
npm run deploy:ecs
```

这个命令会自动完成：

- 本地构建检查
- 打包代码
- 上传到阿里云 ECS
- 在服务器重新构建 Docker 镜像
- 重启 `mio-bakery` 容器
- 检查 API 是否正常

发布完成后访问：

- 顾客端：`http://8.133.194.58`
- 后台：`http://8.133.194.58/admin`
- 收银台：`http://8.133.194.58/admin/pos`

## Git 怎么用

如果这个文件夹还不是 Git 项目，先执行一次：

```bash
git init
git add .
git commit -m "init mio bakery app"
```

以后每次完成一轮功能：

```bash
git add .
git commit -m "描述这次改了什么"
```

Git 是用来保留版本的。GitHub / Gitee 是把这些版本放到云端，方便备份和多人协作；阿里云 ECS 是真正运行网站的服务器。

## 服务器上怎么排查

登录服务器：

```bash
ssh root@8.133.194.58
```

查看容器是否运行：

```bash
docker ps
```

查看网站错误：

```bash
docker logs --tail=100 mio-bakery
```

检查本机 API：

```bash
curl http://127.0.0.1:8787/api/bootstrap
```

检查 Nginx：

```bash
nginx -t
systemctl status nginx
```

## 数据在哪里

当前订单、商品、门店、库存保存在服务器：

```text
/opt/mio-bakery/data
```

发布脚本不会覆盖这个目录，所以正常发布不会清空订单。

手动备份数据：

```bash
tar -czf /root/mio-bakery-data-backup-$(date +%F).tar.gz -C /opt/mio-bakery data
```

## 后续正式上线前

建议下一步按这个顺序做：

1. 绑定域名和备案。
2. 配 HTTPS 证书。
3. 加真正的后台账号密码。
4. 商品图片改用阿里云 OSS。
5. SQLite 迁移到阿里云 RDS MySQL。
6. 再考虑微信小程序或微信支付。
