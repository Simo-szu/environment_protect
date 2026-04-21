#!/bin/bash
# 多语言文案测试脚本

echo "======================================"
echo "  Next.js 多语言文案测试"
echo "======================================"
echo ""

echo "[1/3] 清除 Next.js 缓存..."
rm -rf .next
echo "✓ 缓存已清除"
echo ""

echo "[2/3] 检查 TypeScript 编译..."
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -E "(game\.ts|error)" || echo "✓ TypeScript 编译通过"
echo ""

echo "[3/3] 验证文案键是否存在..."
echo ""
echo "检查中文文案："
grep -q "confirmAction.*确认弃置" src/i18n/locales/zh/game.ts && echo "  ✓ discard.confirmAction" || echo "  ✗ discard.confirmAction 缺失"
grep -q "cancelSelection.*取消选择" src/i18n/locales/zh/game.ts && echo "  ✓ discard.cancelSelection" || echo "  ✗ discard.cancelSelection 缺失"
grep -q "selectCardHint.*请点击要弃置的卡牌" src/i18n/locales/zh/game.ts && echo "  ✓ discard.selectCardHint" || echo "  ✗ discard.selectCardHint 缺失"
grep -q "success.*交易成功" src/i18n/locales/zh/game.ts && echo "  ✓ trade.success" || echo "  ✗ trade.success 缺失"
echo ""

echo "检查英文文案："
grep -q "confirmAction.*Confirm Discard" src/i18n/locales/en/game.ts && echo "  ✓ discard.confirmAction" || echo "  ✗ discard.confirmAction 缺失"
grep -q "cancelSelection.*Cancel Selection" src/i18n/locales/en/game.ts && echo "  ✓ discard.cancelSelection" || echo "  ✗ discard.cancelSelection 缺失"
grep -q "selectCardHint.*Click the card you want to discard" src/i18n/locales/en/game.ts && echo "  ✓ discard.selectCardHint" || echo "  ✗ discard.selectCardHint 缺失"
grep -q "success.*Trade Successful" src/i18n/locales/en/game.ts && echo "  ✓ trade.success" || echo "  ✗ trade.success 缺失"
echo ""

echo "======================================"
echo "  测试完成！"
echo "======================================"
echo ""
echo "下一步："
echo "  1. 运行 'pnpm dev' 启动开发服务器"
echo "  2. 在浏览器中测试弃牌和交易功能"
echo "  3. 检查文案是否正确显示"
echo ""
