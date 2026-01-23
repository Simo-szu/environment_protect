# MinIO 对象存储

本目录用于存放 MinIO 相关配置和数据。

## 目录结构

- `minio.exe`: MinIO 可执行文件 (Windows)
- `data/`: 对象存储数据目录 (不提交到 git)
- `start.ps1`: Windows 启动脚本
- `start.sh`: Unix/Linux 启动脚本

## 使用方式

### Windows
```powershell
.\start.ps1
```

### Unix/Linux/Mac
```bash
./start.sh
```

## 配置

默认配置:
- 端口: 9000 (API)
- 控制台: 9001
- Access Key: minioadmin
- Secret Key: minioadmin

## 注意事项

- `data/` 目录已添加到 .gitignore，不会提交到版本控制
- 生产环境请修改默认的 Access Key 和 Secret Key
