async function loadConfig() {
    try {
        const response = await fetch('config.json');
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

    const jsonUrl = config.json_url;
    const startDate = new Date(config.start_date);
    const endDate = new Date(config.end_date);

    const { dateCounts, memos } = await fetchAndParseJSON(jsonUrl);
    generateHeatmap(dateCounts, startDate, endDate);
}

async function fetchAndParseJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const memos = Array.isArray(data.memos) ? data.memos : [];
        const dateCounts = {};
        memos.forEach(item => {

            var curTime = new Date(item.createTime);
            var addHour = curTime.setHours(curTime.getHours() + 8);
            //const dateStr = new Date(item.createTime).toISOString().split('T')[0];
            const dateStr = new Date(addHour).toISOString().split('T')[0];
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
        const monthLabel = currentDate.toLocaleString('en-US', { month: 'short' });

        const monthContainer = document.createElement("div");
        monthContainer.className = "month-container";

        const monthRow = document.createElement("div");
        monthRow.className = "month-row";

        const label = document.createElement("span");
        label.className = "month-label";
        label.textContent = `${monthLabel}`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = dateCounts[dateStr] || 0;

            const cell = document.createElement("div");
            cell.className = "day";

            let color;
            if (count === 0) {
                color = '#ccc'; //'#ebedf0';
            } else if (count == 1) {
                color = '#c6e48b';
            } else if (count == 2) {
                color = '#7bb661';
            } else if (count == 3) {
                color = '#4c9f3d';
            } else {
                color = '#207a3e';
            }
            cell.style.backgroundColor = color;

            const dotLink = document.createElement("a"); // 创建一个 <a> 标签并添加到 div 中
            dotLink.setAttribute("style", "TEXT-DECORATION: none;");
            dotLink.href = '#' + dateStr; // 设置链接的目标 URL
            dotLink.textContent = 'ㅤ'; // 设置链接的文本内容
            cell.appendChild(dotLink); // 将链接添加到 div 中

            cell.title = `${dateStr}: ${count} entries`;
            cell.addEventListener('mouseover', function (event) {
                const tooltip = document.getElementById("tooltip");
                tooltip.style.opacity = 1;
                tooltip.style.left = `${event.pageX + 5}px`;
                tooltip.style.top = `${event.pageY - 28}px`;
                tooltip.innerText = `${dateStr}: ${count} entries`;
            });
            cell.addEventListener('mouseout', function () {
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

generateHeatmapFromJSON();