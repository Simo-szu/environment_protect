#!/usr/bin/env python3
"""
i18n翻译脚本

使用OpenAI/Ollama/NVIDIA API将zh_CN.ts中的中文文本翻译成目标语言
保留原始文件结构、注释和格式，只翻译值部分
支持文件对比、同步补全、批量处理多个语言文件

默认使用NVIDIA API (deepseek-ai/deepseek-v3.2模型)，无需额外配置API密钥

使用方法:
    # 翻译单个语言 (使用默认NVIDIA API配置)
    python scripts/i18n_translator.py --target en_US

    # 翻译单个语言 (使用自定义OpenAI API)
    python scripts/i18n_translator.py --target en_US --api-key YOUR_API_KEY --base-url YOUR_URL

    # 翻译单个语言 (使用Ollama)
    python scripts/i18n_translator.py --target en_US --use-ollama

    # 同步单个语言文件 (对比并补全缺失键，删除多余键)
    python scripts/i18n_translator.py --sync --target en_US

    # 批量同步所有语言文件
    python scripts/i18n_translator.py --sync-all

    # 干运行模式 (仅预览，不修改文件)
    python scripts/i18n_translator.py --sync-all --dry-run

    # 仅对比键值差异
    python scripts/i18n_translator.py --compare-only --target en_US

    # 排除某些语言
    python scripts/i18n_translator.py --sync-all --exclude ja_JP,ko_KR

环境变量:
    OPENAI_API_KEY: OpenAI API密钥 (可选，已内置NVIDIA API密钥)
    OPENAI_BASE_URL: OpenAI API基础URL (可选，默认使用NVIDIA API)
    OLLAMA_BASE_URL: Ollama API基础URL (可选)
"""

import os
import re
import json
import argparse
import time
import httpx
from typing import Dict, Any, List, Tuple

try:
    from openai import OpenAI
except ImportError:
    print("请先安装openai库: pip install openai httpx")
    exit(1)


# 配置
BATCH_SIZE = 30  # 每批翻译的键值对数量
MAX_RETRIES = 3  # 最大重试次数
RETRY_DELAY = 2  # 重试延迟(秒)

# Ollama默认配置
OLLAMA_DEFAULT_URL = "https://113.219.237.106:12665/v1"
OLLAMA_DEFAULT_MODEL = "alibilge/Huihui-GLM-4.6V-Flash-abliterated:q6_k"

# NVIDIA API默认配置 (使用deepseek模型)
NVIDIA_DEFAULT_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_DEFAULT_API_KEY = "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"
NVIDIA_DEFAULT_MODEL = "deepseek-ai/deepseek-v3.2"

# 语言映射
LANGUAGE_MAP = {
    'en_US': 'English',
    'ja_JP': 'Japanese',
    'ko_KR': 'Korean',
    'de_DE': 'German',
    'fr_FR': 'French',
    'es_ES': 'Spanish',
    'pt_BR': 'Portuguese (Brazil)',
    'ru_RU': 'Russian',
    'ar_SA': 'Arabic',
    'th_TH': 'Thai',
    'vi_VN': 'Vietnamese',
    'id_ID': 'Indonesian',
    'ms_MY': 'Malay',
}

# 语言文件头部注释模板
LANG_HEADER_MAP = {
    'en_US': ('英文', 'enUS'),
    'ja_JP': ('日文', 'jaJP'),
    'ko_KR': ('韩文', 'koKR'),
    'de_DE': ('德文', 'deDE'),
    'fr_FR': ('法文', 'frFR'),
    'es_ES': ('西班牙文', 'esES'),
    'pt_BR': ('葡萄牙文(巴西)', 'ptBR'),
    'ru_RU': ('俄文', 'ruRU'),
    'ar_SA': ('阿拉伯文', 'arSA'),
    'th_TH': ('泰文', 'thTH'),
    'vi_VN': ('越南文', 'viVN'),
    'id_ID': ('印尼文', 'idID'),
    'ms_MY': ('马来文', 'msMY'),
}


def parse_ts_file(file_path: str) -> Dict[str, Any]:
    """解析TypeScript语言文件为Python字典

    使用逐行解析的方式，更可靠地处理各种边缘情况
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取export const后面的对象内容
    match = re.search(r'export\s+const\s+\w+\s*=\s*(\{[\s\S]*\});?\s*$', content)
    if not match:
        raise ValueError(f"无法解析文件: {file_path}")

    obj_str = match.group(1)

    # 移除注释（按行处理）
    lines = obj_str.split('\n')
    clean_lines = []
    in_block_comment = False

    for line in lines:
        if in_block_comment:
            if '*/' in line:
                line = line[line.index('*/') + 2:]
                in_block_comment = False
            else:
                continue

        # 移除块注释开始
        while '/*' in line:
            start = line.index('/*')
            if '*/' in line[start:]:
                end = line.index('*/', start) + 2
                line = line[:start] + line[end:]
            else:
                line = line[:start]
                in_block_comment = True
                break

        # 移除行注释（简单处理：只在行尾寻找//）
        # 使用更安全的方法：逐字符检查
        result_line = []
        i = 0
        in_str = False
        str_char = None
        while i < len(line):
            c = line[i]
            if not in_str:
                if c in ('"', "'"):
                    in_str = True
                    str_char = c
                    result_line.append(c)
                elif c == '/' and i + 1 < len(line) and line[i + 1] == '/':
                    break  # 行注释开始
                else:
                    result_line.append(c)
            else:
                result_line.append(c)
                if c == '\\' and i + 1 < len(line):
                    i += 1
                    result_line.append(line[i])
                elif c == str_char:
                    in_str = False
            i += 1

        clean_lines.append(''.join(result_line))

    obj_str = '\n'.join(clean_lines)

    # 使用正则表达式处理键名和值
    # 匹配模式: 键名: 值 （在 { } 内）
    def convert_to_json(text: str) -> str:
        """将TypeScript对象转换为JSON格式"""
        result = []
        i = 0
        length = len(text)

        while i < length:
            c = text[i]

            # 处理字符串
            if c in ('"', "'"):
                quote = c
                result.append('"')  # 统一用双引号
                i += 1
                while i < length:
                    sc = text[i]
                    if sc == '\\' and i + 1 < length:
                        next_c = text[i + 1]
                        if next_c == quote:
                            result.append(quote)  # 转义的引号
                        elif next_c == '"' and quote == "'":
                            result.append('\\"')  # 在单引号字符串中的双引号需要转义
                        else:
                            result.append(sc)
                            result.append(next_c)
                        i += 2
                        continue
                    if sc == quote:
                        result.append('"')
                        i += 1
                        break
                    if sc == '"' and quote == "'":
                        result.append('\\"')  # 内部双引号转义
                    else:
                        result.append(sc)
                    i += 1
                continue

            # 处理标识符（可能是键名）
            if c.isalpha() or c == '_':
                # 收集标识符
                start = i
                while i < length and (text[i].isalnum() or text[i] == '_'):
                    i += 1
                identifier = text[start:i]

                # 检查后面是否有冒号
                j = i
                while j < length and text[j] in ' \t':
                    j += 1
                if j < length and text[j] == ':':
                    # 这是键名
                    result.append(f'"{identifier}"')
                else:
                    # 普通标识符（如 true, false, null）
                    result.append(identifier)
                continue

            result.append(c)
            i += 1

        return ''.join(result)

    json_str = convert_to_json(obj_str)

    # 移除尾部逗号
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        error_pos = e.pos if hasattr(e, 'pos') else 0
        start = max(0, error_pos - 100)
        end = min(len(json_str), error_pos + 100)
        print(f"错误位置附近: ...{json_str[start:end]}...")
        raise


def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, str]:
    """将嵌套字典扁平化为点分隔的键值对"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # 数组保持原样
            items.append((new_key, v))
        else:
            items.append((new_key, v))
    return dict(items)


def unflatten_dict(d: Dict[str, Any], sep: str = '.') -> Dict[str, Any]:
    """将扁平化的字典恢复为嵌套结构"""
    result = {}
    for key, value in d.items():
        parts = key.split(sep)
        current = result
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
    return result


def chunk_dict(d: Dict[str, Any], chunk_size: int) -> List[Dict[str, Any]]:
    """将字典分块"""
    items = list(d.items())
    return [dict(items[i:i + chunk_size]) for i in range(0, len(items), chunk_size)]


def extract_values_with_positions(file_path: str) -> Tuple[str, List[Tuple[str, str, int, int, int]]]:
    """提取文件中的键值对及其位置信息

    保留原始文件结构，只提取需要翻译的值和位置

    Returns:
        (原始内容, [(键路径, 原始值, 行号, 值开始位置, 值结束位置), ...])
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    result = []
    key_stack = []  # 当前的键路径栈

    # 匹配键值对: key: 'value' 或 key: "value" 或 key: [...] 或 key: {
    # 也匹配嵌套对象开始: key: {
    key_value_pattern = re.compile(
        r'^(\s*)(\w+)\s*:\s*'  # 键名
        r"(?:"
        r"'((?:[^'\\]|\\.)*)'"  # 单引号字符串
        r'|"((?:[^"\\]|\\.)*)"'  # 双引号字符串
        r"|(\[.*?\])"  # 数组
        r"|(\{)\s*$"  # 对象开始
        r")"
    )

    # 匹配对象结束
    obj_end_pattern = re.compile(r'^\s*\}')

    for line_num, line in enumerate(lines):
        # 检查对象结束
        if obj_end_pattern.match(line) and key_stack:
            key_stack.pop()
            continue

        # 检查键值对
        match = key_value_pattern.match(line)
        if match:
            indent, key_name = match.group(1), match.group(2)
            single_quote_val = match.group(3)
            double_quote_val = match.group(4)
            array_val = match.group(5)
            obj_start = match.group(6)

            # 更新键路径
            # 根据缩进级别确定在哪个层级
            indent_level = len(indent) // 2
            while len(key_stack) > indent_level:
                key_stack.pop()

            if obj_start:
                # 对象开始，将键名加入栈
                key_stack.append(key_name)
            else:
                # 这是一个值
                current_path = '.'.join(key_stack + [key_name])

                if single_quote_val is not None:
                    value = single_quote_val.replace("\\'", "'")
                    # 找到值在行中的位置
                    val_start = line.index("'") + 1
                    val_end = line.rindex("'")
                    result.append((current_path, value, line_num, val_start, val_end))
                elif double_quote_val is not None:
                    value = double_quote_val.replace('\\"', '"')
                    val_start = line.index('"') + 1
                    val_end = line.rindex('"')
                    result.append((current_path, value, line_num, val_start, val_end))
                elif array_val:
                    # 数组需要特殊处理
                    val_start = line.index('[')
                    val_end = line.rindex(']') + 1
                    result.append((current_path, array_val, line_num, val_start, val_end))

    return content, result


def generate_translated_file(
    source_content: str,
    translations: Dict[str, str],
    target_lang_code: str
) -> str:
    """基于翻译结果生成新的语言文件

    保留原始文件的所有结构、注释和格式，只替换值
    """
    lines = source_content.split('\n')

    # 获取目标语言信息
    lang_name, var_name = LANG_HEADER_MAP.get(target_lang_code, (target_lang_code, target_lang_code.replace('_', '')))

    # 替换文件头部注释中的语言名称
    for i, line in enumerate(lines):
        if '中文语言包' in line:
            lines[i] = line.replace('中文语言包', f'{lang_name}语言包')
        elif '中文文本' in line:
            lines[i] = line.replace('中文文本', f'{lang_name}文本')
        elif 'zhCN' in line:
            lines[i] = line.replace('zhCN', var_name)

    result_lines = lines.copy()
    key_stack = []

    # 正则匹配
    key_value_pattern = re.compile(
        r'^(\s*)(\w+)(\s*:\s*)'
        r"(?:"
        r"('(?:[^'\\]|\\.)*')"  # 单引号字符串
        r'|("(?:[^"\\]|\\.)*")'  # 双引号字符串
        r"|(\[.*?\])"  # 数组
        r"|(\{)\s*$"  # 对象开始
        r")"
        r"(,?\s*)$"  # 可能的逗号和尾部空格
    )
    obj_end_pattern = re.compile(r'^\s*\}')

    for line_num, line in enumerate(result_lines):
        # 检查对象结束
        if obj_end_pattern.match(line) and key_stack:
            key_stack.pop()
            continue

        match = key_value_pattern.match(line)
        if match:
            indent = match.group(1)
            key_name = match.group(2)
            colon_part = match.group(3)
            single_val = match.group(4)
            double_val = match.group(5)
            array_val = match.group(6)
            obj_start = match.group(7)
            trailing = match.group(8)

            # 更新键路径
            indent_level = len(indent) // 2
            while len(key_stack) > indent_level:
                key_stack.pop()

            if obj_start:
                key_stack.append(key_name)
            else:
                current_path = '.'.join(key_stack + [key_name])

                if current_path in translations:
                    translated = translations[current_path]

                    if array_val:
                        # 数组类型
                        if isinstance(translated, list):
                            # 数组项也需要转义
                            escaped_items = []
                            for item in translated:
                                if isinstance(item, str):
                                    esc = item.replace('\\', '\\\\').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t').replace("'", "\\'")
                                    escaped_items.append(f"'{esc}'")
                                else:
                                    escaped_items.append(f"'{item}'")
                            new_val = "[" + ", ".join(escaped_items) + "]"
                        else:
                            new_val = translated
                    else:
                        # 字符串类型 - 转义特殊字符
                        if isinstance(translated, str):
                            # 先转义反斜杠，然后转义换行符，最后转义单引号
                            escaped = translated.replace('\\', '\\\\')
                            escaped = escaped.replace('\n', '\\n')
                            escaped = escaped.replace('\r', '\\r')
                            escaped = escaped.replace('\t', '\\t')
                            escaped = escaped.replace("'", "\\'")
                            new_val = f"'{escaped}'"
                        else:
                            new_val = f"'{translated}'"

                    result_lines[line_num] = f"{indent}{key_name}{colon_part}{new_val}{trailing}"

    return '\n'.join(result_lines)


class I18nTranslator:
    """i18n翻译器类，支持OpenAI和Ollama"""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str = 'gpt-4o',
        use_ollama: bool = False,
        skip_ssl_verify: bool = False
    ):
        """初始化翻译器

        Args:
            api_key: OpenAI API密钥 (Ollama模式下可为空)
            base_url: API基础URL (可选)
            model: 使用的模型名称
            use_ollama: 是否使用Ollama
            skip_ssl_verify: 是否跳过SSL证书验证
        """
        self.use_ollama = use_ollama
        self.skip_ssl_verify = skip_ssl_verify

        if use_ollama:
            # Ollama配置
            self.base_url = base_url or OLLAMA_DEFAULT_URL
            self.model = model if model != 'gpt-4o' else OLLAMA_DEFAULT_MODEL

            # 创建自定义的httpx客户端来跳过SSL验证
            if skip_ssl_verify:
                http_client = httpx.Client(verify=False, timeout=120.0)
            else:
                http_client = httpx.Client(timeout=120.0)

            self.client = OpenAI(
                api_key=api_key or "ollama",  # Ollama不需要真实的API key
                base_url=self.base_url,
                http_client=http_client
            )
            print(f"使用Ollama: {self.base_url}")
            print(f"模型: {self.model}")
        else:
            # OpenAI配置 (默认使用NVIDIA API)
            actual_api_key = api_key or NVIDIA_DEFAULT_API_KEY
            actual_base_url = base_url or NVIDIA_DEFAULT_URL
            actual_model = model if model != 'gpt-4o' else NVIDIA_DEFAULT_MODEL

            self.client = OpenAI(
                api_key=actual_api_key,
                base_url=actual_base_url
            )
            self.model = actual_model
            print(f"使用OpenAI兼容API: {actual_base_url}")
            print(f"模型: {actual_model}")

        # 检测是否支持JSON模式
        self.supports_json_mode = not use_ollama

    def _extract_json(self, text: str) -> str:
        """从响应文本中提取JSON

        有些模型会在JSON前后添加额外的文本，需要提取出纯JSON部分
        """
        text = text.strip()

        # 如果已经是纯JSON，直接返回
        if text.startswith('{') and text.endswith('}'):
            return text

        # 尝试找到JSON块
        # 1. 尝试匹配```json ... ```格式
        json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', text)
        if json_match:
            return json_match.group(1)

        # 2. 尝试找到第一个{和最后一个}
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            return text[start:end + 1]

        # 3. 返回原文本，让调用者处理解析错误
        return text

    def translate_batch(self, texts: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        """翻译一批文本

        Args:
            texts: 要翻译的键值对字典
            target_lang: 目标语言名称

        Returns:
            翻译后的键值对字典
        """
        # 构建翻译提示
        prompt = f"""You are a professional translator. Translate the following JSON key-value pairs from Chinese to {target_lang}.

IMPORTANT RULES:
1. Only translate the VALUES, keep all KEYS exactly the same
2. Keep any placeholders like {{count}}, {{provider}}, {{version}} unchanged
3. Keep technical terms like 'eSIM', '5G', 'SIM', 'WiFi', 'GPS', 'API' unchanged
4. Maintain the same JSON structure
5. For arrays, translate each element
6. Return ONLY valid JSON, no explanations

Input JSON:
```json
{json.dumps(texts, ensure_ascii=False, indent=2)}
```

Output the translated JSON only:"""

        for attempt in range(MAX_RETRIES):
            try:
                # 构建请求参数
                request_params = {
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are a professional translator specializing in mobile app localization. Translate from Chinese to {target_lang} while maintaining consistency and natural expression. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                }

                # 只有支持JSON模式的API才添加response_format
                if self.supports_json_mode:
                    request_params["response_format"] = {"type": "json_object"}

                response = self.client.chat.completions.create(**request_params)
                result_text = response.choices[0].message.content

                # 解析返回的JSON
                if result_text is None:
                    print("API返回内容为空")
                    return texts

                # 尝试从响应中提取JSON
                result_text = self._extract_json(result_text)
                result = json.loads(result_text)

                # 验证所有键都存在
                missing_keys = set(texts.keys()) - set(result.keys())
                if missing_keys:
                    print(f"警告: 翻译结果缺少键: {missing_keys}")
                    # 使用原文填充缺失的键
                    for key in missing_keys:
                        result[key] = texts[key]

                return result

            except json.JSONDecodeError as e:
                print(f"JSON解析错误 (尝试 {attempt + 1}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                else:
                    print("使用原文作为翻译结果")
                    return texts

            except Exception as e:
                print(f"API调用错误 (尝试 {attempt + 1}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                else:
                    print("使用原文作为翻译结果")
                    return texts

        return texts

    def translate_file(
        self,
        source_file: str,
        target_file: str,
        target_lang_code: str,
        batch_size: int = BATCH_SIZE,
        resume: bool = True
    ) -> Tuple[int, int, List[str]]:
        """翻译整个文件

        Args:
            source_file: 源文件路径
            target_file: 目标文件路径
            target_lang_code: 目标语言代码 (如 'en_US')
            batch_size: 每批翻译的键值对数量
            resume: 是否从上次中断处继续

        Returns:
            (总键数, 已翻译键数, 缺失键列表)
        """
        target_lang = LANGUAGE_MAP.get(target_lang_code, target_lang_code)
        print(f"开始翻译: {source_file} -> {target_file} ({target_lang})")

        # 解析源文件
        source_data = parse_ts_file(source_file)
        flat_source = flatten_dict(source_data)
        total_keys = len(flat_source)
        print(f"源文件共 {total_keys} 个键值对")

        # 检查是否有已存在的翻译文件
        translated = {}
        progress_file = f"{target_file}.progress.json"

        if resume and os.path.exists(progress_file):
            print(f"发现进度文件，从上次中断处继续...")
            with open(progress_file, 'r', encoding='utf-8') as f:
                translated = json.load(f)
            print(f"已完成 {len(translated)}/{total_keys} 个键值对")

        # 找出需要翻译的键
        keys_to_translate = {k: v for k, v in flat_source.items() if k not in translated}

        if not keys_to_translate:
            print("所有键值对已翻译完成")
        else:
            print(f"还需翻译 {len(keys_to_translate)} 个键值对")

            # 分批翻译
            batches = chunk_dict(keys_to_translate, batch_size)

            for i, batch in enumerate(batches):
                print(f"\n翻译批次 {i + 1}/{len(batches)} ({len(batch)} 个键值对)...")

                result = self.translate_batch(batch, target_lang)
                translated.update(result)

                # 保存进度
                with open(progress_file, 'w', encoding='utf-8') as f:
                    json.dump(translated, f, ensure_ascii=False, indent=2)

                print(f"进度: {len(translated)}/{total_keys}")

                # 避免API限流
                if i < len(batches) - 1:
                    time.sleep(1)

        # 验证完整性
        missing_keys = [k for k in flat_source.keys() if k not in translated]

        if missing_keys:
            print(f"\n警告: 发现 {len(missing_keys)} 个缺失的键:")
            for key in missing_keys[:10]:
                print(f"  - {key}")
            if len(missing_keys) > 10:
                print(f"  ... 还有 {len(missing_keys) - 10} 个")

            # 自动补全缺失的键
            print("\n自动补全缺失的键...")
            missing_dict = {k: flat_source[k] for k in missing_keys}
            missing_batches = chunk_dict(missing_dict, batch_size)

            for batch in missing_batches:
                result = self.translate_batch(batch, target_lang)
                translated.update(result)
                time.sleep(1)

            # 再次检查
            still_missing = [k for k in flat_source.keys() if k not in translated]
            if still_missing:
                print(f"仍有 {len(still_missing)} 个键未翻译，使用原文")
                for key in still_missing:
                    translated[key] = flat_source[key]

        # 读取源文件内容
        with open(source_file, 'r', encoding='utf-8') as f:
            source_content = f.read()

        # 生成目标文件（保留原始格式）
        translated_content = generate_translated_file(
            source_content,
            translated,
            target_lang_code
        )

        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(translated_content)

        # 删除进度文件
        if os.path.exists(progress_file):
            os.remove(progress_file)

        print(f"\n翻译完成! 输出文件: {target_file}")
        return total_keys, len(translated), missing_keys


def compare_keys(source_file: str, target_file: str) -> Tuple[List[str], List[str]]:
    """对比两个语言文件的键值

    Args:
        source_file: 源文件路径
        target_file: 目标文件路径

    Returns:
        (缺失的键列表, 多余的键列表)
    """
    source_data = parse_ts_file(source_file)
    target_data = parse_ts_file(target_file)

    flat_source = flatten_dict(source_data)
    flat_target = flatten_dict(target_data)

    missing_keys = [k for k in flat_source.keys() if k not in flat_target]
    extra_keys = [k for k in flat_target.keys() if k not in flat_source]

    return missing_keys, extra_keys


def sync_language_file(
    translator: 'I18nTranslator',
    source_file: str,
    target_file: str,
    target_lang_code: str,
    batch_size: int = BATCH_SIZE,
    dry_run: bool = False
) -> Tuple[int, int, int]:
    """同步单个语言文件

    对比源文件和目标语言文件，翻译并补全缺失的键，删除多余的键

    Args:
        translator: 翻译器实例
        source_file: 源文件路径 (如 zh_CN.ts)
        target_file: 目标语言文件路径
        target_lang_code: 目标语言代码 (如 'en_US')
        batch_size: 每批翻译的键值对数量
        dry_run: 仅预览，不实际修改文件

    Returns:
        (缺失键数量, 多余键数量, 实际翻译数量)
    """
    target_lang = LANGUAGE_MAP.get(target_lang_code, target_lang_code)
    print(f"\n{'='*50}")
    print(f"同步语言文件: {target_lang_code} ({target_lang})")
    print(f"{'='*50}")

    # 检查目标文件是否存在
    if not os.path.exists(target_file):
        print(f"目标文件不存在: {target_file}")
        print("请先使用翻译功能生成完整的语言文件")
        return 0, 0, 0

    # 解析源文件和目标文件
    source_data = parse_ts_file(source_file)
    target_data = parse_ts_file(target_file)

    flat_source = flatten_dict(source_data)
    flat_target = flatten_dict(target_data)

    # 对比键值
    missing_keys = [k for k in flat_source.keys() if k not in flat_target]
    extra_keys = [k for k in flat_target.keys() if k not in flat_source]

    print(f"源文件键数: {len(flat_source)}")
    print(f"目标文件键数: {len(flat_target)}")
    print(f"缺失的键: {len(missing_keys)}")
    print(f"多余的键: {len(extra_keys)}")

    # 显示详情
    if missing_keys:
        print(f"\n缺失的键 ({len(missing_keys)}):")
        for key in missing_keys[:20]:
            print(f"  + {key}: {flat_source[key][:50] if isinstance(flat_source[key], str) else flat_source[key]}")
        if len(missing_keys) > 20:
            print(f"  ... 还有 {len(missing_keys) - 20} 个")

    if extra_keys:
        print(f"\n多余的键 ({len(extra_keys)}):")
        for key in extra_keys[:10]:
            print(f"  - {key}")
        if len(extra_keys) > 10:
            print(f"  ... 还有 {len(extra_keys) - 10} 个")

    # 如果没有差异，直接返回
    if not missing_keys and not extra_keys:
        print("\n✅ 文件已同步，无需更新")
        return 0, 0, 0

    # 干运行模式
    if dry_run:
        print("\n[干运行模式] 不会实际修改文件")
        return len(missing_keys), len(extra_keys), 0

    # 翻译缺失的键
    translated_count = 0
    if missing_keys:
        print(f"\n开始翻译 {len(missing_keys)} 个缺失的键...")

        # 准备需要翻译的内容
        missing_dict = {k: flat_source[k] for k in missing_keys}
        batches = chunk_dict(missing_dict, batch_size)

        for i, batch in enumerate(batches):
            print(f"翻译批次 {i + 1}/{len(batches)} ({len(batch)} 个键值对)...")

            result = translator.translate_batch(batch, target_lang)
            flat_target.update(result)
            translated_count += len(result)

            # 避免API限流
            if i < len(batches) - 1:
                time.sleep(1)

    # 删除多余的键
    if extra_keys:
        print(f"\n删除 {len(extra_keys)} 个多余的键...")
        for key in extra_keys:
            del flat_target[key]

    # 读取源文件内容作为模板
    with open(source_file, 'r', encoding='utf-8') as f:
        source_content = f.read()

    # 生成更新后的目标文件
    updated_content = generate_translated_file(
        source_content,
        flat_target,
        target_lang_code
    )

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"\n✅ 同步完成: {target_file}")
    print(f"   新增翻译: {translated_count}")
    print(f"   删除多余: {len(extra_keys)}")

    return len(missing_keys), len(extra_keys), translated_count


def sync_all_languages(
    translator: 'I18nTranslator',
    source_file: str,
    locales_dir: str,
    batch_size: int = BATCH_SIZE,
    dry_run: bool = False,
    exclude: List[str] | None = None
) -> Dict[str, Tuple[int, int, int]]:
    """同步所有语言文件

    扫描 locales 目录下的所有语言文件，逐个与源文件同步

    Args:
        translator: 翻译器实例
        source_file: 源文件路径 (如 zh_CN.ts)
        locales_dir: locales 目录路径
        batch_size: 每批翻译的键值对数量
        dry_run: 仅预览，不实际修改文件
        exclude: 排除的语言代码列表

    Returns:
        {语言代码: (缺失键数量, 多余键数量, 实际翻译数量)}
    """
    from pathlib import Path

    # 获取源语言代码
    source_lang = Path(source_file).stem  # 如 'zh_CN'
    exclude = exclude or []
    exclude.append(source_lang)  # 排除源文件本身

    # 扫描所有语言文件
    lang_codes = scan_language_files(locales_dir)
    target_langs = [code for code in lang_codes if code not in exclude]

    if not target_langs:
        print("没有找到需要同步的语言文件")
        return {}

    print(f"\n{'#'*60}")
    print(f"# 批量同步语言文件")
    print(f"# 源文件: {source_file}")
    print(f"# 目标语言: {', '.join(target_langs)}")
    print(f"# 干运行: {'是' if dry_run else '否'}")
    print(f"{'#'*60}")

    results = {}
    for lang_code in target_langs:
        target_file = os.path.join(locales_dir, f"{lang_code}.ts")
        try:
            result = sync_language_file(
                translator=translator,
                source_file=source_file,
                target_file=target_file,
                target_lang_code=lang_code,
                batch_size=batch_size,
                dry_run=dry_run
            )
            results[lang_code] = result
        except Exception as e:
            print(f"\n❌ 同步 {lang_code} 失败: {e}")
            results[lang_code] = (-1, -1, -1)

    # 输出汇总
    print(f"\n{'='*60}")
    print("同步汇总")
    print(f"{'='*60}")
    print(f"{'语言':<10} {'缺失键':<10} {'多余键':<10} {'已翻译':<10}")
    print("-" * 40)

    total_missing = 0
    total_extra = 0
    total_translated = 0

    for lang_code, (missing, extra, translated) in results.items():
        if missing == -1:
            print(f"{lang_code:<10} {'错误':<10}")
        else:
            print(f"{lang_code:<10} {missing:<10} {extra:<10} {translated:<10}")
            total_missing += missing
            total_extra += extra
            total_translated += translated

    print("-" * 40)
    print(f"{'总计':<10} {total_missing:<10} {total_extra:<10} {total_translated:<10}")

    return results


def scan_language_files(locales_dir: str) -> List[str]:
    """扫描 locales 目录下的所有语言文件

    Args:
        locales_dir: locales 目录路径

    Returns:
        语言代码列表，如 ['zh_CN', 'en_US', 'ja_JP']
    """
    from pathlib import Path

    lang_codes = []
    locales_path = Path(locales_dir)

    # 匹配 xx_XX.ts 格式的文件（排除 index.ts 和其他文件）
    pattern = re.compile(r'^([a-z]{2}_[A-Z]{2})\.ts$')

    for file in locales_path.iterdir():
        if file.is_file():
            match = pattern.match(file.name)
            if match:
                lang_codes.append(match.group(1))

    # 按语言代码排序，确保 zh_CN 在前面
    lang_codes.sort(key=lambda x: (x != 'zh_CN', x))
    return lang_codes


def update_locales_index(locales_dir: str) -> None:
    """自动更新 locales/index.ts 文件

    扫描目录下的所有语言文件，自动生成导入语句和资源映射

    Args:
        locales_dir: locales 目录路径
    """
    from pathlib import Path

    index_file = Path(locales_dir) / 'index.ts'
    if not index_file.exists():
        print(f"警告: {index_file} 不存在，跳过更新")
        return

    lang_codes = scan_language_files(locales_dir)
    print(f"发现 {len(lang_codes)} 个语言文件: {lang_codes}")

    # 生成变量名映射 (zh_CN -> zhCN, en_US -> enUS)
    def to_var_name(code: str) -> str:
        # 直接去掉下划线，保留原大小写
        return code.replace('_', '')

    # 读取现有文件
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 生成导入语句
    text_imports = []
    for code in lang_codes:
        var_name = to_var_name(code)
        text_imports.append(f"import {{ {var_name} }} from './{code}';")

    # 检查图片文件是否存在
    images_dir = Path(locales_dir) / 'images'
    image_imports = []
    image_codes = []
    for code in lang_codes:
        image_file = images_dir / f'{code}.ts'
        if image_file.exists():
            var_name = to_var_name(code) + 'Images'
            image_imports.append(f"import {{ {var_name} }} from './images/{code}';")
            image_codes.append(code)

    # 生成 textResources 映射
    text_resources_lines = ["const textResources = {"]
    for code in lang_codes:
        var_name = to_var_name(code)
        text_resources_lines.append(f"  {code}: {var_name},")
    text_resources_lines.append("};")

    # 生成 imageResources 映射
    image_resources_lines = ["const imageResources = {"]
    for code in image_codes:
        var_name = to_var_name(code) + 'Images'
        image_resources_lines.append(f"  {code}: {var_name},")
    image_resources_lines.append("};")

    # 替换文件内容
    # 1. 替换导入语句
    import_pattern = re.compile(
        r"(import \{ \w+ \} from '\./[a-z]{2}_[A-Z]{2}';\n)+",
        re.MULTILINE
    )
    new_imports = '\n'.join(text_imports) + '\n'
    content = import_pattern.sub(new_imports, content)

    # 2. 替换图片导入
    image_import_pattern = re.compile(
        r"(import \{ \w+Images \} from '\./images/[a-z]{2}_[A-Z]{2}';\n)+",
        re.MULTILINE
    )
    new_image_imports = '\n'.join(image_imports) + '\n'
    content = image_import_pattern.sub(new_image_imports, content)

    # 3. 替换 textResources
    text_resources_pattern = re.compile(
        r"const textResources = \{[^}]+\};",
        re.MULTILINE | re.DOTALL
    )
    new_text_resources = '\n'.join(text_resources_lines)
    content = text_resources_pattern.sub(new_text_resources, content)

    # 4. 替换 imageResources
    image_resources_pattern = re.compile(
        r"const imageResources = \{[^}]+\};",
        re.MULTILINE | re.DOTALL
    )
    new_image_resources = '\n'.join(image_resources_lines)
    content = image_resources_pattern.sub(new_image_resources, content)

    # 写回文件
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"已更新 {index_file}")


def update_user_store_language_type(locales_dir: str, user_store_file: str) -> None:
    """自动更新 userStore.ts 中的 LanguageType 类型定义

    Args:
        locales_dir: locales 目录路径
        user_store_file: userStore.ts 文件路径
    """
    from pathlib import Path

    store_path = Path(user_store_file)
    if not store_path.exists():
        print(f"警告: {user_store_file} 不存在，跳过更新")
        return

    lang_codes = scan_language_files(locales_dir)

    # 读取现有文件
    with open(store_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 生成新的 LanguageType 定义
    lang_types = ' | '.join(f"'{code}'" for code in lang_codes)
    new_type_def = f"export type LanguageType = {lang_types};"

    # 替换 LanguageType 定义
    type_pattern = re.compile(r"export type LanguageType = [^;]+;")

    if type_pattern.search(content):
        content = type_pattern.sub(new_type_def, content)

        with open(store_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"已更新 {user_store_file} 中的 LanguageType: {lang_codes}")
    else:
        print(f"警告: 在 {user_store_file} 中未找到 LanguageType 定义")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='i18n翻译脚本 - 使用OpenAI/Ollama API翻译语言文件'
    )
    parser.add_argument(
        '--source',
        type=str,
        default='src/locales/zh_CN.ts',
        help='源文件路径 (默认: src/locales/zh_CN.ts)'
    )
    parser.add_argument(
        '--target',
        type=str,
        default=None,
        help='目标语言代码 (如: en_US, ja_JP)，--sync-all 模式下可省略'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='输出文件路径 (默认: src/locales/{target}.ts)'
    )
    parser.add_argument(
        '--api-key',
        type=str,
        default=None,
        help='OpenAI API密钥 (也可通过OPENAI_API_KEY环境变量设置)'
    )
    parser.add_argument(
        '--base-url',
        type=str,
        default=None,
        help='API基础URL (可选，用于自定义endpoint)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default='gpt-4o',
        help='使用的模型名称 (默认: gpt-4o, Ollama默认: Huihui-GLM-4.6V)'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=BATCH_SIZE,
        help=f'每批翻译的键值对数量 (默认: {BATCH_SIZE})'
    )
    parser.add_argument(
        '--compare-only',
        action='store_true',
        help='仅对比键值，不进行翻译'
    )
    parser.add_argument(
        '--no-resume',
        action='store_true',
        help='不从上次中断处继续，重新开始翻译'
    )
    # Ollama相关参数
    parser.add_argument(
        '--use-ollama',
        action='store_true',
        help='使用Ollama作为翻译引擎 (默认使用预配置的服务器和模型)'
    )
    parser.add_argument(
        '--skip-ssl-verify',
        action='store_true',
        help='跳过SSL证书验证 (用于自签名证书的Ollama服务器)'
    )
    # 配置更新选项
    parser.add_argument(
        '--update-config',
        action='store_true',
        help='仅更新 index.ts 和 userStore.ts 配置，不进行翻译'
    )
    parser.add_argument(
        '--fix-format',
        action='store_true',
        help='修复已有翻译文件的格式问题（换行符等）'
    )
    # 同步功能选项
    parser.add_argument(
        '--sync',
        action='store_true',
        help='同步模式: 对比源文件和目标语言文件，自动翻译补全缺失键，删除多余键'
    )
    parser.add_argument(
        '--sync-all',
        action='store_true',
        help='批量同步所有语言文件: 扫描locales目录，同步所有语言文件到源文件'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='干运行模式: 仅预览同步结果，不实际修改文件 (配合 --sync 或 --sync-all 使用)'
    )
    parser.add_argument(
        '--exclude',
        type=str,
        default='',
        help='排除的语言代码，逗号分隔 (如: ja_JP,ko_KR)'
    )

    args = parser.parse_args()

    # 确定路径
    locales_dir = os.path.dirname(args.source)
    output_file = args.output or f"src/locales/{args.target}.ts"
    user_store_file = os.path.join(os.path.dirname(locales_dir), 'api', 'userStore.ts')

    # 仅更新配置模式
    if args.update_config:
        print("=== 仅更新配置文件 ===")
        update_locales_index(locales_dir)
        update_user_store_language_type(locales_dir, user_store_file)
        print("\n✅ 配置更新完成!")
        return

    # 修复格式模式
    if args.fix_format:
        if not os.path.exists(output_file):
            print(f"目标文件不存在: {output_file}")
            return

        print(f"=== 修复文件格式: {output_file} ===")

        # 解析目标文件获取翻译内容
        target_data = parse_ts_file(output_file)
        flat_target = flatten_dict(target_data)

        # 读取源文件结构
        with open(args.source, 'r', encoding='utf-8') as f:
            source_content = f.read()

        # 使用源文件结构 + 翻译内容重新生成
        fixed_content = generate_translated_file(
            source_content,
            flat_target,
            args.target
        )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        print(f"✅ 文件格式已修复: {output_file}")

        # 同时更新配置
        update_locales_index(locales_dir)
        update_user_store_language_type(locales_dir, user_store_file)
        print("\n✅ 所有操作完成!")
        return

    # 仅对比模式
    if args.compare_only:
        if not os.path.exists(output_file):
            print(f"目标文件不存在: {output_file}")
            return

        print(f"对比键值: {args.source} vs {output_file}")
        missing, extra = compare_keys(args.source, output_file)

        if missing:
            print(f"\n缺失的键 ({len(missing)}):")
            for key in missing:
                print(f"  - {key}")
        else:
            print("\n没有缺失的键")

        if extra:
            print(f"\n多余的键 ({len(extra)}):")
            for key in extra:
                print(f"  + {key}")
        else:
            print("\n没有多余的键")

        return

    # 解析排除列表
    exclude_langs = [x.strip() for x in args.exclude.split(',') if x.strip()]

    # 同步所有语言模式
    if args.sync_all:
        # 创建翻译器
        translator = _create_translator(args)
        if translator is None:
            return

        # 执行批量同步
        sync_all_languages(
            translator=translator,
            source_file=args.source,
            locales_dir=locales_dir,
            batch_size=args.batch_size,
            dry_run=args.dry_run,
            exclude=exclude_langs if exclude_langs else None
        )

        # 更新配置文件
        if not args.dry_run:
            print("\n=== 更新配置文件 ===")
            update_locales_index(locales_dir)
            update_user_store_language_type(locales_dir, user_store_file)

        print("\n✅ 批量同步完成!")
        return

    # 单语言同步模式
    if args.sync:
        if not args.target:
            print("错误: --sync 模式需要指定 --target 参数")
            return

        # 创建翻译器
        translator = _create_translator(args)
        if translator is None:
            return

        # 执行同步
        sync_language_file(
            translator=translator,
            source_file=args.source,
            target_file=output_file,
            target_lang_code=args.target,
            batch_size=args.batch_size,
            dry_run=args.dry_run
        )

        # 更新配置文件
        if not args.dry_run:
            print("\n=== 更新配置文件 ===")
            update_locales_index(locales_dir)
            update_user_store_language_type(locales_dir, user_store_file)

        print("\n✅ 同步完成!")
        return

    # 验证target参数
    if not args.target:
        print("错误: 请指定 --target 参数，或使用 --sync-all 批量同步")
        return

    # 创建翻译器
    translator = _create_translator(args)
    if translator is None:
        return

    # 执行翻译
    total, translated, missing = translator.translate_file(
        args.source,
        output_file,
        args.target,
        batch_size=args.batch_size,
        resume=not args.no_resume
    )

    # 输出统计
    print("\n=== 翻译统计 ===")
    print(f"总键数: {total}")
    print(f"已翻译: {translated}")
    print(f"缺失键: {len(missing)}")

    if missing:
        print("\n缺失的键已自动补全")

    # 自动更新 index.ts 和 userStore.ts
    print("\n=== 更新配置文件 ===")
    update_locales_index(locales_dir)
    update_user_store_language_type(locales_dir, user_store_file)

    print("\n✅ 所有操作完成!")


def _create_translator(args) -> I18nTranslator | None:
    """根据命令行参数创建翻译器实例

    Args:
        args: 命令行参数

    Returns:
        翻译器实例，如果创建失败返回 None
    """
    if args.use_ollama:
        # Ollama模式
        api_key = args.api_key or "ollama"
        base_url = args.base_url or os.environ.get('OLLAMA_BASE_URL') or OLLAMA_DEFAULT_URL
        model = args.model if args.model != 'gpt-4o' else OLLAMA_DEFAULT_MODEL

        print("=" * 50)
        print("使用 Ollama 模式")
        print(f"  服务器: {base_url}")
        print(f"  模型: {model}")
        print(f"  跳过SSL验证: {args.skip_ssl_verify}")
        print("=" * 50)

        return I18nTranslator(
            api_key=api_key,
            base_url=base_url,
            model=model,
            use_ollama=True,
            skip_ssl_verify=args.skip_ssl_verify
        )
    else:
        # OpenAI模式 (默认使用NVIDIA API)
        api_key = args.api_key or os.environ.get('OPENAI_API_KEY')
        base_url = args.base_url or os.environ.get('OPENAI_BASE_URL')

        print("=" * 50)
        print("使用 OpenAI兼容模式 (默认NVIDIA API)")
        print(f"  服务器: {base_url or NVIDIA_DEFAULT_URL}")
        print(f"  模型: {args.model if args.model != 'gpt-4o' else NVIDIA_DEFAULT_MODEL}")
        print("=" * 50)

        return I18nTranslator(
            api_key=api_key,
            base_url=base_url,
            model=args.model
        )


if __name__ == '__main__':
    main()

