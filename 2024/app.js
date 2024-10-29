fetch("memos.json")
  .then(response => response.json())
  .then(data => renderTimeline(data.memos))
  .catch(error => console.error("加载数据出错：", error));

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function renderTimeline(memos) {
  const timeline = document.getElementById('timeline');
  memos.forEach(memo => {
    //const date = new Date(memo.createTime);
    //const dateaStr = date.toISOString().split('T')[0];

    var curTime = new Date(item.createTime);
    var addHour = curTime.setHours(curTime.getHours() + 8);
    const dateaStr = new Date(addHour).toISOString().split('T')[0];

    const post = document.createElement('div');
    post.className = 'post';

    const cardaNamelink = document.createElement("a");
    cardaNamelink.name = dateaStr;

    const content = document.createElement('div');
    content.className = 'post-content';
    content.textContent = memo.content;

    const time = document.createElement('div');
    time.className = 'post-time';
    time.textContent = formatDateTime(memo.createTime);

    // 如果该memo包含多张图片，循环显示
    if (memo.resources && memo.resources.length > 0) {
      const imagesContainer = document.createElement('div');
      imagesContainer.className = 'images-container';
      
      memo.resources.forEach(resource => {
        const img = document.createElement('img');
        img.src = `https://zlog.net/files/${resource.filename}`; // 设置图片路径
        img.setAttribute('data-fancybox', 'gallery');
        imagesContainer.appendChild(img);
      });
      
      post.appendChild(imagesContainer);
    }

    post.appendChild(cardaNamelink);
    post.appendChild(time);
    post.appendChild(content);
  
    timeline.appendChild(post);
  });
}
