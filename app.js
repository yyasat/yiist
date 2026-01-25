// ========== quq小手机 - 主应用文件 ==========
// 作者: [您的名字]
// 版本: 1.0.0
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
    
    // 内置API模型配置
    apiModels: {
        'gpt-3.5': {
            name: 'GPT-3.5 Turbo',
            description: '快速、经济、适用于大多数对话场景',
            type: 'builtin',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            provider: 'openai'
        },
        'gpt-4': {
            name: 'GPT-4',
            description: '更智能、理解更深层，适用于复杂对话',
            type: 'builtin',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            provider: 'openai'
        },
        'claude': {
            name: 'Claude',
            description: '擅长创意写作和逻辑推理',
            type: 'builtin',
            endpoint: 'https://api.anthropic.com/v1/messages',
            provider: 'anthropic'
        },
        'ernie': {
            name: '文心一言',
            description: '中文理解优秀，本土化优化',
            type: 'builtin',
            endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
            provider: 'baidu'
        }
    },
    
    // 支持的API提供商
    apiProviders: {
        'openai': {
            name: 'OpenAI',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            modelsEndpoint: 'https://api.openai.com/v1/models',
            authType: 'bearer'
        },
        'anthropic': {
            name: 'Anthropic Claude',
            endpoint: 'https://api.anthropic.com/v1/messages',
            modelsEndpoint: 'https://api.anthropic.com/v1/models',
            authType: 'bearer'
        },
        'google': {
            name: 'Google Gemini',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            modelsEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            authType: 'api_key'
        },
        'azure': {
            name: 'Azure OpenAI',
            endpoint: 'https://{resource}.openai.azure.com/openai/deployments/{deployment}/chat/completions',
            authType: 'api_key'
        },
        'custom': {
            name: '自定义',
            endpoint: '',
            authType: 'bearer'
        }
    },
    
    // 手机端优化配置
    touchMinSize: 44,
    fontSizeBase: 16,
    animationSpeed: 300,
    
    // 应用状态
    version: '1.0.0',
    debugMode: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

// ========== 工具模块 ==========
const Utils = {
    // 显示Toast通知
    showToast(message, type = 'success', duration = 2000) {
        // 创建或获取toast元素
        let toast = document.getElementById('quq-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'quq-toast';
            toast.className = 'toast';
            toast.innerHTML = '<div class="toast-content"></div>';
            document.body.appendChild(toast);
        }
        
        const content = toast.querySelector('.toast-content');
        content.textContent = message;
        
        // 重置样式
        toast.className = 'toast';
        toast.classList.add(type);
        
        // 显示
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 隐藏
        setTimeout(() => toast.classList.remove('show'), duration);
        
        return toast;
    },
    
    // 格式化时间
    formatTime(date = new Date()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    // 格式化日期
    formatDate(date = new Date()) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 生成随机ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // 上传图片
    uploadImage(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // 检查文件大小（限制5MB）
                if (file.size > 5 * 1024 * 1024) {
                    this.showToast('图片大小不能超过5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    callback(e.target.result);
                };
                reader.onerror = () => {
                    this.showToast('图片读取失败', 'error');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },
    
    // 复制到剪贴板
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(
            () => this.showToast('已复制到剪贴板'),
            () => this.showToast('复制失败', 'error')
        );
    },
    
    // 获取设备信息
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
    },
    
    // 安全解析JSON
    safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch {
            return defaultValue;
        }
    },
    
    // 深度合并对象
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },
    
    // 检查是否是对象
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // 获取API请求头
    getApiHeaders(apiKey, provider = 'openai') {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (apiKey) {
            if (provider === 'anthropic') {
                headers['x-api-key'] = apiKey;
                headers['anthropic-version'] = '2023-06-01';
            } else if (provider === 'google') {
                headers['x-goog-api-key'] = apiKey;
            } else {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
        }
        
        return headers;
    },
    
    // 发送API请求
    async sendApiRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30秒超时
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
            finalOptions.signal = controller.signal;
            
            const response = await fetch(url, finalOptions);
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }
};

// ========== 存储模块 ==========
const Storage = {
    // 数据缓存
    cache: {
        roles: null,
        moments: null,
        userInfo: null,
        chatHistories: null,
        comments: null,
        likes: null,
        pinnedContacts: null,
        appliedApiModels: null,
        customApiConfigs: null,
        availableModels: null
    },
    
    // 获取数据（带缓存）
    get(key) {
        // 先从缓存获取
        if (this.cache[key] !== undefined) {
            return this.cache[key];
        }
        
        // 从localStorage获取并解析
        const data = localStorage.getItem(key);
        let parsed;
        
        try {
            parsed = data ? JSON.parse(data) : (key === 'user_info' ? {} : []);
        } catch {
            parsed = key === 'user_info' ? {} : [];
            console.warn(`⚠️ 解析 ${key} 数据失败，使用默认值`);
        }
        
        // 缓存结果
        this.cache[key] = parsed;
        return parsed;
    },
    
    // 保存数据
    set(key, value) {
        try {
            const jsonStr = JSON.stringify(value);
            localStorage.setItem(key, jsonStr);
            this.cache[key] = value; // 更新缓存
            return true;
        } catch (error) {
            console.error(`保存 ${key} 失败:`, error);
            Utils.showToast('保存失败，数据可能过大', 'error');
            return false;
        }
    },
    
    // 获取所有角色
    getRoles() {
        return this.get('contacts');
    },
    
    // 保存所有角色
    saveRoles(roles) {
        return this.set('contacts', roles);
    },
    
    // 获取动态
    getMoments() {
        return this.get('moments');
    },
    
    // 保存动态
    saveMoments(moments) {
        return this.set('moments', moments);
    },
    
    // 获取用户信息
    getUserInfo() {
        return this.get('user_info');
    },
    
    // 保存用户信息
    saveUserInfo(userInfo) {
        return this.set('user_info', userInfo);
    },
    
    // 获取聊天记录
    getChatHistories() {
        return this.get('chat_histories');
    },
    
    // 保存聊天记录
    saveChatHistories(histories) {
        return this.set('chat_histories', histories);
    },
    
    // 获取评论
    getComments() {
        return this.get('comments');
    },
    
    // 保存评论
    saveComments(comments) {
        return this.set('comments', comments);
    },
    
    // 获取点赞
    getLikes() {
        return this.get('likes');
    },
    
    // 保存点赞
    saveLikes(likes) {
        return this.set('likes', likes);
    },
    
    // 获取置顶联系人
    getPinnedContacts() {
        return this.get('pinned_contacts');
    },
    
    // 保存置顶联系人
    savePinnedContacts(pinned) {
        return this.set('pinned_contacts', pinned);
    },
    
    // 获取应用的API模型
    getAppliedApiModels() {
        return this.get('applied_api_models');
    },
    
    // 保存应用的API模型
    saveAppliedApiModels(models) {
        return this.set('applied_api_models', models);
    },
    
    // 获取自定义API配置
    getCustomApiConfigs() {
        return this.get('custom_api_configs') || {};
    },
    
    // 保存自定义API配置
    saveCustomApiConfigs(configs) {
        return this.set('custom_api_configs', configs);
    },
    
    // 获取可用的模型列表
    getAvailableModels() {
        return this.get('available_models') || {};
    },
    
    // 保存可用的模型列表
    saveAvailableModels(models) {
        return this.set('available_models', models);
    },
    
    // 获取设置
    getSetting(key, defaultValue) {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    
    // 保存设置
    saveSetting(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    // 获取备份列表
    getBackupList() {
        return this.get('backup_list') || [];
    },
    
    // 保存备份列表
    saveBackupList(backupList) {
        return this.set('backup_list', backupList);
    },
    
    // 获取云端备份数据
    getCloudBackup(backupId) {
        return this.get(`cloud_backup_${backupId}`);
    },
    
    // 保存云端备份数据
    saveCloudBackup(backupId, backupData) {
        return this.set(`cloud_backup_${backupId}`, backupData);
    },
    
    // 删除云端备份
    deleteCloudBackup(backupId) {
        localStorage.removeItem(`cloud_backup_${backupId}`);
        
        // 更新备份列表
        let backupList = this.getBackupList();
        backupList = backupList.filter(backup => backup.id !== backupId);
        this.saveBackupList(backupList);
        
        // 清除缓存
        delete this.cache[`cloud_backup_${backupId}`];
    },
    
    // 清除缓存
    clearCache() {
        this.cache = {
            roles: null,
            moments: null,
            userInfo: null,
            chatHistories: null,
            comments: null,
            likes: null,
            pinnedContacts: null,
            appliedApiModels: null,
            customApiConfigs: null,
            availableModels: null
        };
    },
    
    // 获取存储统计
    getStats() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
        }
        
        return {
            itemCount: localStorage.length,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            quota: `${(5 * 1024 - totalSize / 1024).toFixed(2)} KB 剩余`
        };
    }
};

// ========== API模块 ==========
const ApiModule = {
    // 状态
    isInitialized: false,
    currentApiConfig: null,
    
    // 初始化
    init() {
        if (this.isInitialized) return;
        
        console.log('🔌 初始化API模块...');
        
        // 加载自定义API配置
        this.loadApiConfigs();
        
        this.isInitialized = true;
        console.log('✅ API模块初始化完成');
    },
    
    // 加载API配置
    loadApiConfigs() {
        const configs = Storage.getCustomApiConfigs();
        this.currentApiConfig = configs;
        return configs;
    },
    
    // 保存API配置
    saveApiConfig(config) {
        const configs = Storage.getCustomApiConfigs();
        const newConfigs = { ...configs, ...config };
        Storage.saveCustomApiConfigs(newConfigs);
        this.currentApiConfig = newConfigs;
        return newConfigs;
    },
    
    // 获取API配置
    getApiConfig(provider = null) {
        const configs = this.currentApiConfig || Storage.getCustomApiConfigs();
        
        if (!provider) {
            // 返回所有配置
            return configs;
        }
        
        // 返回特定提供商的配置
        return configs[provider] || null;
    },
    
    // 测试API连接
    async testApiConnection(config) {
        const { provider, apiKey, endpoint } = config;
        
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        
        try {
            let testUrl, headers, body;
            
            // 根据提供商设置测试参数
            switch (provider) {
                case 'openai':
                    testUrl = endpoint || 'https://api.openai.com/v1/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'anthropic':
                    testUrl = endpoint || 'https://api.anthropic.com/v1/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'google':
                    testUrl = endpoint || 'https://generativelanguage.googleapis.com/v1beta/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'custom':
                    testUrl = endpoint;
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    };
                    break;
                    
                default:
                    throw new Error('不支持的API提供商');
            }
            
            if (!testUrl) {
                throw new Error('API地址不能为空');
            }
            
            // 发送测试请求
            const response = await Utils.sendApiRequest(testUrl, {
                method: 'GET',
                headers: headers
            });
            
            return {
                success: true,
                data: response,
                message: 'API连接测试成功'
            };
            
        } catch (error) {
            console.error('API连接测试失败:', error);
            return {
                success: false,
                error: error.message,
                message: `API连接测试失败: ${error.message}`
            };
        }
    },
    
    // 获取可用模型列表
    async fetchAvailableModels(config) {
        const { provider, apiKey, endpoint } = config;
        
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        
        try {
            let modelsUrl, headers;
            let models = [];
            
            // 根据提供商设置请求参数
            switch (provider) {
                case 'openai':
                    modelsUrl = endpoint ? `${endpoint.replace(/\/chat\/completions$/, '')}/models` : 'https://api.openai.com/v1/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'anthropic':
                    modelsUrl = endpoint || 'https://api.anthropic.com/v1/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'google':
                    modelsUrl = endpoint || 'https://generativelanguage.googleapis.com/v1beta/models';
                    headers = Utils.getApiHeaders(apiKey, provider);
                    break;
                    
                case 'custom':
                    modelsUrl = endpoint;
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    };
                    break;
                    
                default:
                    throw new Error('不支持的API提供商');
            }
            
            if (!modelsUrl) {
                throw new Error('API地址不能为空');
            }
            
            // 发送获取模型请求
            const response = await Utils.sendApiRequest(modelsUrl, {
                method: 'GET',
                headers: headers
            });
            
            // 解析响应数据，提取模型列表
            if (provider === 'openai') {
                // OpenAI格式
                models = response.data
                    .filter(model => model.id.includes('gpt') || model.id.includes('text'))
                    .map(model => ({
                        id: model.id,
                        name: model.id,
                        description: `OpenAI模型 (创建时间: ${new Date(model.created * 1000).toLocaleDateString()})`,
                        provider: 'openai'
                    }));
            } else if (provider === 'anthropic') {
                // Anthropic格式
                models = response.data.map(model => ({
                    id: model.id,
                    name: model.id,
                    description: 'Anthropic Claude模型',
                    provider: 'anthropic'
                }));
            } else if (provider === 'google') {
                // Google格式
                models = response.models
                    .filter(model => model.name.includes('models/gemini'))
                    .map(model => ({
                        id: model.name.replace('models/', ''),
                        name: model.name.replace('models/', ''),
                        description: 'Google Gemini模型',
                        provider: 'google'
                    }));
            } else if (provider === 'custom') {
                // 自定义API，尝试解析响应
                if (Array.isArray(response)) {
                    models = response.map(item => ({
                        id: item.id || item.name || item.model,
                        name: item.name || item.id || item.model,
                        description: item.description || '自定义API模型',
                        provider: 'custom'
                    }));
                } else if (response.data && Array.isArray(response.data)) {
                    models = response.data.map(item => ({
                        id: item.id || item.name || item.model,
                        name: item.name || item.id || item.model,
                        description: item.description || '自定义API模型',
                        provider: 'custom'
                    }));
                } else {
                    // 如果无法解析，使用默认模型
                    models = [{
                        id: 'custom-model',
                        name: '自定义模型',
                        description: '自定义API模型',
                        provider: 'custom'
                    }];
                }
            }
            
            // 保存模型列表
            const availableModels = Storage.getAvailableModels();
            availableModels[provider] = models;
            Storage.saveAvailableModels(availableModels);
            
            return {
                success: true,
                models: models,
                count: models.length,
                message: `成功获取 ${models.length} 个模型`
            };
            
        } catch (error) {
            console.error('获取模型列表失败:', error);
            return {
                success: false,
                error: error.message,
                message: `获取模型列表失败: ${error.message}`
            };
        }
    },
    
    // 发送聊天请求
    async sendChatMessage(config, messages, modelId = null) {
        const { provider, apiKey, endpoint } = config;
        
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        
        if (!endpoint) {
            throw new Error('API地址不能为空');
        }
        
        try {
            let requestUrl = endpoint;
            let headers = Utils.getApiHeaders(apiKey, provider);
            let body = {};
            
            // 根据提供商设置请求体
            switch (provider) {
                case 'openai':
                    body = {
                        model: modelId || 'gpt-3.5-turbo',
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 1000
                    };
                    break;
                    
                case 'anthropic':
                    // 转换消息格式为Anthropic格式
                    const systemMessage = messages.find(m => m.role === 'system');
                    const conversationMessages = messages.filter(m => m.role !== 'system');
                    
                    body = {
                        model: modelId || 'claude-3-haiku-20240307',
                        messages: conversationMessages.map(msg => ({
                            role: msg.role === 'assistant' ? 'assistant' : 'user',
                            content: msg.content
                        })),
                        max_tokens: 1000,
                        temperature: 0.7
                    };
                    
                    if (systemMessage) {
                        body.system = systemMessage.content;
                    }
                    break;
                    
                case 'google':
                    // 转换消息格式为Google格式
                    const googleMessages = messages.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    }));
                    
                    requestUrl = `${endpoint}/${modelId || 'gemini-pro'}:generateContent`;
                    body = {
                        contents: googleMessages,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000
                        }
                    };
                    break;
                    
                case 'custom':
                default:
                    // 自定义API，使用通用格式
                    body = {
                        model: modelId || 'default',
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 1000
                    };
                    break;
            }
            
            // 发送请求
            const response = await Utils.sendApiRequest(requestUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            // 解析响应
            let content = '';
            
            if (provider === 'openai') {
                content = response.choices?.[0]?.message?.content || '';
            } else if (provider === 'anthropic') {
                content = response.content?.[0]?.text || '';
            } else if (provider === 'google') {
                content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                // 自定义API，尝试多种可能的响应格式
                content = response.choices?.[0]?.message?.content || 
                         response.content || 
                         response.text || 
                         response.result || 
                         JSON.stringify(response);
            }
            
            if (!content) {
                throw new Error('API返回空响应');
            }
            
            return {
                success: true,
                content: content,
                rawResponse: response
            };
            
        } catch (error) {
            console.error('API聊天请求失败:', error);
            throw error;
        }
    },
    
    // 获取所有模型（内置+自定义）
    getAllModels() {
        const allModels = { ...Config.apiModels };
        const customConfigs = this.getApiConfig();
        const availableModels = Storage.getAvailableModels();
        
        // 添加自定义模型
        Object.entries(customConfigs).forEach(([provider, config]) => {
            if (config.enabled && availableModels[provider]) {
                availableModels[provider].forEach(model => {
                    const modelKey = `${provider}:${model.id}`;
                    allModels[modelKey] = {
                        name: `${model.name} (${Config.apiProviders[provider]?.name || provider})`,
                        description: model.description || `自定义${provider}模型`,
                        type: 'custom',
                        provider: provider,
                        modelId: model.id
                    };
                });
            }
        });
        
        return allModels;
    },
    
    // 获取当前激活的模型
    getActiveModels() {
        const allModels = this.getAllModels();
        const activeModels = {};
        
        Object.entries(allModels).forEach(([key, model]) => {
            if (model.type === 'builtin' || 
                (model.type === 'custom' && this.getApiConfig(model.provider)?.enabled)) {
                activeModels[key] = model;
            }
        });
        
        return activeModels;
    },
    
    // 打开API配置界面
    openApiConfig() {
        const customConfigs = this.getApiConfig();
        const availableModels = Storage.getAvailableModels();
        
        const modal = UI.createModal({
            id: 'apiConfigModal',
            title: '自定义API配置',
            content: `
                <div class="api-config-section">
                    <div class="api-config-section-title">⚙️ API提供商配置</div>
                    <div class="api-config-description">
                        配置您的API密钥和地址，以便使用自定义AI模型
                    </div>
                    
                    <div class="api-providers-list" id="apiProvidersList">
                        ${Object.entries(Config.apiProviders).map(([key, provider]) => {
                            const config = customConfigs[key] || {};
                            const hasModels = availableModels[key] && availableModels[key].length > 0;
                            
                            return `
                                <div class="api-provider-item ${config.enabled ? 'enabled' : ''}" data-provider="${key}">
                                    <div class="api-provider-header">
                                        <div class="api-provider-info">
                                            <div class="api-provider-name">${provider.name}</div>
                                            <div class="api-provider-status">
                                                ${config.enabled ? 
                                                    `<span class="status-enabled">✓ 已启用</span>` : 
                                                    `<span class="status-disabled">✗ 未启用</span>`
                                                }
                                                ${hasModels ? `<span class="models-count">${availableModels[key].length} 个模型</span>` : ''}
                                            </div>
                                        </div>
                                        <div class="api-provider-toggle">
                                            <label class="switch">
                                                <input type="checkbox" class="provider-toggle" data-provider="${key}" ${config.enabled ? 'checked' : ''}>
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    ${config.enabled ? `
                                        <div class="api-provider-config">
                                            <div class="form-group">
                                                <label class="form-label" for="apiKey_${key}">API密钥</label>
                                                <input type="password" class="form-input" id="apiKey_${key}" 
                                                       placeholder="请输入您的API密钥" value="${config.apiKey || ''}">
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label" for="endpoint_${key}">API地址</label>
                                                <input type="text" class="form-input" id="endpoint_${key}" 
                                                       placeholder="${provider.endpoint || '请输入API地址'}" value="${config.endpoint || ''}">
                                                <div class="form-hint">留空使用默认地址</div>
                                            </div>
                                            <div class="api-provider-actions">
                                                <button class="btn-primary test-api-btn" data-provider="${key}">
                                                    <i class="fas fa-plug"></i> 测试连接
                                                </button>
                                                <button class="btn-primary fetch-models-btn" data-provider="${key}">
                                                    <i class="fas fa-download"></i> 获取模型
                                                </button>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="api-config-section">
                    <div class="api-config-section-title">📊 当前可用模型</div>
                    <div class="available-models-list" id="availableModelsList">
                        ${(() => {
                            const activeModels = this.getActiveModels();
                            const modelKeys = Object.keys(activeModels);
                            
                            if (modelKeys.length === 0) {
                                return '<div class="no-models">暂无可用模型，请先配置API</div>';
                            }
                            
                            return modelKeys.map(key => {
                                const model = activeModels[key];
                                return `
                                    <div class="available-model-item" data-model="${key}">
                                        <div class="model-icon">
                                            <i class="fas fa-robot"></i>
                                        </div>
                                        <div class="model-info">
                                            <div class="model-name">${model.name}</div>
                                            <div class="model-description">${model.description}</div>
                                            <div class="model-provider">
                                                <span class="provider-tag ${model.provider}">${model.type === 'builtin' ? '内置' : '自定义'}</span>
                                                <span class="provider-name">${Config.apiProviders[model.provider]?.name || model.provider}</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('');
                        })()}
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: '关闭',
                    action: 'close',
                    class: 'btn-primary'
                }
            ],
            size: 'large'
        });
        
        UI.showModal('apiConfigModal');
        
        // 设置事件监听
        this.setupApiConfigEvents(modal);
    },
    
    // 设置API配置事件
    setupApiConfigEvents(modal) {
        // 提供商开关切换
        modal.querySelectorAll('.provider-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const provider = e.target.dataset.provider;
                const enabled = e.target.checked;
                
                this.toggleApiProvider(provider, enabled, modal);
            });
        });
        
        // 测试连接按钮
        modal.querySelectorAll('.test-api-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const provider = e.target.dataset.provider;
                await this.testApiProvider(provider, modal);
            });
        });
        
        // 获取模型按钮
        modal.querySelectorAll('.fetch-models-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const provider = e.target.dataset.provider;
                await this.fetchModelsForProvider(provider, modal);
            });
        });
        
        // API密钥输入框更改时自动保存
        modal.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.id;
                const [_, provider] = id.split('_');
                this.saveApiProviderConfig(provider, modal);
            });
        });
    },
    
    // 切换API提供商
    toggleApiProvider(provider, enabled, modal) {
        const configs = this.getApiConfig();
        
        if (enabled) {
            // 启用提供商
            if (!configs[provider]) {
                configs[provider] = {
                    enabled: true,
                    apiKey: '',
                    endpoint: Config.apiProviders[provider]?.endpoint || ''
                };
            } else {
                configs[provider].enabled = true;
            }
        } else {
            // 禁用提供商
            if (configs[provider]) {
                configs[provider].enabled = false;
            }
        }
        
        this.saveApiConfig(configs);
        
        // 重新加载模态框内容
        setTimeout(() => {
            UI.closeModal('apiConfigModal');
            setTimeout(() => {
                this.openApiConfig();
            }, 300);
        }, 300);
    },
    
    // 测试API提供商连接
    async testApiProvider(provider, modal) {
        const apiKeyInput = modal.querySelector(`#apiKey_${provider}`);
        const endpointInput = modal.querySelector(`#endpoint_${provider}`);
        
        if (!apiKeyInput) {
            Utils.showToast('请先输入API密钥', 'error');
            return;
        }
        
        const apiKey = apiKeyInput.value.trim();
        const endpoint = endpointInput.value.trim() || Config.apiProviders[provider]?.endpoint;
        
        if (!apiKey) {
            Utils.showToast('API密钥不能为空', 'error');
            return;
        }
        
        if (!endpoint) {
            Utils.showToast('API地址不能为空', 'error');
            return;
        }
        
        const config = {
            provider: provider,
            apiKey: apiKey,
            endpoint: endpoint
        };
        
        // 保存配置
        this.saveApiProviderConfig(provider, modal);
        
        // 显示加载状态
        const testBtn = modal.querySelector(`.test-api-btn[data-provider="${provider}"]`);
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
        testBtn.disabled = true;
        
        try {
            const result = await this.testApiConnection(config);
            
            if (result.success) {
                Utils.showToast(result.message, 'success');
            } else {
                Utils.showToast(result.message, 'error');
            }
        } catch (error) {
            Utils.showToast(`测试失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
        }
    },
    
    // 获取提供商模型
    async fetchModelsForProvider(provider, modal) {
        const apiKeyInput = modal.querySelector(`#apiKey_${provider}`);
        const endpointInput = modal.querySelector(`#endpoint_${provider}`);
        
        if (!apiKeyInput) {
            Utils.showToast('请先输入API密钥', 'error');
            return;
        }
        
        const apiKey = apiKeyInput.value.trim();
        const endpoint = endpointInput.value.trim() || Config.apiProviders[provider]?.endpoint;
        
        if (!apiKey) {
            Utils.showToast('API密钥不能为空', 'error');
            return;
        }
        
        if (!endpoint) {
            Utils.showToast('API地址不能为空', 'error');
            return;
        }
        
        const config = {
            provider: provider,
            apiKey: apiKey,
            endpoint: endpoint
        };
        
        // 保存配置
        this.saveApiProviderConfig(provider, modal);
        
        // 显示加载状态
        const fetchBtn = modal.querySelector(`.fetch-models-btn[data-provider="${provider}"]`);
        const originalText = fetchBtn.innerHTML;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 获取中...';
        fetchBtn.disabled = true;
        
        try {
            const result = await this.fetchAvailableModels(config);
            
            if (result.success) {
                Utils.showToast(result.message, 'success');
                
                // 重新加载模态框以显示新模型
                setTimeout(() => {
                    UI.closeModal('apiConfigModal');
                    setTimeout(() => {
                        this.openApiConfig();
                    }, 300);
                }, 1000);
            } else {
                Utils.showToast(result.message, 'error');
            }
        } catch (error) {
            Utils.showToast(`获取失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            fetchBtn.innerHTML = originalText;
            fetchBtn.disabled = false;
        }
    },
    
    // 保存API提供商配置
    saveApiProviderConfig(provider, modal) {
        const apiKeyInput = modal.querySelector(`#apiKey_${provider}`);
        const endpointInput = modal.querySelector(`#endpoint_${provider}`);
        
        if (!apiKeyInput) return;
        
        const configs = this.getApiConfig();
        
        if (!configs[provider]) {
            configs[provider] = {
                enabled: true,
                apiKey: '',
                endpoint: ''
            };
        }
        
        configs[provider].apiKey = apiKeyInput.value.trim();
        configs[provider].endpoint = endpointInput.value.trim() || Config.apiProviders[provider]?.endpoint || '';
        
        this.saveApiConfig(configs);
    }
};

// ========== UI组件模块 ==========
const UI = {
    // 当前打开的弹窗
    activeModals: new Set(),
    
    // 创建弹窗
    createModal(options) {
        const {
            id = Utils.generateId('modal'),
            title = '',
            content = '',
            size = 'medium', // small, medium, large
            showClose = true,
            onClose = null,
            buttons = []
        } = options;
        
        // 如果已存在，先移除
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        
        // 创建弹窗
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.dataset.size = size;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                    ${showClose ? '<button class="modal-close"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">${content}</div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="${btn.class || 'btn-primary'}" 
                                    data-action="${btn.action || 'close'}"
                                    ${btn.disabled ? 'disabled' : ''}>
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // 添加到容器
        document.getElementById('modalContainer').appendChild(modal);
        
        // 事件处理
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(id));
        }
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        });
        
        // 按钮事件
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'close') {
                    this.closeModal(id);
                }
                // 其他动作可以通过onButtonClick回调处理
            });
        });
        
        this.activeModals.add(id);
        return modal;
    },
    
    // 显示弹窗
    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            this.activeModals.add(id);
            
            // 触发自定义显示事件
            const event = new CustomEvent('modal:show', { detail: { id } });
            modal.dispatchEvent(event);
        }
    },
    
    // 关闭弹窗
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            this.activeModals.delete(id);
            
            // 触发自定义关闭事件
            const event = new CustomEvent('modal:close', { detail: { id } });
            modal.dispatchEvent(event);
            
            // 稍后移除DOM（为了动画）
            setTimeout(() => {
                if (!modal.classList.contains('active') && modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    },
    
    // 关闭所有弹窗
    closeAllModals() {
        this.activeModals.forEach(id => this.closeModal(id));
        this.activeModals.clear();
    },
    
    // 创建浮窗
    createFloat(options) {
        const {
            id = Utils.generateId('float'),
            content = '',
            position = { x: 0, y: 0 },
            items = []
        } = options;
        
        const float = document.createElement('div');
        float.id = id;
        float.className = 'action-float';
        float.style.left = position.x + 'px';
        float.style.top = position.y + 'px';
        
        if (content) {
            float.innerHTML = content;
        } else if (items.length > 0) {
            float.innerHTML = items.map(item => `
                <div class="action-float-item ${item.class || ''}" 
                     data-action="${item.action || ''}">
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <span>${item.text}</span>
                </div>
            `).join('');
        }
        
        document.getElementById('floatContainer').appendChild(float);
        return float;
    },
    
    // 显示浮窗
    showFloat(id) {
        const float = document.getElementById(id);
        if (float) {
            float.classList.add('show');
        }
    },
    
    // 隐藏浮窗
    hideFloat(id) {
        const float = document.getElementById(id);
        if (float) {
            float.classList.remove('show');
        }
    },
    
    // 创建对话框
    createDialog(options) {
        const {
            id = 'chatDialog',
            title = '',
            content = ''
        } = options;
        
        const dialog = document.createElement('div');
        dialog.id = id;
        dialog.className = 'chat-dialog';
        dialog.innerHTML = content;
        
        document.getElementById('dialogContainer').appendChild(dialog);
        return dialog;
    },
    
    // 显示对话框
    showDialog(id) {
        const dialog = document.getElementById(id);
        if (dialog) {
            dialog.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // 隐藏对话框
    hideDialog(id) {
        const dialog = document.getElementById(id);
        if (dialog) {
            dialog.classList.remove('active');
            document.body.style.overflow = '';
            
            // 稍后移除
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.remove();
                }
            }, 300);
        }
    },
    
    // 更新状态栏时间
    updateStatusBarTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = Utils.formatTime();
        }
    },
    
    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 更新页面显示
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `${tabName}Page`);
        });
    },
    
    // 创建加载指示器
    createLoader(text = '加载中...') {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">${text}</div>
        `;
        
        document.body.appendChild(loader);
        return loader;
    },
    
    // 移除加载指示器
    removeLoader(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
};

// ========== 备份模块 ==========
const BackupModule = {
    // 状态
    isInitialized: false,
    
    // 初始化
    init() {
        if (this.isInitialized) return;
        
        console.log('💾 初始化备份模块...');
        
        // 设置事件监听
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ 备份模块初始化完成');
    },
    
    // 打开备份管理界面
    openBackupManager() {
        const backupList = Storage.getBackupList();
        
        const modal = UI.createModal({
            id: 'backupModal',
            title: '备份与恢复',
            content: `
                <div class="backup-section">
                    <div class="backup-section-title">📱 本地备份</div>
                    <div class="backup-description">
                        将数据备份到本地文件，适合换设备或重装应用时使用
                    </div>
                    <div class="backup-action-buttons">
                        <button class="btn-primary" id="createLocalBackupBtn">
                            <i class="fas fa-download"></i> 创建本地备份
                        </button>
                        <button class="btn-primary" id="restoreLocalBackupBtn">
                            <i class="fas fa-upload"></i> 恢复本地备份
                        </button>
                    </div>
                </div>
                
                <div class="backup-section">
                    <div class="backup-section-title">☁️ 云端备份</div>
                    <div class="backup-description">
                        将数据备份到云端（使用浏览器存储），方便多设备同步
                    </div>
                    <div class="backup-action-buttons">
                        <button class="btn-primary" id="createCloudBackupBtn">
                            <i class="fas fa-cloud-upload-alt"></i> 创建云端备份
                        </button>
                    </div>
                    
                    <div class="backup-list" id="cloudBackupList">
                        ${backupList.length === 0 ? 
                            '<div class="no-backup">暂无云端备份</div>' : 
                            backupList.map(backup => this.createBackupItemHtml(backup)).join('')}
                    </div>
                </div>
                
                <div class="backup-info">
                    <div class="backup-info-title">📊 数据统计</div>
                    <div class="backup-stats" id="backupStats">
                        <!-- 统计信息将通过JS动态更新 -->
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: '关闭',
                    action: 'close',
                    class: 'btn-primary'
                }
            ],
            size: 'large'
        });
        
        UI.showModal('backupModal');
        
        // 更新数据统计
        this.updateBackupStats();
        
        // 设置事件监听
        this.setupBackupManagerEvents(modal);
    },
    
    // 创建备份项HTML
    createBackupItemHtml(backup) {
        const sizeKB = (backup.size / 1024).toFixed(2);
        return `
            <div class="backup-item" data-backup-id="${backup.id}">
                <div class="backup-item-header">
                    <div class="backup-item-title">
                        <i class="fas fa-database"></i>
                        <span>备份 ${backup.id.substring(0, 8)}...</span>
                    </div>
                    <div class="backup-item-date">${backup.date}</div>
                </div>
                <div class="backup-item-details">
                    <div class="backup-item-size">${sizeKB} KB</div>
                    <div class="backup-item-description">${backup.description}</div>
                </div>
                <div class="backup-item-actions">
                    <button class="backup-action-btn restore-btn" data-action="restore" data-backup-id="${backup.id}">
                        <i class="fas fa-undo"></i> 恢复
                    </button>
                    <button class="backup-action-btn delete-btn" data-action="delete" data-backup-id="${backup.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                    <button class="backup-action-btn download-btn" data-action="download" data-backup-id="${backup.id}">
                        <i class="fas fa-download"></i> 下载
                    </button>
                </div>
            </div>
        `;
    },
    
    // 更新备份统计信息
    updateBackupStats() {
        const statsContainer = document.getElementById('backupStats');
        if (!statsContainer) return;
        
        // 获取所有数据
        const allData = this.getAllData();
        const jsonStr = JSON.stringify(allData);
        const dataSize = jsonStr.length;
        
        // 获取备份列表
        const backupList = Storage.getBackupList();
        
        statsContainer.innerHTML = `
            <div class="backup-stat-item">
                <span class="stat-label">数据大小:</span>
                <span class="stat-value">${(dataSize / 1024).toFixed(2)} KB</span>
            </div>
            <div class="backup-stat-item">
                <span class="stat-label">联系人数量:</span>
                <span class="stat-value">${allData.contacts?.length || 0}</span>
            </div>
            <div class="backup-stat-item">
                <span class="stat-label">聊天记录:</span>
                <span class="stat-value">${Object.keys(allData.chat_histories || {}).length} 个对话</span>
            </div>
            <div class="backup-stat-item">
                <span class="stat-label">动态数量:</span>
                <span class="stat-value">${allData.moments?.length || 0}</span>
            </div>
            <div class="backup-stat-item">
                <span class="stat-label">云端备份:</span>
                <span class="stat-value">${backupList.length} 个</span>
            </div>
        `;
    },
    
    // 获取所有数据
    getAllData() {
        const data = {};
        
        // 收集所有localStorage数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                data[key] = localStorage.getItem(key);
            }
        }
        
        return data;
    },
    
    // 设置备份管理界面事件
    setupBackupManagerEvents(modal) {
        // 创建本地备份
        const createLocalBackupBtn = modal.querySelector('#createLocalBackupBtn');
        if (createLocalBackupBtn) {
            createLocalBackupBtn.addEventListener('click', () => {
                this.createLocalBackup();
            });
        }
        
        // 恢复本地备份
        const restoreLocalBackupBtn = modal.querySelector('#restoreLocalBackupBtn');
        if (restoreLocalBackupBtn) {
            restoreLocalBackupBtn.addEventListener('click', () => {
                this.restoreFromLocalBackup();
            });
        }
        
        // 创建云端备份
        const createCloudBackupBtn = modal.querySelector('#createCloudBackupBtn');
        if (createCloudBackupBtn) {
            createCloudBackupBtn.addEventListener('click', () => {
                this.createCloudBackup();
            });
        }
        
        // 备份项操作
        modal.querySelectorAll('.backup-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const backupId = btn.dataset.backupId;
                
                if (action === 'restore') {
                    this.restoreFromCloudBackup(backupId);
                } else if (action === 'delete') {
                    this.deleteCloudBackup(backupId);
                } else if (action === 'download') {
                    this.downloadCloudBackup(backupId);
                }
            });
        });
    },
    
    // 创建本地备份
    createLocalBackup() {
        const allData = this.getAllData();
        const dataStr = JSON.stringify(allData, null, 2);
        
        // 生成备份信息
        const backupInfo = {
            timestamp: Date.now(),
            date: Utils.formatDate(),
            version: Config.version,
            dataSize: dataStr.length,
            itemsCount: Object.keys(allData).length
        };
        
        allData._backup_info = backupInfo;
        
        // 生成最终备份数据
        const backupData = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupData);
        
        // 生成文件名
        const fileName = `quq-backup-${new Date().toISOString().slice(0,10)}-${Date.now()}.json`;
        
        // 创建下载链接
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        Utils.showToast(`本地备份已创建: ${fileName}`);
        console.log('💾 本地备份已创建', backupInfo);
    },
    
    // 从本地备份恢复
    restoreFromLocalBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // 验证备份文件
                    if (!backupData._backup_info) {
                        Utils.showToast('无效的备份文件', 'error');
                        return;
                    }
                    
                    const backupInfo = backupData._backup_info;
                    delete backupData._backup_info; // 移除备份信息
                    
                    const confirmMsg = `
确定要恢复备份吗？

备份信息：
📅 时间: ${backupInfo.date}
📦 版本: ${backupInfo.version}
📊 数据量: ${backupInfo.itemsCount} 个项目

注意：这将覆盖当前所有数据！
`.trim();
                    
                    if (confirm(confirmMsg)) {
                        // 清空当前数据
                        localStorage.clear();
                        Storage.clearCache();
                        
                        // 恢复备份数据
                        Object.keys(backupData).forEach(key => {
                            if (typeof backupData[key] === 'object') {
                                localStorage.setItem(key, JSON.stringify(backupData[key]));
                            } else {
                                localStorage.setItem(key, backupData[key]);
                            }
                        });
                        
                        Utils.showToast('数据恢复成功！页面将刷新...', 'success', 3000);
                        
                        // 3秒后刷新页面
                        setTimeout(() => {
                            location.reload();
                        }, 3000);
                    }
                } catch (error) {
                    Utils.showToast('备份文件格式错误: ' + error.message, 'error');
                    console.error('备份恢复失败:', error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    // 创建云端备份
    createCloudBackup() {
        const description = prompt('请输入备份描述（可选）:', `备份 ${Utils.formatDate()}`);
        if (description === null) return; // 用户取消
        
        const allData = this.getAllData();
        const dataStr = JSON.stringify(allData);
        
        // 生成备份ID
        const backupId = Utils.generateId('backup');
        
        // 创建备份信息
        const backupInfo = {
            id: backupId,
            timestamp: Date.now(),
            date: Utils.formatDate(),
            description: description || `备份 ${Utils.formatDate()}`,
            size: dataStr.length,
            version: Config.version,
            itemsCount: Object.keys(allData).length
        };
        
        // 保存备份数据
        Storage.saveCloudBackup(backupId, allData);
        
        // 更新备份列表
        let backupList = Storage.getBackupList();
        backupList.unshift(backupInfo); // 添加到开头
        
        // 限制最多保存10个备份
        if (backupList.length > 10) {
            // 删除最旧的备份
            const oldestBackup = backupList.pop();
            Storage.deleteCloudBackup(oldestBackup.id);
        }
        
        Storage.saveBackupList(backupList);
        
        // 更新界面
        this.updateBackupList();
        this.updateBackupStats();
        
        Utils.showToast('云端备份已创建');
        console.log('☁️ 云端备份已创建', backupInfo);
    },
    
    // 从云端备份恢复
    restoreFromCloudBackup(backupId) {
        const backupData = Storage.getCloudBackup(backupId);
        if (!backupData) {
            Utils.showToast('备份不存在', 'error');
            return;
        }
        
        const backupList = Storage.getBackupList();
        const backupInfo = backupList.find(b => b.id === backupId);
        
        const confirmMsg = `
确定要恢复此备份吗？

备份信息：
📅 时间: ${backupInfo?.date || '未知'}
📝 描述: ${backupInfo?.description || '无'}
📦 大小: ${(backupInfo?.size / 1024).toFixed(2)} KB
📊 项目: ${backupInfo?.itemsCount || '未知'} 个

注意：这将覆盖当前所有数据！
`.trim();
        
        if (confirm(confirmMsg)) {
            // 清空当前数据
            localStorage.clear();
            Storage.clearCache();
            
            // 恢复备份数据
            Object.keys(backupData).forEach(key => {
                if (typeof backupData[key] === 'object') {
                    localStorage.setItem(key, JSON.stringify(backupData[key]));
                } else {
                    localStorage.setItem(key, backupData[key]);
                }
            });
            
            Utils.showToast('数据恢复成功！页面将刷新...', 'success', 3000);
            
            // 3秒后刷新页面
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    },
    
    // 删除云端备份
    deleteCloudBackup(backupId) {
        if (confirm('确定要删除这个备份吗？此操作不可撤销。')) {
            Storage.deleteCloudBackup(backupId);
            
            // 更新界面
            this.updateBackupList();
            this.updateBackupStats();
            
            Utils.showToast('备份已删除');
        }
    },
    
    // 下载云端备份
    downloadCloudBackup(backupId) {
        const backupData = Storage.getCloudBackup(backupId);
        if (!backupData) {
            Utils.showToast('备份不存在', 'error');
            return;
        }
        
        const backupList = Storage.getBackupList();
        const backupInfo = backupList.find(b => b.id === backupId);
        
        // 添加备份信息
        backupData._backup_info = {
            timestamp: Date.now(),
            date: Utils.formatDate(),
            version: Config.version,
            dataSize: JSON.stringify(backupData).length,
            itemsCount: Object.keys(backupData).length,
            originalBackupInfo: backupInfo
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // 生成文件名
        const fileName = `quq-cloud-backup-${backupId.substring(0, 8)}.json`;
        
        // 创建下载链接
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        Utils.showToast('备份文件已下载');
    },
    
    // 更新备份列表显示
    updateBackupList() {
        const backupListContainer = document.getElementById('cloudBackupList');
        if (!backupListContainer) return;
        
        const backupList = Storage.getBackupList();
        
        if (backupList.length === 0) {
            backupListContainer.innerHTML = '<div class="no-backup">暂无云端备份</div>';
        } else {
            backupListContainer.innerHTML = backupList.map(backup => 
                this.createBackupItemHtml(backup)).join('');
            
            // 重新绑定事件
            backupListContainer.querySelectorAll('.backup-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    const backupId = btn.dataset.backupId;
                    
                    if (action === 'restore') {
                        this.restoreFromCloudBackup(backupId);
                    } else if (action === 'delete') {
                        this.deleteCloudBackup(backupId);
                    } else if (action === 'download') {
                        this.downloadCloudBackup(backupId);
                    }
                });
            });
        }
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 备份按钮
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.openBackupManager();
            });
        }
    }
};

// ========== 聊天模块 ==========
const ChatModule = {
    // 状态
    currentRoleId: null,
    currentDialog: null,
    isInitialized: false,
    
    // 初始化
    init() {
        if (this.isInitialized) return;
        
        console.log('💬 初始化聊天模块...');
        
        // 加载联系人列表
        this.loadChatList();
        
        // 设置事件监听
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ 聊天模块初始化完成');
    },
    
    // 加载联系人列表
    loadChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        const roles = Storage.getRoles();
        
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
        const pinnedContacts = Storage.getPinnedContacts();
        
        // 先显示置顶联系人
        const pinnedRoles = roles.filter(role => pinnedContacts.includes(role.id));
        const normalRoles = roles.filter(role => !pinnedContacts.includes(role.id));
        
        // 添加置顶联系人
        pinnedRoles.forEach(role => this.createContactItem(role, true));
        
        // 添加普通联系人
        normalRoles.forEach(role => this.createContactItem(role, false));
    },
    
    // 创建联系人项
    createContactItem(role, isPinned = false) {
        const chatList = document.getElementById('chatList');
        if (!chatList) return null;
        
        // 获取最后一条消息
        const histories = Storage.getChatHistories();
        const roleHistory = histories[role.id] || [];
        const lastMessage = roleHistory.length > 0 ? roleHistory[roleHistory.length - 1] : null;
        
        // 获取联系人使用的模型
        const appliedModels = Storage.getAppliedApiModels();
        const modelKey = appliedModels[role.id] || Storage.getSetting('selected_api_model', 'gpt-3.5');
        const allModels = ApiModule.getAllModels();
        const model = allModels[modelKey];
        
        // 创建容器
        const container = document.createElement('div');
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
                        ${model ? `
                            <div class="role-model-tag">
                                <span class="model-tag ${model.type === 'builtin' ? 'builtin' : 'custom'}">
                                    <i class="fas fa-robot"></i> ${model.name}
                                </span>
                            </div>
                        ` : ''}
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
    setupContactItemEvents(container, role) {
        const chatItem = container.querySelector('.chat-item');
        const pinBtn = container.querySelector('.pin');
        const deleteBtn = container.querySelector('.delete');
        
        // 点击打开聊天
        chatItem.addEventListener('click', () => {
            this.openChatDialog(role.id);
        });
        
        // 置顶/取消置顶
        pinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePinContact(role.id);
        });
        
        // 删除
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirm(deleteBtn, role);
        });
        
        // 触摸滑动
        this.setupSwipeEvents(chatItem);
    },
    
    // 设置滑动事件
    setupSwipeEvents(element) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            
            // 关闭其他打开的滑动项
            document.querySelectorAll('.chat-item').forEach(item => {
                if (item !== element) {
                    item.style.transform = 'translateX(0)';
                }
            });
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            
            // 限制向左滑动
            if (diff < 0 && diff > -140) {
                element.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: true });
        
        element.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            const diff = currentX - startX;
            
            // 如果滑动足够远，保持打开状态
            if (diff < -50) {
                element.style.transform = 'translateX(-140px)';
            } else {
                element.style.transform = 'translateX(0)';
            }
        });
    },
    
    // 打开聊天对话框
    openChatDialog(roleId) {
        this.currentRoleId = roleId;
        const role = Storage.getRoles().find(r => r.id === roleId);
        if (!role) {
            Utils.showToast('联系人不存在', 'error');
            return;
        }
        
        console.log(`💬 打开与 ${role.name} 的聊天`);
        
        // 创建对话框
        const dialog = UI.createDialog({
            id: 'chatDialog',
            title: role.note || role.name,
            content: `
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
            `
        });
        
        // 显示对话框
        UI.showDialog('chatDialog');
        
        // 加载历史消息
        this.loadChatHistory(roleId);
        
        // 设置对话框事件
        this.setupDialogEvents();
        
        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('chatMessageInput');
            if (input) input.focus();
        }, 100);
        
        this.currentDialog = dialog;
    },
    
    // 加载聊天历史
    loadChatHistory(roleId) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        const histories = Storage.getChatHistories();
        const roleHistory = histories[roleId] || [];
        
        // 如果没有历史消息，显示欢迎语
        if (roleHistory.length === 0) {
            this.addMessage('你好！我是你的AI联系人，很高兴为你服务。', false);
            return;
        }
        
        // 显示所有历史消息
        roleHistory.forEach(msg => {
            this.addMessage(msg.content, msg.role === 'user', msg.id, msg.time);
        });
        
        // 滚动到底部
        this.scrollToBottom();
    },
    
    // 添加消息
    addMessage(content, isUser = false, messageId = null, timestamp = null) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return null;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user' : 'contact'}`;
        
        const id = messageId || Utils.generateId('msg');
        messageElement.dataset.messageId = id;
        
        const now = timestamp ? new Date(timestamp) : new Date();
        const timeStr = Utils.formatTime(now);
        
        messageElement.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timeStr}</div>
            ${isUser ? '<button class="message-edit-btn"><i class="fas fa-edit"></i></button>' : ''}
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // 如果是用户消息，添加编辑功能
        if (isUser) {
            const editBtn = messageElement.querySelector('.message-edit-btn');
            editBtn.addEventListener('click', () => {
                this.editMessage(id, content);
            });
        }
        
        // 滚动到底部
        this.scrollToBottom();
        
        return id;
    },
    
    // 编辑消息
    editMessage(messageId, currentContent) {
        const newContent = prompt('编辑消息内容：', currentContent);
        if (newContent !== null && newContent.trim() && newContent !== currentContent) {
            // 更新界面
            const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
            if (messageElement) {
                messageElement.textContent = newContent.trim();
            }
            
            // 更新存储
            if (this.currentRoleId) {
                const histories = Storage.getChatHistories();
                const roleHistory = histories[this.currentRoleId] || [];
                const messageIndex = roleHistory.findIndex(msg => msg.id === messageId);
                
                if (messageIndex !== -1) {
                    roleHistory[messageIndex].content = newContent.trim();
                    roleHistory[messageIndex].edited = true;
                    roleHistory[messageIndex].editTime = Date.now();
                    
                    Storage.saveChatHistories(histories);
                    Utils.showToast('消息已修改');
                }
            }
        }
    },
    
    // 发送消息
    sendMessage() {
        const input = document.getElementById('chatMessageInput');
        if (!input || !this.currentRoleId) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // 添加用户消息
        const messageId = this.addMessage(message, true);
        
        // 保存到历史记录
        const histories = Storage.getChatHistories();
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
        this.generateAIResponse(message);
    },
    
    // 生成AI回复
    async generateAIResponse(userMessage) {
        if (!this.currentRoleId) return;
        
        const role = Storage.getRoles().find(r => r.id === this.currentRoleId);
        if (!role) return;
        
        // 获取联系人使用的模型
        const appliedModels = Storage.getAppliedApiModels();
        const modelKey = appliedModels[this.currentRoleId] || Storage.getSetting('selected_api_model', 'gpt-3.5');
        const allModels = ApiModule.getAllModels();
        const model = allModels[modelKey];
        
        if (!model) {
            this.addFallbackResponse(role, userMessage);
            return;
        }
        
        // 如果是自定义API模型，检查配置
        if (model.type === 'custom') {
            const apiConfig = ApiModule.getApiConfig(model.provider);
            if (!apiConfig || !apiConfig.enabled || !apiConfig.apiKey) {
                Utils.showToast('自定义API未配置或未启用', 'error');
                this.addFallbackResponse(role, userMessage);
                return;
            }
            
            // 使用自定义API
            try {
                await this.generateCustomAIResponse(role, userMessage, model, apiConfig);
                return;
            } catch (error) {
                console.error('自定义API请求失败:', error);
                Utils.showToast('AI响应失败，使用模拟回复', 'error');
            }
        }
        
        // 使用内置模型或模拟回复
        this.addFallbackResponse(role, userMessage);
    },
    
    // 添加模拟回复
    addFallbackResponse(role, userMessage) {
        // 生成模拟回复
        let reply;
        
        if (!role.personality || role.personality.trim() === '') {
            // 空白机器人模式
            reply = `我收到了你的消息："${userMessage}"。`;
            
            if (userMessage.includes('？') || userMessage.includes('?')) {
                reply += ' 这是一个问题，我可以帮你解答。';
            } else if (userMessage.includes('!') || userMessage.includes('！')) {
                reply += ' 听起来很有趣！';
            }
        } else {
            // 基于人物设定的回复
            reply = `作为${role.name}，`;
            
            // 添加性格特点
            const personality = role.personality.toLowerCase();
            if (personality.includes('温柔') || personality.includes('体贴')) {
                reply += ' 我会温柔地回应你。';
            } else if (personality.includes('幽默') || personality.includes('风趣')) {
                reply += ' 让我用幽默的方式回应！';
            } else if (personality.includes('专业') || personality.includes('严谨')) {
                reply += ' 从专业角度分析，';
            }
            
            reply += ` 关于"${userMessage.substring(0, 20)}${userMessage.length > 20 ? '...' : ''}"，`;
            
            // 添加部分设定
            if (role.personality.length > 50) {
                reply += ` ${role.personality.substring(0, 50)}...`;
            } else {
                reply += role.personality;
            }
        }
        
        // 添加回复
        const replyId = this.addMessage(reply, false);
        
        // 保存回复
        const histories = Storage.getChatHistories();
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
    
    // 生成自定义AI回复
    async generateCustomAIResponse(role, userMessage, model, apiConfig) {
        // 获取聊天历史
        const histories = Storage.getChatHistories();
        const roleHistory = histories[this.currentRoleId] || [];
        
        // 构建消息数组
        const messages = [];
        
        // 添加系统消息（基于角色设定）
        if (role.personality && role.personality.trim()) {
            messages.push({
                role: 'system',
                content: `你是一个AI助手，扮演角色：${role.name}。角色设定：${role.personality}。请根据这个设定来回应用户。`
            });
        } else {
            messages.push({
                role: 'system',
                content: '你是一个有帮助的AI助手。'
            });
        }
        
        // 添加上下文消息（最近10条）
        const recentMessages = roleHistory.slice(-10);
        recentMessages.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
        
        // 添加当前用户消息
        messages.push({
            role: 'user',
            content: userMessage
        });
        
        // 发送API请求
        const config = {
            provider: model.provider,
            apiKey: apiConfig.apiKey,
            endpoint: apiConfig.endpoint
        };
        
        const response = await ApiModule.sendChatMessage(config, messages, model.modelId);
        
        if (response.success) {
            // 添加回复
            const replyId = this.addMessage(response.content, false);
            
            // 保存回复
            histories[this.currentRoleId].push({
                id: replyId,
                role: 'assistant',
                content: response.content,
                time: Date.now()
            });
            
            Storage.saveChatHistories(histories);
            
            // 更新联系人列表的最后消息显示
            this.loadChatList();
        } else {
            throw new Error(response.error || 'API请求失败');
        }
    },
    
    // 滚动到底部
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 50);
        }
    },
    
    // 置顶/取消置顶联系人
    togglePinContact(roleId) {
        let pinned = Storage.getPinnedContacts();
        const index = pinned.indexOf(roleId);
        
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
    
    // 显示删除确认
    showDeleteConfirm(button, role) {
        const float = UI.createFloat({
            items: [
                {
                    text: '确认删除',
                    icon: 'fas fa-trash-alt',
                    action: 'delete',
                    class: 'delete'
                },
                {
                    text: '取消',
                    icon: 'fas fa-times',
                    action: 'cancel'
                }
            ]
        });
        
        const rect = button.getBoundingClientRect();
        float.style.left = rect.left + 'px';
        float.style.top = rect.top + 'px';
        
        UI.showFloat(float.id);
        
        // 事件处理
        float.querySelector('[data-action="delete"]').addEventListener('click', () => {
            this.deleteContact(role.id);
            UI.hideFloat(float.id);
        });
        
        float.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
        });
        
        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!float.contains(e.target)) {
                    UI.hideFloat(float.id);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    },
    
    // 删除联系人
    deleteContact(roleId) {
        if (!confirm('确定要删除这个联系人吗？此操作不可撤销。')) {
            return;
        }
        
        // 从角色列表中移除
        let roles = Storage.getRoles();
        roles = roles.filter(r => r.id !== roleId);
        Storage.saveRoles(roles);
        
        // 从置顶列表中移除
        let pinned = Storage.getPinnedContacts();
        pinned = pinned.filter(id => id !== roleId);
        Storage.savePinnedContacts(pinned);
        
        // 删除聊天记录
        const histories = Storage.getChatHistories();
        delete histories[roleId];
        Storage.saveChatHistories(histories);
        
        // 如果正在聊天的是这个联系人，关闭对话框
        if (this.currentRoleId === roleId) {
            UI.hideDialog('chatDialog');
            this.currentRoleId = null;
            this.currentDialog = null;
        }
        
        // 重新加载列表
        this.loadChatList();
        
        Utils.showToast('联系人已删除');
    },
    
    // 设置对话框事件
    setupDialogEvents() {
        // 返回按钮
        const backBtn = document.getElementById('backToChatList');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                UI.hideDialog('chatDialog');
                this.currentRoleId = null;
                this.currentDialog = null;
            });
        }
        
        // 更多按钮
        const moreBtn = document.getElementById('dialogMoreBtn');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                this.showChatActionsMenu(e.target);
            });
        }
        
        // 发送按钮
        const sendBtn = document.getElementById('sendChatMessage');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // 输入框回车发送
        const input = document.getElementById('chatMessageInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    },
    
    // 显示聊天操作菜单
    showChatActionsMenu(button) {
        const float = UI.createFloat({
            items: [
                {
                    text: '编辑联系人',
                    icon: 'fas fa-edit',
                    action: 'edit'
                },
                {
                    text: '切换模型',
                    icon: 'fas fa-robot',
                    action: 'switchModel'
                },
                {
                    text: '聊天设置',
                    icon: 'fas fa-cog',
                    action: 'settings'
                },
                {
                    text: '删除联系人',
                    icon: 'fas fa-trash-alt',
                    action: 'delete',
                    class: 'delete'
                }
            ]
        });
        
        const rect = button.getBoundingClientRect();
        float.style.left = (rect.left - 150) + 'px';
        float.style.top = (rect.top + 40) + 'px';
        
        UI.showFloat(float.id);
        
        // 事件处理
        float.querySelector('[data-action="edit"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
            ProfileModule.openRoleEditor(this.currentRoleId);
        });
        
        float.querySelector('[data-action="switchModel"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
            this.showModelSelector();
        });
        
        float.querySelector('[data-action="delete"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
            const role = Storage.getRoles().find(r => r.id === this.currentRoleId);
            if (role) {
                this.deleteContact(this.currentRoleId);
            }
        });
        
        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!float.contains(e.target)) {
                    UI.hideFloat(float.id);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    },
    
    // 显示模型选择器
    showModelSelector() {
        if (!this.currentRoleId) {
            Utils.showToast('请先选择一个联系人', 'error');
            return;
        }
        
        const role = Storage.getRoles().find(r => r.id === this.currentRoleId);
        if (!role) return;
        
        // 获取当前选择的模型
        const appliedModels = Storage.getAppliedApiModels();
        const currentModelKey = appliedModels[this.currentRoleId] || Storage.getSetting('selected_api_model', 'gpt-3.5');
        
        // 获取所有可用模型
        const allModels = ApiModule.getActiveModels();
        const modelKeys = Object.keys(allModels);
        
        if (modelKeys.length === 0) {
            Utils.showToast('没有可用模型，请先配置API', 'error');
            return;
        }
        
        const modal = UI.createModal({
            id: 'modelSelectorModal',
            title: '选择AI模型',
            content: `
                <div class="model-selector-section">
                    <div class="model-selector-description">
                        为联系人 <strong>${role.note || role.name}</strong> 选择AI模型
                    </div>
                    
                    <div class="model-selector-list" id="modelSelectorList">
                        ${modelKeys.map(key => {
                            const model = allModels[key];
                            const isCurrent = key === currentModelKey;
                            return `
                                <div class="model-selector-item ${isCurrent ? 'selected' : ''}" data-model="${key}">
                                    <div class="model-selector-checkbox">
                                        <i class="fas fa-check"></i>
                                    </div>
                                    <div class="model-selector-icon">
                                        <i class="fas fa-robot"></i>
                                    </div>
                                    <div class="model-selector-info">
                                        <div class="model-selector-name">
                                            ${model.name}
                                            ${isCurrent ? '<span class="current-model-badge">当前</span>' : ''}
                                        </div>
                                        <div class="model-selector-description">${model.description}</div>
                                        <div class="model-selector-provider">
                                            <span class="provider-tag ${model.type === 'builtin' ? 'builtin' : 'custom'}">
                                                ${model.type === 'builtin' ? '内置' : '自定义'}
                                            </span>
                                            <span class="provider-name">${Config.apiProviders[model.provider]?.name || model.provider}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="model-selector-hint">
                        <i class="fas fa-info-circle"></i>
                        切换模型不会影响现有聊天记录，但会影响未来的回复
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: '取消',
                    action: 'close',
                    class: 'btn-primary'
                },
                {
                    text: '应用',
                    action: 'apply',
                    class: 'btn-primary'
                }
            ]
        });
        
        UI.showModal('modelSelectorModal');
        
        // 设置事件监听
        this.setupModelSelectorEvents(modal, role.id);
    },
    
    // 设置模型选择器事件
    setupModelSelectorEvents(modal, roleId) {
        // 模型项点击
        modal.querySelectorAll('.model-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                // 移除所有选中状态
                modal.querySelectorAll('.model-selector-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // 添加当前选中状态
                item.classList.add('selected');
            });
        });
        
        // 应用按钮
        const applyBtn = modal.querySelector('[data-action="apply"]');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const selectedItem = modal.querySelector('.model-selector-item.selected');
                if (selectedItem) {
                    const modelKey = selectedItem.dataset.model;
                    this.applyModelToContact(roleId, modelKey);
                    UI.closeModal('modelSelectorModal');
                } else {
                    Utils.showToast('请先选择一个模型', 'error');
                }
            });
        }
    },
    
    // 应用模型到联系人
    applyModelToContact(roleId, modelKey) {
        const appliedModels = Storage.getAppliedApiModels();
        appliedModels[roleId] = modelKey;
        Storage.saveAppliedApiModels(appliedModels);
        
        // 获取模型信息
        const allModels = ApiModule.getAllModels();
        const model = allModels[modelKey];
        
        if (model) {
            Utils.showToast(`已将 ${model.name} 模型应用到联系人`, 'success');
            
            // 更新聊天列表显示
            this.loadChatList();
        }
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 添加联系人按钮
        const addBtn = document.getElementById('addRoleBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                ProfileModule.openRoleEditor();
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
    init() {
        if (this.isInitialized) return;
        
        console.log('📱 初始化动态模块...');
        
        // 加载动态列表
        this.loadMoments();
        
        // 设置事件监听
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ 动态模块初始化完成');
    },
    
    // 加载动态
    loadMoments() {
        const momentsList = document.getElementById('momentsList');
        if (!momentsList) return;
        
        const moments = Storage.getMoments();
        
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
        
        // 按时间倒序排序（最新的在前）
        moments.sort((a, b) => {
            const timeA = new Date(a.time || a.createdAt || 0);
            const timeB = new Date(b.time || b.createdAt || 0);
            return timeB - timeA;
        });
        
        // 添加每个动态
        moments.forEach(moment => {
            this.createMomentItem(moment);
        });
    },
    
    // 创建动态项
    createMomentItem(moment) {
        const momentsList = document.getElementById('momentsList');
        if (!momentsList) return null;
        
        // 获取点赞和评论
        const likes = Storage.getLikes();
        const comments = Storage.getComments();
        
        const momentLikes = likes[moment.id] || [];
        const momentComments = comments[moment.id] || [];
        const userInfo = Storage.getUserInfo();
        const isLiked = momentLikes.includes(userInfo.userId || 'currentUser');
        
        // 创建动态项
        const momentItem = document.createElement('div');
        momentItem.className = 'moment-item';
        momentItem.dataset.momentId = moment.id;
        
        momentItem.innerHTML = `
            <div class="moment-header">
                <div class="moment-avatar">
                    ${userInfo.avatar ? 
                        `<img src="${userInfo.avatar}" alt="${userInfo.name}">` : 
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #07c160; color: white; font-weight: 600;">${userInfo.name?.charAt(0) || '我'}</div>`}
                </div>
                <div class="moment-info">
                    <div class="moment-author">${moment.author || userInfo.name || '我'}</div>
                    <div class="moment-time">${moment.time || '刚刚'}</div>
                </div>
            </div>
            <div class="moment-content">${moment.content}</div>
            <div class="moment-actions">
                <div class="moment-action-left">
                    <button class="moment-action-btn like-btn ${isLiked ? 'liked' : ''}" data-moment-id="${moment.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${momentLikes.length}</span>
                    </button>
                    <button class="moment-action-btn comment-btn" data-moment-id="${moment.id}">
                        <i class="fas fa-comment"></i>
                        <span class="comment-count">${momentComments.length}</span>
                    </button>
                </div>
                <button class="moment-more-btn" data-moment-id="${moment.id}">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        `;
        
        momentsList.appendChild(momentItem);
        
        // 设置事件
        this.setupMomentItemEvents(momentItem, moment);
        
        return momentItem;
    },
    
    // 设置动态项事件
    setupMomentItemEvents(momentItem, moment) {
        // 点赞按钮
        const likeBtn = momentItem.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLike(moment.id);
        });
        
        // 评论按钮
        const commentBtn = momentItem.querySelector('.comment-btn');
        commentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openComments(moment.id);
        });
        
        // 更多按钮
        const moreBtn = momentItem.querySelector('.moment-more-btn');
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMomentActionsMenu(moreBtn, moment.id);
        });
    },
    
    // 点赞/取消点赞
    toggleLike(momentId) {
        let likes = Storage.getLikes();
        if (!likes[momentId]) {
            likes[momentId] = [];
        }
        
        const userInfo = Storage.getUserInfo();
        const userId = userInfo.userId || 'currentUser';
        const likeIndex = likes[momentId].indexOf(userId);
        
        if (likeIndex === -1) {
            // 点赞
            likes[momentId].push(userId);
            
            // 更新UI
            const likeBtn = document.querySelector(`.like-btn[data-moment-id="${momentId}"]`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
                const likeCount = likeBtn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                }
            }
            
            Utils.showToast('已点赞');
        } else {
            // 取消点赞
            likes[momentId].splice(likeIndex, 1);
            
            // 更新UI
            const likeBtn = document.querySelector(`.like-btn[data-moment-id="${momentId}"]`);
            if (likeBtn) {
                likeBtn.classList.remove('liked');
                const likeCount = likeBtn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = parseInt(likeCount.textContent) - 1;
                }
            }
            
            Utils.showToast('已取消点赞', 'info');
        }
        
        Storage.saveLikes(likes);
    },
    
    // 打开评论
    openComments(momentId) {
        this.currentMomentId = momentId;
        
        const comments = Storage.getComments();
        const momentComments = comments[momentId] || [];
        const userInfo = Storage.getUserInfo();
        
        // 创建评论弹窗
        const modal = UI.createModal({
            id: 'commentsModal',
            title: '评论',
            content: `
                <div class="comments-list" id="commentsList">
                    ${momentComments.length === 0 ? 
                        '<div style="text-align: center; color: #999; padding: 20px;">暂无评论</div>' :
                        momentComments.map(comment => `
                            <div class="comment-item" data-comment-id="${comment.id}">
                                <div class="comment-header">
                                    <div class="comment-author">${comment.author}</div>
                                    <div class="comment-time">${comment.time}</div>
                                </div>
                                <div class="comment-content">${comment.content}</div>
                                ${comment.author === userInfo.name ? `
                                    <div class="comment-actions">
                                        <span class="comment-action edit-comment">编辑</span>
                                        <span class="comment-action delete-comment">删除</span>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                </div>
                <div class="comment-input">
                    <input type="text" class="comment-input-field" id="commentInput" placeholder="请输入评论...">
                    <button class="comment-send-btn" id="sendCommentBtn">发送</button>
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
        
        UI.showModal('commentsModal');
        
        // 设置评论事件
        this.setupCommentsEvents();
        
        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('commentInput');
            if (input) input.focus();
        }, 100);
    },
    
    // 设置评论事件
    setupCommentsEvents() {
        // 发送评论
        const sendBtn = document.getElementById('sendCommentBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendComment());
        }
        
        // 回车发送
        const input = document.getElementById('commentInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendComment();
                }
            });
        }
        
        // 编辑评论
        document.querySelectorAll('.edit-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem?.dataset.commentId;
                if (commentId) {
                    this.editComment(commentId);
                }
            });
        });
        
        // 删除评论
        document.querySelectorAll('.delete-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem?.dataset.commentId;
                if (commentId) {
                    this.deleteComment(commentId);
                }
            });
        });
    },
    
    // 发送评论
    sendComment() {
        const input = document.getElementById('commentInput');
        if (!input || !this.currentMomentId) return;
        
        const comment = input.value.trim();
        if (!comment) {
            Utils.showToast('请输入评论内容', 'error');
            return;
        }
        
        const userInfo = Storage.getUserInfo();
        const comments = Storage.getComments();
        
        if (!comments[this.currentMomentId]) {
            comments[this.currentMomentId] = [];
        }
        
        const newComment = {
            id: Utils.generateId('comment'),
            author: userInfo.name || '用户',
            content: comment,
            time: new Date().toLocaleString()
        };
        
        comments[this.currentMomentId].push(newComment);
        Storage.saveComments(comments);
        
        // 清空输入框
        input.value = '';
        
        // 更新UI
        this.loadMoments();
        this.openComments(this.currentMomentId);
        
        Utils.showToast('评论成功');
    },
    
    // 编辑评论
    editComment(commentId) {
        const comments = Storage.getComments();
        const momentComments = comments[this.currentMomentId] || [];
        const commentIndex = momentComments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
            const comment = momentComments[commentIndex];
            const newContent = prompt('编辑评论内容：', comment.content);
            
            if (newContent !== null && newContent.trim() && newContent !== comment.content) {
                comment.content = newContent.trim();
                comment.time = new Date().toLocaleString();
                
                Storage.saveComments(comments);
                this.openComments(this.currentMomentId);
                Utils.showToast('评论已更新');
            }
        }
    },
    
    // 删除评论
    deleteComment(commentId) {
        if (!confirm('确定要删除这条评论吗？')) return;
        
        const comments = Storage.getComments();
        const momentComments = comments[this.currentMomentId] || [];
        
        comments[this.currentMomentId] = momentComments.filter(c => c.id !== commentId);
        Storage.saveComments(comments);
        
        this.openComments(this.currentMomentId);
        Utils.showToast('评论已删除');
    },
    
    // 显示动态操作菜单
    showMomentActionsMenu(button, momentId) {
        const float = UI.createFloat({
            items: [
                {
                    text: '编辑动态',
                    icon: 'fas fa-edit',
                    action: 'edit'
                },
                {
                    text: '删除动态',
                    icon: 'fas fa-trash-alt',
                    action: 'delete',
                    class: 'delete'
                }
            ]
        });
        
        const rect = button.getBoundingClientRect();
        float.style.left = (rect.left - 150) + 'px';
        float.style.top = (rect.top + 40) + 'px';
        
        UI.showFloat(float.id);
        
        // 事件处理
        float.querySelector('[data-action="edit"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
            this.editMoment(momentId);
        });
        
        float.querySelector('[data-action="delete"]').addEventListener('click', () => {
            UI.hideFloat(float.id);
            this.deleteMoment(momentId);
        });
        
        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!float.contains(e.target)) {
                    UI.hideFloat(float.id);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    },
    
    // 编辑动态
    editMoment(momentId) {
        const moments = Storage.getMoments();
        const momentIndex = moments.findIndex(m => m.id === momentId);
        
        if (momentIndex !== -1) {
            const moment = moments[momentIndex];
            const newContent = prompt('编辑动态内容：', moment.content);
            
            if (newContent !== null && newContent.trim() && newContent !== moment.content) {
                moment.content = newContent.trim();
                moment.time = new Date().toLocaleString();
                
                Storage.saveMoments(moments);
                this.loadMoments();
                Utils.showToast('动态已更新');
            }
        }
    },
    
    // 删除动态
    deleteMoment(momentId) {
        if (!confirm('确定要删除这条动态吗？\n\n同时会删除相关的点赞和评论。')) return;
        
        let moments = Storage.getMoments();
        moments = moments.filter(m => m.id !== momentId);
        Storage.saveMoments(moments);
        
        // 删除相关的点赞和评论
        const likes = Storage.getLikes();
        delete likes[momentId];
        Storage.saveLikes(likes);
        
        const comments = Storage.getComments();
        delete comments[momentId];
        Storage.saveComments(comments);
        
        // 重新加载
        this.loadMoments();
        Utils.showToast('动态已删除');
    },
    
    // 添加动态
    addMoment() {
        const content = prompt('请输入动态内容：');
        if (!content || !content.trim()) return;
        
        const userInfo = Storage.getUserInfo();
        const moments = Storage.getMoments();
        
        const newMoment = {
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
    setupEventListeners() {
        // 添加动态按钮
        const addBtn = document.getElementById('addMomentBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addMoment());
        }
        
        // 编辑封面
        const editCoverBtn = document.getElementById('editCoverBtn');
        if (editCoverBtn) {
            editCoverBtn.addEventListener('click', () => {
                Utils.uploadImage((imageData) => {
                    const userInfo = Storage.getUserInfo();
                    userInfo.coverBackground = `url('${imageData}') center/cover no-repeat`;
                    Storage.saveUserInfo(userInfo);
                    ProfileModule.loadUserInfo();
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
    init() {
        if (this.isInitialized) return;
        
        console.log('👤 初始化个人模块...');
        
        // 加载用户信息
        this.loadUserInfo();
        
        // 设置事件监听
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ 个人模块初始化完成');
    },
    
    // 加载用户信息
    loadUserInfo() {
        let userInfo = Storage.getUserInfo();
        
        // 如果用户信息不存在，创建默认
        if (!userInfo || Object.keys(userInfo).length === 0) {
            userInfo = {
                name: '用户',
                bio: '点击编辑个性签名',
                avatar: '',
                coverBackground: '',
                userId: '',
                profileSignature: '点击编辑个性签名',
                status: '点击设置状态',
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
            userInfo.tagColors = userInfo.tags.map(() => 
                Config.lightColors[Math.floor(Math.random() * Config.lightColors.length)]
            );
        }
        
        // 更新动态页面
        this.updateMomentsPage(userInfo);
        
        // 更新个人页面
        this.updateProfilePage(userInfo);
        
        // 保存更新后的信息
        Storage.saveUserInfo(userInfo);
    },
    
    // 更新动态页面
    updateMomentsPage(userInfo) {
        // 用户名
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = userInfo.name;
        
        // 个性签名
        const userBio = document.getElementById('userBio');
        if (userBio) userBio.textContent = userInfo.bio;
        
        // 标签
        const tagsContainer = document.getElementById('dynamicTagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            
            if (userInfo.tags && Array.isArray(userInfo.tags)) {
                userInfo.tags.forEach((tag, index) => {
                    if (tag) {
                        const tagElement = document.createElement('div');
                        tagElement.className = 'dynamic-tag';
                        
                        // 处理#号
                        let displayTag = tag;
                        const useHash = Storage.getSetting('use_hash_for_tags', true);
                        if (useHash && !tag.startsWith('#')) {
                            displayTag = `#${tag}`;
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
        
        // 封面背景
        const coverBackground = document.getElementById('coverBackground');
        if (coverBackground && userInfo.coverBackground) {
            coverBackground.style.background = userInfo.coverBackground;
        }
        
        // 头像
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && userInfo.avatar) {
            userAvatar.src = userInfo.avatar;
        }
    },
    
    // 更新个人页面
    updateProfilePage(userInfo) {
        // 用户名
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = userInfo.name;
        
        // 用户ID
        const profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.textContent = userInfo.userId ? `ID: ${userInfo.userId}` : 'ID: 点击设置';
        }
        
        // 个性签名
        const profileSignature = document.getElementById('profileSignature');
        if (profileSignature) profileSignature.textContent = userInfo.profileSignature;
        
        // 状态
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = userInfo.status;
        
        const statusElement = document.getElementById('profileStatus');
        if (statusElement) {
            statusElement.style.background = userInfo.statusColor;
        }
        
        // 标签
        const tagsContainer = document.getElementById('profileTagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            
            if (userInfo.tags && Array.isArray(userInfo.tags)) {
                userInfo.tags.forEach((tag, index) => {
                    if (tag) {
                        const tagElement = document.createElement('div');
                        tagElement.className = 'profile-tag';
                        
                        // 处理#号
                        let displayTag = tag;
                        const useHash = Storage.getSetting('use_hash_for_tags', true);
                        if (useHash && !tag.startsWith('#')) {
                            displayTag = `#${tag}`;
                        } else if (!useHash && tag.startsWith('#')) {
                            displayTag = tag.substring(1);
                        }
                        
                        tagElement.textContent = displayTag;
                        tagElement.style.background = userInfo.tagColors[index] || Config.lightColors[index % Config.lightColors.length];
                        tagElement.style.borderColor = '#d9d9d9';
                        tagElement.style.color = '#333';
                        
                        // 点击编辑标签
                        tagElement.addEventListener('click', () => {
                            this.editTag(tag, index);
                        });
                        
                        tagsContainer.appendChild(tagElement);
                    }
                });
                
                // 确保至少有3个标签
                while (userInfo.tags.length < 3) {
                    userInfo.tags.push(`标签${userInfo.tags.length + 1}`);
                    userInfo.tagColors.push(Config.lightColors[userInfo.tags.length % Config.lightColors.length]);
                }
            }
            
            // 添加#号开关
            const hashToggle = document.createElement('div');
            hashToggle.className = 'tag-hash-toggle';
            const useHash = Storage.getSetting('use_hash_for_tags', true);
            hashToggle.innerHTML = `
                <input type="checkbox" id="profileHashToggle" class="tag-hash-checkbox" ${useHash ? 'checked' : ''}>
                <label for="profileHashToggle">#号</label>
            `;
            
            tagsContainer.appendChild(hashToggle);
            
            // #号开关事件
            const toggle = hashToggle.querySelector('input');
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    Storage.saveSetting('use_hash_for_tags', e.target.checked);
                    this.loadUserInfo();
                    Utils.showToast(`已${e.target.checked ? '开启' : '关闭'}标签井号前缀`);
                });
            }
        }
        
        // 头像
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar && userInfo.avatar) {
            profileAvatar.src = userInfo.avatar;
        }
    },
    
    // 编辑标签
    editTag(tag, index) {
        const userInfo = Storage.getUserInfo();
        const currentTag = tag.startsWith('#') ? tag.substring(1) : tag;
        const useHash = Storage.getSetting('use_hash_for_tags', true);
        
        const newTag = prompt('编辑标签内容：', currentTag);
        if (newTag !== null && newTag.trim() && newTag !== currentTag) {
            let finalTag = newTag.trim();
            if (useHash && !finalTag.startsWith('#')) {
                finalTag = `#${finalTag}`;
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
    openRoleEditor(roleId = null) {
        const roles = Storage.getRoles();
        const role = roleId ? roles.find(r => r.id === roleId) : null;
        
        // 获取可用模型
        const allModels = ApiModule.getActiveModels();
        const modelKeys = Object.keys(allModels);
        const defaultModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
        
        // 获取当前模型
        const appliedModels = Storage.getAppliedApiModels();
        const currentModel = roleId ? appliedModels[roleId] || defaultModel : defaultModel;
        
        const modal = UI.createModal({
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
                <div class="form-group">
                    <label class="form-label" for="rolePersonality">人物设定</label>
                    <textarea class="form-textarea" id="rolePersonality" placeholder="描述联系人的性格、背景、身份等设定。如果不填写，联系人将作为空白机器人，只听指令" rows="4">${role ? (role.personality || '') : ''}</textarea>
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">可选填写。如果不填写，联系人将作为空白机器人，只听指令</div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="roleModel">AI模型</label>
                    <select class="form-input" id="roleModel">
                        ${modelKeys.map(key => {
                            const model = allModels[key];
                            const selected = key === currentModel ? 'selected' : '';
                            return `<option value="${key}" ${selected}>${model.name} (${model.type === 'builtin' ? '内置' : '自定义'})</option>`;
                        }).join('')}
                    </select>
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">选择联系人使用的AI模型</div>
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
    setupRoleEditorEvents(modal, roleId) {
        // 上传头像
        const uploadBtn = modal.querySelector('#uploadRoleAvatarBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                Utils.uploadImage((imageData) => {
                    const preview = modal.querySelector('#roleAvatarPreview');
                    if (preview) {
                        preview.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    }
                });
            });
        }
        
        // 保存按钮
        const saveBtn = modal.querySelector('[data-action="save"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveRole(modal, roleId);
            });
        }
    },
    
    // 保存联系人
    saveRole(modal, roleId) {
        const nameInput = modal.querySelector('#roleName');
        const noteInput = modal.querySelector('#roleNote');
        const personalityInput = modal.querySelector('#rolePersonality');
        const modelInput = modal.querySelector('#roleModel');
        
        if (!nameInput || !noteInput || !personalityInput || !modelInput) return;
        
        const name = nameInput.value.trim();
        const note = noteInput.value.trim();
        const personality = personalityInput.value.trim();
        const modelKey = modelInput.value;
        
        if (!name) {
            Utils.showToast('请输入联系人名称', 'error');
            return;
        }
        
        // 获取头像
        const avatarPreview = modal.querySelector('#roleAvatarPreview img');
        const avatar = avatarPreview ? avatarPreview.src : '';
        
        let roles = Storage.getRoles();
        
        if (roleId) {
            // 更新现有联系人
            const roleIndex = roles.findIndex(r => r.id === roleId);
            if (roleIndex !== -1) {
                roles[roleIndex] = {
                    ...roles[roleIndex],
                    name,
                    note: note || name,
                    personality,
                    avatar,
                    updatedAt: Date.now()
                };
            }
            
            // 更新模型
            const appliedModels = Storage.getAppliedApiModels();
            appliedModels[roleId] = modelKey;
            Storage.saveAppliedApiModels(appliedModels);
        } else {
            // 创建新联系人
            const newRole = {
                id: Utils.generateId('contact'),
                name,
                note: note || name,
                personality,
                avatar,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            roles.push(newRole);
            
            // 应用选择的模型
            const appliedModels = Storage.getAppliedApiModels();
            appliedModels[newRole.id] = modelKey;
            Storage.saveAppliedApiModels(appliedModels);
        }
        
        Storage.saveRoles(roles);
        UI.closeModal('roleEditorModal');
        
        // 更新聊天列表
        ChatModule.loadChatList();
        
        Utils.showToast(`联系人 ${roleId ? '已更新' : '已添加'}`);
    },
    
    // 打开设置
    openSettings() {
        const selectedModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
        const allModels = ApiModule.getActiveModels();
        const currentModel = allModels[selectedModel] || Config.apiModels['gpt-3.5'];
        
        const modal = UI.createModal({
            id: 'settingsModal',
            title: '设置',
            content: `
                <div class="settings-group">
                    <div class="settings-title">⚙️ API配置</div>
                    <div class="settings-description">
                        配置和管理自定义API模型
                    </div>
                    <div class="settings-action">
                        <button class="btn-primary" id="openApiConfigBtn" style="width: 100%;">
                            <i class="fas fa-cog"></i> 管理API配置
                        </button>
                    </div>
                </div>
                
                <div class="settings-group">
                    <div class="settings-title">🤖 默认AI模型设置</div>
                    <div style="margin-bottom: 15px; font-size: 14px; color: var(--text-light);">
                        选择联系人使用的默认AI模型，新建联系人将自动使用选中的模型
                    </div>
                    
                    <div class="api-model-select" id="apiModelSelect">
                        ${Object.keys(allModels).map(key => {
                            const model = allModels[key];
                            const isSelected = key === selectedModel;
                            return `
                                <div class="api-model-item ${isSelected ? 'selected' : ''}" data-model="${key}">
                                    <div class="api-model-name">${model.name}</div>
                                    <div class="api-model-description">${model.description}</div>
                                    <div class="api-model-provider">
                                        <span class="provider-tag ${model.type === 'builtin' ? 'builtin' : 'custom'}">
                                            ${model.type === 'builtin' ? '内置' : '自定义'}
                                        </span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <div class="settings-item">
                            <div class="settings-label">当前默认模型</div>
                            <div class="settings-value" id="currentModelDisplay">${currentModel.name}</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="settings-btn" id="applyToAllBtn">应用到所有联系人</button>
                        <button class="settings-btn" id="applyToSelectedBtn">应用到选中联系人</button>
                    </div>
                </div>
                
                <div class="settings-group">
                    <div class="settings-title">🎨 显示设置</div>
                    <div class="settings-item">
                        <div class="settings-label">暗色模式</div>
                        <select class="settings-select" id="darkModeSelect">
                            <option value="auto">自动</option>
                            <option value="light">浅色</option>
                            <option value="dark">深色</option>
                        </select>
                    </div>
                    <div class="settings-item">
                        <div class="settings-label">字体大小</div>
                        <select class="settings-select" id="fontSizeSelect">
                            <option value="small">小</option>
                            <option value="medium" selected>中</option>
                            <option value="large">大</option>
                        </select>
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
    setupSettingsEvents(modal) {
        // 打开API配置按钮
        const openApiConfigBtn = modal.querySelector('#openApiConfigBtn');
        if (openApiConfigBtn) {
            openApiConfigBtn.addEventListener('click', () => {
                UI.closeModal('settingsModal');
                setTimeout(() => {
                    ApiModule.openApiConfig();
                }, 300);
            });
        }
        
        // AI模型选择
        modal.querySelectorAll('.api-model-item').forEach(item => {
            item.addEventListener('click', () => {
                // 移除所有选中状态
                modal.querySelectorAll('.api-model-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // 添加当前选中状态
                item.classList.add('selected');
                
                // 更新选中的模型
                const model = item.dataset.model;
                Storage.saveSetting('selected_api_model', model);
                
                // 更新显示
                const display = modal.querySelector('#currentModelDisplay');
                const allModels = ApiModule.getActiveModels();
                const modelInfo = allModels[model];
                if (display && modelInfo) {
                    display.textContent = modelInfo.name;
                }
                
                Utils.showToast(`已设置 ${modelInfo?.name || model} 为默认模型`);
            });
        });
        
        // 应用到所有联系人
        const applyToAllBtn = modal.querySelector('#applyToAllBtn');
        if (applyToAllBtn) {
            applyToAllBtn.addEventListener('click', () => {
                const selectedModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
                const allModels = ApiModule.getActiveModels();
                const modelInfo = allModels[selectedModel];
                
                if (modelInfo && confirm(`确定要将 ${modelInfo.name} 模型应用到所有联系人吗？`)) {
                    const roles = Storage.getRoles();
                    const appliedModels = {};
                    
                    roles.forEach(role => {
                        appliedModels[role.id] = selectedModel;
                    });
                    
                    Storage.saveAppliedApiModels(appliedModels);
                    ChatModule.loadChatList();
                    Utils.showToast(`已将 ${modelInfo.name} 模型应用到所有联系人`);
                }
            });
        }
        
        // 应用到选中联系人
        const applyToSelectedBtn = modal.querySelector('#applyToSelectedBtn');
        if (applyToSelectedBtn) {
            applyToSelectedBtn.addEventListener('click', () => {
                const selectedModel = Storage.getSetting('selected_api_model', 'gpt-3.5');
                const allModels = ApiModule.getActiveModels();
                const modelInfo = allModels[selectedModel];
                
                if (ChatModule.currentRoleId) {
                    const appliedModels = Storage.getAppliedApiModels();
                    appliedModels[ChatModule.currentRoleId] = selectedModel;
                    Storage.saveAppliedApiModels(appliedModels);
                    ChatModule.loadChatList();
                    Utils.showToast(`已将 ${modelInfo?.name || selectedModel} 模型应用到当前联系人`);
                } else {
                    Utils.showToast('请先打开一个联系人聊天', 'error');
                }
            });
        }
        
        // 暗色模式选择
        const darkModeSelect = modal.querySelector('#darkModeSelect');
        if (darkModeSelect) {
            darkModeSelect.addEventListener('change', (e) => {
                Storage.saveSetting('dark_mode', e.target.value);
                Utils.showToast('显示设置已保存，刷新后生效');
            });
        }
        
        // 字体大小选择
        const fontSizeSelect = modal.querySelector('#fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                Storage.saveSetting('font_size', e.target.value);
                Utils.showToast('字体设置已保存，刷新后生效');
            });
        }
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 我的联系人按钮
        const myRolesBtn = document.getElementById('myRolesBtn');
        if (myRolesBtn) {
            myRolesBtn.addEventListener('click', () => {
                this.openRoleManager();
            });
        }
        
        // 设置按钮
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        // 备份按钮
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                BackupModule.openBackupManager();
            });
        }
        
        // 头像编辑
        const editAvatarBtn = document.getElementById('editAvatarBtn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                this.editAvatar('userAvatar');
            });
        }
        
        const editProfileAvatarBtn = document.getElementById('editProfileAvatarBtn');
        if (editProfileAvatarBtn) {
            editProfileAvatarBtn.addEventListener('click', () => {
                this.editAvatar('profileAvatar');
            });
        }
        
        // 用户名编辑
        const userName = document.getElementById('userName');
        if (userName) {
            userName.addEventListener('click', () => {
                this.editField('name', '用户名');
            });
        }
        
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.addEventListener('click', () => {
                this.editField('name', '用户名');
            });
        }
        
        // 个性签名编辑
        const userBio = document.getElementById('userBio');
        if (userBio) {
            userBio.addEventListener('click', () => {
                this.editField('bio', '个性签名');
            });
        }
        
        const profileSignature = document.getElementById('profileSignature');
        if (profileSignature) {
            profileSignature.addEventListener('click', () => {
                this.editField('profileSignature', '个性签名');
            });
        }
        
        // 用户ID编辑
        const profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.addEventListener('click', () => {
                this.editField('userId', '用户ID');
            });
        }
        
        // 状态编辑
        const profileStatus = document.getElementById('profileStatus');
        if (profileStatus) {
            profileStatus.addEventListener('click', () => {
                this.editField('status', '状态');
            });
        }
    },
    
    // 编辑头像
    editAvatar(avatarId) {
        Utils.uploadImage((imageData) => {
            const userInfo = Storage.getUserInfo();
            userInfo.avatar = imageData;
            Storage.saveUserInfo(userInfo);
            this.loadUserInfo();
            Utils.showToast('头像已更新');
        });
    },
    
    // 编辑字段
    editField(field, label) {
        const userInfo = Storage.getUserInfo();
        const currentValue = userInfo[field] || '';
        const newValue = prompt(`请输入${label}：`, currentValue);
        
        if (newValue !== null) {
            userInfo[field] = newValue.trim();
            Storage.saveUserInfo(userInfo);
            this.loadUserInfo();
            Utils.showToast(`${label}已更新`);
        }
    },
    
    // 打开联系人管理器
    openRoleManager() {
        const roles = Storage.getRoles();
        const pinned = Storage.getPinnedContacts();
        
        let content = '';
        
        if (roles.length === 0) {
            content = '<div style="text-align: center; color: #999; padding: 30px;">还没有创建联系人</div>';
        } else {
            // 先显示置顶联系人
            const pinnedRoles = roles.filter(role => pinned.includes(role.id));
            const normalRoles = roles.filter(role => !pinned.includes(role.id));
            
            content = '<div id="roleManagerList">';
            
            // 置顶联系人
            if (pinnedRoles.length > 0) {
                content += '<div style="font-size: 12px; color: #999; margin-bottom: 10px;">置顶联系人</div>';
                pinnedRoles.forEach(role => {
                    content += this.createRoleManagerItem(role, true);
                });
            }
            
            // 普通联系人
            if (normalRoles.length > 0) {
                if (pinnedRoles.length > 0) {
                    content += '<div style="font-size: 12px; color: #999; margin: 20px 0 10px;">所有联系人</div>';
                }
                normalRoles.forEach(role => {
                    content += this.createRoleManagerItem(role, false);
                });
            }
            
            content += '</div>';
        }
        
        const modal = UI.createModal({
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
        const addBtn = modal.querySelector('[data-action="add"]');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                UI.closeModal('roleManagerModal');
                setTimeout(() => {
                    this.openRoleEditor();
                }, 300);
            });
        }
        
        // 设置联系人项点击事件
        modal.querySelectorAll('.role-item').forEach(item => {
            item.addEventListener('click', () => {
                const roleId = item.dataset.roleId;
                UI.closeModal('roleManagerModal');
                setTimeout(() => {
                    ChatModule.openChatDialog(roleId);
                }, 300);
            });
        });
    },
    
    // 创建联系人管理器项
    createRoleManagerItem(role, isPinned) {
        // 获取模型信息
        const appliedModels = Storage.getAppliedApiModels();
        const modelKey = appliedModels[role.id] || Storage.getSetting('selected_api_model', 'gpt-3.5');
        const allModels = ApiModule.getAllModels();
        const model = allModels[modelKey];
        
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
                        ${model ? `
                            <div class="role-model-tag">
                                <span class="model-tag ${model.type === 'builtin' ? 'builtin' : 'custom'}">
                                    <i class="fas fa-robot"></i> ${model.name}
                                </span>
                            </div>
                        ` : ''}
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
    init() {
        if (this.isInitialized) return;
        
        console.log('🚀 quq小手机启动中...');
        console.log(`版本: ${Config.version}`);
        console.log(`调试模式: ${Config.debugMode ? '开启' : '关闭'}`);
        
        // 1. 初始化核心功能
        this.initCore();
        
        // 2. 初始化各个模块
        ProfileModule.init();
        ChatModule.init();
        MomentsModule.init();
        BackupModule.init();
        ApiModule.init(); // 初始化API模块
        
        // 3. 设置全局事件
        this.setupGlobalEvents();
        
        // 4. 启动定时任务
        this.startTimers();
        
        // 5. 隐藏加载屏
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                console.log('✅ 应用启动完成');
            }, 500);
        }, 1000);
        
        this.isInitialized = true;
    },
    
    // 初始化核心功能
    initCore() {
        // 更新时间
        this.updateTime();
        
        // 设置电量监控
        this.setupBatteryMonitor();
        
        // 设置触摸优化
        this.setupTouchOptimization();
        
        // 检查更新
        this.checkForUpdates();
    },
    
    // 更新时间
    updateTime() {
        UI.updateStatusBarTime();
    },
    
    // 设置电量监控
    setupBatteryMonitor() {
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                this.updateBatteryDisplay(battery);
                
                battery.addEventListener('levelchange', () => {
                    this.updateBatteryDisplay(battery);
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.updateBatteryDisplay(battery);
                });
            }).catch(() => {
                // 如果获取失败，使用模拟电量
                this.setSimulatedBattery();
            });
        } else {
            this.setSimulatedBattery();
        }
    },
    
    // 更新电池显示
    updateBatteryDisplay(battery) {
        const levelElement = document.getElementById('batteryLevel');
        const percentageElement = document.getElementById('batteryPercentage');
        
        if (!levelElement || !percentageElement) return;
        
        const level = Math.floor(battery.level * 100);
        levelElement.style.width = `${level}%`;
        percentageElement.textContent = `${level}%`;
        
        // 根据电量改变颜色
        let color;
        if (battery.charging) {
            color = '#1890ff'; // 充电中
        } else if (level <= 15) {
            color = '#f5222d'; // 电量低
        } else if (level <= 30) {
            color = '#fa8c16'; // 电量中等
        } else if (level <= 60) {
            color = '#faad14'; // 电量良好
        } else {
            color = '#52c41a'; // 电量充足
        }
        
        levelElement.style.background = color;
        
        // 更新边框颜色
        const batteryIcon = document.querySelector('.battery-icon');
        const batteryTip = document.querySelector('.battery-tip');
        if (batteryIcon) batteryIcon.style.borderColor = color;
        if (batteryTip) batteryTip.style.background = color;
    },
    
    // 设置模拟电量
    setSimulatedBattery() {
        const levelElement = document.getElementById('batteryLevel');
        const percentageElement = document.getElementById('batteryPercentage');
        
        if (levelElement && percentageElement) {
            const level = 85; // 模拟85%电量
            levelElement.style.width = `${level}%`;
            percentageElement.textContent = `${level}%`;
            levelElement.style.background = '#52c41a';
        }
    },
    
    // 设置触摸优化
    setupTouchOptimization() {
        // 禁用双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止长按选择文本
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        
        // 优化滚动
        document.addEventListener('touchmove', (e) => {
            // 可以在这里添加滚动优化
        }, { passive: true });
    },
    
    // 检查更新
    checkForUpdates() {
        // 这里可以添加检查更新的逻辑
        const lastVersion = Storage.getSetting('last_version', '0.0.0');
        
        if (lastVersion !== Config.version) {
            console.log(`🔄 检测到新版本: ${lastVersion} -> ${Config.version}`);
            Storage.saveSetting('last_version', Config.version);
            
            // 可以在这里显示更新提示
            if (Config.debugMode) {
                setTimeout(() => {
                    Utils.showToast(`已更新到版本 ${Config.version}`, 'info', 3000);
                }, 2000);
            }
        }
    },
    
    // 设置全局事件
    setupGlobalEvents() {
        // 标签切换
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // 全局点击事件（关闭浮窗等）
        document.addEventListener('click', (e) => {
            // 如果点击的不是浮窗触发元素，关闭所有浮窗
            if (!e.target.closest('[data-float-trigger]')) {
                document.querySelectorAll('.action-float.show').forEach(float => {
                    float.classList.remove('show');
                });
            }
            
            // 如果点击的是模态框背景，关闭模态框
            if (e.target.classList.contains('modal')) {
                UI.closeModal(e.target.id);
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            // ESC键关闭所有弹窗
            if (e.key === 'Escape') {
                UI.closeAllModals();
                document.querySelectorAll('.action-float.show').forEach(float => {
                    float.classList.remove('show');
                });
            }
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面重新可见时更新时间
                this.updateTime();
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            // 可以在这里添加响应式调整
            console.log('🔄 窗口大小变化:', window.innerWidth, 'x', window.innerHeight);
        }, 300));
    },
    
    // 切换标签页
    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        this.currentTab = tabName;
        UI.switchTab(tabName);
        
        // 标签切换时的额外处理
        switch (tabName) {
            case 'chat':
                // 刷新联系人列表
                ChatModule.loadChatList();
                break;
            case 'moments':
                // 刷新动态列表
                MomentsModule.loadMoments();
                break;
            case 'profile':
                // 刷新个人信息
                ProfileModule.loadUserInfo();
                break;
        }
        
        console.log(`🔀 切换到 ${tabName} 标签`);
    },
    
    // 启动定时任务
    startTimers() {
        // 每分钟更新时间
        setInterval(() => this.updateTime(), 60000);
        
        // 每5分钟自动保存（如果需要）
        setInterval(() => {
            if (Config.debugMode) {
                console.log('💾 定时检查数据存储...');
            }
        }, 300000);
        
        // 内存监控（开发模式）
        if (Config.debugMode) {
            setInterval(() => {
                if (performance.memory) {
                    const usedMB = performance.memory.usedJSHeapSize / 1048576;
                    if (usedMB > 100) {
                        console.warn(`⚠️ 高内存使用: ${usedMB.toFixed(1)}MB`);
                    }
                }
            }, 30000);
        }
    },
    
    // 获取应用状态
    getStatus() {
        return {
            version: Config.version,
            currentTab: this.currentTab,
            modules: {
                chat: ChatModule.isInitialized,
                moments: MomentsModule.isInitialized,
                profile: ProfileModule.isInitialized,
                backup: BackupModule.isInitialized,
                api: ApiModule.isInitialized
            },
            storage: Storage.getStats(),
            device: Utils.getDeviceInfo()
        };
    },
    
    // 重启应用
    restart() {
        console.log('🔄 重启应用...');
        location.reload();
    }
};

// ========== 启动应用 ==========
// 当DOM加载完成时启动
document.addEventListener('DOMContentLoaded', () => {
    // 显示启动日志
    console.log('='.repeat(50));
    console.log('🚀 quq小手机 - 正在启动...');
    console.log('='.repeat(50));
    
    // 启动应用
    App.init();
    
    // 暴露模块到全局（方便调试）
    if (Config.debugMode) {
        window.App = App;
        window.ChatModule = ChatModule;
        window.MomentsModule = MomentsModule;
        window.ProfileModule = ProfileModule;
        window.BackupModule = BackupModule;
        window.ApiModule = ApiModule;
        window.Storage = Storage;
        window.Utils = Utils;
        window.UI = UI;
        window.Config = Config;
        
        console.log('🔧 调试模式已启用，模块已暴露到全局');
        console.log('💡 在控制台中使用 App.getStatus() 查看应用状态');
        console.log('💾 使用 BackupModule.openBackupManager() 打开备份管理');
        console.log('🔌 使用 ApiModule.openApiConfig() 打开API配置');
    }
});

// ========== Service Worker 注册（可选） ==========
if ('serviceWorker' in navigator && Config.debugMode) {
    navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('✅ Service Worker 注册成功');
    }).catch(error => {
        console.log('❌ Service Worker 注册失败:', error);
    });
}