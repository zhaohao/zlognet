/* Author : zhaohao.online */
/* Date : 2024-10-16 */
/* Update: 2024-10-24 */

function randomString(e) {
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

let verstring = "?" + randomString(8);

async function loadConfig() {
  try {
    const response = await fetch("config.json");
    const config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
}

async function generateHeatmapFromJSON() {
  const config = await loadConfig();
  if (!config) {
    return;
  }

  const jsonUrl = config.json_url + verstring;
  const startDate = new Date(config.start_date);
  const endDate = new Date(config.end_date);

  const { dateCounts, memos } = await fetchAndParseJSON(jsonUrl);
  generateHeatmap(dateCounts, startDate, endDate);
  displayJSONData(memos);
}

async function fetchAndParseJSON(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const memos = Array.isArray(data.memos) ? data.memos : [];
    const dateCounts = {};
    memos.forEach((item) => {
      var curTime = new Date(item.createTime);
      var addHour = curTime.setHours(curTime.getHours() + 8);
      //const dateStr = new Date(item.createTime).toISOString().split('T')[0];
      const dateStr = new Date(addHour).toISOString().split("T")[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    return { dateCounts, memos };
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
    return { dateCounts: {}, memos: [] };
  }
}

function generateHeatmap(dateCounts, startDate, endDate) {
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  let currentDate = new Date(startDate);
  let lastDate = new Date();
  //while (currentDate <= endDate) {
  while (currentDate <= lastDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthLabel = currentDate.toLocaleString("en-US", { month: "short" });

    const monthContainer = document.createElement("div");
    monthContainer.className = "month-container";

    const monthRow = document.createElement("div");
    monthRow.className = "month-row";

    const label = document.createElement("span");
    label.className = "month-label";
    label.textContent = `${monthLabel}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const count = dateCounts[dateStr] || 0;

      const cell = document.createElement("div");
      cell.className = "day";

      let color;
      if (count === 0) {
        color = "#ccc"; //'#ebedf0';
      } else if (count == 1) {
        color = "#c6e48b";
      } else if (count == 2) {
        color = "#7bb661";
      } else if (count == 3) {
        color = "#4c9f3d";
      } else {
        color = "#207a3e";
      }
      cell.style.backgroundColor = color;

      const dotLink = document.createElement("a");
      dotLink.setAttribute("style", "TEXT-DECORATION: none;");
      dotLink.href = "#" + dateStr;
      dotLink.textContent = "ㅤ";
      cell.appendChild(dotLink);

      cell.title = `${dateStr}: ${count} entries`;
      cell.addEventListener("mouseover", function (event) {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.opacity = 1;
        tooltip.style.left = `${event.pageX + 5}px`;
        tooltip.style.top = `${event.pageY - 28}px`;
        tooltip.innerText = `${dateStr}: ${count} entries`;
      });
      cell.addEventListener("mouseout", function () {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.opacity = 0;
      });

      monthRow.appendChild(cell);
    }

    monthContainer.appendChild(label);
    monthContainer.appendChild(monthRow);
    heatmap.appendChild(monthContainer);

    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }
}

async function displayJSONData(memos) {
  const config = await loadConfig();
  if (!config) {
    return;
  }

//  const memosUrl_new = config.memos_url_new + verstring;
//  const memosUrl_old = config.memos_url_old + verstring;
  const msiteUrl_new = config.memos_url_new;
  const msiteUrl_old = config.memos_url_old;

  const container = document.getElementById("json-data");
  container.innerHTML = "";

  memos.forEach((memo) => {
    const card = document.createElement("div");
    card.className = "card";

    const date = new Date(memo.createTime);
    const dateStr = date.toISOString().split("T")[0];
    const dateStrlong = date.toLocaleString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.textContent = `${date.toLocaleString("zh-CN", { hour12: false })}`;

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.textContent = memo.content || "No content available.";

    const cardLink = document.createElement("a");
    cardLink.setAttribute(
      "style",
      "TEXT-DECORATION: none;color:#555; font-size:10px; font-family:monospace;",
    );

    if(memo.uid) {
    cardLink.href = msiteUrl_old + "/m/" + memo.uid;
    cardLink.setAttribute("target", "_blank");
    cardLink.textContent = msiteUrl_old + "/m/" + memo.uid;
    }
    else {
    cardLink.href = msiteUrl_new + "/"+ memo.name;
    cardLink.setAttribute("target", "_blank");
    cardLink.textContent = msiteUrl_new + "/"+ memo.name;
    }

    const cardlinkDiv = document.createElement("div");
    cardlinkDiv.className = "card-link";
    cardlinkDiv.textContent = ``;
    cardlinkDiv.appendChild(cardLink);

    const cardaNamelink = document.createElement("a");
    cardaNamelink.name = dateStr;

    const cardFooter = document.createElement("div");
    cardFooter.className = "card-footer";
    cardFooter.textContent = `${date.toLocaleString()}`;

    const imgavatar = document.createElement("img");
    imgavatar.src = "/assets/profile-stardust-128.jpg";
    imgavatar.className = "imgavatarclass";

    const avatarLink = document.createElement("a");
    avatarLink.href = "https://zhaohao.online";
    avatarLink.setAttribute("target", "_blank");

    avatarLink.appendChild(imgavatar);

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "card-avatar";
    //avatarDiv.textContent = `${date.toLocaleString()}　`;
    avatarDiv.textContent = `${dateStrlong}　`;
    avatarDiv.appendChild(avatarLink);

    // Display resources if they exist
    if (memo.resources && memo.resources.length > 0) {
      const resourceList = document.createElement("div");
      resourceList.className = "resource-list";

      memo.resources.forEach((resource) => {
        const resourceItem = document.createElement("span");
        resourceItem.className = "resource-item";

        if (/\.(mp4|mpg|mkv|mp3)/i.test(resource.filename)) {
          const container = document.createElement("div");
          const medialink = "https://cloud.zlog.net/files/" + resource.filename;

          container.innerHTML = `
                   <video controls style="width: 96%; height: auto;">
                     <source src=${medialink} type="video/mp4">
                     您的浏览器不支持 HTML5 视频播放。
                   </video>
             `;
          resourceItem.appendChild(container);
        }

        //if (resource.type === "image/jpeg")
        if (/\.(jpeg|jpg|gif|png|bmp|webp|svg|avif)/i.test(resource.filename)) {
          const img = document.createElement("img");
          img.src = "https://keep.zlog.net/files/" + resource.filename;
          //img.src = memosUrl + '/file/' + resource.name + '/' + resource.filename;
          //img.setAttribute('data-fancybox', 'gallery');
          img.className = "imgclass";

          const fancyboxlink = document.createElement("a");
          //fancyboxlink.href = memosUrl + '/file/' + resource.name + '/' + resource.filename;
          fancyboxlink.href = "https://keep.zlog.net/files/" + resource.filename;
          fancyboxlink.setAttribute("data-fancybox", "gallery");
          fancyboxlink.target = "_blank";

          // 将 img 添加到 a 中
          fancyboxlink.appendChild(img);
          resourceItem.appendChild(fancyboxlink);
        } else {
          const rlink = document.createElement("a");
          //rlink.href = memosUrl + '/file/' + resource.name + '/' + resource.filename;
          rlink.href = "https://keep.zlog.net/files/" + resource.filename;
          rlink.textContent = resource.description || resource.filename;
          rlink.target = "_blank";
          resourceItem.appendChild(rlink);
        }

        resourceList.appendChild(resourceItem);
      });

      card.appendChild(resourceList);
    }

    const memolocation = document.createElement("div");
    memolocation.className = "card-location";
    if (memo.location) {
      memolocation.textContent = `${memo.location.placeholder}`;
    }

    card.appendChild(cardaNamelink);
    card.appendChild(cardlinkDiv);
    card.appendChild(cardContent);
    card.appendChild(cardHeader);
    card.appendChild(memolocation);
    //card.appendChild(cardFooter);
    card.appendChild(avatarDiv);

    container.appendChild(card);
  });
}

generateHeatmapFromJSON();
