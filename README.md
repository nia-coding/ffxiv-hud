# FFXIV HUD

macOS 桌面悬浮任务看板原型，使用 Electron + 原生 HTML/CSS/JS 实现。内容由根目录 `tasks.json` 驱动，保存文件后会自动刷新 HUD。

## 运行

```bash
npm install
npm start
```

如果 Electron 官方下载源超时，使用镜像源安装：

```bash
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install
```

## 验证

```bash
npm run check
```

## 数据格式

```json
{
  "mainQuest": {
    "title": "任务名称",
    "objective": "当前阶段目标",
    "details": "详细说明文本"
  },
  "sideQuests": [
    {
      "title": "支线任务",
      "objective": "进度 0/1",
      "details": "详细说明文本"
    }
  ]
}
```

## 说明

应用默认开启鼠标穿透。鼠标移动到主线任务、支线任务或详情弹窗上时，渲染进程会通过 IPC 临时关闭穿透，让点击事件由 HUD 接管；离开可交互区域后恢复穿透。

如果 `npm install` 在 Electron 二进制下载阶段失败，通常是网络连接到 Electron release 源不稳定导致。可以换稳定网络，或使用上面的 `ELECTRON_MIRROR` 命令重新安装。
