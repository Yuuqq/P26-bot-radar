/**
 * P26 协同水军雷达：网络科学重构
 * 实现了基于 ECharts 力导向图的水军拓扑模拟与过滤清洗
 */

const chartContainer = document.getElementById('chartContainer');
const valNodes = document.getElementById('valNodes');
const valEdges = document.getElementById('valEdges');
const statusEl = document.getElementById('status');

const paramTime = document.getElementById('paramTime');
const paramDegree = document.getElementById('paramDegree');
const valTimeThresh = document.getElementById('valTimeThresh');
const valDegreeThresh = document.getElementById('valDegreeThresh');

const btnRunFilter = document.getElementById('btnRunFilter');
const btnReset = document.getElementById('btnReset');

let chart = null;

// Graph Data
let fullNodes = [];
let fullEdges = [];
let currentNodes = [];
let currentEdges = [];

const COLOR_NORMAL = '#0f9d58';
const COLOR_BOT = '#ea4335';
const COLOR_TARGET = '#a142f4';

// === 数据生成器 (Mock Dataset Generation) ===
function generateNetwork() {
  fullNodes = [];
  fullEdges = [];

  // 1. 生成核心攻击目标 (Target Node - id: 0)
  fullNodes.push({ id: '0', category: 2, name: 'Target_News_Post', symbolSize: 30, itemStyle: { color: COLOR_TARGET }, originalType: 'target' });

  // 2. 生成 50 个普通人类用户 (Normal - ids 1-50)
  for (let i = 1; i <= 50; i++) {
    fullNodes.push({
      id: i.toString(),
      category: 0,
      name: `User_${i}`,
      symbolSize: Math.random() * 10 + 5,
      itemStyle: { color: COLOR_NORMAL },
      originalType: 'normal',
      outDegree: 0
    });
  }

  // 3. 生成 30 个水军账号 (Bots - ids 51-80)
  for (let i = 51; i <= 80; i++) {
    fullNodes.push({
      id: i.toString(),
      category: 1,
      name: `Bot_${i}`,
      symbolSize: Math.random() * 5 + 8, // Bots tend to look alike
      itemStyle: { color: COLOR_BOT },
      originalType: 'bot',
      outDegree: 0
    });
  }

  // 4. 生成普通用户的边 (Sparse, Random, Normal Time Deltas > 5000ms)
  for (let i = 1; i <= 50; i++) {
    // Some normal users interact with the target
    if (Math.random() > 0.6) {
      addEdge(i.toString(), '0', 5000 + Math.random() * 50000);
    }
    // Normal users interact with each other (small world)
    for (let j = 1; j <= 50; j++) {
      if (i !== j && Math.random() > 0.95) {
        addEdge(i.toString(), j.toString(), 3000 + Math.random() * 10000);
      }
    }
  }

  // 5. 生成水军的边 (Highly coordinated, Star/Dense topology, low Time Deltas < 500ms)
  // One or two controller bots (Centrality)
  const controllers = ['51', '52'];
  controllers.forEach(ctrl => {
    fullNodes.find(n => n.id === ctrl).symbolSize = 25; // Controller is big
  });

  for (let i = 51; i <= 80; i++) {
    const id = i.toString();
    // All bots heavily attack the target with highly coordinated time (timeDelta 10-200ms)
    addEdge(id, '0', 10 + Math.random() * 190);

    // Bots follow orders from controllers
    if (!controllers.includes(id)) {
      addEdge(controllers[0], id, 5 + Math.random() * 50); // Controller broadcasts commands
      // High density among bots
      for (let j = 51; j <= 80; j++) {
        if (i !== j && Math.random() > 0.8) {
          addEdge(id, j.toString(), Math.random() * 300);
        }
      }
    }
  }

  // 计算初始入出度 (为了过滤)
  // outDegree 已经在加边时累加
}

function addEdge(source, target, timeDelta) {
  fullEdges.push({
    source,
    target,
    timeDelta, // 自定义属性，代表协同时间差
    lineStyle: { width: timeDelta < 500 ? 1.5 : 0.5, opacity: 0.6 }
  });

  const sNode = fullNodes.find(n => n.id === source);
  if (sNode) sNode.outDegree = (sNode.outDegree || 0) + 1;
}

// === 可视化逻辑 ===
function initChart() {
  if (!chart && window.echarts) {
    chart = window.echarts.init(chartContainer);
  }
}

function renderGraph() {
  if (!chart) return;

  valNodes.textContent = currentNodes.length;
  valEdges.textContent = currentEdges.length;

  const option = {
    tooltip: {
      formatter: function (params) {
        if (params.dataType === 'node') {
          return `${params.data.name}<br/>出度/扩散范围: ${params.data.outDegree || 0}`;
        } else if (params.dataType === 'edge') {
          return `互动时间差: ${params.data.timeDelta.toFixed(0)} ms`;
        }
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: currentNodes,
        links: currentEdges,
        roam: true,
        label: { show: false },
        force: {
          repulsion: 100,
          edgeLength: 30
        },
        lineStyle: { color: 'source', curveness: 0.1 }
      }
    ]
  };

  chart.setOption(option);
}

// === 过滤清洗算法 (The Sandbox Mechanics) ===
function runFilter() {
  const timeTolerance = parseInt(paramTime.value);
  const degreeThreshold = parseInt(paramDegree.value);

  const flaggedEdges = new Set();
  const flaggedNodes = new Set();

  fullEdges.forEach(e => {
    if (e.timeDelta < timeTolerance) {
      flaggedEdges.add(e);
      if (e.source !== '0') flaggedNodes.add(e.source);
    }
  });

  fullNodes.forEach(n => {
    if (n.id !== '0' && n.outDegree > degreeThreshold) {
      flaggedNodes.add(n.id);
    }
  });

  let removedCount = 0;

  currentNodes = fullNodes.filter(n => {
    if (flaggedNodes.has(n.id)) {
      removedCount++;
      return false;
    }
    return true;
  });

  currentEdges = fullEdges.filter(e => {
    return !flaggedNodes.has(e.source) && !flaggedNodes.has(e.target);
  });

  renderGraph();

  if (removedCount > 0) {
    statusEl.textContent = `⚡ 成功识别并剥离 ${removedCount} 个高度协同的水军节点！`;
    statusEl.style.color = "var(--danger)";
  } else {
    statusEl.textContent = `清洗完成。当前规则下未触发新的水军警报。`;
    statusEl.style.color = "var(--text-muted)";
  }
}

// === Event Listeners ===
paramTime.addEventListener("input", e => valTimeThresh.textContent = e.target.value);
paramDegree.addEventListener("input", e => valDegreeThresh.textContent = e.target.value);

btnReset.addEventListener('click', () => {
  generateNetwork();
  currentNodes = JSON.parse(JSON.stringify(fullNodes));
  currentEdges = JSON.parse(JSON.stringify(fullEdges));
  renderGraph();
  statusEl.textContent = "关系网已重置 (真实网民 + 未清理的庞大水军群体)";
  statusEl.style.color = "var(--text-main)";
});

btnRunFilter.addEventListener('click', runFilter);

window.addEventListener('resize', () => {
  if (chart) chart.resize();
});

// App Entry Point - 改进的 ECharts 加载检测
function waitForECharts(maxAttempts = 10, interval = 300) {
  let attempts = 0;

  function check() {
    attempts++;
    if (window.echarts) {
      statusEl.textContent = "ECharts 加载完成，正在初始化...";
      initChart();
      btnReset.click(); // Initial generation
    } else if (attempts < maxAttempts) {
      statusEl.textContent = `正在加载 ECharts 图表库... (${attempts}/${maxAttempts})`;
      setTimeout(check, interval);
    } else {
      statusEl.textContent = "⚠️ ECharts 加载超时，请刷新页面重试。若问题持续，请检查网络连接。";
      statusEl.style.color = "var(--danger)";
    }
  }

  check();
}

waitForECharts();

// === PM Metrics Integration ===
(function () {
  try {
    if (!window.pmMetrics) return;
    let taskStarted = false;
    document.addEventListener('click', function (e) {
      if (taskStarted) return;
      const btn = e.target.closest('button, input');
      if (btn) {
        taskStarted = true;
        window.pmMetrics.markTaskStart('bot_network_task');
      }
    }, { once: false });
  } catch (_e) { }
})();
