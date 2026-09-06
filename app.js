// P26 协同水军雷达 v2.0
  // 水军评分系统、账号详情面板、CSV导出、ECharts力导向图

  const chartContainer = document.getElementById("chartContainer");
  const valNodes = document.getElementById("valNodes");
  const valEdges = document.getElementById("valEdges");
  const statusEl = document.getElementById("status");
  const paramTime = document.getElementById("paramTime");
  const paramDegree = document.getElementById("paramDegree");
  const valTimeThresh = document.getElementById("valTimeThresh");
  const valDegreeThresh = document.getElementById("valDegreeThresh");
  const btnRunFilter = document.getElementById("btnRunFilter");
  const btnGenerate = document.getElementById("btnGenerate");
  const btnExport = document.getElementById("btnExport");
  const detailPanel = document.getElementById("detailPanel");

  let currentChart = null;
  let lastData = null;
  let lastFiltered = null;

  function setStatus(t) { if (statusEl) statusEl.textContent = "状态: " + t; }

  const BOT_INDICATORS = [
    "注册<7天","无头像","无个人简介","每日发帖>50条",
    "发帖时间高度均匀","内容复制率>80%","账号互粉率>90%","关键词命中>3个",
  ];

  function generateNetwork(nodeCount, edgeMult) {
    const nodes = [];
    const edges = [];
    const botCount = Math.round(nodeCount * 0.35);

    for (let i = 0; i < nodeCount; i++) {
      const isBot = i < botCount;
      const botScore = isBot ? 65 + Math.round(Math.random() * 35) : Math.round(Math.random() * 40);
      nodes.push({
        id: i,
        name: (isBot ? "🤖" : "👤") + " U" + String(i + 1).padStart(3, "0"),
        isBot: isBot,
        botScore: botScore,
        regDaysAgo: isBot ? Math.round(Math.random() * 14) : 100 + Math.round(Math.random() * 900),
        postPerDay: isBot ? 30 + Math.round(Math.random() * 80) : Math.round(Math.random() * 18),
        timeVariance: isBot ? (0.1 + Math.random() * 0.25) : (0.5 + Math.random() * 0.5),
        indicators: BOT_INDICATORS.filter(() => isBot && Math.random() < 0.55),
      });
    }

    const targetEdges = Math.round(nodeCount * edgeMult);
    const edgeSet = new Set();
    let attempts = 0;
    while (edges.length < targetEdges && attempts < targetEdges * 10) {
      attempts++;
      let src, tgt;
      if (Math.random() < 0.55 && botCount > 1) {
        src = Math.floor(Math.random() * botCount);
        tgt = Math.floor(Math.random() * botCount);
      } else {
        src = Math.floor(Math.random() * nodeCount);
        tgt = Math.floor(Math.random() * nodeCount);
      }
      if (src === tgt) continue;
      const key = Math.min(src, tgt) + "-" + Math.max(src, tgt);
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source: src, target: tgt, timeDelta: Math.random() * 300 });
    }
    return { nodes, edges };
  }

  function filterBots(data, timeThresh, degreeThresh) {
    const degree = {};
    data.edges.forEach(e => {
      degree[e.source] = (degree[e.source] || 0) + 1;
      degree[e.target] = (degree[e.target] || 0) + 1;
    });
    const suspectEdges = data.edges.filter(e => e.timeDelta <= timeThresh);
    const suspectNodeIds = new Set();
    suspectEdges.forEach(e => {
      if ((degree[e.source] || 0) >= degreeThresh) suspectNodeIds.add(e.source);
      if ((degree[e.target] || 0) >= degreeThresh) suspectNodeIds.add(e.target);
    });
    return { suspectNodeIds, suspectEdges, degree };
  }

  function renderChart(data, filtered) {
    if (!window.echarts || !chartContainer) { setStatus("ECharts 未加载"); return; }
    if (currentChart) currentChart.dispose();
    currentChart = window.echarts.init(chartContainer, null, { renderer: "canvas" });
    const { suspectNodeIds, degree } = filtered;
    const eNodes = data.nodes.map(n => ({
      id: n.id, name: n.name,
      symbolSize: Math.min(40, 10 + (degree[n.id] || 0) * 3),
      itemStyle: {
        color: suspectNodeIds.has(n.id) ? "#ef4444" : n.isBot ? "#f97316" : "#3b82f6",
        borderColor: suspectNodeIds.has(n.id) ? "#7f1d1d" : "#1d4ed8",
        borderWidth: suspectNodeIds.has(n.id) ? 2 : 0,
      },
    }));
    const eEdges = data.edges.map(e => ({
      source: e.source, target: e.target,
      lineStyle: {
        color: filtered.suspectEdges.includes(e) ? "#ef4444" : "#94a3b8",
        opacity: filtered.suspectEdges.includes(e) ? 0.8 : 0.3,
        width: filtered.suspectEdges.includes(e) ? 2 : 1,
      },
    }));
    currentChart.setOption({
      backgroundColor: "transparent",
      tooltip: { trigger: "item" },
      series: [{ type: "graph", layout: "force", data: eNodes, edges: eEdges, roam: true,
        force: { repulsion: 200, edgeLength: [60, 120] }, label: { show: false },
        emphasis: { focus: "adjacency" } }],
    });
    currentChart.on("click", function(params) {
      if (params.dataType === "node") showDetail(data.nodes[params.dataIndex], suspectNodeIds.has(data.nodes[params.dataIndex].id));
    });
  }

  function showDetail(node, isSuspect) {
    if (!detailPanel) return;
    detailPanel.style.display = "";
    detailPanel.innerHTML =
      "<h3 style='margin:0 0 8px'>" + node.name + (isSuspect ? ' <span style="color:#ef4444">⚠ 疑似水军</span>' : "") + "</h3>" +
      "<div class='detail-grid'>" +
      "<span class='dk'>水军评分</span><span class='dv' style='color:" + (node.botScore > 60 ? "#ef4444" : "#16a34a") + "'>" + node.botScore + "%</span>" +
      "<span class='dk'>注册天前</span><span class='dv'>" + node.regDaysAgo + " 天</span>" +
      "<span class='dk'>日发帖</span><span class='dv'>" + node.postPerDay + " 条</span>" +
      "<span class='dk'>时间均匀</span><span class='dv'>" + (node.timeVariance < 0.35 ? "⚠ 可疑" : "正常") + "</span>" +
      "</div>" +
      (node.indicators.length ? "<div style='margin-top:8px;font-size:.8rem'><strong>命中特征：</strong>" + node.indicators.join("、") + "</div>" : "") +
      "<button type='button' onclick=「this.parentElement.style.display='none'」 style='margin-top:10px;padding:4px 12px;border:1px solid #ddd;border-radius:8px;cursor:pointer'>关闭</button>";
  }

  function runSimulation() {
    const nodeCount = Math.min(120, Math.max(20, parseInt(valNodes && valNodes.value) || 60));
    lastData = generateNetwork(nodeCount, 2);
    if (valEdges) valEdges.textContent = lastData.edges.length;
    const timeT = parseInt(paramTime && paramTime.value || "60");
    const degT = parseInt(paramDegree && paramDegree.value || "3");
    if (valTimeThresh) valTimeThresh.textContent = timeT + "s";
    if (valDegreeThresh) valDegreeThresh.textContent = degT;
    lastFiltered = filterBots(lastData, timeT, degT);
    renderChart(lastData, lastFiltered);
    const botCount = lastData.nodes.filter(n => n.isBot).length;
    setStatus("模拟 " + nodeCount + " 账号 · 过滤发现 " + lastFiltered.suspectNodeIds.size + " 可疑节点（实际水军 " + botCount + " 个）");
  }

  function runFilter() {
    if (!lastData) { runSimulation(); return; }
    const timeT = parseInt(paramTime && paramTime.value || "60");
    const degT = parseInt(paramDegree && paramDegree.value || "3");
    if (valTimeThresh) valTimeThresh.textContent = timeT + "s";
    if (valDegreeThresh) valDegreeThresh.textContent = degT;
    lastFiltered = filterBots(lastData, timeT, degT);
    renderChart(lastData, lastFiltered);
    setStatus("过滤完成，发现 " + lastFiltered.suspectNodeIds.size + " 个可疑账号");
  }

  function exportCsv() {
    if (!lastData) { setStatus("请先生成网络"); return; }
    const { suspectNodeIds } = lastFiltered || { suspectNodeIds: new Set() };
    const rows = ["账号,水军评分,注册天前,日发帖量,时间均匀,是否可疑"];
    lastData.nodes.forEach(n => {
      rows.push([n.name, n.botScore, n.regDaysAgo, n.postPerDay, n.timeVariance < 0.35 ? "是" : "否", suspectNodeIds.has(n.id) ? "是" : "否"].join(","));
    });
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bot-radar.csv"; a.click();
    URL.revokeObjectURL(url);
    setStatus("已导出 CSV");
  }

  if (paramTime) paramTime.addEventListener("input", function() { if (valTimeThresh) valTimeThresh.textContent = paramTime.value + "s"; });
  if (paramDegree) paramDegree.addEventListener("input", function() { if (valDegreeThresh) valDegreeThresh.textContent = paramDegree.value; });
  if (btnGenerate) btnGenerate.addEventListener("click", runSimulation);
  if (btnRunFilter) btnRunFilter.addEventListener("click", runFilter);
  if (btnExport) btnExport.addEventListener("click", exportCsv);

  (function() {
    if (window.echarts) { runSimulation(); return; }
    const s = document.createElement("script");
    s.src = "../shared/vendor/echarts.min.js";
    s.onerror = function () {
      var t = document.createElement("script");
      t.src = "https://yuuqq.github.io/shared/vendor/echarts.min.js";
      t.onload = function() { runSimulation(); };
      t.onerror = function() { setStatus("ECharts 加载失败，请检查网络"); };
      document.head.appendChild(t);
    };
    s.onload = function() { runSimulation(); };
    s.onerror = function() { setStatus("ECharts 加载失败，请检查网络"); };
    document.head.appendChild(s);
  })();
  