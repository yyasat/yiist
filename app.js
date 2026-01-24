// 全局数据
let currentTab = 'chat';
let roles = JSON.parse(localStorage.getItem('contacts')) || [];
let moments = JSON.parse(localStorage.getItem('moments')) || [];
let userInfo = JSON.parse(localStorage.getItem('user_info')) || {};
let chatHistories = JSON.parse(localStorage.getItem('chat_histories')) || {};
let currentRoleId = null;
let editingRoleId = null;
let batteryMonitor = null;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let currentMomentId = null;
let comments = JSON.parse(localStorage.getItem('comments')) || {};
let likes = JSON.parse(localStorage.getItem('likes')) || {};
let currentEditingMessageId = null;
let useHashForTags = JSON.parse(localStorage.getItem('use_hash_for_tags')) !== false;
let selectedApiModel = localStorage.getItem('selected_api_model') || 'gpt-3.5';
let appliedApiModels = JSON.parse(localStorage.getItem('applied_api_models')) || {};
let pinnedContacts = JSON.parse(localStorage.getItem('pinned_contacts')) || [];

// 浅色系颜色数组
const lightColors = [
    '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec',
    '#f1f8e9', '#fff8e1', '#e8eaf6', '#f9fbe7', '#fffde7',
    '#e0f2f1', '#fff3e0', '#f3e5f5', '#e8f5e9', '#f1f8e9',
    '#fff8e1', '#e0f7fa', '#fce4ec', '#f3e5f5', '#e8eaf6'
];

// API模型信息
const apiModels = {
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
};

// 初始化函数
function init() {
    // 隐藏加载屏，显示主应用
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        document.getElementById('app').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 300);
    }, 500);
    
    updateTime();
    setupRealBatteryMonitor();
    loadUserInfo();
    loadChatList();
    loadMoments();
    loadApiModelSelection();
    setupEventListeners();
    
    // 每分钟更新时间
    setInterval(updateTime, 1000);
}

// 更新时间
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
}

// 设置真实电量监控
function setupRealBatteryMonitor() {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            updateBatteryDisplay(battery);
            
            // 监听电量变化
            battery.addEventListener('levelchange', () => {
                updateBatteryDisplay(battery);
            });
            
            battery.addEventListener('chargingchange', () => {
                updateBatteryDisplay(battery);
            });
            
            // 保存电池对象以便后续更新
            batteryMonitor = battery;
        }).catch(error => {
            console.log('无法获取电池信息:', error);
            showToast('无法获取电量信息', 'error');
            setSimulatedBattery();
        });
    } else {
        showToast('浏览器不支持电量API', 'error');
        setSimulatedBattery();
    }
}

// 更新电池显示
function updateBatteryDisplay(battery) {
    const batteryLevel = document.getElementById('batteryLevel');
    const batteryPercentage = document.getElementById('batteryPercentage');
    
    const level = Math.floor(battery.level * 100);
    batteryLevel.style.width = `${level}%`;
    batteryPercentage.textContent = `${level}%`;
    
    // 根据电量和充电状态改变颜色
    if (battery.charging) {
        batteryLevel.style.background = '#1890ff'; // 充电中 - 蓝色
    } else if (level <= 15) {
        batteryLevel.style.background = '#f5222d'; // 电量极低 - 红色
    } else if (level <= 30) {
        batteryLevel.style.background = '#fa8c16'; // 电量低 - 橙色
    } else if (level <= 60) {
        batteryLevel.style.background = '#faad14'; // 电量中等 - 黄色
    } else {
        batteryLevel.style.background = '#52c41a'; // 电量充足 - 绿色
    }
    
    // 更新电池图标边框颜色
    const batteryIcon = document.querySelector('.battery-icon');
    const batteryTip = document.querySelector('.battery-tip');
    
    if (battery.charging) {
        batteryIcon.style.borderColor = '#1890ff';
        batteryTip.style.background = '#1890ff';
    } else if (level <= 15) {
        batteryIcon.style.borderColor = '#f5222d';
        batteryTip.style.background = '#f5222d';
    } else {
        batteryIcon.style.borderColor = '#333';
        batteryTip.style.background = '#333';
    }
}

// 设置模拟电量（当无法获取真实电量时）
function setSimulatedBattery() {
    let simulatedLevel = 85;
    const batteryLevel = document.getElementById('batteryLevel');
    const batteryPercentage = document.getElementById('batteryPercentage');
    
    batteryLevel.style.width = `${simulatedLevel}%`;
    batteryPercentage.textContent = `${simulatedLevel}%`;
    batteryLevel.style.background = '#52c41a';
}

// 显示浮窗通知
function showToast(message, type = 'success', duration = 2000) {
    // 创建toast元素
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<div id="toastContent"></div>';
        document.body.appendChild(toast);
    }
    
    const content = document.getElementById('toastContent');
    content.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    // 显示通知
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 隐藏通知
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 创建模态框
function createModal(id, title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">${title}</div>
                <button class="modal-close" onclick="document.getElementById('${id}').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
                ${buttons.map(btn => 
                    `<button class="${btn.class || 'btn-primary'}" onclick="${btn.onclick}">${btn.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').appendChild(modal);
    return modal;
}

// 加载用户信息
function loadUserInfo() {
    // 设置默认用户信息
    if (!userInfo.name) {
        userInfo = {
            name: '用户',
            bio: '点击编辑个性签名',
            avatar: '',
            coverBackground: '',
            userId: '',
            profileSignature: '点击编辑个性签名',
            status: '点击设置状态',
            tags: ['标签1', '标签2', '标签3'],
            statusColor: '#e3f2fd',
            tagColors: lightColors.slice(0, 3)
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
    
    // 确保颜色数据存在
    if (!userInfo.statusColor) {
        userInfo.statusColor = lightColors[Math.floor(Math.random() * lightColors.length)];
    }
    if (!userInfo.tagColors || userInfo.tagColors.length !== userInfo.tags.length) {
        // 每次更新随机浅色系
        userInfo.tagColors = userInfo.tags.map(() => lightColors[Math.floor(Math.random() * lightColors.length)]);
    }
    
    // 更新动态页面UI
    document.getElementById('userName').textContent = userInfo.name;
    document.getElementById('userBio').textContent = userInfo.bio;
    
    // 更新动态页面的标签
    const dynamicTagsContainer = document.getElementById('dynamicTagsContainer');
    dynamicTagsContainer.innerHTML = '';
    if (userInfo.tags && Array.isArray(userInfo.tags)) {
        userInfo.tags.forEach((tag, index) => {
            if (tag) {
                const tagElement = document.createElement('div');
                tagElement.className = 'dynamic-tag';
                
                // 如果标签不以#开头，根据设置添加
                let displayTag = tag;
                if (useHashForTags && !tag.startsWith('#')) {
                    displayTag = `#${tag}`;
                } else if (!useHashForTags && tag.startsWith('#')) {
                    displayTag = tag.substring(1);
                }
                tagElement.textContent = displayTag;
                
                // 动态标签颜色自适应封面
                tagElement.style.background = 'rgba(255, 255, 255, 0.15)';
                tagElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                tagElement.style.color = 'rgba(255, 255, 255, 0.9)';
                dynamicTagsContainer.appendChild(tagElement);
            }
        });
    }
    
    // 更新个人页面UI
    document.getElementById('profileName').textContent = userInfo.name;
    document.getElementById('profileId').textContent = userInfo.userId ? `ID: ${userInfo.userId}` : 'ID: 点击设置';
    document.getElementById('profileSignature').textContent = userInfo.profileSignature || '点击编辑个性签名';
    document.getElementById('statusText').textContent = userInfo.status || '点击设置状态';
    
    // 更新状态样式
    const statusElement = document.getElementById('profileStatus');
    statusElement.style.background = userInfo.statusColor;
    statusElement.style.borderColor = '#d9d9d9';
    statusElement.style.color = '#333';
    
    // 更新标签
    const profileTagsContainer = document.getElementById('profileTagsContainer');
    profileTagsContainer.innerHTML = '';
    
    // 添加标签井号开关
    const hashToggleContainer = document.createElement('div');
    hashToggleContainer.className = 'tag-hash-toggle';
    hashToggleContainer.innerHTML = `
        <input type="checkbox" id="profileHashToggle" class="tag-hash-checkbox" ${useHashForTags ? 'checked' : ''}>
        <label for="profileHashToggle">#号</label>
    `;
    
    if (userInfo.tags && Array.isArray(userInfo.tags)) {
        userInfo.tags.forEach((tag, index) => {
            if (tag) {
                const tagElement = document.createElement('div');
                tagElement.className = 'profile-tag';
                
                // 根据设置显示#号
                let displayTag = tag;
                if (useHashForTags && !tag.startsWith('#')) {
                    displayTag = `#${tag}`;
                } else if (!useHashForTags && tag.startsWith('#')) {
                    displayTag = tag.substring(1);
                }
                tagElement.textContent = displayTag;
                
                // 每次更新随机浅色系
                const randomColor = lightColors[Math.floor(Math.random() * lightColors.length)];
                tagElement.style.background = randomColor;
                tagElement.style.borderColor = '#d9d9d9';
                tagElement.style.color = '#333';
                
                // 保存随机颜色
                userInfo.tagColors[index] = randomColor;
                
                tagElement.addEventListener('click', () => openTagEditModal(tag, index));
                profileTagsContainer.appendChild(tagElement);
            }
        });
        
        // 确保至少有3个标签
        while (userInfo.tags.length < 3) {
            userInfo.tags.push(`标签${userInfo.tags.length + 1}`);
            userInfo.tagColors.push(lightColors[Math.floor(Math.random() * lightColors.length)]);
        }
    }
    
    // 添加井号开关到标签容器
    profileTagsContainer.appendChild(hashToggleContainer);
    
    // 井号开关事件
    const hashToggle = document.getElementById('profileHashToggle');
    if (hashToggle) {
        hashToggle.addEventListener('change', (e) => {
            useHashForTags = e.target.checked;
            localStorage.setItem('use_hash_for_tags', useHashForTags);
            loadUserInfo(); // 重新加载以更新标签显示
            showToast(`已${useHashForTags ? '开启' : '关闭'}标签井号前缀`);
        });
    }
    
    // 设置动态封面背景
    if (userInfo.coverBackground) {
        document.getElementById('coverBackground').style.background = userInfo.coverBackground;
    }
    
    // 设置头像
    if (userInfo.avatar) {
        document.getElementById('userAvatar').src = userInfo.avatar;
        document.getElementById('profileAvatar').src = userInfo.avatar;
    }
    
    // 保存更新后的用户信息
    localStorage.setItem('user_info', JSON.stringify(userInfo));
}

// 加载聊天列表
function loadChatList() {
    const chatList = document.getElementById('chatList');
    
    // 清空原有的示例联系人
    roles = roles.filter(role => !['联系人助手', '编程导师'].includes(role.name.toLowerCase()));
    localStorage.setItem('contacts', JSON.stringify(roles));
    
    if (roles.length === 0) {
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
    
    chatList.innerHTML = '';
    
    // 先显示置顶的联系人
    const pinnedRoles = roles.filter(role => pinnedContacts.includes(role.id));
    const normalRoles = roles.filter(role => !pinnedContacts.includes(role.id));
    
    // 显示置顶联系人
    pinnedRoles.forEach(role => {
        addContactItem(role, true);
    });
    
    // 显示普通联系人
    normalRoles.forEach(role => {
        addContactItem(role, false);
    });
}

// 添加联系人项
function addContactItem(role, isPinned) {
    const chatList = document.getElementById('chatList');
    const history = chatHistories[role.id] || [];
    const lastMessage = history.length > 0 ? history[history.length - 1] : null;
    
    const chatItemContainer = document.createElement('div');
    chatItemContainer.className = 'chat-item-container';
    chatItemContainer.innerHTML = `
        <div class="chat-item" data-role-id="${role.id}">
            ${isPinned ? '<div class="pinned-badge"></div>' : ''}
            <div class="role-header">
                <div class="role-avatar">
                    ${role.avatar ? `<img src="${role.avatar}" alt="${role.name}">` : role.name.charAt(0)}
                </div>
                <div class="role-info">
                    <div class="role-name-container">
                        <div class="role-note">${role.note || role.name}</div>
                        <div class="role-original-name">${role.note ? `(${role.name})` : ''}</div>
                    </div>
                    <div class="role-description">
                        ${lastMessage ? (lastMessage.content.length > 30 ? lastMessage.content.substring(0, 30) + '...' : lastMessage.content) : '开始聊天'}
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
    
    // 点击聊天项
    const chatItem = chatItemContainer.querySelector('.chat-item');
    chatItem.addEventListener('click', (e) => {
        if (Math.abs(touchEndX - touchStartX) < 10 && Math.abs(touchEndY - touchStartY) < 10) {
            openChatDialog(role.id);
        }
    });
    
    // 触摸事件处理
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    chatItem.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        
        // 关闭其他打开的滑动项
        document.querySelectorAll('.chat-item').forEach(item => {
            if (item !== chatItem) {
                item.style.transform = 'translateX(0)';
            }
        });
    });
    
    chatItem.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        // 限制向左滑动最大140px
        if (diff < 0 && diff > -140) {
            chatItem.style.transform = `translateX(${diff}px)`;
        }
    });
    
    chatItem.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        const diff = currentX - startX;
        
        // 如果滑动超过50px，则保持打开状态
        if (diff < -50) {
            chatItem.style.transform = 'translateX(-140px)';
        } else {
            chatItem.style.transform = 'translateX(0)';
        }
    });
    
    // 置顶按钮事件
    const pinBtn = chatItemContainer.querySelector('.chat-action-btn.pin');
    pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePinContact(role.id);
    });
    
    // 删除按钮事件
    const deleteBtn = chatItemContainer.querySelector('.chat-action-btn.delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteContactFloat(deleteBtn, role.id);
    });
    
    chatList.appendChild(chatItemContainer);
}

// 显示删除联系人浮窗
function showDeleteContactFloat(button, roleId) {
    // 创建浮窗
    const float = document.createElement('div');
    float.className = 'action-float';
    float.innerHTML = `
        <div class="action-float-item confirm-delete-contact" data-role-id="${roleId}">
            <i class="fas fa-trash-alt"></i>
            <span>确认删除</span>
        </div>
        <div class="action-float-item cancel-delete">
            <i class="fas fa-times"></i>
            <span>取消</span>
        </div>
    `;
    
    const rect = button.getBoundingClientRect();
    float.style.left = rect.left + 'px';
    float.style.top = rect.top + 'px';
    
    document.getElementById('floatContainer').appendChild(float);
    
    // 显示浮窗
    setTimeout(() => {
        float.classList.add('show');
        
        // 确认删除
        float.querySelector('.confirm-delete-contact').addEventListener('click', () => {
            deleteContact(roleId);
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 取消删除
        float.querySelector('.cancel-delete').addEventListener('click', () => {
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 点击其他地方关闭浮窗
        const closeFloat = (e) => {
            if (!float.contains(e.target)) {
                float.classList.remove('show');
                setTimeout(() => {
                    if (float.parentNode) {
                        float.remove();
                    }
                }, 300);
                document.removeEventListener('click', closeFloat);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeFloat);
        }, 10);
    }, 10);
}

// 置顶/取消置顶联系人
function togglePinContact(roleId) {
    const index = pinnedContacts.indexOf(roleId);
    if (index === -1) {
        // 置顶
        pinnedContacts.push(roleId);
        showToast('联系人已置顶');
    } else {
        // 取消置顶
        pinnedContacts.splice(index, 1);
        showToast('已取消置顶');
    }
    
    localStorage.setItem('pinned_contacts', JSON.stringify(pinnedContacts));
    loadChatList();
}

// 删除联系人
function deleteContact(roleId) {
    roles = roles.filter(r => r.id !== roleId);
    localStorage.setItem('contacts', JSON.stringify(roles));
    
    // 从置顶列表中移除
    const pinnedIndex = pinnedContacts.indexOf(roleId);
    if (pinnedIndex !== -1) {
        pinnedContacts.splice(pinnedIndex, 1);
        localStorage.setItem('pinned_contacts', JSON.stringify(pinnedContacts));
    }
    
    // 删除聊天记录
    if (chatHistories[roleId]) {
        delete chatHistories[roleId];
        localStorage.setItem('chat_histories', JSON.stringify(chatHistories));
    }
    
    loadChatList();
    showToast('联系人已删除');
}

// 加载动态
function loadMoments() {
    const momentsList = document.getElementById('momentsList');
    
    if (moments.length === 0) {
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
    
    momentsList.innerHTML = '';
    moments.forEach(moment => {
        const momentItem = document.createElement('div');
        momentItem.className = 'moment-item';
        momentItem.dataset.momentId = moment.id;
        
        // 获取点赞数
        const momentLikes = likes[moment.id] || [];
        const isLiked = momentLikes.includes(userInfo.userId || 'currentUser');
        
        // 获取评论数
        const momentComments = comments[moment.id] || [];
        
        momentItem.innerHTML = `
            <div class="moment-header">
                <div class="moment-avatar">
                    ${userInfo.avatar ? `<img src="${userInfo.avatar}" alt="${userInfo.name}">` : 
                      `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #07c160; color: white; font-weight: 600;">${userInfo.name.charAt(0)}</div>`}
                </div>
                <div class="moment-info">
                    <div class="moment-author">${moment.author || userInfo.name}</div>
                    <div class="moment-time">${moment.time}</div>
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
                <button class="moment-more-btn" data-moment-id="${moment.id}" data-float-trigger>
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        `;
        
        // 点赞按钮事件
        const likeBtn = momentItem.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(moment.id);
        });
        
        // 评论按钮事件
        const commentBtn = momentItem.querySelector('.comment-btn');
        commentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openComments(moment.id);
        });
        
        // 更多按钮事件
        const moreBtn = momentItem.querySelector('.moment-more-btn');
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMomentId = moment.id;
            showMomentActionsFloat(moreBtn);
        });
        
        momentsList.appendChild(momentItem);
    });
}

// 显示动态操作浮窗
function showMomentActionsFloat(button) {
    // 创建浮窗
    const float = document.createElement('div');
    float.className = 'action-float';
    float.innerHTML = `
        <div class="action-float-item edit-moment">
            <i class="fas fa-edit"></i>
            <span>编辑动态</span>
        </div>
        <div class="action-float-item delete delete-moment">
            <i class="fas fa-trash-alt"></i>
            <span>删除动态</span>
        </div>
    `;
    
    const rect = button.getBoundingClientRect();
    float.style.left = (rect.left - 150) + 'px';
    float.style.top = (rect.top + 40) + 'px';
    
    document.getElementById('floatContainer').appendChild(float);
    
    // 显示浮窗
    setTimeout(() => {
        float.classList.add('show');
        
        // 编辑动态
        float.querySelector('.edit-moment').addEventListener('click', () => {
            editMoment();
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 删除动态
        float.querySelector('.delete-moment').addEventListener('click', () => {
            deleteMoment();
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 点击其他地方关闭浮窗
        const closeFloat = (e) => {
            if (!float.contains(e.target)) {
                float.classList.remove('show');
                setTimeout(() => {
                    if (float.parentNode) {
                        float.remove();
                    }
                }, 300);
                document.removeEventListener('click', closeFloat);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeFloat);
        }, 10);
    }, 10);
}

// 点赞/取消点赞
function toggleLike(momentId) {
    if (!likes[momentId]) {
        likes[momentId] = [];
    }
    
    const userId = userInfo.userId || 'currentUser';
    const likeIndex = likes[momentId].indexOf(userId);
    
    if (likeIndex === -1) {
        // 点赞
        likes[momentId].push(userId);
        
        // 更新UI
        const likeBtn = document.querySelector(`.like-btn[data-moment-id="${momentId}"]`);
        const likeCount = likeBtn.querySelector('.like-count');
        
        likeBtn.classList.add('liked');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
        
        showToast('已点赞', 'success');
    } else {
        // 取消点赞
        likes[momentId].splice(likeIndex, 1);
        
        // 更新UI
        const likeBtn = document.querySelector(`.like-btn[data-moment-id="${momentId}"]`);
        const likeCount = likeBtn.querySelector('.like-count');
        
        likeBtn.classList.remove('liked');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
        
        showToast('已取消点赞', 'info');
    }
    
    localStorage.setItem('likes', JSON.stringify(likes));
}

// 打开评论弹窗
function openComments(momentId) {
    currentMomentId = momentId;
    
    // 创建评论弹窗
    const modal = createModal('commentsModal', '评论', `
        <div class="comments-list" id="commentsList">
            <!-- 评论将通过JS动态添加 -->
        </div>
        <div class="comment-input">
            <input type="text" class="comment-input-field" id="commentInput" placeholder="请输入评论...">
            <button class="comment-send-btn" id="sendCommentBtn">发送</button>
        </div>
    `);
    
    modal.classList.add('active');
    loadComments();
    setupCommentEvents();
}

// 加载评论
function loadComments() {
    const commentsList = document.getElementById('commentsList');
    const momentComments = comments[currentMomentId] || [];
    
    commentsList.innerHTML = '';
    
    if (momentComments.length === 0) {
        commentsList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">暂无评论</div>';
    } else {
        // 按时间从早到晚排序
        momentComments.sort((a, b) => new Date(a.time) - new Date(b.time)).forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.dataset.commentId = comment.id;
            
            commentItem.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-time">${comment.time}</div>
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-actions">
                    <span class="comment-action reply-comment">回复</span>
                    <span class="comment-action edit-comment">编辑</span>
                    <span class="comment-action delete-comment">删除</span>
                </div>
                ${comment.reply ? `<div class="comment-reply">回复 ${comment.replyTo}: ${comment.reply}</div>` : ''}
            `;
            
            // 评论操作事件
            commentItem.querySelector('.reply-comment').addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('commentInput').placeholder = `回复 ${comment.author}: `;
                document.getElementById('commentInput').focus();
            });
            
            commentItem.querySelector('.edit-comment').addEventListener('click', (e) => {
                e.stopPropagation();
                editComment(comment.id);
            });
            
            commentItem.querySelector('.delete-comment').addEventListener('click', (e) => {
                e.stopPropagation();
                showDeleteCommentFloat(e.target, comment.id);
            });
            
            commentsList.appendChild(commentItem);
        });
    }
    
    document.getElementById('commentInput').focus();
}

// 设置评论事件
function setupCommentEvents() {
    // 发送评论
    document.getElementById('sendCommentBtn').addEventListener('click', sendComment);
    
    // 回车发送评论
    document.getElementById('commentInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendComment();
        }
    });
}

// 发送评论
function sendComment() {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    
    if (!comment) {
        showToast('请输入评论内容', 'error');
        return;
    }
    
    if (!comments[currentMomentId]) {
        comments[currentMomentId] = [];
    }
    
    const newComment = {
        id: 'comment_' + Date.now(),
        author: userInfo.name,
        content: comment,
        time: new Date().toLocaleString()
    };
    
    comments[currentMomentId].push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    // 更新UI
    loadMoments();
    loadComments();
    
    // 清空输入框
    commentInput.value = '';
    commentInput.placeholder = '请输入评论...';
    
    showToast('评论成功');
}

// 编辑评论
function editComment(commentId) {
    const momentComments = comments[currentMomentId] || [];
    const commentIndex = momentComments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
        const comment = momentComments[commentIndex];
        const newContent = prompt('编辑评论内容：', comment.content);
        
        if (newContent !== null && newContent.trim()) {
            comment.content = newContent.trim();
            comment.time = new Date().toLocaleString();
            localStorage.setItem('comments', JSON.stringify(comments));
            
            // 重新加载评论
            loadComments();
            showToast('评论已更新');
        }
    }
}

// 显示删除评论浮窗
function showDeleteCommentFloat(button, commentId) {
    const float = document.createElement('div');
    float.className = 'action-float';
    float.innerHTML = `
        <div class="action-float-item confirm-delete-comment" data-comment-id="${commentId}">
            <i class="fas fa-trash-alt"></i>
            <span>确认删除</span>
        </div>
        <div class="action-float-item cancel-delete">
            <i class="fas fa-times"></i>
            <span>取消</span>
        </div>
    `;
    
    const rect = button.getBoundingClientRect();
    float.style.left = rect.left + 'px';
    float.style.top = rect.top + 'px';
    document.getElementById('floatContainer').appendChild(float);
    
    // 显示浮窗
    setTimeout(() => {
        float.classList.add('show');
        
        // 确认删除
        float.querySelector('.confirm-delete-comment').addEventListener('click', () => {
            deleteComment(commentId);
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 取消删除
        float.querySelector('.cancel-delete').addEventListener('click', () => {
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 点击其他地方关闭浮窗
        const closeFloat = (e) => {
            if (!float.contains(e.target)) {
                float.classList.remove('show');
                setTimeout(() => {
                    if (float.parentNode) {
                        float.remove();
                    }
                }, 300);
                document.removeEventListener('click', closeFloat);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeFloat);
        }, 10);
    }, 10);
}

// 删除评论
function deleteComment(commentId) {
    if (confirm('确定要删除这条评论吗？')) {
        comments[currentMomentId] = comments[currentMomentId].filter(c => c.id !== commentId);
        localStorage.setItem('comments', JSON.stringify(comments));
        
        // 重新加载评论
        loadComments();
        showToast('评论已删除');
    }
}

// 编辑动态
function editMoment() {
    const moment = moments.find(m => m.id === currentMomentId);
    if (!moment) return;
    
    const newContent = prompt('编辑动态内容：', moment.content);
    if (newContent !== null && newContent.trim()) {
        moment.content = newContent.trim();
        moment.time = new Date().toLocaleString();
        localStorage.setItem('moments', JSON.stringify(moments));
        loadMoments();
        showToast('动态已更新');
    }
}

// 删除动态
function deleteMoment() {
    if (confirm('确定要删除这条动态吗？')) {
        moments = moments.filter(m => m.id !== currentMomentId);
        localStorage.setItem('moments', JSON.stringify(moments));
        
        // 删除相关的点赞和评论
        if (likes[currentMomentId]) {
            delete likes[currentMomentId];
            localStorage.setItem('likes', JSON.stringify(likes));
        }
        
        if (comments[currentMomentId]) {
            delete comments[currentMomentId];
            localStorage.setItem('comments', JSON.stringify(comments));
        }
        
        loadMoments();
        showToast('动态已删除');
    }
}

// 打开聊天对话框
function openChatDialog(roleId) {
    currentRoleId = roleId;
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    // 创建聊天对话框
    const dialog = document.createElement('div');
    dialog.id = 'chatDialog';
    dialog.className = 'chat-dialog active';
    dialog.innerHTML = `
        <div class="dialog-header">
            <button class="dialog-back" id="backToChatList">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="dialog-title-container" id="dialogTitleContainer">
                <span class="dialog-title-note">${role.note || role.name}</span>
                ${role.note ? `<span class="dialog-title-name">(${role.name})</span>` : ''}
            </div>
            <button class="dialog-more-btn" id="dialogMoreBtn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        <div class="chat-messages" id="chatMessages">
            <!-- 聊天消息将通过JS动态添加 -->
        </div>
        <div class="chat-input">
            <input type="text" class="message-input" id="chatMessageInput" placeholder="请输入消息...">
            <button class="send-btn" id="sendChatMessage">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    document.getElementById('dialogContainer').appendChild(dialog);
    
    // 清空聊天消息
    document.getElementById('chatMessages').innerHTML = '';
    
    // 加载聊天记录
    const history = chatHistories[roleId] || [];
    if (history.length > 0) {
        history.forEach(msg => {
            addMessageToChat(msg.content, msg.role === 'user', msg.id, msg.time);
        });
    }
    
    // 设置事件
    setupChatDialogEvents();
    document.getElementById('chatMessageInput').focus();
    
    // 滚动到底部
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// 添加消息到聊天界面
function addMessageToChat(content, isUser = false, messageId = null, timestamp = null) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isUser ? 'user' : 'contact'}`;
    
    if (messageId) {
        messageElement.dataset.messageId = messageId;
    } else {
        messageElement.dataset.messageId = 'msg_' + Date.now();
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    // 添加时间显示
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    
    const now = timestamp ? new Date(timestamp) : new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;
    
    // 添加编辑按钮（仅用户消息）
    if (isUser) {
        const editBtn = document.createElement('button');
        editBtn.className = 'message-edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = '编辑消息';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editMessage(messageElement.dataset.messageId, content);
        });
        
        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeElement);
        messageElement.appendChild(editBtn);
        
        // 长按编辑消息
        let longPressTimer;
        messageElement.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                editMessage(messageElement.dataset.messageId, content);
            }, 1000);
        });
        
        messageElement.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
        });
    } else {
        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeElement);
    }
    
    document.getElementById('chatMessages').appendChild(messageElement);
    
    // 滚动到底部
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageElement.dataset.messageId;
}

// 设置聊天对话框事件
function setupChatDialogEvents() {
    // 返回聊天列表
    document.getElementById('backToChatList').addEventListener('click', () => {
        document.getElementById('chatDialog').classList.remove('active');
        setTimeout(() => {
            const dialog = document.getElementById('chatDialog');
            if (dialog) dialog.remove();
        }, 300);
    });
    
    // 聊天对话框更多按钮
    document.getElementById('dialogMoreBtn').addEventListener('click', (e) => {
        showChatEditFloat(e.target);
    });
    
    // 发送消息
    document.getElementById('sendChatMessage').addEventListener('click', sendMessage);
    
    // 回车发送消息
    document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 显示聊天编辑浮窗
function showChatEditFloat(button) {
    const float = document.createElement('div');
    float.className = 'action-float chat-edit-float';
    float.innerHTML = `
        <div class="action-float-item edit-contact-in-chat">
            <i class="fas fa-edit"></i>
            <span>编辑联系人</span>
        </div>
        <div class="action-float-item change-chat-style">
            <i class="fas fa-palette"></i>
            <span>修改聊天样式</span>
        </div>
        <div class="action-float-item delete delete-contact-in-chat">
            <i class="fas fa-trash-alt"></i>
            <span>删除联系人</span>
        </div>
    `;
    
    const rect = button.getBoundingClientRect();
    float.style.left = (rect.left - 150) + 'px';
    float.style.top = (rect.top + 40) + 'px';
    
    document.getElementById('dialogContainer').appendChild(float);
    
    // 显示浮窗
    setTimeout(() => {
        float.classList.add('show');
        
        // 编辑联系人
        float.querySelector('.edit-contact-in-chat').addEventListener('click', () => {
            openRoleEditor(currentRoleId);
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 修改聊天样式
        float.querySelector('.change-chat-style').addEventListener('click', () => {
            openChatStyleEditor(currentRoleId);
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 删除联系人
        float.querySelector('.delete-contact-in-chat').addEventListener('click', () => {
            const role = roles.find(r => r.id === currentRoleId);
            if (role && confirm(`确定要删除联系人"${role.note || role.name}"吗？`)) {
                deleteContact(currentRoleId);
                document.getElementById('chatDialog').classList.remove('active');
                setTimeout(() => {
                    const dialog = document.getElementById('chatDialog');
                    if (dialog) dialog.remove();
                }, 300);
            }
            float.classList.remove('show');
            setTimeout(() => float.remove(), 300);
        });
        
        // 点击其他地方关闭浮窗
        const closeFloat = (e) => {
            if (!float.contains(e.target)) {
                float.classList.remove('show');
                setTimeout(() => {
                    if (float.parentNode) {
                        float.remove();
                    }
                }, 300);
                document.removeEventListener('click', closeFloat);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeFloat);
        }, 10);
    }, 10);
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const message = input.value.trim();
    
    if (!message || !currentRoleId) return;
    
    const role = roles.find(r => r.id === currentRoleId);
    if (!role) return;
    
    // 添加用户消息
    const messageId = addMessageToChat(message, true, null, Date.now());
    
    // 保存消息历史
    if (!chatHistories[currentRoleId]) {
        chatHistories[currentRoleId] = [];
    }
    
    chatHistories[currentRoleId].push({
        id: messageId,
        role: 'user',
        content: message,
        time: Date.now()
    });
    
    // 清空输入框
    input.value = '';
    
    // 基于API模型生成联系人回复
    setTimeout(() => {
        // 获取联系人使用的API模型
        const contactModel = appliedApiModels[currentRoleId] || selectedApiModel;
        
        // 基于人物设定和API模型生成回复
        let reply = generateContactReply(message, role, contactModel);
        
        // 添加联系人回复
        const replyMessageId = addMessageToChat(reply, false, null, Date.now());
        
        // 保存联系人回复
        chatHistories[currentRoleId].push({
            id: replyMessageId,
            role: 'assistant',
            content: reply,
            time: Date.now()
        });
        
        // 保存到本地存储
        localStorage.setItem('chat_histories', JSON.stringify(chatHistories));
        
        // 更新聊天列表
        loadChatList();
    }, 1000);
    
    // 保存用户消息
    localStorage.setItem('chat_histories', JSON.stringify(chatHistories));
}

// 生成联系人回复
function generateContactReply(message, role, model) {
    let reply = '';
    
    // 检查是否有人物设定
    if (!role.personality || role.personality.trim() === '') {
        // 空白机器人模式，只听指令
        reply = `我收到了你的指令："${message}"。`;
        
        // 根据指令类型回复
        if (message.includes('？') || message.includes('?') || message.includes('什么') || message.includes('怎么') || message.includes('为什么')) {
            reply += ' 这是一个需要回答的问题。';
        } else if (message.includes('做') || message.includes('执行') || message.includes('完成')) {
            reply += ' 这是一个需要执行的指令。';
        } else {
            reply += ' 已收到你的消息。';
        }
    } else {
        // 基于API模型生成不同的回复风格
        switch(model) {
            case 'gpt-4':
                reply = `（GPT-4模型）作为${role.name}，我对您的问题"${message}"进行了深入分析。`;
                break;
            case 'claude':
                reply = `（Claude模型）基于我的理解，关于"${message}"，我想从几个角度来探讨...`;
                break;
            case 'ernie':
                reply = `（文心一言模型）作为${role.name}，我来回答您的问题："${message}"。`;
                break;
            default: // gpt-3.5
                reply = `作为${role.name}，我对您提到的"${message}"很感兴趣。`;
        }
        
        // 添加人物设定相关的内容
        if (role.personality) {
            const personalityKeywords = role.personality.toLowerCase();
            
            if (personalityKeywords.includes('温柔') || personalityKeywords.includes('体贴')) {
                reply += ` 我会用温柔体贴的方式回应你。`;
            } else if (personalityKeywords.includes('幽默') || personalityKeywords.includes('风趣')) {
                reply += ` 哈哈，这个话题真有趣！让我用幽默的方式聊聊。`;
            } else if (personalityKeywords.includes('严谨') || personalityKeywords.includes('专业')) {
                reply += ` 从专业角度出发，我认为...`;
            } else if (personalityKeywords.includes('活泼') || personalityKeywords.includes('开朗')) {
                reply += ` 哇！这个问题真棒！让我用活泼开朗的态度来回答！`;
            }
            
            // 添加部分人物设定
            if (role.personality.length > 0) {
                reply += ` ${role.personality.substring(0, 80)}...`;
            }
        }
        
        // 添加语言风格
        if (role.languageStyle) {
            reply += ` 我会用${role.languageStyle}的风格与你交流。`;
        }
        
        // 添加模型特定内容
        reply += ` [使用${apiModels[model].name}模型生成]`;
    }
    
    return reply;
}

// 编辑消息
function editMessage(messageId, currentContent) {
    currentEditingMessageId = messageId;
    const modal = createModal('messageEditModal', '编辑消息', `
        <div class="form-group">
            <textarea class="form-textarea" id="messageEditContent" rows="4" placeholder="编辑消息内容...">${currentContent}</textarea>
        </div>
    `, [
        {
            text: '保存修改',
            onclick: 'saveMessageEdit()',
            class: 'btn-primary'
        }
    ]);
    
    modal.classList.add('active');
    document.getElementById('messageEditContent').focus();
}

// 保存消息编辑
function saveMessageEdit() {
    const textarea = document.getElementById('messageEditContent');
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        showToast('消息内容不能为空', 'error');
        return;
    }
    
    // 更新聊天界面中的消息
    const messageElement = document.querySelector(`[data-message-id="${currentEditingMessageId}"] .message-content`);
    if (messageElement) {
        messageElement.textContent = newContent;
    }
    
    // 更新聊天历史记录
    if (currentRoleId && chatHistories[currentRoleId]) {
        const messageIndex = chatHistories[currentRoleId].findIndex(msg => 
            msg.id === currentEditingMessageId || 
            (msg.role === 'user' && msg.content === textarea.dataset.originalContent)
        );
        
        if (messageIndex !== -1) {
            chatHistories[currentRoleId][messageIndex].content = newContent;
            chatHistories[currentRoleId][messageIndex].edited = true;
            chatHistories[currentRoleId][messageIndex].editTime = Date.now();
            localStorage.setItem('chat_histories', JSON.stringify(chatHistories));
        }
    }
    
    // 关闭弹窗
    document.getElementById('messageEditModal').classList.remove('active');
    showToast('消息已修改');
}

// 打开联系人编辑器
function openRoleEditor(roleId = null) {
    editingRoleId = roleId;
    const role = roleId ? roles.find(r => r.id === roleId) : null;
    
    const modal = createModal('roleEditorModal', roleId ? '编辑联系人' : '添加联系人', `
        <div class="form-group">
            <div class="form-label">头像</div>
            <div style="text-align: center;">
                <div id="roleAvatarPreview" style="width: 100px; height: 100px; border-radius: 50%; background: #f0f0f0; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden;">
                    ${role && role.avatar ? `<img src="${role.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-user"></i>'}
                </div>
                <button class="btn-primary" id="uploadRoleAvatar" style="width: auto; padding: 10px 20px;">
                    选择头像
                </button>
                <input type="file" id="roleAvatarInput" accept="image/*" style="display: none;">
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
            <label class="form-label" for="roleLanguageStyle">语言风格</label>
            <input type="text" class="form-input" id="roleLanguageStyle" placeholder="例如：温柔体贴、幽默风趣、严谨专业等" value="${role ? (role.languageStyle || '') : ''}">
        </div>
    `, [
        {
            text: '保存联系人',
            onclick: 'saveRole()',
            class: 'btn-primary'
        }
    ]);
    
    modal.classList.add('active');
    setupRoleEditorEvents();
}

// 设置联系人编辑器事件
function setupRoleEditorEvents() {
    // 上传头像
    document.getElementById('uploadRoleAvatar').addEventListener('click', () => {
        document.getElementById('roleAvatarInput').click();
    });
    
    document.getElementById('roleAvatarInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('roleAvatarPreview').innerHTML = 
                    `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 保存联系人
function saveRole() {
    const name = document.getElementById('roleName').value.trim();
    const note = document.getElementById('roleNote').value.trim();
    const personality = document.getElementById('rolePersonality').value.trim();
    const languageStyle = document.getElementById('roleLanguageStyle').value.trim();
    
    if (!name) {
        showToast('请输入联系人名称', 'error');
        return;
    }
    
    // 获取头像
    const avatarPreview = document.getElementById('roleAvatarPreview');
    const avatarImg = avatarPreview.querySelector('img');
    const avatar = avatarImg ? avatarImg.src : '';
    
    if (editingRoleId) {
        // 更新现有联系人
        const roleIndex = roles.findIndex(r => r.id === editingRoleId);
        if (roleIndex !== -1) {
            roles[roleIndex] = {
                ...roles[roleIndex],
                name,
                note,
                personality,
                languageStyle,
                avatar,
                updatedAt: Date.now()
            };
        }
    } else {
        // 创建新联系人
        const newRole = {
            id: 'contact_' + Date.now(),
            name,
            note,
            personality,
            languageStyle,
            avatar,
            createdAt: Date.now()
        };
        roles.push(newRole);
        
        // 应用当前选中的API模型到新联系人
        appliedApiModels[newRole.id] = selectedApiModel;
        localStorage.setItem('applied_api_models', JSON.stringify(appliedApiModels));
    }
    
    // 保存到本地存储
    localStorage.setItem('contacts', JSON.stringify(roles));
    
    // 关闭编辑器
    document.getElementById('roleEditorModal').classList.remove('active');
    
    // 更新UI
    loadChatList();
    
    showToast('联系人保存成功！');
}

// 打开聊天样式编辑器
function openChatStyleEditor(roleId) {
    // 这里可以扩展聊天样式编辑功能
    showToast('聊天样式编辑器功能待开发', 'info');
}

// 加载API模型选择
function loadApiModelSelection() {
    // 在设置中显示当前选中的模型
    const currentModelDisplay = document.getElementById('currentModelDisplay');
    if (currentModelDisplay) {
        currentModelDisplay.textContent = apiModels[selectedApiModel].name;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 触摸事件监听
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
    });
    
    // 标签页切换
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // 更新标签状态
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            
            // 显示对应的页面
            if (tabName === 'chat') {
                document.getElementById('chatPage').classList.add('active');
            } else if (tabName === 'moments') {
                document.getElementById('momentsPage').classList.add('active');
            } else if (tabName === 'profile') {
                document.getElementById('profilePage').classList.add('active');
            }
        });
    });
    
    // 添加联系人按钮
    document.getElementById('addRoleBtn').addEventListener('click', () => {
        openRoleManager();
    });
    
    // 我的联系人按钮
    document.getElementById('myRolesBtn').addEventListener('click', () => {
        openRoleManager();
    });
    
    // 设置按钮
    document.getElementById('settingsBtn').addEventListener('click', () => {
        openSettings();
    });
    
    // 编辑动态封面
    document.getElementById('editCoverBtn').addEventListener('click', () => {
        uploadImage((imageData) => {
            document.getElementById('coverBackground').style.background = `url('${imageData}') center/cover no-repeat`;
            userInfo.coverBackground = `url('${imageData}') center/cover no-repeat`;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            showToast('封面已更新');
        });
    });
    
    // 编辑头像
    document.getElementById('editAvatarBtn').addEventListener('click', () => {
        uploadImage((imageData) => {
            userInfo.avatar = imageData;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('头像已更新');
        });
    });
    
    // 编辑个人头像
    document.getElementById('editProfileAvatarBtn').addEventListener('click', () => {
        uploadImage((imageData) => {
            userInfo.avatar = imageData;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('头像已更新');
        });
    });
    
    // 编辑个性签名
    document.getElementById('userBio').addEventListener('click', () => {
        const newBio = prompt('请输入个性签名：', userInfo.bio || '');
        if (newBio !== null) {
            userInfo.bio = newBio;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('个性签名已更新');
        }
    });
    
    // 编辑用户名
    document.getElementById('userName').addEventListener('click', () => {
        const newName = prompt('请输入用户名：', userInfo.name || '');
        if (newName !== null && newName.trim()) {
            userInfo.name = newName.trim();
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('用户名已更新');
        }
    });
    
    // 编辑个人用户名
    document.getElementById('profileName').addEventListener('click', () => {
        const newName = prompt('请输入用户名：', userInfo.name || '');
        if (newName !== null && newName.trim()) {
            userInfo.name = newName.trim();
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('用户名已更新');
        }
    });
    
    // 编辑个人签名
    document.getElementById('profileSignature').addEventListener('click', () => {
        const newSignature = prompt('请输入个性签名：', userInfo.profileSignature || '');
        if (newSignature !== null) {
            userInfo.profileSignature = newSignature;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('个性签名已更新');
        }
    });
    
    // 编辑用户ID
    document.getElementById('profileId').addEventListener('click', () => {
        const newId = prompt('请输入用户ID：', userInfo.userId || '');
        if (newId !== null) {
            userInfo.userId = newId;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('用户ID已更新');
        }
    });
    
    // 编辑状态
    document.getElementById('profileStatus').addEventListener('click', () => {
        const currentStatus = userInfo.status || '点击设置状态';
        const newStatus = prompt('请输入自定义状态：', currentStatus);
        
        if (newStatus !== null && newStatus.trim()) {
            userInfo.status = newStatus.trim();
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            loadUserInfo();
            showToast('状态已更新');
        }
    });
    
    // 添加动态
    document.getElementById('addMomentBtn').addEventListener('click', () => {
        const content = prompt('请输入动态内容：');
        if (content && content.trim()) {
            const newMoment = {
                id: 'moment_' + Date.now(),
                content: content.trim(),
                time: new Date().toLocaleString(),
                author: userInfo.name
            };
            
            moments.push(newMoment);
            localStorage.setItem('moments', JSON.stringify(moments));
            loadMoments();
            showToast('动态发布成功');
        }
    });
}

// 上传图片
function uploadImage(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                callback(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// 打开联系人管理器
function openRoleManager() {
    const modal = createModal('roleManagerModal', '我的联系人', `
        <div id="roleList"></div>
        <button class="btn-primary" id="addNewRoleBtn" style="margin-top: 20px;">
            添加新联系人
        </button>
    `);
    
    modal.classList.add('active');
    loadRoleList();
    
    // 添加新联系人按钮
    setTimeout(() => {
        document.getElementById('addNewRoleBtn').addEventListener('click', () => {
            document.getElementById('roleManagerModal').classList.remove('active');
            setTimeout(() => {
                openRoleEditor();
            }, 300);
        });
    }, 10);
}

// 加载联系人列表
function loadRoleList() {
    const roleList = document.getElementById('roleList');
    roleList.innerHTML = '';
    
    if (roles.length === 0) {
        roleList.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">还没有创建联系人</div>';
        return;
    }
    
    // 先显示置顶的联系人
    const pinnedRoles = roles.filter(role => pinnedContacts.includes(role.id));
    const normalRoles = roles.filter(role => !pinnedContacts.includes(role.id));
    
    // 显示置顶联系人
    pinnedRoles.forEach(role => {
        addContactListItem(role, true);
    });
    
    // 显示普通联系人
    normalRoles.forEach(role => {
        addContactListItem(role, false);
    });
}

// 添加联系人列表项
function addContactListItem(role, isPinned) {
    const roleList = document.getElementById('roleList');
    
    const roleItem = document.createElement('div');
    roleItem.className = 'role-item';
    roleItem.innerHTML = `
        ${isPinned ? '<div class="pinned-badge"></div>' : ''}
        <div class="role-header">
            <div class="role-avatar">
                ${role.avatar ? `<img src="${role.avatar}" alt="${role.name}">` : role.name.charAt(0)}
            </div>
            <div class="role-info">
                <div class="role-name-container">
                    <div class="role-note">${role.note || role.name}</div>
                    <div class="role-original-name">${role.note ? `(${role.name})` : ''}</div>
                </div>
                <div class="role-description">
                    ${role.personality ? (role.personality.length > 50 ? role.personality.substring(0, 50) + '...' : role.personality) : '空白机器人，只听指令'}
                </div>
            </div>
        </div>
    `;
    
    roleItem.addEventListener('click', () => {
        document.getElementById('roleManagerModal').classList.remove('active');
        setTimeout(() => {
            openChatDialog(role.id);
        }, 300);
    });
    
    roleList.appendChild(roleItem);
}

// 打开设置
function openSettings() {
    const modal = createModal('settingsModal', '设置', `
        <div class="settings-group">
            <div class="settings-title">API模型设置</div>
            <div style="margin-bottom: 15px; font-size: 14px; color: var(--text-light);">
                选择联系人使用的API模型，新建联系人将自动使用选中的模型
            </div>
            
            <div class="api-model-select" id="apiModelSelect">
                <div class="api-model-item" data-model="gpt-3.5">
                    <div class="api-model-name">GPT-3.5 Turbo</div>
                    <div class="api-model-desc">快速、经济、适用于大多数对话场景</div>
                </div>
                <div class="api-model-item" data-model="gpt-4">
                    <div class="api-model-name">GPT-4</div>
                    <div class="api-model-desc">更智能、理解更深层，适用于复杂对话</div>
                </div>
                <div class="api-model-item" data-model="claude">
                    <div class="api-model-name">Claude</div>
                    <div class="api-model-desc">擅长创意写作和逻辑推理</div>
                </div>
                <div class="api-model-item" data-model="ernie">
                    <div class="api-model-name">文心一言</div>
                    <div class="api-model-desc">中文理解优秀，本土化优化</div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <div class="settings-item">
                    <div class="settings-label">当前选择模型</div>
                    <div class="settings-value" id="currentModelDisplay">${apiModels[selectedApiModel].name}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="settings-btn" id="applyToAllBtn">应用到所有联系人</button>
                <button class="settings-btn" id="applyToSelectedBtn">应用到选中联系人</button>
            </div>
        </div>
        
        <div class="settings-group">
            <div class="settings-title">显示设置</div>
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
    `);
    
    modal.classList.add('active');
    setupSettingsEvents();
}

// 设置设置事件
function setupSettingsEvents() {
    // API模型选择
    document.querySelectorAll('.api-model-item').forEach(item => {
        // 设置选中状态
        if (item.dataset.model === selectedApiModel) {
            item.classList.add('selected');
        }
        
        item.addEventListener('click', () => {
            // 移除所有选中状态
            document.querySelectorAll('.api-model-item').forEach(i => {
                i.classList.remove('selected');
            });
            
            // 添加当前选中状态
            item.classList.add('selected');
            
            // 更新选中的模型
            selectedApiModel = item.dataset.model;
            localStorage.setItem('selected_api_model', selectedApiModel);
            
            // 更新显示
            document.getElementById('currentModelDisplay').textContent = apiModels[selectedApiModel].name;
            
            showToast(`已选择${apiModels[selectedApiModel].name}模型`);
        });
    });
    
    // 应用到所有联系人
    document.getElementById('applyToAllBtn').addEventListener('click', () => {
        if (confirm(`确定要将${apiModels[selectedApiModel].name}模型应用到所有联系人吗？`)) {
            roles.forEach(role => {
                appliedApiModels[role.id] = selectedApiModel;
            });
            
            localStorage.setItem('applied_api_models', JSON.stringify(appliedApiModels));
            showToast(`已将${apiModels[selectedApiModel].name}模型应用到所有联系人`);
        }
    });
    
    // 应用到选中联系人
    document.getElementById('applyToSelectedBtn').addEventListener('click', () => {
        if (currentRoleId) {
            appliedApiModels[currentRoleId] = selectedApiModel;
            localStorage.setItem('applied_api_models', JSON.stringify(appliedApiModels));
            showToast(`已将${apiModels[selectedApiModel].name}模型应用到当前联系人`);
        } else {
            showToast('请先打开一个联系人聊天', 'error');
        }
    });
}

// 打开标签编辑弹窗
function openTagEditModal(tag, index) {
    const modal = createModal('tagEditModal', '编辑标签', `
        <div class="form-group">
            <label class="form-label" for="tagEditInput">标签内容</label>
            <input type="text" class="form-input" id="tagEditInput" placeholder="输入标签内容（可带#号）" value="${tag.startsWith('#') ? tag.substring(1) : tag}">
        </div>
        <div class="form-group">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="tagHashToggle" class="tag-hash-checkbox" ${useHashForTags ? 'checked' : ''}>
                <label for="tagHashToggle" style="font-size: 14px; color: var(--text-light); cursor: pointer;">添加#号前缀</label>
            </div>
        </div>
    `, [
        {
            text: '保存标签',
            onclick: 'saveTagEdit()',
            class: 'btn-primary'
        }
    ]);
    
    // 保存编辑的标签索引
    document.getElementById('tagEditInput').dataset.tagIndex = index;
    
    modal.classList.add('active');
}

// 保存标签编辑
function saveTagEdit() {
    const input = document.getElementById('tagEditInput');
    const hashToggle = document.getElementById('tagHashToggle');
    const index = input.dataset.tagIndex;
    const newTag = input.value.trim();
    
    if (!newTag) {
        showToast('请输入标签内容', 'error');
        return;
    }
    
    // 根据井号设置处理标签
    let finalTag = newTag;
    if (hashToggle.checked && !newTag.startsWith('#')) {
        finalTag = `#${newTag}`;
    } else if (!hashToggle.checked && newTag.startsWith('#')) {
        finalTag = newTag.substring(1);
    }
    
    // 更新标签
    userInfo.tags[index] = finalTag;
    
    // 更新全局井号设置
    useHashForTags = hashToggle.checked;
    localStorage.setItem('use_hash_for_tags', useHashForTags);
    
    // 保存并重新加载
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    loadUserInfo();
    
    // 关闭弹窗
    document.getElementById('tagEditModal').classList.remove('active');
    showToast('标签已更新');
}

// 点击弹窗外部关闭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', init);