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
        minute: '2-digit',
        weekday: 'long'
    });

    const datastring = createDate.toLocaleDateString('en-us', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });



    // 创建日期锚点（YYYY-MM-DD格式）
    // UTC const dateAnchor = createDate.toISOString().split('T')[0];
    // LOC const dateAnchor = createDate.toLocaleDateString('en-CA'); 
    const lyear = createDate.getFullYear();
    const lmonth = String(createDate.getMonth() + 1).padStart(2, '0');
    const lday = String(createDate.getDate()).padStart(2, '0');

    const dateAnchor = `${lyear}-${lmonth}-${lday}`; 

    // 处理内容
    let contentHtml = '';


    if (memo.content && memo.content.length > 0) {
        contentHtml = formatContent(memo.content);
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
                <div class="memo-bottom-date">${datastring}</div>
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
                        <div class="attachment-info">
                            <span class="attachment-type">Photo</span>
                        </div>
                    </div>
                `;
    } else if (attachment.type.startsWith('video/')) {
        return `
                    <div class="attachment attachment-video">
                        <video controls>
                            <source src="${MEMOS_FILE_URL}${attachment.filename}" type="${attachment.type}">
                            您的浏览器不支持视频播放
                        </video>
                        <div class="attachment-info">
                            <span class="attachment-type">Video</span>
                        </div>
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

// 解析 content 节点的内容
function formatContent(content) {
    if (!content) return '';

    let formatted = content;

    // 0. 首先处理内容中的标签 #xyz
    // 使用更精确的正则表达式，避免匹配到其他地方的 #
    formatted = formatted.replace(/(^|\s)#([a-zA-Z0-9\u4e00-\u9fa5_-]+)(?=\s|$)/g,
        '$1<span class="tag" data-tag="$2">#$2</span>');

    // 1. 处理代码块 ```
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // 2. 处理行内代码 `
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 3. 处理标题
    formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 4. 处理粗体 ** ** 或 __ __
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 5. 处理斜体 * * 或 _ _
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');

    // 6. 处理删除线 ~~ ~~
    formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // 7. 处理引用块 >
    formatted = formatted.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // 8. 处理无序列表 * 或 -
    formatted = formatted.replace(/^\s*[\*\-] (.*$)/gim, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // 9. 处理有序列表 1. 2. 3.
    formatted = formatted.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

    // 10. 处理链接 [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 11. 处理图片 ![alt](src)
    formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />');

    // 12. 处理简单的表格（基本支持）
    formatted = formatted.replace(/^\|(.+)\|$/gim, function (match) {
        if (match.includes('---')) {
            return ''; // 跳过表头分隔线
        }
        return '<tr>' + match.split('|').slice(1, -1).map(cell =>
            `<td>${cell.trim()}</td>`
        ).join('') + '</tr>';
    });

    // 13. 包装表格
    formatted = formatted.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

    // 14. 处理换行（将两个换行转换为段落，单个换行转换为 <br>）
    formatted = formatted.replace(/\n\n+/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = '<p>' + formatted + '</p>';

    // 15. 清理空的段落
    formatted = formatted.replace(/<p><\/p>/g, '');
    formatted = formatted.replace(/<p><br><\/p>/g, '');

    return formatted;
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