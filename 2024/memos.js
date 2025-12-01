
let MEMOS_JSON_URL = null;
let MEMOS_FILE_URL = null;

async function init() {
    try {
        const res = await fetch("config.json");
        const config = await res.json();

        MEMOS_JSON_URL = config.json_url;
        MEMOS_FILE_URL = config.file_url;

        document.getElementById('dataSource').textContent = MEMOS_JSON_URL;

        loadMemosData();

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

let currentImageIndex = 0;
let allImages = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('dataSource').textContent = MEMOS_JSON_URL;
});

function setupModalEvents() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

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

    prevBtn.addEventListener('click', showPreviousImage);
    nextBtn.addEventListener('click', showNextImage);
}

function showPreviousImage() {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    updateModalImage();
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    updateModalImage();
}

function updateModalImage() {
    const modalImage = document.getElementById('modalImage');
    const modalInfo = document.getElementById('modalInfo');

    if (allImages.length > 0) {
        const currentImage = allImages[currentImageIndex];
        modalImage.src = currentImage.src;
        modalImage.alt = currentImage.alt;

        modalInfo.innerHTML = `
                    <div>${currentImage.alt}</div>
                    <div>${currentImageIndex + 1} / ${allImages.length}</div>
                `;
    }
}

function openImageModal(imageIndex) {
    currentImageIndex = imageIndex;
    const modal = document.getElementById('imageModal');
    modal.style.display = 'block';
    updateModalImage();
}

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

async function loadMemosData() {

    const memoList = document.getElementById('memoList');

    try {
        const response = await fetch(MEMOS_JSON_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const memosData = await response.json();

        document.getElementById('loadingState').style.display = 'none';

        if (memosData.memos && memosData.memos.length > 0) {

            const sortedMemos = memosData.memos.sort((a, b) =>
                new Date(b.createTime) - new Date(a.createTime)
            );

            sortedMemos.forEach(memo => {
                const memoElement = createMemoElement(memo);
                memoList.appendChild(memoElement);
            });

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

function createMemoElement(memo) {
    const memoItem = document.createElement('article');
    memoItem.className = 'memo-item';

    const createDate = new Date(memo.createTime);

    const datastring = createDate.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // UTC const dateAnchor = createDate.toISOString().split('T')[0];
    // LOC const dateAnchor = createDate.toLocaleDateString('en-CA'); 

    const weekday = createDate.toLocaleDateString('zh-CN', { weekday: 'long' });
    const y = createDate.getFullYear();
    const m = String(createDate.getMonth() + 1).padStart(2, '0');
    const d = String(createDate.getDate()).padStart(2, '0');
    const hh = String(createDate.getHours()).padStart(2, '0');
    const mm = String(createDate.getMinutes()).padStart(2, '0');

    const formattedDate = `${y}年${m}月${d}日${hh}点${mm}分 ${weekday}`;
    const dateAnchor = `${y}-${m}-${d}`;

    let contentHtml = '';
    if (memo.content && memo.content.length > 0) {
        contentHtml = formatContent(memo.content);
    } else {
        contentHtml = `<p>${memo.content || '无内容'}</p>`;
    }
    
    let locationHtml = '';
    if (memo.location && memo.location.placeholder.length > 0) {
        locationHtml = `<p>${memo.location.placeholder}</p>`;
    }

    let tagsHtml = '';
    if (memo.tags && memo.tags.length > 0) {
        tagsHtml = memo.tags.map(tag =>
            `<span class="tag">${tag}</span>`
        ).join('');
    }

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
                <div class="memo-bottom-date">${locationHtml}</div>
                <div class="memo-bottom-date">${datastring}</div>
            `;

    return memoItem;
}

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
                            <span>stardust</span>
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
                            <span>stardust</span>
                        </div>
                    </div>
                `;
    } else {

        return `
                    <div class="attachment">
                        <div style="padding: 15px; background: #f5f5f5; text-align: center;">
                            <p>${fileName}</p>
                            <p>${attachment.type}</p>
                            <p>stardust</p>
                        </div>
                    </div>
                `;
    }
}

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

function formatContent(content) {
    if (!content) return '';

    let formatted = content;

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

    // 10. 处理图片 ![alt](src)
    formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:50%;height:auto;" />');

    // 11. 处理链接 [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

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

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('click', function (event) {

        if (event.target.closest('.attachment-image')) {
            const attachment = event.target.closest('.attachment-image');
            const img = attachment.querySelector('img');
            const src = img.src;
            const alt = img.alt;

            const imageIndex = allImages.findIndex(image => image.src === src);
            if (imageIndex !== -1) {
                openImageModal(imageIndex);
            }
        }
    });
});

function randomString(e) {

    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}
let verstring = "?" + randomString(8);