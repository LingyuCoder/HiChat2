HiChat2
=======

Web IM工具HiChat v2——开发中

依赖：
1. Openfire
2. node.js (0.11+)

先用`npm install`安装所有依赖包

使用命令`node --harmony app.js`启动，然后在`localhost:3000/app/index.html`下看效果

* 单聊——RFC3921（√）
* 好友添加——RFC3921（√）
* 在线状态——RFC3921（√）
* 群聊——XEP0045（√）
* 群聊权限控制——XEP0045（√）
* 群聊书签——XEP0048（×）
* 个人名片——XEP0054（√）
* 带内注册——XEP0077（×）
* 数据表单——XEP0004（×）
* 文件传输——webrtc datachannel（√）
* 视频聊天——webrtc（√）
