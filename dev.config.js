// 跨平台开发配置
const os = require('os');
const path = require('path');

const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

module.exports = {
  // 平台信息
  platform: {
    name: platform,
    isWindows,
    isMac,
    isLinux,
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
  },

  // 开发服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    https: process.env.HTTPS === 'true'
  },

  // 路径配置
  paths: {
    root: process.cwd(),
    src: path.join(process.cwd(), 'src'),
    public: path.join(process.cwd(), 'public'),
    build: path.join(process.cwd(), '.next'),
    nodeModules: path.join(process.cwd(), 'node_modules')
  },

  // 环境变量
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'My Digital Biome',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
  },

  // 平台特定配置
  platformSpecific: {
    // Windows 配置
    windows: {
      shell: 'cmd',
      pathSeparator: '\\',
      lineEnding: '\r\n'
    },
    // macOS 配置
    darwin: {
      shell: 'zsh',
      pathSeparator: '/',
      lineEnding: '\n'
    },
    // Linux 配置
    linux: {
      shell: 'bash',
      pathSeparator: '/',
      lineEnding: '\n'
    }
  }
};