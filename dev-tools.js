// ========== 开发工具模块 ==========
const DevTools = {
    // 显示/隐藏开发面板
    togglePanel() {
        const panel = document.getElementById('devToolsPanel');
        panel.classList.toggle('show');
    },
    
    // 快速清空所有数据（开发用）
    clearAllData() {
        if (confirm('🚨 确定要清空所有数据吗？\n\n这将删除：\n✅ 所有联系人\n✅ 所有聊天记录\n✅ 所有动态和评论\n✅ 用户信息\n\n此操作不可撤销！')) {
            console.log('🗑️ 正在清空所有数据...');
            
            // 清空localStorage
            localStorage.clear();
            
            // 显示清除成功消息
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                font-size: 16px;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            `;
            toast.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">🗑️</div>
                <div>所有数据已清除！</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">3秒后刷新页面</div>
            `;
            document.body.appendChild(toast);
            
            // 3秒后刷新
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    },
    
    // 生成测试数据
    generateTestData() {
        console.log('🧪 正在生成测试数据...');
        
        // 生成测试用户信息
        const testUserInfo = {
            name: '测试用户',
            bio: '这是一个测试账号',
            avatar: '',
            coverBackground: '',
            userId: 'test_001',
            profileSignature: '测试个性签名',
            status: '在线',
            tags: ['测试标签1', '测试标签2', '#测试标签3'],
            statusColor: '#e3f2fd',
            tagColors: ['#f3e5f5', '#e8f5e8', '#fff3e0']
        };
        localStorage.setItem('user_info', JSON.stringify(testUserInfo));
        
        // 生成测试联系人
        const testContacts = [
            {
                id: 'contact_1',
                name: 'AI助手',
                note: '智能助手',
                personality: '一个友善、乐于助人的AI助手，可以回答各种问题',
                languageStyle: '专业且友好',
                offlineStyle: '快速响应',
                avatar: '',
                createdAt: Date.now()
            },
            {
                id: 'contact_2',
                name: '技术顾问',
                note: '编程导师',
                personality: '专业的编程导师，擅长JavaScript、Python等编程语言',
                languageStyle: '严谨专业',
                offlineStyle: '详细解答',
                avatar: '',
                createdAt: Date.now()
            },
            {
                id: 'contact_3',
                name: '创意伙伴',
                note: '灵感来源',
                personality: '充满创意的伙伴，擅长头脑风暴和创意写作',
                languageStyle: '生动有趣',
                offlineStyle: '创意无限',
                avatar: '',
                createdAt: Date.now()
            }
        ];
        localStorage.setItem('contacts', JSON.stringify(testContacts));
        
        // 生成测试聊天记录
        const testChatHistories = {
            'contact_1': [
                {
                    id: 'msg_1',
                    role: 'assistant',
                    content: '你好！我是AI助手，很高兴为你服务。有什么我可以帮助你的吗？',
                    time: Date.now() - 3600000
                },
                {
                    id: 'msg_2',
                    role: 'user',
                    content: '我想了解这个应用的功能',
                    time: Date.now() - 3500000
                },
                {
                    id: 'msg_3',
                    role: 'assistant',
                    content: '这是一个仿微信风格的AI联系人应用，你可以创建多个AI联系人，与它们聊天，发布动态，管理个人资料。',
                    time: Date.now() - 3400000
                }
            ],
            'contact_2': [
                {
                    id: 'msg_4',
                    role: 'assistant',
                    content: '你好，我是编程导师。有什么编程问题需要帮助吗？',
                    time: Date.now() - 7200000
                }
            ]
        };
        localStorage.setItem('chat_histories', JSON.stringify(testChatHistories));
        
        // 生成测试动态
        const testMoments = [
            {
                id: 'moment_1',
                content: '今天体验了新的AI联系人功能，感觉很有趣！',
                time: new Date(Date.now() - 86400000).toLocaleString(),
                author: '测试用户'
            },
            {
                id: 'moment_2',
                content: '刚刚创建了一个编程导师联系人，准备学习一些新技术。',
                time: new Date(Date.now() - 43200000).toLocaleString(),
                author: '测试用户'
            }
        ];
        localStorage.setItem('moments', JSON.stringify(testMoments));
        
        // 生成测试点赞和评论
        localStorage.setItem('likes', JSON.stringify({
            'moment_1': ['user1', 'user2', 'user3'],
            'moment_2': ['user1']
        }));
        
        localStorage.setItem('comments', JSON.stringify({
            'moment_1': [
                {
                    id: 'comment_1',
                    author: '朋友A',
                    content: '看起来很有意思！',
                    time: new Date(Date.now() - 80000000).toLocaleString()
                },
                {
                    id: 'comment_2',
                    author: '朋友B',
                    content: '我也试试看',
                    time: new Date(Date.now() - 78000000).toLocaleString()
                }
            ]
        }));
        
        // 设置API模型
        localStorage.setItem('selected_api_model', 'gpt-3.5');
        
        // 设置标签井号
        localStorage.setItem('use_hash_for_tags', true);
        
        // 设置置顶联系人
        localStorage.setItem('pinned_contacts', JSON.stringify(['contact_1']));
        
        // 设置API测试配置
        localStorage.setItem('custom_api_configs', JSON.stringify({
            openai: {
                enabled: true,
                apiKey: '',
                endpoint: 'https://api.openai.com/v1/chat/completions'
            },
            anthropic: {
                enabled: false,
                apiKey: '',
                endpoint: 'https://api.anthropic.com/v1/messages'
            },
            google: {
                enabled: false,
                apiKey: '',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
            }
        }));
        
        // 显示成功消息
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(7, 193, 96, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 16px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 10px 30px rgba(7, 193, 96, 0.3);
        `;
        toast.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">🧪</div>
            <div>测试数据生成成功！</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">3秒后刷新页面</div>
        `;
        document.body.appendChild(toast);
        
        console.log('✅ 测试数据生成完成');
        
        // 3秒后刷新
        setTimeout(() => {
            location.reload();
        }, 3000);
    },
    
    // 导出所有数据（备份）
    exportAllData() {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                allData[key] = localStorage.getItem(key);
            }
        }
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `quq-phone-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('💾 数据备份已导出');
        alert('数据备份已导出为JSON文件');
    },
    
    // 导入数据（恢复）
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (confirm(`确定要导入数据吗？\n\n这将覆盖当前的：\n✅ ${Object.keys(data).length} 个数据项`)) {
                        // 清空当前数据
                        localStorage.clear();
                        
                        // 导入新数据
                        Object.keys(data).forEach(key => {
                            if (typeof data[key] === 'object') {
                                localStorage.setItem(key, JSON.stringify(data[key]));
                            } else {
                                localStorage.setItem(key, data[key]);
                            }
                        });
                        
                        alert('数据导入成功！页面将刷新...');
                        location.reload();
                    }
                } catch (error) {
                    alert('文件格式错误：' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    // API测试功能
    testAPIConnection() {
        console.log('🔌 测试API连接...');
        
        const apiKey = prompt('请输入OpenAI API密钥：');
        if (!apiKey) {
            console.log('❌ 未输入API密钥');
            return;
        }
        
        const config = {
            provider: 'openai',
            apiKey: apiKey,
            endpoint: 'https://api.openai.com/v1/chat/completions'
        };
        
        const loader = UI.createLoader('测试API连接中...');
        
        // 测试API连接
        ApiModule.testApiConnection(config).then(result => {
            UI.removeLoader(loader);
            
            if (result.success) {
                alert('✅ API连接测试成功！\n\n可以获取模型列表了。');
                console.log('✅ API连接测试成功:', result.data);
                
                // 保存配置
                ApiModule.saveApiConfig({
                    openai: {
                        enabled: true,
                        apiKey: apiKey,
                        endpoint: config.endpoint
                    }
                });
                
                // 询问是否获取模型列表
                if (confirm('API连接成功！是否现在获取模型列表？')) {
                    this.fetchModels();
                }
            } else {
                alert(`❌ API连接测试失败：\n${result.message}`);
                console.error('❌ API连接测试失败:', result.error);
            }
        }).catch(error => {
            UI.removeLoader(loader);
            alert(`❌ API连接测试失败：\n${error.message}`);
            console.error('❌ API连接测试失败:', error);
        });
    },
    
    // 获取模型列表
    fetchModels() {
        console.log('📋 获取模型列表...');
        
        const configs = Storage.getCustomApiConfigs();
        const openaiConfig = configs.openai;
        
        if (!openaiConfig || !openaiConfig.apiKey) {
            alert('请先配置OpenAI API密钥');
            return;
        }
        
        const config = {
            provider: 'openai',
            apiKey: openaiConfig.apiKey,
            endpoint: openaiConfig.endpoint
        };
        
        const loader = UI.createLoader('获取模型列表中...');
        
        ApiModule.fetchAvailableModels(config).then(result => {
            UI.removeLoader(loader);
            
            if (result.success) {
                alert(`✅ 获取模型列表成功！\n\n共获取到 ${result.count} 个模型。\n\n现在可以在API配置界面中看到这些模型了。`);
                console.log('✅ 获取模型列表成功:', result.models);
                
                // 打开API配置界面显示模型
                setTimeout(() => {
                    ApiModule.openApiConfig();
                }, 500);
            } else {
                alert(`❌ 获取模型列表失败：\n${result.message}`);
                console.error('❌ 获取模型列表失败:', result.error);
            }
        }).catch(error => {
            UI.removeLoader(loader);
            alert(`❌ 获取模型列表失败：\n${error.message}`);
            console.error('❌ 获取模型列表失败:', error);
        });
    },
    
    // 快速API聊天测试
    quickAPIChatTest() {
        console.log('💬 快速API聊天测试...');
        
        const configs = Storage.getCustomApiConfigs();
        const openaiConfig = configs.openai;
        
        if (!openaiConfig || !openaiConfig.apiKey) {
            alert('请先配置OpenAI API密钥');
            return;
        }
        
        const message = prompt('请输入测试消息：', '你好，请介绍一下你自己');
        if (!message) return;
        
        const config = {
            provider: 'openai',
            apiKey: openaiConfig.apiKey,
            endpoint: openaiConfig.endpoint
        };
        
        const messages = [
            {
                role: 'system',
                content: '你是一个有帮助的AI助手。'
            },
            {
                role: 'user',
                content: message
            }
        ];
        
        const loader = UI.createLoader('发送聊天消息中...');
        
        ApiModule.sendChatMessage(config, messages).then(result => {
            UI.removeLoader(loader);
            
            if (result.success) {
                alert(`✅ API聊天测试成功！\n\nAI回复：\n${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}`);
                console.log('✅ API聊天测试成功:', result.content.substring(0, 200));
            } else {
                alert(`❌ API聊天测试失败：\n${result.error}`);
                console.error('❌ API聊天测试失败:', result.error);
            }
        }).catch(error => {
            UI.removeLoader(loader);
            alert(`❌ API聊天测试失败：\n${error.message}`);
            console.error('❌ API聊天测试失败:', error);
        });
    },
    
    // 性能监控
    startPerformanceMonitor() {
        console.log('🎯 性能监控启动');
        
        // 监控FPS
        let frameCount = 0;
        let lastTime = Date.now();
        let fps = 60;
        
        function checkFPS() {
            frameCount++;
            const currentTime = Date.now();
            if (currentTime - lastTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                if (fps < 30) {
                    console.warn(`⚠️ 低FPS警告: ${fps}`);
                }
            }
            requestAnimationFrame(checkFPS);
        }
        checkFPS();
        
        // 监控内存（如果浏览器支持）
        if (performance.memory) {
            setInterval(() => {
                const usedMB = performance.memory.usedJSHeapSize / 1048576;
                const totalMB = performance.memory.totalJSHeapSize / 1048576;
                console.log(`💾 内存使用: ${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB`);
                
                if (usedMB > 100) {
                    console.warn('⚠️ 高内存使用警告');
                }
            }, 10000);
        }
        
        // 监控网络状态
        window.addEventListener('online', () => {
            console.log('🌐 网络状态: 在线');
        });
        
        window.addEventListener('offline', () => {
            console.warn('🌐 网络状态: 离线');
        });
        
        console.log('✅ 性能监控已启动');
    },
    
    // 快速跳转到代码区域
    showCodeStructure() {
        console.log('📁 应用代码结构:');
        console.log('=======================');
        console.log('1. Config - 配置和常量');
        console.log('2. Utils - 工具函数');
        console.log('3. Storage - 数据存储');
        console.log('4. UI - 界面组件');
        console.log('5. ApiModule - API模块');
        console.log('6. ChatModule - 聊天功能');
        console.log('7. MomentsModule - 动态功能');
        console.log('8. ProfileModule - 个人功能');
        console.log('9. BackupModule - 备份功能');
        console.log('10. App - 主控制器');
        console.log('=======================');
        console.log('💡 提示：在编辑器中搜索这些模块名快速定位');
    },
    
    // 查看当前数据统计
    showDataStats() {
        const stats = {
            '联系人数量': JSON.parse(localStorage.getItem('contacts') || '[]').length,
            '动态数量': JSON.parse(localStorage.getItem('moments') || '[]').length,
            '聊天记录总数': Object.values(JSON.parse(localStorage.getItem('chat_histories') || '{}'))
                .reduce((total, history) => total + history.length, 0),
            '用户信息': localStorage.getItem('user_info') ? '已设置' : '未设置',
            'API配置': localStorage.getItem('custom_api_configs') ? '已配置' : '未配置',
            '可用模型': Object.values(JSON.parse(localStorage.getItem('available_models') || '{}'))
                .reduce((total, models) => total + models.length, 0),
            '存储占用': `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`
        };
        
        console.log('📊 数据统计:');
        console.log('=======================');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        console.log('=======================');
    },
    
    // 快速测试功能
    quickTest() {
        console.log('🔧 运行快速测试...');
        
        // 测试1: 检查核心模块
        const modules = ['Config', 'Utils', 'Storage', 'ApiModule', 'ChatModule', 'MomentsModule', 'ProfileModule', 'BackupModule', 'App'];
        modules.forEach(module => {
            if (window[module]) {
                console.log(`✅ ${module} 模块加载正常`);
            } else {
                console.error(`❌ ${module} 模块未找到`);
            }
        });
        
        // 测试2: 检查DOM元素
        const requiredElements = ['app', 'chatPage', 'momentsPage', 'profilePage'];
        requiredElements.forEach(id => {
            if (document.getElementById(id)) {
                console.log(`✅ #${id} 元素存在`);
            } else {
                console.error(`❌ #${id} 元素缺失`);
            }
        });
        
        // 测试3: 检查样式
        if (document.querySelector('link[href="style.css"]')) {
            console.log('✅ style.css 已加载');
        } else {
            console.error('❌ style.css 未加载');
        }
        
        // 测试4: 检查API模块功能
        if (window.ApiModule && typeof ApiModule.testApiConnection === 'function') {
            console.log('✅ API模块功能正常');
        } else {
            console.error('❌ API模块功能异常');
        }
        
        console.log('✅ 快速测试完成');
    }
};

// 暴露到全局（开发时使用）
window.DevTools = DevTools;

// 自动启动开发工具（在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 开发工具已加载');
    console.log('可用命令:');
    console.log('  DevTools.clearAllData() - 清空所有数据');
    console.log('  DevTools.generateTestData() - 生成测试数据');
    console.log('  DevTools.exportAllData() - 导出数据备份');
    console.log('  DevTools.importData() - 导入数据');
    console.log('  DevTools.testAPIConnection() - 测试API连接');
    console.log('  DevTools.fetchModels() - 获取模型列表');
    console.log('  DevTools.quickAPIChatTest() - 快速API聊天测试');
    console.log('  DevTools.showCodeStructure() - 显示代码结构');
    console.log('  DevTools.showDataStats() - 显示数据统计');
    console.log('  DevTools.quickTest() - 快速测试');
    
    // 添加API测试按钮到开发工具面板
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const devToolsPanel = document.getElementById('devToolsPanel');
            if (devToolsPanel) {
                const apiTestBtn = document.createElement('button');
                apiTestBtn.className = 'dev-tools-btn';
                apiTestBtn.textContent = 'API测试';
                apiTestBtn.onclick = () => DevTools.testAPIConnection();
                devToolsPanel.insertBefore(apiTestBtn, devToolsPanel.firstChild);
                
                // 自动显示开发面板（开发环境）
                devToolsPanel.classList.add('show');
            }
        }, 1000);
    });
}