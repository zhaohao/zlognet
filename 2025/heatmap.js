/* filename: heatmap.js */
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

// 导出一个函数供外部调用
async function generateHeatmapForPage(pageMemos) {
    const config = await loadConfig();
    if (!config) {
        return;
    }
    
    // 从当前页面的memos中提取日期
    const dateCounts = {};
    pageMemos.forEach(item => {
        var curTime = new Date(item.createTime);
        var addHour = curTime.setHours(curTime.getHours() + 8);
        const dateStr = new Date(addHour).toISOString().split('T')[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    // 获取当前页面memos的月份范围
    const dates = Object.keys(dateCounts);
    if (dates.length === 0) {
        generateEmptyHeatmap();
        return;
    }
    
    // 计算最小和最大日期
    const sortedDates = dates.sort();
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);
    
    // 生成热力图（仅显示有数据的月份）
    generateHeatmap(dateCounts, startDate, endDate);
}

// 生成空热力图
function generateEmptyHeatmap() {
    const heatmap = document.getElementById("heatmap");
    heatmap.innerHTML = '<div class="empty-heatmap">本月暂无备忘录</div>';
}

// 原始函数，用于初始化加载所有数据（可选保留）
async function generateHeatmapFromJSON() {
    const config = await loadConfig();
    if (!config) {
        return;
    }
    
    const jsonUrl = config.json_url + '?' + randomString(5);
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
    
    // 获取开始和结束月份
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    
    // 生成每个月的热力图
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const monthLabel = new Date(currentYear, currentMonth).toLocaleString('en-US', {
            month: 'short'
        });
        
        const monthContainer = document.createElement("div");
        monthContainer.className = "month-container";
        
        const label = document.createElement("span");
        label.className = "month-label";
        label.textContent = `${monthLabel}`;
        
        const monthRow = document.createElement("div");
        monthRow.className = "month-row";
        
        // 计算该月的天数
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // 生成该月每一天的格子
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = dateCounts[dateStr] || 0;

            const dotLink = document.createElement("a");
            dotLink.setAttribute("style", "TEXT-DECORATION: none;color: #fff;");
            dotLink.href = '#' + dateStr;
            dotLink.textContent = '';

            const cell = document.createElement("div");
            cell.className = "day";
            let color;
            
            if (count === 0) {
                color = '#ccc';
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

            dotLink.appendChild(cell);
            monthRow.appendChild(dotLink);
        }
        
        monthContainer.appendChild(label);
        monthContainer.appendChild(monthRow);
        heatmap.appendChild(monthContainer);
        
        // 移动到下一个月
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
}