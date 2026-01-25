// ========== 错误捕获和兼容性修复 ==========
console.log('🚀 app.js 开始加载');

// 全局错误捕获
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    // 防止错误阻断执行
    return true;
});

// 捕获Promise错误
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise错误:', e.reason);
    // 防止错误阻断执行
    e.preventDefault();
});

// 确保必要的对象存在
if (!window.console) window.console = { log: function(){}, error: function(){}, warn: function(){} };
if (!window.JSON) window.JSON = { parse: function(){ return null; }, stringify: function(){ return ''; } };

// 创建全局对象
window.quq = window.quq || {};

console.log('✅ app.js 基础加载完成');

// ========== quq小手机 - 主应用文件 ==========
// 作者: [您的名字]
// 版本: 1.0.1
// 最后更新: 2024年
// 描述: 仿微信风格的AI联系人聊天应用

// ========== 配置模块 ==========
const Config = {
    // 颜色配置
    lightColors: [
        '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec',
        '#f1f8e9', '#fff8e1', '#e8eaf6', '#f9fbe7', '#fffde7',
        '#e0f2f1', '#fff3e0', '#f3e5f5', '#e8f5e9', '#f1f8e9',
        '#fff8e1', '#e0f7fa', '#fce4ec', '#f3e5f5', '#e8eaf6'
    ],
    
    // API模型配置
    apiModels: {
        'gpt-3.5': {
            name: 'GPT-3.5 Turbo',
            description: '快速、经济、适用于大多数对话场景'
        },
        'gpt-4': {
            name: 'GPT-4',
            description: '更智能、理解更深层，适用于复杂对话'
        },
        'claude': {
            name: 'Claude',
            description: '擅长创意写作和逻辑推理'
        },
        'ernie': {
            name: '文心一言',
            description: '中文理解优秀，本土化优化'
        }
    },
    
    // 手机端优化配置
    touchMinSize: 44,
    fontSizeBase: 16,
    animationSpeed: 300,
    
    // 应用状态
    version: '1.0.1',
    debugMode: (function() {
        // 更兼容的主机名检测
        var hostname = window.location.hostname;
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               hostname === '0.0.0.0' ||
               hostname === '';
    })()
};

// ========== 工具模块 ==========
const Utils = {
    // 显示Toast通知
    showToast: function(message, type, duration) {
        if (typeof type === 'undefined') type = 'success';
        if (typeof duration === 'undefined') duration = 2000;
        
        // 创建或获取toast元素
        var toast = document.getElementById('quq-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'quq-toast';
            toast.className = 'toast';
            toast.innerHTML = '<div class="toast-content"></div>';
            document.body.appendChild(toast);
        }
        
        var content = toast.querySelector('.toast-content');
        if (content) {
            content.textContent = message;
        }
        
        // 重置样式
        toast.className = 'toast';
        toast.classList.add(type);
        
        // 显示
        setTimeout(function() {
            toast.classList.add('show');
        }, 10);
        
        // 隐藏
        setTimeout(function() {
            toast.classList.remove('show');
        }, duration);
        
        return toast;
    },
    
    // 格式化时间
    formatTime: function(date) {
        if (!date) date = new Date();
        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();
        
        // 兼容性处理
        hours = hours.length < 2 ? '0' + hours : hours;
        minutes = minutes.length < 2 ? '0' + minutes : minutes;
        
        return hours + ':' + minutes;
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        var inThrottle;
        return function() {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    },
    
    // 生成随机ID
    generateId: function(prefix) {
        if (typeof prefix === 'undefined') prefix = 'id';
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    },
    
    // 上传图片
    uploadImage: function(callback) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        var self = this;
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                // 检查文件大小（限制5MB）
                if (file.size > 5 * 1024 * 1024) {
                    self.showToast('图片大小不能超过5MB', 'error');
                    return;
                }
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    if (typeof callback === 'function') {
                        callback(e.target.result);
                    }
                };
                reader.onerror = function() {
                    self.showToast('图片读取失败', 'error');
                };
                
                try {
                    reader.readAsDataURL(file);
                } catch (error) {
                    self.showToast('文件读取错误', 'error');
                }
            }
        };
        
        try {
            input.click();
        } catch (error) {
            self.showToast('无法打开文件选择器', 'error');
        }
    },
    
    // 复制到剪贴板
    copyToClipboard: function(text) {
        var self = this;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                function() {
                    self.showToast('已复制到剪贴板');
                },
                function() {
                    // 降级方案
                    self._fallbackCopyToClipboard(text);
                }
            );
        } else {
            // 降级方案
            this._fallbackCopyToClipboard(text);
        }
    },
    
    // 降级复制方案
    _fallbackCopyToClipboard: function(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                this.showToast('已复制到剪贴板');
            } else {
                this.showToast('复制失败，请手动复制', 'error');
            }
        } catch (err) {
            this.showToast('复制失败', 'error');
        }
        
        document.body.removeChild(textArea);
    },
    
    // 获取设备信息
    getDeviceInfo: function() {
        return {
            userAgent: navigator.userAgent || '未知',
            platform: navigator.platform || '未知',
            language: navigator.language || 'zh-CN',
            screen: window.screen ? (window.screen.width + 'x' + window.screen.height) : '未知',
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
        };
    },
    
    // 安全解析JSON
    safeJsonParse: function(str, defaultValue) {
        if (typeof defaultValue === 'undefined') defaultValue = null;
        try {
            return JSON.parse(str);
        } catch (e) {
            return defaultValue;
        }
    }
};

// ========== 存储模块 ==========
const Storage = {
    // 数据缓存
    cache: {},
    
    // 获取数据（带缓存）
    get: function(key) {
        // 先从缓存获取
        if (this.cache[key] !== undefined) {
            return this.cache[key];
        }
        
        // 从localStorage获取并解析
        var data = localStorage.getItem(key);
        var parsed;
        
        try {
            parsed = data ? JSON.parse(data) : (key === 'user_info' ? {} : []);
        } catch {
            parsed = key === 'user_info' ? {} : [];
            console.warn('解析 ' + key + ' 数据失败，使用默认值');
        }
        
        // 缓存结果
        this.cache[key] = parsed;
        return parsed;
    },
    
    // 保存数据
    set: function(key, value) {
        try {
            var jsonStr = JSON.stringify(value);
            localStorage.setItem(key, jsonStr);
            this.cache[key] = value; // 更新缓存
            return true;
        } catch (error) {
            console.error('保存 ' + key + ' 失败:', error);
            Utils.showToast('保存失败，数据可能过大', 'error');
            return false;
        }
    },
    
    // 获取所有角色
    getRoles: function() {
        return this.get('contacts');
    },
    
    // 保存所有角色
    saveRoles: function(roles) {
        return this.set('contacts', roles);
    },
    
    // 获取动态
    getMoments: function() {
        return this.get('moments');
    },
    
    // 保存动态
    saveMoments: function(moments) {
        return this.set('moments', moments);
    },
    
    // 获取用户信息
    getUserInfo: function() {
        return this.get('user_info');
    },
    
    // 保存用户信息
    saveUserInfo: function(userInfo) {
        return this.set('user_info', userInfo);
    },
    
    // 获取聊天记录
    getChatHistories: function() {
        return this.get('chat_histories');
    },
    
    // 保存聊天记录
    saveChatHistories: function(histories) {
        return this.set('chat_histories', histories);
    },
    
    // 获取评论
    getComments: function() {
        return this.get('comments');
    },
    
    // 保存评论
    saveComments: function(comments) {
        return this.set('comments', comments);
    },
    
    // 获取点赞
    getLikes: function() {
        return this.get('likes');
    },
    
    // 保存点赞
    saveLikes: function(likes) {
        return this.set('likes', likes);
    },
    
    // 获取置顶联系人
    getPinnedContacts: function() {
        return this.get('pinned_contacts');
    },
    
    // 保存置顶联系人
    savePinnedContacts: function(pinned) {
        return this.set('pinned_contacts', pinned);
    },
    
    // 获取应用的API模型
    getAppliedApiModels: function() {
        return this.get('applied_api_models');
    },
    
    // 保存应用的API模型
    saveAppliedApiModels: function(models) {
        return this.set('applied_api_models', models);
    },
    
    // 获取设置
    getSetting: function(key, defaultValue) {
        var value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    
    // 保存设置
    saveSetting: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    },
    
    // 清除缓存
    clearCache: function() {
        this.cache = {};
    }
};

// ========== UI组件模块 ==========
const UI = {
    // 当前打开的弹窗
    activeModals: new Set(),
    
    // 创建弹窗
    createModal: function(options) {
        var id = options.id || Utils.generateId('modal');
        var title = options.title || '';
        var content = options.content || '';
        var size = options.size || 'medium';
        var showClose = options.showClose !== false;
        var buttons = options.buttons || [];
        
        // 如果已存在，先移除
        var existing = document.getElementById(id);
        if (existing) existing.remove();
        
        // 创建弹窗
        var modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.setAttribute('data-size', size);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                    ${showClose ? '<button class="modal-close"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">${content}</div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(function(btn) {
                            return `
                                <button class="${btn.class || 'btn-primary'}" 
                                        data-action="${btn.action || 'close'}"
                                        ${btn.disabled ? 'disabled' : ''}>
                                    ${btn.text}
                                </button>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // 添加到容器
        var modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            modalContainer.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }
        
        // 事件处理
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                UI.closeModal(id);
            });
        }
        
        // 点击背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                UI.closeModal(id);
            }
        });
        
        // 按钮事件
        modal.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-action');
                if (action === 'close') {
                    UI.closeModal(id);
                }
            });
        });
        
        this.activeModals.add(id);
        return modal;
    },
    
    // 显示弹窗
    showModal: function(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            this.activeModals.add(id);
        }
    },
    
    // 关闭弹窗
    closeModal: function(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            this.activeModals.delete(id);
            
            // 稍后移除DOM（为了动画）
            setTimeout(function() {
                if (!modal.classList.contains('active') && modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    },
    
    // 更新状态栏时间
    updateStatusBarTime: function() {
        var timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = Utils.formatTime();
        }
    },
    
    // 切换标签页
    switchTab: function(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-item').forEach(function(tab) {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        // 更新页面显示
        document.querySelectorAll('.page').forEach(function(page) {
            page.classList.toggle('active', page.id === tabName + 'Page');
        });
    }
};

// ========== 聊天模块 ==========
const ChatModule = {
    // 状态
    currentRoleId: null,
    currentDialog: null,
    isInitialized: false,
    
    // 初始化
    init: function() {
        if (this.isInitialized) return;
        
        console.log('💬 初始化聊天模块...');
        
        try {
            // 加载联系人列表
            this.loadChatList();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ 聊天模块初始化完成');
        } catch (error) {
            console.error('聊天模块初始化失败:', error);
        }
    },
    
    // 加载联系人列表
    loadChatList: function() {
        var chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        var roles = Storage.getRoles();
        
        // 如果没有联系人
        if (!roles || roles.length === 0) {
            chatList.innerHTML = `
                <div class="no-contacts">
                    <div class="no-contacts-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>暂无联系人</div>
                    <div style="font-size: 14px; margin-top: 10px; color: #666;">
                        点击右上角添加按钮创建联系人
                    </div>
                </div>
            `;
            return;
        }
        
        // 清空列表
        chatList.innerHTML = '';
        
        // 获取置顶联系人
        var pinnedContacts = Storage.getPinnedContacts();
        
        // 先显示置顶联系人
        var pinnedRoles = roles.filter(function(role) {
            return pinnedContacts.indexOf(role.id) !== -1;
        });
        var normalRoles = roles.filter(function(role) {
            return pinnedContacts.indexOf(role.id) === -1;
        });
        
        // 添加置顶联系人
        var self = this;
        pinnedRoles.forEach(function(role) {
            self.createContactItem(role, true);
        });
        
        // 添加普通联系人
        normalRoles.forEach(function(role) {
            self.createContactItem(role, false);
        });
    },
    
    // 创建联系人项
    createContactItem: function(role, isPinned) {
        var chatList = document.getElementById('chatList');
        if (!chatList) return null;
        
        // 获取最后一条消息
        var histories = Storage.getChatHistories();
        var roleHistory = histories[role.id] || [];
        var lastMessage = roleHistory.length > 0 ? roleHistory[roleHistory.length - 1] : null;
        
        // 创建容器
        var container = document.createElement('div');
        container.className = 'chat-item-container';
        container.innerHTML = `
            <div class="chat-item" data-role-id="${role.id}">
                ${isPinned ? '<div class="pinned-badge"></div>' : ''}
                <div class="role-header">
                    <div class="role-avatar">
                        ${role.avatar ? `<img src="${role.avatar}" alt="${role.name}">` : role.name.charAt(0)}
                    </div>
                    <div class="role-info">
                        <div class="role-name-container">
                            <div class="role-note">${role.note || role.name}</div>
                            ${role.note ? `<div class="role-original-name">(${role.name})</div>` : ''}
                        </div>
                        <div class="role-description">
                            ${lastMessage ? 
                                (lastMessage.content.length > 30 ? 
                                    lastMessage.content.substring(0, 30) + '...' : 
                                    lastMessage.content) : 
                                '开始聊天'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-action-btn pin" data-role-id="${role.id}">
                    <i class="fas fa-thumbtack"></i>
                    <span>${isPinned ? '取消置顶' : '置顶'}</span>
                </button>
                <button class="chat-action-btn delete" data-role-id="${role.id}">
                    <i class="fas fa-trash-alt"></i>
                    <span>删除</span>
                </button>
            </div>
        `;
        
        chatList.appendChild(container);
        
        // 设置事件
        this.setupContactItemEvents(container, role);
        
        return container;
    },
    
    // 设置联系人项事件
    setupContactItemEvents: function(container, role) {
        var chatItem = container.querySelector('.chat-item');
        var pinBtn = container.querySelector('.pin');
        var deleteBtn = container.querySelector('.delete');
        var self = this;
        
        // 点击打开聊天
        chatItem.addEventListener('click', function() {
            self.openChatDialog(role.id);
        });
        
        // 置顶/取消置顶
        pinBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self.togglePinContact(role.id);
        });
        
        // 删除
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self.deleteContact(role.id);
        });
    },
    
    // 打开聊天对话框
    openChatDialog: function(roleId) {
        this.currentRoleId = roleId;
        var role = Storage.getRoles().find(function(r) { return r.id === roleId; });
        if (!role) {
            Utils.showToast('联系人不存在', 'error');
            return;
        }
        
        console.log('💬 打开与 ' + role.name + ' 的聊天');
        
        // 创建对话框
        var dialog = document.createElement('div');
        dialog.id = 'chatDialog';
        dialog.className = 'chat-dialog';
        dialog.innerHTML = `
            <div class="dialog-header">
                <button class="dialog-back" id="backToChatList">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="dialog-title-container">
                    <span class="dialog-title-note">${role.note || role.name}</span>
                    ${role.note ? `<span class="dialog-title-name">(${role.name})</span>` : ''}
                </div>
                <button class="dialog-more-btn" id="dialogMoreBtn">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- 消息将在这里显示 -->
            </div>
            <div class="chat-input">
                <input type="text" class="message-input" id="chatMessageInput" placeholder="请输入消息...">
                <button class="send-btn" id="sendChatMessage">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        // 添加到容器
        var dialogContainer = document.getElementById('dialogContainer');
        if (dialogContainer) {
            dialogContainer.appendChild(dialog);
        } else {
            document.body.appendChild(dialog);
        }
        
        // 显示对话框
        dialog.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 加载历史消息
        this.loadChatHistory(roleId);
        
        // 设置对话框事件
        this.setupDialogEvents();
        
        // 聚焦输入框
        setTimeout(function() {
            var input = document.getElementById('chatMessageInput');
            if (input) input.focus();
        }, 100);
        
        this.currentDialog = dialog;
    },
    
    // 加载聊天历史
    loadChatHistory: function(roleId) {
        var messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        var histories = Storage.getChatHistories();
        var roleHistory = histories[roleId] || [];
        
        // 如果没有历史消息，显示欢迎语
        if (roleHistory.length === 0) {
            this.addMessage('你好！我是你的AI联系人，很高兴为你服务。', false);
            return;
        }
        
        // 显示所有历史消息
        var self = this;
        roleHistory.forEach(function(msg) {
            self.addMessage(msg.content, msg.role === 'user', msg.id, msg.time);
        });
        
        // 滚动到底部
        this.scrollToBottom();
    },
    
    // 添加消息
    addMessage: function(content, isUser, messageId, timestamp) {
        var messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return null;
        
        var messageElement = document.createElement('div');
        messageElement.className = 'message ' + (isUser ? 'user' : 'contact');
        
        var id = messageId || Utils.generateId('msg');
        messageElement.setAttribute('data-message-id', id);
        
        var now = timestamp ? new Date(timestamp) : new Date();
        var timeStr = Utils.formatTime(now);
        
        messageElement.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timeStr}</div>
            ${isUser ? '<button class="message-edit-btn"><i class="fas fa-edit"></i></button>' : ''}
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // 滚动到底部
        this.scrollToBottom();
        
        return id;
    },
    
    // 发送消息
    sendMessage: function() {
        var input = document.getElementById('chatMessageInput');
        if (!input || !this.currentRoleId) return;
        
        var message = input.value.trim();
        if (!message) return;
        
        // 添加用户消息
        var messageId = this.addMessage(message, true);
        
        // 保存到历史记录
        var histories = Storage.getChatHistories();
        if (!histories[this.currentRoleId]) {
            histories[this.currentRoleId] = [];
        }
        
        histories[this.currentRoleId].push({
            id: messageId,
            role: 'user',
            content: message,
            time: Date.now()
        });
        
        Storage.saveChatHistories(histories);
        
        // 清空输入框
        input.value = '';
        
        // 生成AI回复
        var self = this;
        setTimeout(function() {
            self.generateAIResponse(message);
        }, 500);
    },
    
    // 生成AI回复
    generateAIResponse: function(userMessage) {
        if (!this.currentRoleId) return;
        
        var role = Storage.getRoles().find(function(r) { return r.id === this.currentRoleId; });
        if (!role) return;
        
        // 获取使用的模型
        var appliedModels = Storage.getAppliedApiModels();
        var model = appliedModels[this.currentRoleId] || Storage.getSetting('selected_api_model', 'gpt-3.5');
        
        // 生成回复
        var reply;
        
        if (!role.personality || role.personality.trim() === '') {
            // 空白机器人模式
            reply = '我收到了你的消息："' + userMessage + '"。';
            
            if (userMessage.includes('？') || userMessage.includes('?')) {
                reply += ' 这是一个问题，我可以帮你解答。';
            } else if (userMessage.includes('!') || userMessage.includes('！')) {
                reply += ' 听起来很有趣！';
            }
        } else {
            // 基于人物设定的回复
            var modelName = Config.apiModels[model] ? Config.apiModels[model].name : 'AI';
            reply = '（' + modelName + '）作为' + role.name + '，';
            
            // 添加性格特点
            var personality = role.personality.toLowerCase();
            if (personality.includes('温柔') || personality.includes('体贴')) {
                reply += ' 我会温柔地回应你。';
            } else if (personality.includes('幽默') || personality.includes('风趣')) {
                reply += ' 让我用幽默的方式回应！';
            } else if (personality.includes('专业') || personality.includes('严谨')) {
                reply += ' 从专业角度分析，';
            }
            
            reply += ' 关于"' + userMessage.substring(0, 20) + (userMessage.length > 20 ? '...' : '') + '"，';
            
            // 添加部分设定
            if (role.personality.length > 50) {
                reply += ' ' + role.personality.substring(0, 50) + '...';
            } else {
                reply += role.personality;
            }
        }
        
        // 添加回复
        var replyId = this.addMessage(reply, false);
        
        // 保存回复
        var histories = Storage.getChatHistories();
        histories[this.currentRoleId].push({
            id: replyId,
            role: 'assistant',
            content: reply,
            time: Date.now()
        });
        
        Storage.saveChatHistories(histories);
        
        // 更新联系人列表的最后消息显示
        this.loadChatList();
    },
    
    // 滚动到底部
    scrollToBottom: function() {
        var messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(function() {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 50);
        }
    },
    
    // 置顶/取消置顶联系人
    togglePinContact: function(roleId) {
        var pinned = Storage.getPinnedContacts();
        var index = pinned.indexOf(roleId);
        
        if (index === -1) {
            // 置顶
            pinned.push(roleId);
            Utils.showToast('联系人已置顶');
        } else {
            // 取消置顶
            pinned.splice(index, 1);
            Utils.showToast('已取消置顶');
        }
        
        Storage.savePinnedContacts(pinned);
        this.loadChatList();
    },
    
    // 删除联系人
    deleteContact: function(roleId) {
        if (!confirm('确定要删除这个联系人吗？此操作不可撤销。')) {
            return;
        }
        
        // 从角色列表中移除
        var roles = Storage.getRoles();
        roles = roles.filter(function(r) { return r.id !== roleId; });
        Storage.saveRoles(roles);
        
        // 从置顶列表中移除
        var pinned = Storage.getPinnedContacts();
        pinned = pinned.filter(function(id) { return id !== roleId; });
        Storage.savePinnedContacts(pinned);
        
        // 删除聊天记录
        var histories = Storage.getChatHistories();
        delete histories[roleId];
        Storage.saveChatHistories(histories);
        
        // 如果正在聊天的是这个联系人，关闭对话框
        if (this.currentRoleId === roleId) {
            this.closeChatDialog();
        }
        
        // 重新加载列表
        this.loadChatList();
        
        Utils.showToast('联系人已删除');
    },
    
    // 关闭聊天对话框
    closeChatDialog: function() {
        var dialog = document.getElementById('chatDialog');
        if (dialog) {
            dialog.classList.remove('active');
            document.body.style.overflow = '';
            
            setTimeout(function() {
                if (dialog.parentNode) {
                    dialog.remove();
                }
            }, 300);
        }
        this.currentRoleId = null;
        this.currentDialog = null;
    },
    
    // 设置对话框事件
    setupDialogEvents: function() {
        var self = this;
        
        // 返回按钮
        var backBtn = document.getElementById('backToChatList');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                self.closeChatDialog();
            });
        }
        
        // 发送按钮
        var sendBtn = document.getElementById('sendChatMessage');
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                self.sendMessage();
            });
        }
        
        // 输入框回车发送
        var input = document.getElementById('chatMessageInput');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    self.sendMessage();
                }
            });
        }
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        var self = this;
        
        // 添加联系人按钮
        var addBtn = document.getElementById('addRoleBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                // 调用个人模块的编辑器
                if (typeof ProfileModule !== 'undefined') {
                    ProfileModule.openRoleEditor();
                }
            });
        }
    }
};

// ========== 动态模块 ==========
const MomentsModule = {
    // 状态
    currentMomentId: null,
    isInitialized: false,
    
    // 初始化
    init: function() {
        if (this.isInitialized) return;
        
        console.log('📱 初始化动态模块...');
        
        try {
            // 加载动态列表
            this.loadMoments();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ 动态模块初始化完成');
        } catch (error) {
            console.error('动态模块初始化失败:', error);
        }
    },
    
    // 加载动态
    loadMoments: function() {
        var momentsList = document.getElementById('momentsList');
        if (!momentsList) return;
        
        var moments = Storage.getMoments();
        
        // 如果没有动态
        if (!moments || moments.length === 0) {
            momentsList.innerHTML = `
                <div class="no-moments">
                    <div class="no-moments-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div>还没有动态</div>
                    <div style="font-size: 14px; margin-top: 10px; color: #666;">
                        点击右下角按钮发布第一条动态
                    </div>
                </div>
            `;
            return;
        }
        
        // 清空列表
        momentsList.innerHTML = '';
        
        // 按时间倒序排序
        moments.sort(function(a, b) {
            var timeA = new Date(a.time || a.createdAt || 0);
            var timeB = new Date(b.time || b.createdAt || 0);
            return timeB - timeA;
        });
        
        // 添加每个动态
        var self = this;
        moments.forEach(function(moment) {
            self.createMomentItem(moment);
        });
    },
    
    // 创建动态项
    createMomentItem: function(moment) {
        var momentsList = document.getElementById('momentsList');
        if (!momentsList) return null;
        
        var userInfo = Storage.getUserInfo();
        
        var momentItem = document.createElement('div');
        momentItem.className = 'moment-item';
        momentItem.setAttribute('data-moment-id', moment.id);
        
        momentItem.innerHTML = `
            <div class="moment-header">
                <div class="moment-avatar">
                    ${userInfo.avatar ? 
                        `<img src="${userInfo.avatar}" alt="${userInfo.name}">` : 
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #07c160; color: white; font-weight: 600;">${userInfo.name ? userInfo.name.charAt(0) : '我'}</div>`}
                </div>
                <div class="moment-info">
                    <div class="moment-author">${moment.author || userInfo.name || '我'}</div>
                    <div class="moment-time">${moment.time || '刚刚'}</div>
                </div>
            </div>
            <div class="moment-content">${moment.content}</div>
            <div class="moment-actions">
                <div class="moment-action-left">
                    <button class="moment-action-btn like-btn" data-moment-id="${moment.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">0</span>
                    </button>
                    <button class="moment-action-btn comment-btn" data-moment-id="${moment.id}">
                        <i class="fas fa-comment"></i>
                        <span class="comment-count">0</span>
                    </button>
                </div>
                <button class="moment-more-btn" data-moment-id="${moment.id}">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        `;
        
        momentsList.appendChild(momentItem);
        
        return momentItem;
    },
    
    // 添加动态
    addMoment: function() {
        var content = prompt('请输入动态内容：');
        if (!content || !content.trim()) return;
        
        var userInfo = Storage.getUserInfo();
        var moments = Storage.getMoments();
        
        var newMoment = {
            id: Utils.generateId('moment'),
            content: content.trim(),
            time: new Date().toLocaleString(),
            author: userInfo.name || '用户',
            createdAt: Date.now()
        };
        
        moments.push(newMoment);
        Storage.saveMoments(moments);
        
        this.loadMoments();
        Utils.showToast('动态发布成功');
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        var self = this;
        
        // 添加动态按钮
        var addBtn = document.getElementById('addMomentBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                self.addMoment();
            });
        }
        
        // 编辑封面
        var editCoverBtn = document.getElementById('editCoverBtn');
        if (editCoverBtn) {
            editCoverBtn.addEventListener('click', function() {
                Utils.uploadImage(function(imageData) {
                    var userInfo = Storage.getUserInfo();
                    userInfo.coverBackground = 'url(\'' + imageData + '\') center/cover no-repeat';
                    Storage.saveUserInfo(userInfo);
                    
                    // 更新封面显示
                    var coverBackground = document.getElementById('coverBackground');
                    if (coverBackground) {
                        coverBackground.style.background = userInfo.coverBackground;
                    }
                    
                    Utils.showToast('封面已更新');
                });
            });
        }
    }
};

// ========== 个人模块 ==========
const ProfileModule = {
    // 状态
    isInitialized: false,
    
    // 初始化
    init: function() {
        if (this.isInitialized) return;
        
        console.log('👤 初始化个人模块...');
        
        try {
            // 加载用户信息
            this.loadUserInfo();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ 个人模块初始化完成');
        } catch (error) {
            console.error('个人模块初始化失败:', error);
        }
    },
    
    // 加载用户信息
    loadUserInfo: function() {
        var userInfo = Storage.getUserInfo();
        
        // 如果用户信息不存在，创建默认
        if (!userInfo || Object.keys(userInfo).length === 0) {
            userInfo = {
                name: '用户',
                bio: '点击编辑个性签名',
                avatar: '',
                coverBackground: '',
                userId: '',
                profileSignature: '点击编辑个性签名',
                status: '在线',
                tags: ['标签1', '标签2', '标签3'],
                statusColor: Config.lightColors[0],
                tagColors: Config.lightColors.slice(0, 3)
            };
            Storage.saveUserInfo(userInfo);
        }
        
        // 确保颜色数据存在
        if (!userInfo.statusColor) {
            userInfo.statusColor = Config.lightColors[Math.floor(Math.random() * Config.lightColors.length)];
        }
        if (!userInfo.tagColors || userInfo.tagColors.length !== userInfo.tags.length) {
            userInfo.tagColors = userInfo.tags.map(function() {
                return Config.lightColors[Math.floor(Math.random() * Config.lightColors.length)];
            });
        }
        
        // 更新动态页面
        this.updateMomentsPage(userInfo);
        
        // 更新个人页面
        this.updateProfilePage(userInfo);
        
        // 保存更新后的信息
        Storage.saveUserInfo(userInfo);
    },
    
    // 更新动态页面
    updateMomentsPage: function(userInfo) {
        // 用户名
        var userName = document.getElementById('userName');
        if (userName) userName.textContent = userInfo.name;
        
        // 个性签名
        var userBio = document.getElementById('userBio');
        if (userBio) userBio.textContent = userInfo.bio;
        
        // 标签
        var tagsContainer = document.getElementById('dynamicTagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            
            if (userInfo.tags && Array.isArray(userInfo.tags)) {
                var self = this;
                userInfo.tags.forEach(function(tag, index) {
                    if (tag) {
                        var tagElement = document.createElement('div');
                        tagElement.className = 'dynamic-tag';
                        
                        // 处理#号
                        var displayTag = tag;
                        var useHash = Storage.getSetting('use_hash_for_tags', true);
                        if (useHash && !tag.startsWith('#')) {
                            displayTag = '#' + tag;
                        } else if (!useHash && tag.startsWith('#')) {
                            displayTag = tag.substring(1);
                        }
                        
                        tagElement.textContent = displayTag;
                        tagElement.style.background = 'rgba(255, 255, 255, 0.15)';
                        tagElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        tagElement.style.color = 'rgba(255, 255, 255, 0.9)';
                        
                        tagsContainer.appendChild(tagElement);
                    }
                });
            }
        }
        
        // 头像
        var userAvatar = document.getElementById('userAvatar');
        if (userAvatar && userInfo.avatar) {
            userAvatar.src = userInfo.avatar;
        }
    },
    
    // 更新个人页面
    updateProfilePage: function(userInfo) {
        // 用户名
        var profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = userInfo.name;
        
        // 用户ID
        var profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.textContent = userInfo.userId ? 'ID: ' + userInfo.userId : 'ID: 点击设置';
        }
        
        // 个性签名
        var profileSignature = document.getElementById('profileSignature');
        if (profileSignature) profileSignature.textContent = userInfo.profileSignature;
        
        // 状态
        var statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = userInfo.status;
        
        var statusElement = document.getElementById('profileStatus');
        if (statusElement) {
            statusElement.style.background = userInfo.statusColor;
        }
        
        // 标签
        var tagsContainer = document.getElementById('profileTagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            
            if (userInfo.tags && Array.isArray(userInfo.tags)) {
                var self = this;
                userInfo.tags.forEach(function(tag, index) {
                    if (tag) {
                        var tagElement = document.createElement('div');
                        tagElement.className = 'profile-tag';
                        
                        // 处理#号
                        var displayTag = tag;
                        var useHash = Storage.getSetting('use_hash_for_tags', true);
                        if (useHash && !tag.startsWith('#')) {
                            displayTag = '#' + tag;
                        } else if (!useHash && tag.startsWith('#')) {
                            displayTag = tag.substring(1);
                        }
                        
                        tagElement.textContent = displayTag;
                        tagElement.style.background = userInfo.tagColors[index] || Config.lightColors[index % Config.lightColors.length];
                        tagElement.style.borderColor = '#d9d9d9';
                        tagElement.style.color = '#333';
                        
                        // 点击编辑标签
                        tagElement.addEventListener('click', function() {
                            self.editTag(tag, index);
                        });
                        
                        tagsContainer.appendChild(tagElement);
                    }
                });
                
                // 添加#号开关
                var hashToggle = document.createElement('div');
                hashToggle.className = 'tag-hash-toggle';
                var useHash = Storage.getSetting('use_hash_for_tags', true);
                hashToggle.innerHTML = `
                    <input type="checkbox" id="profileHashToggle" class="tag-hash-checkbox" ${useHash ? 'checked' : ''}>
                    <label for="profileHashToggle">#号</label>
                `;
                
                tagsContainer.appendChild(hashToggle);
                
                // #号开关事件
                var toggle = hashToggle.querySelector('input');
                if (toggle) {
                    toggle.addEventListener('change', function(e) {
                        Storage.saveSetting('use_hash_for_tags', e.target.checked);
                        ProfileModule.loadUserInfo();
                        Utils.showToast(e.target.checked ? '已开启标签井号前缀' : '已关闭标签井号前缀');
                    });
                }
            }
        }
        
        // 头像
        var profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar && userInfo.avatar) {
            profileAvatar.src = userInfo.avatar;
        }
    },
    
    // 编辑标签
    editTag: function(tag, index) {
        var userInfo = Storage.getUserInfo();
        var currentTag = tag.startsWith('#') ? tag.substring(1) : tag;
        var useHash = Storage.getSetting('use_hash_for_tags', true);
        
        var newTag = prompt('编辑标签内容：', currentTag);
        if (newTag !== null && newTag.trim() && newTag !== currentTag) {
            var finalTag = newTag.trim();
            if (useHash && !finalTag.startsWith('#')) {
                finalTag = '#' + finalTag;
            } else if (!useHash && finalTag.startsWith('#')) {
                finalTag = finalTag.substring(1);
            }
            
            userInfo.tags[index] = finalTag;
            Storage.saveUserInfo(userInfo);
            this.loadUserInfo();
            Utils.showToast('标签已更新');
        }
    },
    
    // 打开联系人编辑器
    openRoleEditor: function(roleId) {
        var roles = Storage.getRoles();
        var role = roleId ? roles.find(function(r) { return r.id === roleId; }) : null;
        
        var modal = UI.createModal({
            id: 'roleEditorModal',
            title: roleId ? '编辑联系人' : '添加联系人',
            content: `
                <div class="form-group">
                    <div class="form-label">头像</div>
                    <div style="text-align: center;">
                        <div id="roleAvatarPreview" style="width: 100px; height: 100px; border-radius: 50%; background: #f0f0f0; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden;">
                            ${role && role.avatar ? `<img src="${role.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-user"></i>'}
                        </div>
                        <button class="btn-primary" id="uploadRoleAvatarBtn" style="width: auto; padding: 10px 20px;">
                            选择头像
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="roleName">名称</label>
                    <input type="text" class="form-input" id="roleName" placeholder="请输入联系人名称" value="${role ? role.name : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="roleNote">备注</label>
                    <input type="text" class="form-input" id="roleNote" placeholder="仅用户可见，联系人不可见" value="${role ? (role.note || '') : ''}">
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">此备注仅用户可见，联系人不可见</div>
                </div>
            `,
            buttons: [
                {
                    text: '取消',
                    action: 'close',
                    class: 'btn-primary'
                },
                {
                    text: '保存',
                    action: 'save',
                    class: 'btn-primary'
                }
            ]
        });
        
        UI.showModal('roleEditorModal');
        
        // 设置事件
        this.setupRoleEditorEvents(modal, roleId);
    },
    
    // 设置联系人编辑器事件
    setupRoleEditorEvents: function(modal, roleId) {
        var self = this;
        
        // 上传头像
        var uploadBtn = modal.querySelector('#uploadRoleAvatarBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() {
                Utils.uploadImage(function(imageData) {
                    var preview = modal.querySelector('#roleAvatarPreview');
                    if (preview) {
                        preview.innerHTML = '<img src="' + imageData + '" style="width: 100%; height: 100%; object-fit: cover;">';
                    }
                });
            });
        }
        
        // 保存按钮
        var saveBtn = modal.querySelector('[data-action="save"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                self.saveRole(modal, roleId);
            });
        }
    },
    
    // 保存联系人
    saveRole: function(modal, roleId) {
        var nameInput = modal.querySelector('#roleName');
        var noteInput = modal.querySelector('#roleNote');
        
        if (!nameInput || !noteInput) return;
        
        var name = nameInput.value.trim();
        var note = noteInput.value.trim();
        
        if (!name) {
            Utils.showToast('请输入联系人名称', 'error');
            return;
        }
        
        // 获取头像
        var avatarPreview = modal.querySelector('#roleAvatarPreview img');
        var avatar = avatarPreview ? avatarPreview.src : '';
        
        var roles = Storage.getRoles();
        
        if (roleId) {
            // 更新现有联系人
            var roleIndex = roles.findIndex(function(r) { return r.id === roleId; });
            if (roleIndex !== -1) {
                roles[roleIndex] = {
                    id: roles[roleIndex].id,
                    name: name,
                    note: note || name,
                    personality: roles[roleIndex].personality || '',
                    avatar: avatar,
                    createdAt: roles[roleIndex].createdAt,
                    updatedAt: Date.now()
                };
            }
        } else {
            // 创建新联系人
            var newRole = {
                id: Utils.generateId('contact'),
                name: name,
                note: note || name,
                personality: '',
                avatar: avatar,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            roles.push(newRole);
            
            // 应用当前选中的API模型
            var appliedModels = Storage.getAppliedApiModels();
            var selectedModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
            appliedModels[newRole.id] = selectedModel;
            Storage.saveAppliedApiModels(appliedModels);
        }
        
        Storage.saveRoles(roles);
        UI.closeModal('roleEditorModal');
        
        // 更新聊天列表
        if (typeof ChatModule !== 'undefined') {
            ChatModule.loadChatList();
        }
        
        Utils.showToast(roleId ? '联系人已更新' : '联系人已添加');
    },
    
    // 打开设置
    openSettings: function() {
        var selectedModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
        var currentModel = Config.apiModels[selectedModel] || Config.apiModels['gpt-3.5'];
        
        var modal = UI.createModal({
            id: 'settingsModal',
            title: '设置',
            content: `
                <div class="settings-group">
                    <div class="settings-title">API模型设置</div>
                    <div style="margin-bottom: 15px; font-size: 14px; color: var(--text-light);">
                        选择联系人使用的API模型，新建联系人将自动使用选中的模型
                    </div>
                    
                    <div class="api-model-select" id="apiModelSelect">
                        ${Object.keys(Config.apiModels).map(function(key) {
                            var model = Config.apiModels[key];
                            return `
                                <div class="api-model-item ${key === selectedModel ? 'selected' : ''}" data-model="${key}">
                                    <div class="api-model-name">${model.name}</div>
                                    <div class="api-model-desc">${model.description}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <div class="settings-item">
                            <div class="settings-label">当前选择模型</div>
                            <div class="settings-value" id="currentModelDisplay">${currentModel.name}</div>
                        </div>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: '关闭',
                    action: 'close',
                    class: 'btn-primary'
                }
            ]
        });
        
        UI.showModal('settingsModal');
        
        // 设置事件
        this.setupSettingsEvents(modal);
    },
    
    // 设置设置事件
    setupSettingsEvents: function(modal) {
        // API模型选择
        modal.querySelectorAll('.api-model-item').forEach(function(item) {
            item.addEventListener('click', function() {
                // 移除所有选中状态
                modal.querySelectorAll('.api-model-item').forEach(function(i) {
                    i.classList.remove('selected');
                });
                
                // 添加当前选中状态
                item.classList.add('selected');
                
                // 更新选中的模型
                var model = item.getAttribute('data-model');
                Storage.saveSetting('selected_api_model', model);
                
                // 更新显示
                var display = modal.querySelector('#currentModelDisplay');
                if (display) {
                    display.textContent = Config.apiModels[model] ? Config.apiModels[model].name : model;
                }
                
                Utils.showToast('已选择 ' + (Config.apiModels[model] ? Config.apiModels[model].name : model) + ' 模型');
            });
        });
    },
    
    // 打开备份管理器
    openBackupManager: function() {
        var modal = UI.createModal({
            id: 'backupManagerModal',
            title: '备份与恢复',
            content: `
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 14px; color: var(--text-light); margin-bottom: 15px;">
                        定期备份可以防止数据丢失。建议每周至少备份一次。
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                        <button class="btn-primary" onclick="DevTools.createBackup()" style="padding: 15px;">
                            <i class="fas fa-save"></i>
                            <span>创建完整备份</span>
                        </button>
                        <button class="btn-primary" onclick="DevTools.quickBackup()" style="padding: 15px;">
                            <i class="fas fa-bolt"></i>
                            <span>快速备份</span>
                        </button>
                        <button class="btn-primary" onclick="DevTools.importBackup()" style="padding: 15px;">
                            <i class="fas fa-file-import"></i>
                            <span>导入备份</span>
                        </button>
                        <button class="btn-primary" onclick="DevTools.setupAutoBackup()" style="padding: 15px;">
                            <i class="fas fa-clock"></i>
                            <span>自动备份设置</span>
                        </button>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: '关闭',
                    action: 'close',
                    class: 'btn-primary'
                }
            ]
        });
        
        UI.showModal('backupManagerModal');
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
        var self = this;
        
        // 我的联系人按钮
        var myRolesBtn = document.getElementById('myRolesBtn');
        if (myRolesBtn) {
            myRolesBtn.addEventListener('click', function() {
                self.openRoleManager();
            });
        }
        
        // 设置按钮
        var settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                self.openSettings();
            });
        }
        
        // 备份按钮
        var backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', function() {
                self.openBackupManager();
            });
        }
        
        // 头像编辑
        var editAvatarBtn = document.getElementById('editAvatarBtn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', function() {
                Utils.uploadImage(function(imageData) {
                    var userInfo = Storage.getUserInfo();
                    userInfo.avatar = imageData;
                    Storage.saveUserInfo(userInfo);
                    self.loadUserInfo();
                    Utils.showToast('头像已更新');
                });
            });
        }
        
        var editProfileAvatarBtn = document.getElementById('editProfileAvatarBtn');
        if (editProfileAvatarBtn) {
            editProfileAvatarBtn.addEventListener('click', function() {
                Utils.uploadImage(function(imageData) {
                    var userInfo = Storage.getUserInfo();
                    userInfo.avatar = imageData;
                    Storage.saveUserInfo(userInfo);
                    self.loadUserInfo();
                    Utils.showToast('头像已更新');
                });
            });
        }
        
        // 用户名编辑
        var userName = document.getElementById('userName');
        if (userName) {
            userName.addEventListener('click', function() {
                self.editField('name', '用户名');
            });
        }
        
        var profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.addEventListener('click', function() {
                self.editField('name', '用户名');
            });
        }
    },
    
    // 编辑字段
    editField: function(field, label) {
        var userInfo = Storage.getUserInfo();
        var currentValue = userInfo[field] || '';
        var newValue = prompt('请输入' + label + '：', currentValue);
        
        if (newValue !== null) {
            userInfo[field] = newValue.trim();
            Storage.saveUserInfo(userInfo);
            this.loadUserInfo();
            Utils.showToast(label + '已更新');
        }
    },
    
    // 打开联系人管理器
    openRoleManager: function() {
        var roles = Storage.getRoles();
        var pinned = Storage.getPinnedContacts();
        
        var content = '';
        
        if (roles.length === 0) {
            content = '<div style="text-align: center; color: #999; padding: 30px;">还没有创建联系人</div>';
        } else {
            // 先显示置顶联系人
            var pinnedRoles = roles.filter(function(role) {
                return pinned.indexOf(role.id) !== -1;
            });
            var normalRoles = roles.filter(function(role) {
                return pinned.indexOf(role.id) === -1;
            });
            
            content = '<div id="roleManagerList">';
            
            // 置顶联系人
            if (pinnedRoles.length > 0) {
                content += '<div style="font-size: 12px; color: #999; margin-bottom: 10px;">置顶联系人</div>';
                pinnedRoles.forEach(function(role) {
                    content += ProfileModule.createRoleManagerItem(role, true);
                });
            }
            
            // 普通联系人
            if (normalRoles.length > 0) {
                if (pinnedRoles.length > 0) {
                    content += '<div style="font-size: 12px; color: #999; margin: 20px 0 10px;">所有联系人</div>';
                }
                normalRoles.forEach(function(role) {
                    content += ProfileModule.createRoleManagerItem(role, false);
                });
            }
            
            content += '</div>';
        }
        
        var modal = UI.createModal({
            id: 'roleManagerModal',
            title: '我的联系人',
            content: content,
            buttons: [
                {
                    text: '添加新联系人',
                    action: 'add',
                    class: 'btn-primary'
                },
                {
                    text: '关闭',
                    action: 'close',
                    class: 'btn-primary'
                }
            ]
        });
        
        UI.showModal('roleManagerModal');
        
        // 设置事件
        var addBtn = modal.querySelector('[data-action="add"]');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                UI.closeModal('roleManagerModal');
                setTimeout(function() {
                    ProfileModule.openRoleEditor();
                }, 300);
            });
        }
    },
    
    // 创建联系人管理器项
    createRoleManagerItem: function(role, isPinned) {
        return `
            <div class="role-item" data-role-id="${role.id}">
                ${isPinned ? '<div class="pinned-badge"></div>' : ''}
                <div class="role-header">
                    <div class="role-avatar">
                        ${role.avatar ? `<img src="${role.avatar}" alt="${role.name}">` : role.name.charAt(0)}
                    </div>
                    <div class="role-info">
                        <div class="role-name-container">
                            <div class="role-note">${role.note || role.name}</div>
                            ${role.note ? `<div class="role-original-name">(${role.name})</div>` : ''}
                        </div>
                        <div class="role-description">
                            ${role.personality ? 
                                (role.personality.length > 50 ? 
                                    role.personality.substring(0, 50) + '...' : 
                                    role.personality) : 
                                '空白机器人，只听指令'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// ========== 主应用控制器 ==========
const App = {
    // 状态
    currentTab: 'chat',
    isInitialized: false,
    
    // 初始化应用
    init: function() {
        if (this.isInitialized) return;
        
        console.log('🚀 quq小手机启动中...');
        console.log('版本: ' + Config.version);
        console.log('调试模式: ' + (Config.debugMode ? '开启' : '关闭'));
        
        try {
            // 1. 初始化核心功能
            this.initCore();
            
            // 2. 初始化各个模块
            ProfileModule.init();
            ChatModule.init();
            MomentsModule.init();
            
            // 3. 设置全局事件
            this.setupGlobalEvents();
            
            // 4. 启动定时任务
            this.startTimers();
            
            // 5. 隐藏加载屏，显示应用
            this.showApp();
            
            this.isInitialized = true;
            console.log('✅ 应用启动完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            // 即使出错也尝试显示应用
            this.showApp();
        }
    },
    
    // 初始化核心功能
    initCore: function() {
        // 更新时间
        this.updateTime();
        
        // 设置触摸优化
        this.setupTouchOptimization();
    },
    
    // 更新时间
    updateTime: function() {
        UI.updateStatusBarTime();
    },
    
    // 设置触摸优化
    setupTouchOptimization: function() {
        // 禁用双击缩放
        var lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            var now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    },
    
    // 显示应用界面
    showApp: function() {
        var loading = document.getElementById('loadingScreen');
        var app = document.getElementById('app');
        
        if (loading && app) {
            // 先淡出加载屏
            loading.style.opacity = '0';
            
            setTimeout(function() {
                loading.style.display = 'none';
                app.style.display = 'flex';
                console.log('✅ 应用界面已显示');
                
                // 显示欢迎消息
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('应用启动完成');
                }
            }, 500);
        } else {
            // 直接显示
            if (app) app.style.display = 'flex';
            if (loading) loading.style.display = 'none';
        }
    },
    
    // 设置全局事件
    setupGlobalEvents: function() {
        var self = this;
        
        // 标签切换
        document.querySelectorAll('.tab-item').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var tabName = tab.getAttribute('data-tab');
                self.switchTab(tabName);
            });
        });
        
        // 全局点击事件（关闭浮窗等）
        document.addEventListener('click', function(e) {
            // 如果点击的是模态框背景，关闭模态框
            if (e.target.classList.contains('modal')) {
                UI.closeModal(e.target.id);
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', function(e) {
            // ESC键关闭所有弹窗
            if (e.key === 'Escape') {
                UI.closeAllModals();
            }
        });
    },
    
    // 切换标签页
    switchTab: function(tabName) {
        if (this.currentTab === tabName) return;
        
        this.currentTab = tabName;
        UI.switchTab(tabName);
        
        // 标签切换时的额外处理
        switch (tabName) {
            case 'chat':
                // 刷新联系人列表
                if (ChatModule.isInitialized) {
                    ChatModule.loadChatList();
                }
                break;
            case 'moments':
                // 刷新动态列表
                if (MomentsModule.isInitialized) {
                    MomentsModule.loadMoments();
                }
                break;
            case 'profile':
                // 刷新个人信息
                if (ProfileModule.isInitialized) {
                    ProfileModule.loadUserInfo();
                }
                break;
        }
        
        console.log('切换到 ' + tabName + ' 标签');
    },
    
    // 启动定时任务
    startTimers: function() {
        var self = this;
        
        // 每分钟更新时间
        setInterval(function() {
            self.updateTime();
        }, 60000);
    }
};

// ========== 应用启动成功标志 ==========
console.log('🎉 app.js 所有代码加载完成');

// 延迟启动应用，确保页面完全加载
setTimeout(function() {
    try {
        if (typeof App !== 'undefined') {
            App.init();
        } else {
            console.error('App对象未定义');
            // 直接显示应用界面
            var loading = document.getElementById('loadingScreen');
            var app = document.getElementById('app');
            if (loading && app) {
                loading.style.display = 'none';
                app.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('启动应用时出错:', error);
        // 出错时也尝试显示界面
        var loading = document.getElementById('loadingScreen');
        var app = document.getElementById('app');
        if (loading && app) {
            loading.style.display = 'none';
            app.style.display = 'flex';
        }
    }
}, 1000);

// 超时保护：10秒后强制显示
setTimeout(function() {
    var loading = document.getElementById('loadingScreen');
    var app = document.getElementById('app');
    
    if (loading && loading.style.display !== 'none' && app && app.style.display === 'none') {
        console.log('⚠️ 加载超时，强制显示应用');
        loading.style.display = 'none';
        app.style.display = 'flex';
        if (typeof Utils !== 'undefined') {
            Utils.showToast('应用已就绪', 'info');
        }
    }
}, 10000);

console.log('✅ app.js 加载流程完成');