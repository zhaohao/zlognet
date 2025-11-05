/* filename: app.js */
/* author: zhao.im */
/* updatetime: 2024-12-10 */ 

function randomString(e) {    
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

let verstring = "?"+randomString(6);
let memostring ="memos.json"+verstring;

fetch(memostring)
  .then(response => response.json())
  .then(data => renderTimeline(data.memos))
  .catch(error => console.error("Load data error:", error));

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function renderTimeline(memos) {
  const timeline = document.getElementById('timeline');
  memos.forEach(memo => {
    const date = new Date(memo.createTime);
    const dateaStr = date.toISOString().split('T')[0];
    const post = document.createElement('div');
    post.className = 'post';

    const cardaNamelink = document.createElement("a");
    cardaNamelink.name = dateaStr;


        const imgavatar = document.createElement("img");
        imgavatar.src = "stardust.jpg";
        imgavatar.className = 'imgavatarclass';

        const avatarLink = document.createElement("a");
        avatarLink.href = "https://2025.zhao.im";
        avatarLink.setAttribute('target', '_blank');

        avatarLink.appendChild(imgavatar);

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "card-avatar";
        avatarDiv.textContent = ``;
        avatarDiv.appendChild(avatarLink);



    const content = document.createElement('div');
    content.className = 'post-content';
    content.textContent = memo.content;

    const time = document.createElement('div');
    time.className = 'post-time';
    time.textContent = formatDateTime(memo.createTime);
    
    const postfooter = document.createElement('div');
    postfooter.className = 'post-footer';
    postfooter.textContent =`${date.toLocaleString("en-us",{weekday: "long", year: "numeric", month: "long", day: "numeric"})}`;

    if (memo.attachments && memo.attachments.length > 0) {
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'media-container';
    
    memo.attachments.forEach(resource => {
      const fileExtension = resource.filename.split('.').pop().toLowerCase();
    
      if (['mp4', 'mpg', 'webm', 'ogg'].includes(fileExtension)) { // 如果是视频文件
        const video = document.createElement('video');
        video.src = `/files/${resource.filename}`;
        video.controls = true; // 添加播放控件
        video.className = 'video-container';
        mediaContainer.appendChild(video);
      } 
      else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'avif', 'webp'].includes(fileExtension)) { // 如果是图片文件
        const img = document.createElement('img');
        img.src = `/files/${resource.filename}`;
        img.setAttribute('data-fancybox', 'gallery');
        img.className = 'images-container';
        mediaContainer.appendChild(img);
      }
    });
    
    post.appendChild(mediaContainer);
    }
   
    const memolocation = document.createElement('div');
    memolocation.className = 'post-location';
    if (memo.location) {
        memolocation.textContent = `${memo.location.placeholder}`;
    }
    post.appendChild(cardaNamelink);
    post.appendChild(avatarDiv);
    post.appendChild(time);
    post.appendChild(content);
    post.appendChild(memolocation);
    post.appendChild(postfooter);
    
    timeline.appendChild(post);
  });
}
