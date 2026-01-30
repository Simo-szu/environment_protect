import json
import chardet

# 检测中文文件编码
with open('apps/web/src/i18n/messages/zh.json', 'rb') as f:
    raw_data = f.read()
    detected = chardet.detect(raw_data)
    print(f"检测到的编码: {detected['encoding']}")

# 读取英文翻译文件
with open('apps/web/src/i18n/messages/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# 读取中文翻译文件（使用检测到的编码）
with open('apps/web/src/i18n/messages/zh.json', 'r', encoding=detected['encoding']) as f:
    zh_data = json.load(f)

# 添加缺失的翻译键
if 'points' in en_data and 'progress' in en_data['points']:
    if 'nextLevel' not in en_data['points']['progress']:
        en_data['points']['progress']['nextLevel'] = 'Need'

if 'points' in zh_data and 'progress' in zh_data['points']:
    if 'nextLevel' not in zh_data['points']['progress']:
        zh_data['points']['progress']['nextLevel'] = '距离下一级还需'

# 保存文件（都用UTF-8）
with open('apps/web/src/i18n/messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

with open('apps/web/src/i18n/messages/zh.json', 'w', encoding='utf-8') as f:
    json.dump(zh_data, f, ensure_ascii=False, indent=4)

print("翻译文件已更新！")
