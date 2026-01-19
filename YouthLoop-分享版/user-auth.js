// 用户认证状态管理
class UserAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        // 从本地存储加载用户信息
        const userData = localStorage.getItem('youthloop_user');
        if (userData) {
            this.user = JSON.parse(userData);
        }
        this.updateUI();
    }

    // 登录
    login(userData) {
        this.user = {
            id: userData.id || Date.now(),
            username: userData.username || userData.contact,
            email: userData.email || userData.contact,
            avatar: userData.avatar || null,
            points: userData.points || 0,
            level: userData.level || 1,
            joinDate: userData.joinDate || new Date().toISOString(),
            ...userData
        };
        
        localStorage.setItem('youthloop_user', JSON.stringify(this.user));
        this.updateUI();
    }

    // 登出
    logout() {
        this.user = null;
        localStorage.removeItem('youthloop_user');
        this.updateUI();
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.user !== null;
    }

    // 获取用户信息
    getUser() {
        return this.user;
    }

    // 获取当前用户（别名方法）
    getCurrentUser() {
        return this.user;
    }

    // 更新用户积分
    updatePoints(points) {
        if (this.user) {
            this.user.points = points;
            localStorage.setItem('youthloop_user', JSON.stringify(this.user));
            this.updateUI();
        }
    }

    // 更新UI
    updateUI() {
        const mobileAuthSection = document.querySelector('.mobile-auth-section');
        const desktopAuthSection = document.querySelector('.desktop-auth-section');

        if (this.isLoggedIn()) {
            // 显示用户头像和信息
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = this.getMobileUserHTML();
            }
            if (desktopAuthSection) {
                desktopAuthSection.innerHTML = this.getDesktopUserHTML();
            }
        } else {
            // 显示登录注册按钮
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = this.getMobileAuthHTML();
            }
            if (desktopAuthSection) {
                desktopAuthSection.innerHTML = this.getDesktopAuthHTML();
            }
        }

        // 重新初始化图标和事件
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        this.bindEvents();
    }

    // 移动端用户HTML
    getMobileUserHTML() {
        return `
            <div class="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
                <div class="flex items-center gap-3">
                    <div class="user-avatar w-8 h-8 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold text-sm cursor-pointer" onclick="toggleUserMenu()">
                        ${this.user.avatar ? `<img src="${this.user.avatar}" alt="头像" class="w-full h-full rounded-full object-cover">` : this.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-semibold text-[#30499B]">${this.user.username}</div>
                        <div class="text-xs text-slate-500">积分: ${this.user.points}</div>
                    </div>
                </div>
                <div id="mobile-user-menu" class="hidden bg-slate-50 rounded-lg p-3 space-y-2">
                    <a href="我的页面.html" class="block text-sm text-slate-600 hover:text-[#30499B] transition-colors">个人资料</a>
                    <a href="#" class="block text-sm text-slate-600 hover:text-[#30499B] transition-colors">消息中心</a>
                    <button onclick="userAuth.logout()" class="block w-full text-left text-sm text-[#EE4035] hover:text-[#dc2626] transition-colors">退出登录</button>
                </div>
            </div>
        `;
    }

    // 桌面端用户HTML
    getDesktopUserHTML() {
        return `
            <div class="relative user-menu-container">
                <div class="user-avatar flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/60 transition-all" onclick="toggleUserMenu()">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#56B949] to-[#4aa840] flex items-center justify-center text-white font-bold text-sm relative overflow-hidden">
                        ${this.user.avatar ? `<img src="${this.user.avatar}" alt="头像" class="w-full h-full rounded-full object-cover">` : this.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="hidden lg:block">
                        <div class="text-sm font-semibold text-[#30499B]">${this.user.username}</div>
                        <div class="text-xs text-slate-500">积分: ${this.user.points}</div>
                    </div>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform" id="user-menu-arrow"></i>
                </div>
                
                <div id="desktop-user-menu" class="hidden absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div class="px-4 py-2 border-b border-slate-100">
                        <div class="text-sm font-semibold text-slate-800">${this.user.username}</div>
                        <div class="text-xs text-slate-500">${this.user.email}</div>
                    </div>
                    <a href="我的页面.html" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <i data-lucide="user" class="w-4 h-4"></i>
                        个人资料
                    </a>
                    <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <i data-lucide="bell" class="w-4 h-4"></i>
                        消息中心
                    </a>
                    <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                        账户设置
                    </a>
                    <div class="border-t border-slate-100 mt-1 pt-1">
                        <button onclick="userAuth.logout()" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#EE4035] hover:bg-red-50 transition-colors">
                            <i data-lucide="log-out" class="w-4 h-4"></i>
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 移动端登录注册HTML
    getMobileAuthHTML() {
        return `
            <div class="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
                <a href="登录页面.html" class="text-sm font-semibold text-[#30499B] text-left">登录</a>
                <a href="注册页面.html" class="text-center text-sm px-4 py-2 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20">注册</a>
            </div>
        `;
    }

    // 桌面端登录注册HTML
    getDesktopAuthHTML() {
        return `
            <a href="登录页面.html" class="text-sm font-semibold text-[#30499B] hover:text-[#56B949] transition-colors">登录</a>
            <a href="注册页面.html" class="text-sm px-4 py-1.5 rounded-full bg-[#30499B] text-white font-medium shadow-md shadow-[#30499B]/20 hover:bg-[#253a7a] hover:scale-105 transition-all">注册</a>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu-container') && !e.target.closest('.user-avatar')) {
                this.closeUserMenu();
            }
        });
    }

    // 关闭用户菜单
    closeUserMenu() {
        const mobileMenu = document.getElementById('mobile-user-menu');
        const desktopMenu = document.getElementById('desktop-user-menu');
        const arrow = document.getElementById('user-menu-arrow');

        if (mobileMenu) mobileMenu.classList.add('hidden');
        if (desktopMenu) desktopMenu.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

// 切换用户菜单
function toggleUserMenu() {
    const mobileMenu = document.getElementById('mobile-user-menu');
    const desktopMenu = document.getElementById('desktop-user-menu');
    const arrow = document.getElementById('user-menu-arrow');

    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }

    if (desktopMenu) {
        desktopMenu.classList.toggle('hidden');
        if (arrow) {
            const isOpen = !desktopMenu.classList.contains('hidden');
            arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    // 重新初始化图标
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 全局实例
const userAuth = new UserAuth();

// 全局函数
window.toggleUserMenu = toggleUserMenu;
window.userAuth = userAuth;