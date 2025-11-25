function randomString(e) {

	e = e || 32;
	var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
	a = t.length,
	n = "";
	for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
	return n
}
let verstring = "?" + randomString(8);


let MEMOS_JSON_URL = null;
let MEMOS_FILE_URL = null;

async function init() {
    try {
        const res = await fetch("config.json");
        const config = await res.json();

        MEMOS_JSON_URL = config.json_url;
        MEMOS_FILE_URL = config.file_url;

        // 显示数据源
        document.getElementById('dataSource').textContent = MEMOS_JSON_URL;

        // 加载 memos 数据
        loadMemosData();

        // 绑定模态框事件
        setupModalEvents();

    } catch (err) {
        console.error("加载 config.json 失败:", err);
        document.getElementById('loadingState').innerHTML = `
            <div class="error">
                <p>加载配置文件失败</p>
                <p>错误信息: ${err.message}</p>
                <p>请检查 config.json 文件路径是否正确</p>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", init);

// const MEMOS_FILE_URL = "https://zlog.net/files/2025/";
// const MEMOS_JSON_URL = 'https://memos.zhao.im/api/v1/memos?pageSize=1000&view=MEMO_VIEW_FULL' + verstring;



// 全局变量
let currentImageIndex = 0;
let allImages = [];

document.addEventListener('DOMContentLoaded', function () {
    // 显示数据源
    document.getElementById('dataSource').textContent = MEMOS_JSON_URL;
});


// 设置模态框事件
function setupModalEvents() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // 关闭模态框
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // 点击模态框背景关闭
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 键盘事件
    document.addEventListener('keydown', function (event) {
        if (modal.style.display === 'block') {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
            } else if (event.key === 'ArrowLeft') {
                showPreviousImage();
            } else if (event.key === 'ArrowRight') {
                showNextImage();
            }
        }
    });

    // 导航按钮
    prevBtn.addEventListener('click', showPreviousImage);
    nextBtn.addEventListener('click', showNextImage);
}

// 显示上一张图片
function showPreviousImage() {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    updateModalImage();
}

// 显示下一张图片
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    updateModalImage();
}

// 更新模态框图片
function updateModalImage() {
    const modalImage = document.getElementById('modalImage');
    const modalInfo = document.getElementById('modalInfo');

    if (allImages.length > 0) {
        const currentImage = allImages[currentImageIndex];
        modalImage.src = currentImage.src;
        modalImage.alt = currentImage.alt;

        // 更新信息
        modalInfo.innerHTML = `
                    <div>${currentImage.alt}</div>
                    <div>${currentImageIndex + 1} / ${allImages.length}</div>
                `;
    }
}

// 打开图片模态框
function openImageModal(imageIndex) {
    currentImageIndex = imageIndex;
    const modal = document.getElementById('imageModal');
    modal.style.display = 'block';
    updateModalImage();
}

// 收集所有图片
function collectAllImages() {
    allImages = [];
    const memoItems = document.querySelectorAll('.memo-item');

    memoItems.forEach(memoItem => {
        const images = memoItem.querySelectorAll('.attachment-image img');
        images.forEach(img => {
            allImages.push({
                src: img.src,
                alt: img.alt
            });
        });
    });
}

// 加载 memos.json 数据
async function loadMemosData() {

    const memoList = document.getElementById('memoList');

    try {
        const response = await fetch(MEMOS_JSON_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const memosData = await response.json();

        // 隐藏加载状态
        document.getElementById('loadingState').style.display = 'none';

        // 检查是否有 memos 数据
        if (memosData.memos && memosData.memos.length > 0) {
            // 按时间倒序排列
            const sortedMemos = memosData.memos.sort((a, b) =>
                new Date(b.createTime) - new Date(a.createTime)
            );

            // 渲染每个备忘录
            sortedMemos.forEach(memo => {
                const memoElement = createMemoElement(memo);
                memoList.appendChild(memoElement);
            });

            // 收集所有图片用于模态框导航
            collectAllImages();
        } else {
            memoList.innerHTML = '<div class="empty-state">暂无备忘录内容</div>';
        }
    } catch (error) {
        console.error('加载 memos 数据失败:', error);
        document.getElementById('loadingState').innerHTML =
            `<div class="error">
                        <p>加载备忘录数据失败</p>
                        <p>错误信息: ${error.message}</p>
                        <p>请检查 memos.json 文件路径是否正确</p>
                    </div>`;
    }
}

// 创建单个备忘录元素的函数
function createMemoElement(memo) {
    const memoItem = document.createElement('article');
    memoItem.className = 'memo-item';

    // 格式化日期
    const createDate = new Date(memo.createTime);
    const formattedDate = createDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 创建日期锚点（YYYY-MM-DD格式）
    const dateAnchor = createDate.toISOString().split('T')[0];

    // 处理内容
    let contentHtml = '';
    if (memo.nodes && memo.nodes.length > 0) {
        contentHtml = parseNodes(memo.nodes);
    } else {
        contentHtml = `<p>${memo.content || '无内容'}</p>`;
    }

    // 处理标签
    let tagsHtml = '';
    if (memo.tags && memo.tags.length > 0) {
        tagsHtml = memo.tags.map(tag =>
            `<span class="tag">${tag}</span>`
        ).join('');
    }

    // 处理附件
    let attachmentsHtml = '';
    if (memo.attachments && memo.attachments.length > 0) {
        attachmentsHtml = memo.attachments.map(attachment => {
            return createAttachmentElement(attachment);
        }).join('');
    }

    memoItem.innerHTML = `
                <a id="${dateAnchor}" class="memo-anchor"></a>
                <div class="memo-header">
                    <div class="memo-date">${formattedDate}</div>
                    <div class="memo-tags">${tagsHtml}</div>
                </div>
                <div class="memo-content">${contentHtml}</div>
                ${attachmentsHtml ? `<div class="memo-attachments">${attachmentsHtml}</div>` : ''}
            `;

    return memoItem;
}

// 创建附件元素
function createAttachmentElement(attachment) {
    if (!attachment.type) return '';

//    const fileSize = attachment.size ? formatFileSize(attachment.size) : '';
    const fileName = attachment.filename || '未命名文件';

    if (attachment.type.startsWith('image/')) {
        return `
                    <div class="attachment attachment-image" data-image-src="${attachment.filename}">
                        <img src="${MEMOS_FILE_URL}${attachment.filename}" alt="${fileName}" loading="lazy">
                    </div>
                `;
    } else if (attachment.type.startsWith('video/')) {
        return `
                    <div class="attachment attachment-video">
                        <video controls>
                            <source src="${MEMOS_FILE_URL}${attachment.filename}" type="${attachment.type}">
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                `;
    } else {
        // 其他文件类型
        return `
                    <div class="attachment">
                        <div style="padding: 15px; background: #f5f5f5; text-align: center;">
                            <p>${fileName}</p>
                            <p>${attachment.type}</p>

                        </div>
                    </div>
                `;
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (!bytes) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// 解析节点数据
function parseNodes(nodes) {
    let html = '';

    nodes.forEach(node => {
        switch (node.type) {
            case 'PARAGRAPH':
                if (node.paragraphNode && node.paragraphNode.children) {
                    html += '<p>' + parseChildren(node.paragraphNode.children) + '</p>';
                }
                break;
            case 'LINE_BREAK':
                html += '<br>';
                break;
            case 'CODE_BLOCK':
                if (node.codeBlockNode) {
                    html += `<pre><code>${node.codeBlockNode.content || ''}</code></pre>`;
                }
                break;
            default:
                // 其他节点类型
                break;
        }
    });

    return html;
}

// 解析子节点
function parseChildren(children) {
    let html = '';

    children.forEach(child => {
        switch (child.type) {
            case 'TEXT':
                if (child.textNode && child.textNode.content) {
                    html += child.textNode.content;
                }
                break;
            case 'BOLD':
                if (child.boldNode && child.boldNode.children) {
                    html += '<strong>' + parseChildren(child.boldNode.children) + '</strong>';
                }
                break;
            case 'ITALIC':
                if (child.italicNode && child.italicNode.children) {
                    html += '<em>' + parseChildren(child.italicNode.children) + '</em>';
                }
                break;
            case 'TAG':
                if (child.tagNode && child.tagNode.content) {
                    html += `<span class="tag">${child.tagNode.content}</span>`;
                }
                break;
            case 'AUTO_LINK':
                if (child.autoLinkNode && child.autoLinkNode.url) {
                    html += `<a href="${child.autoLinkNode.url}" target="_blank">${child.autoLinkNode.url}</a>`;
                }
                break;
            case 'LINE_BREAK':
                html += '<br>';
                break;
            default:
                // 其他子节点类型
                break;
        }
    });

    return html;
}

// 在文档加载完成后绑定图片点击事件
document.addEventListener('DOMContentLoaded', function () {
    // 使用事件委托来处理图片点击
    document.addEventListener('click', function (event) {
        // 检查点击的是否是图片附件
        if (event.target.closest('.attachment-image')) {
            const attachment = event.target.closest('.attachment-image');
            const img = attachment.querySelector('img');
            const src = img.src;
            const alt = img.alt;

            // 找到图片在所有图片中的索引
            const imageIndex = allImages.findIndex(image => image.src === src);
            if (imageIndex !== -1) {
                openImageModal(imageIndex);
            }
        }
    });
});