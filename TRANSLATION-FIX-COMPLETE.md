# Next.js 多语言文案修复完整报告

## ✅ 修复完成

所有缺失的翻译 key 已补充完毕！

## 📋 修复的问题

### 1. 重复对象定义
- ❌ `play` 对象被定义了 2 次
- ❌ `discard` 对象被定义了 2 次
- ❌ `errors` 对象被定义了 2 次

### 2. 缺失的翻译 key
- ❌ `play.discard.selectedCardHint` - 已选择待弃牌提示
- ❌ `play.discard.pendingBadge` - 待确认弃置徽章

## 🛠️ 修复内容

### 新增的翻译 key

| Key | 中文 | 英文 | 用途 |
|-----|------|------|------|
| `play.discard.selectedCardHint` | 已选择待弃牌：{cardId} | Selected card to discard: {cardId} | 显示当前选中要弃置的卡牌 |
| `play.discard.pendingBadge` | 待确认弃置 | Pending Discard | 卡牌上的待弃置徽章 |

### 完整的 discard 文案列表

```typescript
discard: {
    title: '需要弃牌',                              // 弃牌面板标题
    confirmAction: '确认弃置',                       // 确认按钮
    cancelSelection: '取消选择',                     // 取消按钮
    selectCardHint: '请点击要弃置的卡牌',            // 未选择时的提示
    selectedCardHint: '已选择待弃牌：{cardId}',      // ✅ 新增：已选择时的提示
    pendingBadge: '待确认弃置',                      // ✅ 新增：卡牌徽章
    instruction: '手牌数量已超过上限...',            // 说明文字
    overLimitGuide: '手牌太多？...',                 // 引导文字
    clickToDiscardStrong: '点击下方任意卡牌即弃牌',  // 强调提示
    requiredHint: '还需弃置 {count} 张...',          // 数量提示
    inlineHint: '当前手牌超上限...',                 // 内联提示
    action: '弃置',                                  // 操作名称
    clickCore: '点击弃置这张核心卡',                 // 核心卡提示
    clickPolicy: '点击弃置这张政策卡',               // 政策卡提示
}
```

## 📁 修复的文件

1. ✅ `apps/web/src/i18n/locales/zh/game.ts`
2. ✅ `apps/web/src/i18n/locales/en/game.ts`

## ✅ 验证结果

```bash
TypeScript 编译检查：
✅ apps/web/src/i18n/locales/zh/game.ts: No diagnostics found
✅ apps/web/src/i18n/locales/en/game.ts: No diagnostics found
```

## 🚀 如何测试

### 1. 清除缓存
```bash
cd apps/web
rm -rf .next
pnpm dev
```

### 2. 测试弃牌完整流程

**步骤：**
1. 启动游戏，手牌超过上限
2. 查看弃牌面板标题：应显示"需要弃牌"
3. 查看提示文字：应显示"请点击要弃置的卡牌"
4. **点击一张卡牌**
5. ✅ 查看提示变化：应显示"已选择待弃牌：XXX"（而非 `game.play.discard.selectedCardHint`）
6. ✅ 查看卡牌徽章：选中的卡牌上应显示"待确认弃置"徽章
7. 点击"确认弃置"按钮完成弃牌

### 3. 测试语言切换
1. 切换到英文
2. 重复上述流程
3. 确认英文文案正常显示

## 🔍 问题排查

如果文案仍未生效：

### 方案 1：强制清除所有缓存
```bash
cd apps/web
rm -rf .next node_modules/.cache
pnpm dev
```

### 方案 2：浏览器强制刷新
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 方案 3：检查控制台
打开浏览器开发者工具，查看是否还有其他 `MISSING_MESSAGE` 错误

## 📝 修复历史

### 第一次修复
- 合并重复的 `play`、`discard`、`errors` 对象
- 添加 `trade.success` 文案

### 第二次修复（本次）
- ✅ 补充 `play.discard.selectedCardHint`
- ✅ 补充 `play.discard.pendingBadge`

## 🎯 总结

所有已知的弃牌相关翻译 key 都已补充完毕。如果在测试过程中发现其他缺失的 key，请：

1. 记录控制台中的 `MISSING_MESSAGE` 错误
2. 记录页面上显示的原始 key 名
3. 告诉我具体的 key 名称，我会立即补充

现在可以重启前端服务进行测试了！🎉
