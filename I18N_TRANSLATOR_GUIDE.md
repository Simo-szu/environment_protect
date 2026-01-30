# i18n 翻译脚本使用指南

> `scripts/i18n_translator.py` - 国际化翻译与同步工具

## 概述

本脚本用于管理多语言翻译文件，支持以下功能：

- 🌐 **翻译**: 将中文 (`zh_CN.ts`) 翻译成其他语言
- 🔄 **同步**: 对比并同步多个语言文件的键值
- 📊 **对比**: 查看不同语言文件之间的差异
- 🛠️ **修复**: 修复翻译文件的格式问题

**默认使用 NVIDIA API (deepseek-ai/deepseek-v3.2 模型)，无需额外配置 API 密钥即可使用！**

## 环境准备

### 依赖安装

```bash
pip install openai httpx
```

### 环境变量 (可选)

脚本已内置 NVIDIA API 配置，以下环境变量仅在需要自定义时设置：

```bash
# 自定义 OpenAI 兼容 API 配置 (可选)
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"

# Ollama 配置 (可选)
export OLLAMA_BASE_URL="https://your-ollama-server/v1"
```

### 默认 API 配置

| 配置项 | 默认值 |
|--------|--------|
| API URL | `https://integrate.api.nvidia.com/v1` |
| 模型 | `deepseek-ai/deepseek-v3.2` |
| API Key | 已内置 (NVIDIA API) |

---

## 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--source` | 源文件路径 | `src/locales/zh_CN.ts` |
| `--target` | 目标语言代码 | 必需 (除 `--sync-all`) |
| `--output` | 输出文件路径 | `src/locales/{target}.ts` |
| `--api-key` | API 密钥 | 内置 NVIDIA API Key |
| `--base-url` | API 基础 URL | NVIDIA API URL |
| `--model` | 模型名称 | `deepseek-ai/deepseek-v3.2` |
| `--batch-size` | 每批翻译数量 | `30` |
| `--use-ollama` | 使用 Ollama 引擎 | 否 |
| `--skip-ssl-verify` | 跳过 SSL 验证 | 否 |
| `--compare-only` | 仅对比键值 | 否 |
| `--sync` | 同步单个语言文件 | 否 |
| `--sync-all` | 批量同步所有语言 | 否 |
| `--dry-run` | 干运行模式 | 否 |
| `--exclude` | 排除的语言代码 | 无 |
| `--no-resume` | 不从断点续传 | 否 |
| `--update-config` | 仅更新配置文件 | 否 |
| `--fix-format` | 修复格式问题 | 否 |

---

## 支持的语言

| 代码 | 语言 |
|------|------|
| `en_US` | English (英文) |
| `ja_JP` | Japanese (日文) |
| `ko_KR` | Korean (韩文) |
| `de_DE` | German (德文) |
| `fr_FR` | French (法文) |
| `es_ES` | Spanish (西班牙文) |
| `pt_BR` | Portuguese - Brazil (葡萄牙文-巴西) |
| `ru_RU` | Russian (俄文) |
| `ar_SA` | Arabic (阿拉伯文) |
| `th_TH` | Thai (泰文) |
| `vi_VN` | Vietnamese (越南文) |
| `id_ID` | Indonesian (印尼文) |
| `ms_MY` | Malay (马来文) |

---

## 使用场景

### 1. 完整翻译新语言 ⭐

从零开始翻译一个新的语言文件：

```bash
# 使用默认 NVIDIA API (推荐，无需配置)
python scripts/i18n_translator.py --target en_US

# 使用自定义 OpenAI 兼容 API
python scripts/i18n_translator.py --target en_US --api-key YOUR_API_KEY --base-url YOUR_URL

# 使用 Ollama
python scripts/i18n_translator.py --target en_US --use-ollama --skip-ssl-verify
```

**说明**: 会将 `zh_CN.ts` 中的所有文本翻译成目标语言，生成 `en_US.ts`。

---

### 2. 同步单个语言文件 ⭐⭐

当你修改了 `zh_CN.ts` 后，同步更新到某个语言：

```bash
# 使用默认 NVIDIA API
python scripts/i18n_translator.py --sync --target en_US

# 使用 Ollama
python scripts/i18n_translator.py --sync --target en_US --use-ollama --skip-ssl-verify
```

**功能**:
- ✅ 对比源文件和目标文件的键值差异
- ✅ 翻译并补全缺失的键
- ✅ 删除目标文件中多余的键
- ✅ 保留已有的翻译内容

---

### 3. 批量同步所有语言文件 ⭐⭐⭐

一键同步所有语言文件（最常用）：

```bash
# 使用默认 NVIDIA API (推荐)
python scripts/i18n_translator.py --sync-all

# 使用 Ollama
python scripts/i18n_translator.py --sync-all --use-ollama --skip-ssl-verify
```

**工作流程**:
1. 修改 `zh_CN.ts` (添加/删除/修改键值)
2. 运行上述命令
3. 所有语言文件自动同步

---

### 4. 干运行模式 (预览)

在实际同步前预览变更：

```bash
# 预览同步所有语言
python scripts/i18n_translator.py --sync-all --dry-run

# 预览同步单个语言
python scripts/i18n_translator.py --sync --target en_US --dry-run
```

**输出示例**:
```
==================================================
同步语言文件: en_US (English)
==================================================
源文件键数: 1246
目标文件键数: 1258
缺失的键: 5
多余的键: 17

缺失的键 (5):
  + common.newFeature: 新功能
  + settings.darkMode: 深色模式
  ...

多余的键 (17):
  - deprecated.oldKey
  ...

[干运行模式] 不会实际修改文件
```

---

### 5. 仅对比键值差异

快速查看两个文件的差异，不进行任何操作：

```bash
python scripts/i18n_translator.py --compare-only --target en_US
```

---

### 6. 排除某些语言

同步时跳过特定语言：

```bash
# 排除日语和韩语
python scripts/i18n_translator.py --sync-all --exclude ja_JP,ko_KR
```

---

### 7. 修复格式问题

修复已有翻译文件的格式（换行符、缩进等）：

```bash
python scripts/i18n_translator.py --fix-format --target en_US
```

---

### 8. 仅更新配置文件

只更新 `index.ts` 和 `userStore.ts`，不进行翻译：

```bash
python scripts/i18n_translator.py --update-config --target dummy
```

---

## 典型工作流

### 日常开发流程 (推荐)

```bash
# 1. 修改中文语言包
# 编辑 src/locales/zh_CN.ts

# 2. 预览同步结果
python scripts/i18n_translator.py --sync-all --dry-run

# 3. 确认无误后执行同步 (使用默认 NVIDIA API)
python scripts/i18n_translator.py --sync-all
```

### 新增语言

```bash
# 1. 完整翻译新语言 (使用默认 NVIDIA API)
python scripts/i18n_translator.py --target th_TH

# 2. 配置文件自动更新 (index.ts, userStore.ts)
# 脚本会自动处理
```

---

## 注意事项

1. **默认 API**: 脚本已内置 NVIDIA API 配置，无需额外设置即可使用
2. **断点续传**: 翻译中断后，再次运行会从上次进度继续（除非加 `--no-resume`）
3. **SSL 证书**: 使用自签名证书的 Ollama 服务器需要加 `--skip-ssl-verify`
4. **占位符保留**: 翻译时会保留 `{count}`, `{name}` 等占位符
5. **技术术语**: `eSIM`, `5G`, `WiFi` 等术语不会被翻译

---

## 问题排查

### 常见错误

| 错误 | 解决方案 |
|------|----------|
| `请先安装openai库` | 运行 `pip install openai httpx` |
| `目标文件不存在` | 先用翻译模式生成完整文件 |
| `JSON解析错误` | 检查源文件格式是否正确 |
| `API调用错误` | 检查网络连接或更换 API 配置 |

### 查看帮助

```bash
python scripts/i18n_translator.py --help
```

