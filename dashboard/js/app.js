// ============================================================================
// dashboard/js/app.js
// 台灣薪資背離、生活成本壓迫與人口死亡交叉大趨勢戰情室
// 包含：四大頂部動態概觀跳動球動畫 + 四大趨勢分頁 ECharts 視覺化邏輯（大字體高對比版）
// ============================================================================

let chartGrandCross, chartWage, chartTornado, chartGlobal;
let isTornadoPlaying = false;

// ----------------------------------------------------
// 頂部四大 KPI 數值滾動動畫 (0 ➔ 目標值)
// ----------------------------------------------------
function animateCounters() {
  const counters = [
    { id: 'stat-wage-ratio', target: 68.4, decimals: 1, prefix: '', suffix: '%' },
    { id: 'stat-real-wage', target: 1.2, decimals: 1, prefix: '+', suffix: '%' },
    { id: 'stat-housing-ratio', target: 3.8, decimals: 1, prefix: '', suffix: ' 倍' },
    { id: 'stat-tfr', target: 0.87, decimals: 2, prefix: '', suffix: '' }
  ];

  const duration = 1400;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    counters.forEach(c => {
      const el = document.getElementById(c.id);
      if (!el) return;
      const currentVal = (c.target * ease).toFixed(c.decimals);
      el.innerText = `${c.prefix}${currentVal}${c.suffix}`;
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ----------------------------------------------------
// Tab 分頁切換邏輯（配合深海藍頂部導覽列的高對比亮橘按鈕）
// ----------------------------------------------------
function switchTab(index) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('text-slate-950', 'bg-amber-400', 'border-amber-300', 'shadow-md', 'font-bold');
    btn.classList.add('text-slate-200', 'border-transparent', 'font-semibold');
  });

  const targetSection = document.getElementById(`tab-${index}`);
  if (targetSection) targetSection.classList.add('active');

  const activeBtn = document.getElementById(`tab-btn-${index}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-200', 'border-transparent', 'font-semibold');
    activeBtn.classList.add('text-slate-950', 'bg-amber-400', 'border-amber-300', 'shadow-md', 'font-bold');
  }

  setTimeout(() => {
    if (index === 0 && chartGrandCross) chartGrandCross.resize();
    if (index === 1 && chartWage) chartWage.resize();
    if (index === 2 && chartTornado) chartTornado.resize();
    if (index === 3 && chartGlobal) chartGlobal.resize();
  }, 80);
}

// ----------------------------------------------------
// 1. Tab 0：終局死亡交叉 (The Grand Cross 2000–2025)
// ----------------------------------------------------
function initGrandCross() {
  const dom = document.getElementById('chart-grand-cross');
  if (!dom) return;
  chartGrandCross = echarts.init(dom);

  const yearsMacro = ['2000', '2004', '2008', '2012', '2016', '2020', '2024/25'];

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textStyle: { color: '#f8fafc', fontSize: 14 }
    },
    legend: {
      data: ['實質成屋房價指數 (2000=100)', '實質中位數薪資指數 (2000=100)', '年出生人數 (萬人)', '年死亡人數 (萬人)'],
      bottom: 0,
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
      itemWidth: 28,
      itemHeight: 14
    },
    grid: { left: '7%', right: '7%', top: '12%', bottom: '16%' },
    xAxis: {
      type: 'category',
      data: yearsMacro,
      axisLine: { lineStyle: { color: '#64748b', width: 1.5 } },
      axisLabel: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' }
    },
    yAxis: [
      {
        type: 'value',
        name: '實質指數 (基準 2000=100)',
        min: 80,
        max: 340,
        nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
        axisLabel: { color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      {
        type: 'value',
        name: '人口數 (萬人)',
        min: 10,
        max: 35,
        nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
        axisLabel: { color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '實質成屋房價指數 (2000=100)',
        type: 'line',
        data: [100, 118, 162, 215, 235, 282, 318],
        itemStyle: { color: '#e11d48' },
        lineStyle: { width: 4 },
        symbolSize: 8,
        smooth: true
      },
      {
        name: '實質中位數薪資指數 (2000=100)',
        type: 'line',
        data: [100, 101.5, 99.8, 98.4, 100.8, 101.4, 101.2],
        itemStyle: { color: '#0284c7' },
        lineStyle: { width: 4 },
        symbolSize: 8,
        smooth: true
      },
      {
        name: '年出生人數 (萬人)',
        type: 'line',
        yAxisIndex: 1,
        data: [30.5, 21.6, 19.8, 22.9, 20.8, 16.5, 13.4],
        itemStyle: { color: '#334155' },
        lineStyle: { width: 3.5, type: 'dashed' },
        symbolSize: 8,
        smooth: true,
        markPoint: {
          symbolSize: 78,
          data: [
            {
              name: '死亡交叉',
              coord: ['2020', 16.5],
              value: '2020 死亡交叉\n(生不如死)',
              itemStyle: { color: '#be123c' },
              label: { fontSize: 12, fontWeight: 'bold', color: '#fff', lineHeight: 15 }
            }
          ]
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#e11d48', type: 'dotted', width: 2 },
          data: [{ xAxis: '2020', label: { formatter: '2020 人口自然負增長轉折', position: 'insideEndTop', color: '#be123c', fontSize: 13, fontWeight: 'bold' } }]
        }
      },
      {
        name: '年死亡人數 (萬人)',
        type: 'line',
        yAxisIndex: 1,
        data: [12.6, 13.5, 14.3, 15.4, 17.2, 17.3, 20.2],
        itemStyle: { color: '#64748b' },
        lineStyle: { width: 2.5, type: 'dotted' },
        symbolSize: 6,
        smooth: true
      }
    ]
  };

  chartGrandCross.setOption(option);
}

// ----------------------------------------------------
// 2. Tab 1：薪資大背離與購買力停滯 (Salary Disconnect)
// ----------------------------------------------------
function initWageDisconnect() {
  const dom = document.getElementById('chart-wage-disconnect');
  if (!dom) return;
  chartWage = echarts.init(dom);

  const wageYears = ['2005', '2008', '2011', '2014', '2017', '2020', '2023', '2025'];
  const avgWage = [39500, 41200, 43500, 46100, 49800, 54100, 57500, 59200];
  const medWage = [34000, 35100, 36200, 37800, 39500, 41500, 43800, 44600];
  const gapBand = avgWage.map((a, idx) => a - medWage[idx]);
  const realPurchasingLine = [37200, 36100, 36200, 36300, 36900, 37800, 37600, 37650];
  const ratioSeries = [86.0, 85.1, 83.2, 82.0, 79.3, 76.7, 76.1, 68.4];

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textStyle: { color: '#f8fafc', fontSize: 14 },
      formatter: params => {
        const idx = params[0].dataIndex;
        const yr = wageYears[idx];
        const avg = avgWage[idx].toLocaleString();
        const med = medWage[idx].toLocaleString();
        const gap = gapBand[idx].toLocaleString();
        const real = realPurchasingLine[idx].toLocaleString();
        const ratio = ratioSeries[idx];
        return `
          <div style="font-weight:800;font-size:15px;margin-bottom:6px;color:#fcd34d;">${yr} 年薪資與購買力結構</div>
          <div><span style="color:#f59e0b;">●</span> 名目平均總薪資：<b>NT$ ${avg}</b></div>
          <div><span style="color:#38bdf8;">●</span> 名目中位數薪資：<b>NT$ ${med}</b></div>
          <div><span style="color:#fb7185;">■</span> 體感貧窮區夾層差距：<b>NT$ ${gap} / 月</b></div>
          <div><span style="color:#34d399;">●</span> 扣除 CPI 實質購買力平減線：<b>NT$ ${real}</b></div>
          <div><span style="color:#f43f5e;">●</span> 中位數佔平均數比例：<b>${ratio}%</b></div>
        `;
      }
    },
    legend: {
      data: ['名目平均總薪資', '名目中位數薪資', '體感貧窮區 (平均與中位數夾層)', '扣除 CPI 實質購買力平減線', '中位數佔平均數比例 (%)'],
      bottom: 0,
      textStyle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' }
    },
    grid: { left: '8%', right: '7%', top: '12%', bottom: '16%' },
    xAxis: {
      type: 'category',
      data: wageYears,
      axisLine: { lineStyle: { color: '#64748b', width: 1.5 } },
      axisLabel: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' }
    },
    yAxis: [
      {
        type: 'value',
        name: '月薪 (NT$)',
        min: 28000,
        max: 64000,
        nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
        axisLabel: { color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      {
        type: 'value',
        name: '比例 (%)',
        min: 60,
        max: 95,
        nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
        axisLabel: { color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '_base_median',
        type: 'line',
        stack: 'poverty-gap',
        data: medWage,
        lineStyle: { opacity: 0 },
        symbol: 'none',
        silent: true,
        tooltip: { show: false }
      },
      {
        name: '體感貧窮區 (平均與中位數夾層)',
        type: 'line',
        stack: 'poverty-gap',
        data: gapBand,
        lineStyle: { opacity: 0 },
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(244, 63, 94, 0.35)' },
            { offset: 1, color: 'rgba(244, 63, 94, 0.10)' }
          ])
        },
        markPoint: {
          symbol: 'rect',
          symbolSize: [135, 30],
          data: [
            {
              coord: ['2020', 48500],
              value: '體感貧窮區擴大',
              itemStyle: { color: 'rgba(190, 18, 60, 0.92)' },
              label: { color: '#fff', fontSize: 13, fontWeight: 'bold' }
            }
          ]
        },
        smooth: true
      },
      {
        name: '名目平均總薪資',
        type: 'line',
        data: avgWage,
        itemStyle: { color: '#d97706' },
        lineStyle: { width: 4 },
        symbolSize: 8,
        smooth: true
      },
      {
        name: '名目中位數薪資',
        type: 'line',
        data: medWage,
        itemStyle: { color: '#0284c7' },
        lineStyle: { width: 4 },
        symbolSize: 8,
        smooth: true
      },
      {
        name: '扣除 CPI 實質購買力平減線',
        type: 'line',
        data: realPurchasingLine,
        itemStyle: { color: '#0f766e' },
        lineStyle: { width: 3.5, type: 'dashed' },
        symbolSize: 7,
        smooth: true
      },
      {
        name: '中位數佔平均數比例 (%)',
        type: 'line',
        yAxisIndex: 1,
        data: ratioSeries,
        itemStyle: { color: '#e11d48' },
        lineStyle: { width: 3, type: 'dotted' },
        symbolSize: 7
      }
    ]
  };

  chartWage.setOption(option);
}

// ----------------------------------------------------
// 3. Tab 2：年齡結構動態變形：龍捲風動態金字塔 (1990–2045)
// ----------------------------------------------------
function initPopulationTornado() {
  const dom = document.getElementById('chart-population-tornado');
  if (!dom) return;
  chartTornado = echarts.init(dom);

  const ageGroups = [
    '0-4', '5-9', '10-14', '15-19', '20-24', '25-29',
    '30-34', '35-39', '40-44', '45-49', '50-54', '55-59',
    '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95-99', '100+'
  ];
  const timelineYears = ['1990', '2000', '2010', '2020', '2025', '2035推估', '2045推估'];

  const medianAgeMeta = {
    '1990':     { age: 27.0, groupIdx: '25-29', shape: '穩固正金字塔' },
    '2000':     { age: 32.1, groupIdx: '30-34', shape: '標準鐘型過渡' },
    '2010':     { age: 37.4, groupIdx: '35-39', shape: '青壯中階膨脹' },
    '2020':     { age: 42.7, groupIdx: '40-44', shape: '少子化底座收縮' },
    '2025':     { age: 44.8, groupIdx: '40-44', shape: '洋蔥型劇烈凹陷' },
    '2035推估': { age: 51.2, groupIdx: '50-54', shape: '頭重腳輕失衡' },
    '2045推估': { age: 57.1, groupIdx: '55-59', shape: '懸空倒三角龍捲風' }
  };

  const pyramidData = {
    '1990': {
      male:   [-88, -95, -102, -108, -105, -98, -92, -84, -68, -52, -45, -40, -32, -25, -18, -12, -5.5, -2.0, -0.4, -0.08, -0.01],
      female: [ 82,  89,   96,  102,   99,  93,  87,  80,  64,  49,  43,  38,  30,  24,  18,  13,  7.0,  3.1,  0.8,  0.15,  0.03]
    },
    '2000': {
      male:   [-75, -82, -89, -98, -104, -102, -96, -91, -85, -67, -50, -42, -36, -28, -20, -14, -7.2, -3.2, -0.8, -0.15, -0.03],
      female: [ 70,  77,  84,  93,   98,   97,  91,  87,  81,  64,  48,  41,  35,  27,  21,  16,  9.0,  4.5,  1.3,  0.28,  0.06]
    },
    '2010': {
      male:   [-52, -58, -69, -80, -88, -97, -102, -100, -94, -89, -82, -64, -48, -38, -28, -18, -9.8, -4.6, -1.4, -0.25, -0.05],
      female: [ 48,  54,  65,  76,  83,  92,   98,   96,  90,  86,  79,  62,  47,  38,  29,  21, 12.2,  6.5,  2.4,  0.48,  0.10]
    },
    '2020': {
      male:   [-44, -48, -52, -59, -73, -83, -89, -96, -98, -92, -87, -81, -73, -56, -38, -24, -14.5, -7.5, -2.5, -0.45, -0.09],
      female: [ 41,  45,  49,  56,  68,  77,  83,  91,  94,  89,  85,  80,  74,  58,  41,  28,  18.5, 10.2,  3.8,  0.82,  0.18]
    },
    '2025': {
      male:   [-36, -42, -47, -51, -58, -71, -80, -87, -94, -96, -90, -85, -78, -68, -48, -31, -18.5, -9.8, -3.8, -0.75, -0.15],
      female: [ 34,  39,  44,  48,  54,  66,  75,  83,  90,  93,  88,  84,  79,  71,  52,  36,  24.0, 13.5,  5.5,  1.25,  0.28]
    },
    '2035推估': {
      male:   [-24, -28, -34, -40, -46, -50, -56, -69, -78, -85, -92, -93, -86, -78, -69, -48, -26.5, -13.2, -5.2, -1.10, -0.25],
      female: [ 22,  26,  32,  38,  43,  47,  53,  65,  74,  82,  89,  91,  86,  80,  73,  55,  34.0,  18.5,  7.8,  1.85,  0.45]
    },
    '2045推估': {
      male:   [-18, -20, -23, -27, -33, -39, -44, -49, -54, -66, -75, -82, -88, -85, -76, -65, -34.5, -18.2, -7.5, -1.60, -0.40],
      female: [ 16,  18,  21,  25,  31,  37,  42,  47,  52,  64,  72,  80,  87,  87,  81,  74,  44.5,  24.5, 11.2,  2.75,  0.72]
    }
  };

  const options = timelineYears.map(year => {
    const meta = medianAgeMeta[year];
    return {
      title: {
        text: `${year} 台灣人口金字塔（${meta.shape}）`,
        subtext: `年齡中位數：${meta.age} 歲 ｜ 單位：萬人（左：男性 / 右：女性，0 歲至 100+ 歲）`,
        left: 'center',
        top: 4,
        textStyle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
        subtextStyle: { fontSize: 14, fontWeight: 'bold', color: '#334155' }
      },
      series: [
        {
          name: '男性人口',
          type: 'bar',
          stack: 'total',
          data: pyramidData[year].male,
          itemStyle: { color: '#0284c7', borderRadius: [3, 0, 0, 3] },
          markLine: {
            symbol: ['none', 'none'],
            silent: true,
            lineStyle: { color: '#e11d48', width: 2.5, type: 'dashed' },
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: `▲ 年齡中位數標註線：${meta.age} 歲 (${meta.groupIdx}歲組)`,
              color: '#be123c',
              fontWeight: 'bold',
              fontSize: 13,
              backgroundColor: 'rgba(255,228,230,0.95)',
              padding: [4, 8],
              borderRadius: 4
            },
            data: [{ yAxis: meta.groupIdx }]
          }
        },
        {
          name: '女性人口',
          type: 'bar',
          stack: 'total',
          data: pyramidData[year].female,
          itemStyle: { color: '#ec4899', borderRadius: [0, 3, 3, 0] }
        }
      ]
    };
  });

  const baseOption = {
    timeline: {
      axisType: 'category',
      autoPlay: false,
      playInterval: 2000,
      currentIndex: 4,
      data: timelineYears,
      left: '8%',
      right: '8%',
      bottom: '2%',
      label: { color: '#0f172a', fontSize: 13, fontWeight: 'bold' },
      checkpointStyle: { color: '#0284c7', borderColor: '#bae6fd', symbolSize: 14 },
      controlStyle: { itemSize: 22, color: '#0284c7', borderColor: '#0284c7' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textStyle: { color: '#f8fafc', fontSize: 14 },
      formatter: params => {
        const age = params[0].name;
        const male = Math.abs(params[0].value);
        const female = params[1].value;
        return `
          <div style="font-weight:800;font-size:15px;margin-bottom:4px;color:#fcd34d;">年齡層：${age} 歲</div>
          <div><span style="color:#38bdf8;">■</span> 男性人口：<b>${male.toFixed(2)} 萬人</b></div>
          <div><span style="color:#f472b6;">■</span> 女性人口：<b>${female.toFixed(2)} 萬人</b></div>
          <div>合計：<b>${(male + female).toFixed(2)} 萬人</b></div>
        `;
      }
    },
    legend: {
      data: ['男性人口', '女性人口'],
      top: 54,
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' }
    },
    grid: { left: '10%', right: '10%', top: '18%', bottom: '16%' },
    xAxis: {
      type: 'value',
      name: '萬人',
      min: -120,
      max: 120,
      nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
      axisLabel: { formatter: val => Math.abs(val), color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
      splitLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'category',
      data: ageGroups,
      axisTick: { show: false },
      axisLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' }
    }
  };

  chartTornado.setOption({ baseOption, options });

  chartTornado.on('timelinechanged', params => {
    const activeYear = timelineYears[params.currentIndex];
    const meta = medianAgeMeta[activeYear];
    const displaySpan = document.getElementById('current-timeline-year');
    const medianSpan = document.getElementById('current-median-age');
    if (displaySpan) displaySpan.innerText = `${activeYear} 年`;
    if (medianSpan && meta) medianSpan.innerText = `${meta.age} 歲`;
  });

  chartTornado.on('timelineplaychanged', params => {
    isTornadoPlaying = params.playState;
    updatePlayBtnUI();
  });
}

function toggleTornadoPlay() {
  if (!chartTornado) return;
  isTornadoPlaying = !isTornadoPlaying;
  chartTornado.dispatchAction({
    type: 'timelinePlayChange',
    playState: isTornadoPlaying
  });
  updatePlayBtnUI();
}

function updatePlayBtnUI() {
  const btn = document.getElementById('btn-tornado-play');
  if (!btn) return;
  if (isTornadoPlaying) {
    btn.innerText = '⏸ 暫停動態演進';
    btn.classList.remove('bg-sky-600', 'hover:bg-sky-700');
    btn.classList.add('bg-rose-600', 'hover:bg-rose-700');
  } else {
    btn.innerText = '▶ 自動播放演進';
    btn.classList.remove('bg-rose-600', 'hover:bg-rose-700');
    btn.classList.add('bg-sky-600', 'hover:bg-sky-700');
  }
}

// ----------------------------------------------------
// 4. Tab 3：東亞掉速競技場：8 個代表經濟體生育率墜落對比 (2000–2025)
// ----------------------------------------------------
function initGlobalTFR() {
  const dom = document.getElementById('chart-global-tfr');
  if (!dom) return;
  chartGlobal = echarts.init(dom);

  const tfrYears = ['2000', '2005', '2010', '2015', '2020', '2024/25'];

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textStyle: { color: '#f8fafc', fontSize: 14 }
    },
    legend: {
      data: ['台灣 (焦點)', '韓國', '新加坡', '香港', '日本', '中國大陸', '美國', 'OECD平均'],
      bottom: 0,
      textStyle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' }
    },
    grid: { left: '7%', right: '7%', top: '12%', bottom: '16%' },
    xAxis: {
      type: 'category',
      data: tfrYears,
      axisLine: { lineStyle: { color: '#64748b', width: 1.5 } },
      axisLabel: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '總生育率 (TFR)',
      min: 0.5,
      max: 2.2,
      nameTextStyle: { color: '#0f172a', fontSize: 14, fontWeight: 'bold' },
      axisLabel: { color: '#1e293b', fontSize: 13, fontWeight: 'bold' },
      splitLine: { lineStyle: { type: 'dashed', color: '#cbd5e1' } }
    },
    series: [
      {
        name: '台灣 (焦點)',
        type: 'line',
        data: [1.68, 1.12, 0.90, 1.18, 0.99, 0.87],
        itemStyle: { color: '#e11d48' },
        lineStyle: { width: 4.5 },
        symbolSize: 9,
        smooth: true,
        z: 10,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#64748b', type: 'dotted', width: 2 },
          data: [
            { yAxis: 2.1, label: { formatter: '人口替代水準 (TFR = 2.1)', position: 'insideEndTop', color: '#334155', fontSize: 13, fontWeight: 'bold' } },
            { yAxis: 1.0, label: { formatter: '超低生育率警戒線 (TFR = 1.0)', position: 'insideEndBottom', color: '#be123c', fontSize: 13, fontWeight: 'bold' } }
          ]
        }
      },
      {
        name: '韓國',
        type: 'line',
        data: [1.48, 1.09, 1.23, 1.24, 0.84, 0.72],
        itemStyle: { color: '#7c3aed' },
        lineStyle: { width: 3.5 },
        symbolSize: 7,
        smooth: true
      },
      {
        name: '新加坡',
        type: 'line',
        data: [1.60, 1.26, 1.15, 1.24, 1.10, 0.97],
        itemStyle: { color: '#0891b2' },
        lineStyle: { width: 2.5, type: 'dashed' },
        symbolSize: 6,
        smooth: true
      },
      {
        name: '香港',
        type: 'line',
        data: [1.03, 0.96, 1.13, 1.20, 0.87, 0.75],
        itemStyle: { color: '#d97706' },
        lineStyle: { width: 2.5, type: 'dashed' },
        symbolSize: 6,
        smooth: true
      },
      {
        name: '日本',
        type: 'line',
        data: [1.36, 1.26, 1.39, 1.45, 1.33, 1.20],
        itemStyle: { color: '#475569' },
        lineStyle: { width: 3 },
        symbolSize: 7,
        smooth: true
      },
      {
        name: '中國大陸',
        type: 'line',
        data: [1.62, 1.61, 1.63, 1.67, 1.28, 1.00],
        itemStyle: { color: '#dc2626' },
        lineStyle: { width: 2.5 },
        symbolSize: 6,
        smooth: true
      },
      {
        name: '美國',
        type: 'line',
        data: [2.06, 2.05, 1.93, 1.84, 1.64, 1.62],
        itemStyle: { color: '#0284c7' },
        lineStyle: { width: 2.8, type: 'dotted' },
        symbolSize: 6,
        smooth: true
      },
      {
        name: 'OECD平均',
        type: 'line',
        data: [1.65, 1.63, 1.74, 1.68, 1.59, 1.50],
        itemStyle: { color: '#059669' },
        lineStyle: { width: 2.5, type: 'dotted' },
        symbolSize: 6,
        smooth: true
      }
    ]
  };

  chartGlobal.setOption(option);
}

// ----------------------------------------------------
// 啟動初始化與視窗自適應重繪
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initGrandCross();
  initWageDisconnect();
  initPopulationTornado();
  initGlobalTFR();

  window.addEventListener('resize', () => {
    if (chartGrandCross) chartGrandCross.resize();
    if (chartWage) chartWage.resize();
    if (chartTornado) chartTornado.resize();
    if (chartGlobal) chartGlobal.resize();
  });
});
