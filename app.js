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

const COLOR_NEUTRAL = '#6E5B41';
const COLOR_TARGET = '#A2402F';

// === 数据生成器 (Mock Dataset Generation) ===
function generateNetwork() {
  fullNodes = [];
  fullEdges = [];

  // 1. 生成核心攻击目标 (Target Node - id: 0)
  fullNodes.push({ id: '0', category: 2, name: '目标帖', symbolSize: 30, itemStyle: { color: COLOR_TARGET }, originalType: 'target' });

  for (let i = 1; i <= 80; i++) {
    fullNodes.push({
      id: i.toString(),
      category: i <= 50 ? 0 : 1,
      name: `账号 ${i}`,
      symbolSize: 8 + Math.random() * 8,
      itemStyle: { color: COLOR_NEUTRAL },
      originalType: i <= 50 ? 'normal' : 'bot',
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
  for (let i = 1; i <= 5; i += 1) {
    addEdge(i.toString(), "0", 40 + Math.random() * 80);
  }

  // 5. 生成水军的边 (Highly coordinated, Star/Dense topology, low Time Deltas < 500ms)
  // One or two controller bots (Centrality)
  const controllers = ['51', '52'];
  controllers.forEach(ctrl => {
    fullNodes.find(n => n.id === ctrl).symbolSize = 18;
  });

  for (let i = 51; i <= 80; i++) {
    const id = i.toString();
    if (i >= 75) {
      addEdge(id, "0", 4000 + Math.random() * 8000);
      continue;
    }
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
  valNodes.textContent = String(currentNodes.length);
  valEdges.textContent = String(currentEdges.length);
  if (!chart) return;

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
  if (!chart) {
    statusEl.textContent = "图还没准备好，这次没有执行清洗。";
    return;
  }
  const timeTolerance = parseInt(paramTime.value, 10);
  const degreeThreshold = parseInt(paramDegree.value, 10);

  const flaggedNodes = new Set();

  fullEdges.forEach(e => {
    if (e.timeDelta < timeTolerance) {
      if (e.source !== '0') flaggedNodes.add(e.source);
    }
  });

  fullNodes.forEach(n => {
    if (n.id !== '0' && n.outDegree > degreeThreshold) {
      flaggedNodes.add(n.id);
    }
  });

  currentNodes = fullNodes.filter(n => !flaggedNodes.has(n.id));

  currentEdges = fullEdges.filter(e => {
    return !flaggedNodes.has(e.source) && !flaggedNodes.has(e.target);
  });

  renderGraph();

  let hit = 0;
  let falseAlarm = 0;
  let missed = 0;
  fullNodes.forEach((node) => {
    if (node.originalType === "target") return;
    const flagged = flaggedNodes.has(node.id);
    const bot = node.originalType === "bot";
    if (flagged && bot) hit += 1;
    else if (flagged) falseAlarm += 1;
    else if (bot) missed += 1;
  });
  const flaggedCount = hit + falseAlarm;
  const precision = flaggedCount ? hit / flaggedCount : 0;
  const recall = hit + missed ? hit / (hit + missed) : 0;
  statusEl.textContent = `合成数据。这条规则标出 ${flaggedCount} 个节点：命中水军 ${hit}，误伤普通账号 ${falseAlarm}，漏掉水军 ${missed}。精确率 ${(precision * 100).toFixed(0)}%，召回率 ${(recall * 100).toFixed(0)}%。`;
  statusEl.style.color = "var(--ink, var(--text-main))";
}

// === Event Listeners ===
paramTime.addEventListener("input", e => valTimeThresh.textContent = e.target.value);
paramDegree.addEventListener("input", e => valDegreeThresh.textContent = e.target.value);

btnReset.addEventListener('click', () => {
  generateNetwork();
  currentNodes = JSON.parse(JSON.stringify(fullNodes));
  currentEdges = JSON.parse(JSON.stringify(fullEdges));
  renderGraph();
  statusEl.textContent = "已重新生成合成网络。节点颜色相同，和隐藏标注的对照要等清洗之后。";
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
      statusEl.textContent = "图表库没有载入，清洗按钮已停用。请刷新后再试。";
      statusEl.style.color = "var(--danger)";
      btnRunFilter.disabled = true;
      btnReset.disabled = true;
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
