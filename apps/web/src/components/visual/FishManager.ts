/**
 * FishManager - 管理池塘中的鱼类动画
 * 使用CSS动画而不是复杂的GSAP MotionPath来避免SSR问题
 */

export interface Fish {
  id: string;
  element: HTMLElement;
  size: 'small' | 'large';
  health: 'healthy' | 'sick' | 'dead';
  x: number;
  y: number;
  speed: number;
  direction: number; // 角度（度）
  personality: 'active' | 'calm' | 'lazy';
  color: string;
}

export class FishManager {
  private container: HTMLElement;
  private fish: Fish[] = [];
  private animationId: number | null = null;
  private isRunning = false;
  private maxFishCount = 15; // 默认最大鱼数量
  private currentQuality: 'high' | 'medium' | 'low' | 'disabled' = 'high';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 设置性能质量 - 只影响动画质量，不影响鱼群数量
   */
  setPerformanceQuality(quality: 'high' | 'medium' | 'low' | 'disabled'): void {
    this.currentQuality = quality;
    // 性能质量只影响动画，不再调整鱼群数量
    // 鱼群数量完全由生态状态决定
  }

  /**
   * 根据生态状态调整鱼数量 - 唯一的鱼群变化逻辑
   */
  setEcologicalState(theme: 'healthy' | 'polluted' | 'collapsed', biomeState: any): void {
    // 鱼群数量只根据生态状态变化，与性能无关
    let targetFishCount: number;

    if (theme === 'healthy') {
      // 健康状态：鱼类繁荣，保持完整数量
      targetFishCount = 15;
    } else if (theme === 'polluted') {
      // 污染状态：鱼类减少，但变化渐进
      targetFishCount = Math.max(8, Math.round(biomeState.smallFish / 20));
    } else {
      // 崩溃状态：鱼类濒危，但不会完全消失
      targetFishCount = Math.max(3, Math.round(biomeState.smallFish / 50));
    }

    // 只根据生态状态调整，确保变化合理且渐进
    this.adjustFishCount(targetFishCount);
  }

  /**
   * 动态调整鱼数量
   */
  private adjustFishCount(targetCount: number): void {
    const currentCount = this.fish.length;

    if (targetCount === 0) {
      this.clearFish();
      return;
    }

    if (currentCount < targetCount) {
      // 需要添加鱼
      const containerRect = this.container.getBoundingClientRect();
      const safeWidth = containerRect.width - 120;
      const safeHeight = containerRect.height - 120;

      for (let i = currentCount; i < targetCount; i++) {
        const fish = this.createSingleFish(i, safeWidth, safeHeight);
        this.fish.push(fish);
        this.container.appendChild(fish.element);
      }
    } else if (currentCount > targetCount) {
      // 需要移除鱼
      const fishToRemove = this.fish.splice(targetCount);
      fishToRemove.forEach(fish => {
        if (fish.element.parentNode) {
          fish.element.parentNode.removeChild(fish.element);
        }
      });
    }
  }

  /**
   * 创建指定数量的鱼类
   */
  createFish(count: number = 15): void {
    this.maxFishCount = count;
    this.clearFish();

    const containerRect = this.container.getBoundingClientRect();
    const safeWidth = containerRect.width - 120; // 边界填充
    const safeHeight = containerRect.height - 120;

    for (let i = 0; i < count; i++) {
      const fish = this.createSingleFish(i, safeWidth, safeHeight);
      this.fish.push(fish);
      this.container.appendChild(fish.element);
    }

    this.startAnimation();
  }

  /**
   * 创建单条鱼
   */
  private createSingleFish(index: number, maxWidth: number, maxHeight: number): Fish {
    const size = Math.random() > 0.7 ? 'large' : 'small';
    const personalities = ['active', 'calm', 'lazy'] as const;
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    
    // 生成随机颜色
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 60%)`;
    
    // 创建鱼类元素 - 使用更真实的鱼形状
    const element = document.createElement('div');
    element.className = `fish fish-${size} fish-healthy`;

    const fishWidth = size === 'large' ? 48 : 32;
    const fishHeight = size === 'large' ? 24 : 16;

    element.style.cssText = `
      position: absolute;
      width: ${fishWidth}px;
      height: ${fishHeight}px;
      transform-origin: center;
      transition: all 0.3s ease;
      z-index: 10;
      pointer-events: none;
    `;

    // 创建鱼身体（主体）
    const body = document.createElement('div');
    body.style.cssText = `
      position: absolute;
      width: 70%;
      height: 100%;
      background: linear-gradient(45deg, ${color}, ${this.lightenColor(color, 20)});
      border-radius: 50% 20% 50% 20%;
      left: 0;
      top: 0;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
    `;
    element.appendChild(body);

    // 创建鱼尾巴
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      width: 35%;
      height: 80%;
      background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)});
      right: -15%;
      top: 10%;
      clip-path: polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%);
      transform-origin: left center;
    `;
    element.appendChild(tail);

    // 创建鱼眼睛
    const eye = document.createElement('div');
    eye.style.cssText = `
      position: absolute;
      width: ${size === 'large' ? '6px' : '4px'};
      height: ${size === 'large' ? '6px' : '4px'};
      background: radial-gradient(circle, white 60%, black 60%);
      border-radius: 50%;
      top: 25%;
      left: 15%;
      z-index: 1;
    `;
    element.appendChild(eye);

    // 创建鱼鳍
    const fin = document.createElement('div');
    fin.style.cssText = `
      position: absolute;
      width: 20%;
      height: 40%;
      background: ${this.darkenColor(color, 10)};
      bottom: -10%;
      left: 30%;
      border-radius: 0 0 50% 50%;
      opacity: 0.8;
    `;
    element.appendChild(fin);
    
    // 随机初始位置
    const x = Math.random() * maxWidth + 60;
    const y = Math.random() * maxHeight + 60;
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    return {
      id: `fish-${index}`,
      element,
      size,
      health: 'healthy',
      x,
      y,
      speed: personality === 'active' ? 0.8 : personality === 'calm' ? 0.5 : 0.3,
      direction: Math.random() * 360,
      personality,
      color
    };
  }

  /**
   * 更新所有鱼类的健康状态
   */
  updateFishHealth(theme: 'healthy' | 'polluted' | 'collapsed'): void {
    const healthMap = {
      healthy: 'healthy',
      polluted: 'sick',
      collapsed: 'dead'
    } as const;

    const newHealth = healthMap[theme];

    // 批量更新，减少重排和重绘
    requestAnimationFrame(() => {
      this.fish.forEach(fish => {
        if (fish.health !== newHealth) {
          fish.health = newHealth;

          // 更新CSS类
          fish.element.className = `fish fish-${fish.size} fish-${newHealth}`;

          // 根据健康状态调整样式
          if (newHealth === 'sick') {
            fish.element.style.opacity = '0.7';
            fish.element.style.filter = 'grayscale(0.3)';
            fish.speed *= 0.6; // 减慢速度
          } else if (newHealth === 'dead') {
            fish.element.style.opacity = '0.4';
            fish.element.style.filter = 'grayscale(1)';
            fish.element.style.transform += ' rotate(90deg)'; // 翻肚皮
            fish.speed *= 0.1; // 几乎不动
          } else {
            fish.element.style.opacity = '1';
            fish.element.style.filter = 'none';
            fish.element.style.transform = fish.element.style.transform.replace(' rotate(90deg)', '');
          }
        }
      });
    });
  }

  /**
   * 开始动画循环
   */
  private startAnimation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const animate = () => {
      if (!this.isRunning) return;
      
      this.updateFishPositions();
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * 更新鱼类位置
   */
  private updateFishPositions(): void {
    const containerRect = this.container.getBoundingClientRect();
    const maxWidth = containerRect.width - 60;
    const maxHeight = containerRect.height - 60;
    
    this.fish.forEach(fish => {
      // 根据健康状态调整移动模式
      if (fish.health === 'dead') {
        // 死鱼缓慢下沉或漂浮
        fish.y += 0.1;
        if (fish.y > maxHeight) fish.y = maxHeight;
      } else {
        // 正常游泳
        const radians = (fish.direction * Math.PI) / 180;
        fish.x += Math.cos(radians) * fish.speed;
        fish.y += Math.sin(radians) * fish.speed;
        
        // 边界检测和转向
        if (fish.x <= 30 || fish.x >= maxWidth) {
          fish.direction = 180 - fish.direction;
          fish.x = Math.max(30, Math.min(maxWidth, fish.x));
        }
        if (fish.y <= 30 || fish.y >= maxHeight) {
          fish.direction = -fish.direction;
          fish.y = Math.max(30, Math.min(maxHeight, fish.y));
        }
        
        // 随机改变方向
        if (Math.random() < 0.02) {
          fish.direction += (Math.random() - 0.5) * 30;
        }
      }
      
      // 更新DOM位置
      fish.element.style.left = `${fish.x}px`;
      fish.element.style.top = `${fish.y}px`;
      
      // 根据游泳方向旋转鱼
      const rotation = fish.health === 'dead' ? 90 : fish.direction;
      fish.element.style.transform = `rotate(${rotation}deg)`;
    });
  }

  /**
   * 停止动画
   */
  stopAnimation(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 清理所有鱼类
   */
  clearFish(): void {
    this.stopAnimation();
    this.fish.forEach(fish => {
      if (fish.element.parentNode) {
        fish.element.parentNode.removeChild(fish.element);
      }
    });
    this.fish = [];
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearFish();
  }

  /**
   * 获取鱼类数量
   */
  getFishCount(): number {
    return this.fish.length;
  }

  /**
   * 颜色处理工具函数
   */
  private lightenColor(color: string, percent: number): string {
    // 简单的颜色变亮处理
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      const newL = Math.min(100, parseInt(l) + percent);
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
    return color;
  }

  private darkenColor(color: string, percent: number): string {
    // 简单的颜色变暗处理
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      const newL = Math.max(0, parseInt(l) - percent);
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
    return color;
  }
}
