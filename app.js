// Pinyin to Zhuyin (Bopomofo) mapping dictionaries
const initials = {
  b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ',
  d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ',
  g: 'ㄍ', k: 'ㄎ', h: 'ㄏ',
  j: 'ㄐ', q: 'ㄑ', x: 'ㄒ',
  zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ',
  z: 'ㄗ', c: 'ㄘ', s: 'ㄙ'
};

const finals = {
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ',
  ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ',
  an: 'ㄢ', ang: 'ㄤ', en: 'ㄣ', eng: 'ㄥ', er: 'ㄦ',
  u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ',
  uan: 'ㄨㄢ', uang: 'ㄨㄤ', un: 'ㄨㄣ', ueng: 'ㄨㄥ', ong: 'ㄨㄥ',
  i: 'ㄧ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iao: 'ㄧㄠ', iu: 'ㄧㄡ',
  ian: 'ㄧㄢ', iang: 'ㄧㄤ', in: 'ㄧㄣ', ing: 'ㄧㄥ',
  ü: 'ㄩ', üe: 'ㄩㄝ', ue: 'ㄩㄝ', üan: 'ㄩㄢ', ün: 'ㄩㄣ', iong: 'ㄩㄥ'
};

const individuals = {
  zhi: 'ㄓ', chi: 'ㄔ', shi: 'ㄕ', ri: 'ㄖ',
  zi: 'ㄗ', ci: 'ㄘ', si: 'ㄙ',
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ',
  ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ',
  an: 'ㄢ', ang: 'ㄤ', en: 'ㄣ', eng: 'ㄥ', er: 'ㄦ', r: 'ㄦ',
  wu: 'ㄨ', wa: 'ㄨㄚ', wo: 'ㄨㄛ', wai: 'ㄨㄞ', wei: 'ㄨㄟ',
  wan: 'ㄨㄢ', wang: 'ㄨㄤ', wen: 'ㄨㄣ', weng: 'ㄨㄥ',
  yi: 'ㄧ', ya: 'ㄧㄚ', ye: 'ㄧㄝ', yao: 'ㄧㄠ', you: 'ㄧㄡ',
  yan: 'ㄧㄢ', yang: 'ㄧㄤ', yin: 'ㄧㄣ', ying: 'ㄧㄥ',
  yu: 'ㄩ', yue: 'ㄩㄝ', yuan: 'ㄩㄢ', yun: 'ㄩㄣ', yong: 'ㄩㄥ'
};

// Conversions for Tone Numbers to standard Zhuyin Tone symbols
const toneSymbols = {
  1: '',
  2: 'ˊ',
  3: 'ˇ',
  4: 'ˋ',
  5: '˙'
};

// Convert a Pinyin syllable (like 'zhao4' or 'men5') to Zhuyin parts
function pinyinToZhuyin(pinyinStr) {
  if (!pinyinStr) return { symbols: [], tone: 1 };
  
  let tone = 1;
  let syllable = pinyinStr.toLowerCase().trim();
  
  // Extract tone number if present
  const lastChar = syllable.slice(-1);
  if (/[1-5]/.test(lastChar)) {
    tone = parseInt(lastChar, 10);
    syllable = syllable.slice(0, -1);
  }
  
  // Clean special characters (like v to ü)
  syllable = syllable.replace('v', 'ü');
  
  let zhuyinStr = '';
  if (individuals[syllable]) {
    zhuyinStr = individuals[syllable];
  } else {
    let initial = '';
    let final = syllable;
    
    // Check 2-character initials
    if (syllable.startsWith('zh') || syllable.startsWith('ch') || syllable.startsWith('sh')) {
      initial = syllable.slice(0, 2);
      final = syllable.slice(2);
    } else {
      // Check 1-character initials
      const first = syllable.charAt(0);
      if (initials[first]) {
        initial = first;
        final = syllable.slice(1);
      }
    }
    
    const initSymbol = initials[initial] || '';
    const finalSymbol = finals[final] || '';
    zhuyinStr = initSymbol + finalSymbol;
  }
  
  return {
    symbols: zhuyinStr.split(''),
    tone: tone
  };
}

// State variables
let charactersData = []; // Array of { char, isChinese, pinyin, options: [], zhuyin: { symbols: [], tone: 1 } }
let selectedCharIndex = null;

// DOM Elements
const textInput = document.getElementById('text-input');
const pagesContainer = document.getElementById('pages-container');

// Configurations
const config = {
  layoutMode: 'zhuyin-only', // 'zhuyin-only', 'hanzi-zhuyin', or 'textbook-10x6'
  showHanzi: true, // true = Show Hanzi in Square
  fillMode: 'char-row', // 'char-row' (one char per row/col) or 'continuous' (grid flow)
  writingDirection: 'vertical', // 'vertical' (right-to-left columns) or 'horizontal' (row-by-row)
  gridType: 'tian', // 'tian' (田字格) or 'mi' (米字格)
  gridColor: '#388e3c', // default green for schoolbook sheet
  gridSize: 70, // grid box size in pixels
  traceCount: 3, // Number of gray tracing grids in single-char column practice (0 to 11)
  lineConfig: {
    prompt: 1,
    trace: 3,
    empty: 5
  }
};

// Initialize listeners and setup
window.addEventListener('DOMContentLoaded', () => {
  setupListeners();
  updatePanelVisibility();
  triggerConversion();
});

function updatePanelVisibility() {
  const isCharRow = config.fillMode === 'char-row';

  const toggleShowHanzi = document.querySelector('.toggle-show-hanzi');
  const toggleFill = document.querySelector('.toggle-fill-mode');
  const toggleDir = document.querySelector('.toggle-writing-dir');
  const toggleTrace = document.querySelector('.toggle-trace-count');
  const colorPicker = document.querySelector('.toggle-grid-color');

  if (toggleShowHanzi) toggleShowHanzi.style.display = (config.layoutMode !== 'zhuyin-only') ? 'block' : 'none';
  if (colorPicker) colorPicker.style.display = (config.layoutMode === 'zhuyin-only') ? 'block' : 'none';
  if (toggleFill) toggleFill.style.display = 'block';

  if (isCharRow) {
    if (toggleDir) toggleDir.style.display = 'none';
    if (toggleTrace) toggleTrace.style.display = 'block';
  } else {
    if (toggleDir) toggleDir.style.display = 'block';
    if (toggleTrace) toggleTrace.style.display = 'none';
  }
}

function setupListeners() {
  textInput.addEventListener('input', triggerConversion);
  
  // Layout Modes
  document.querySelectorAll('input[name="layout-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      config.layoutMode = e.target.value;
      if (config.layoutMode !== 'zhuyin-only') {
        config.gridColor = '#388e3c'; // Force green for school sheet
      }
      updatePanelVisibility();
      renderWorksheet();
    });
  });

  // Show Hanzi
  document.querySelectorAll('input[name="show-hanzi"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      config.showHanzi = e.target.value === 'yes';
      renderWorksheet();
    });
  });

  // Fill Modes
  document.querySelectorAll('input[name="fill-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      config.fillMode = e.target.value;
      updatePanelVisibility();
      renderWorksheet();
    });
  });

  // Writing Direction
  document.querySelectorAll('input[name="writing-direction"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      config.writingDirection = e.target.value;
      renderWorksheet();
    });
  });

  // Trace count (0-11) slider & number input
  const traceSlider = document.getElementById('trace-count-slider');
  const traceNum = document.getElementById('trace-count-num');
  const traceValSpan = document.getElementById('trace-count-val');

  if (traceSlider && traceNum) {
    const updateTraceCount = (val) => {
      let num = parseInt(val, 10);
      if (isNaN(num)) num = 0;
      num = Math.max(0, Math.min(11, num));
      config.traceCount = num;
      traceSlider.value = num;
      traceNum.value = num;
      if (traceValSpan) traceValSpan.textContent = `${num}格`;
      renderWorksheet();
    };

    traceSlider.addEventListener('input', (e) => updateTraceCount(e.target.value));
    traceNum.addEventListener('input', (e) => updateTraceCount(e.target.value));
  }

  // Grid Types
  document.querySelectorAll('input[name="grid-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      config.gridType = e.target.value;
      renderWorksheet();
    });
  });

  // Grid Colors (for Bopomofo-only mode)
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      config.gridColor = e.currentTarget.dataset.color;
      renderWorksheet();
    });
  });

  // Grid Size Slider
  const sizeSlider = document.getElementById('grid-size');
  const sizeValue = document.getElementById('grid-size-val');
  sizeSlider.addEventListener('input', (e) => {
    config.gridSize = parseInt(e.target.value, 10);
    sizeValue.textContent = `${config.gridSize}px`;
    renderWorksheet();
  });

  // Practice Grid Line configuration listener removed since line configuration inputs were deleted

  // Print button
  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });

  // Modal Setup
  const modal = document.getElementById('edit-modal');
  const closeModal = document.querySelector('.close-modal');
  const saveBtn = document.getElementById('btn-save-edit');
  
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  saveBtn.addEventListener('click', saveManualEdit);
}

// Parse Bopomofo input tokens (e.g. "ㄒㄧㄠ", "ㄉㄚˋ", "ㄅ", "˙ㄇㄣ")
function parseBopomofoToken(tokenStr) {
  let tone = 1;
  let cleanStr = tokenStr.trim();
  
  // Replace Chinese character '一' (U+4e00) with Bopomofo 'ㄧ' (\u3127)
  cleanStr = cleanStr.replace(/一/g, '\u3127');
  
  // 1. Check neutral tone at the start (˙ - \u02d9)
  if (cleanStr.startsWith('\u02d9') || cleanStr.startsWith('5')) {
    tone = 5;
    cleanStr = cleanStr.slice(1);
  }
  
  // 2. Check tone mark or number at the end
  const lastChar = cleanStr.slice(-1);
  if (lastChar === '\u02ca' || lastChar === '2') {
    tone = 2;
    cleanStr = cleanStr.slice(0, -1);
  } else if (lastChar === '\u02c7' || lastChar === '3') {
    tone = 3;
    cleanStr = cleanStr.slice(0, -1);
  } else if (lastChar === '\u02cb' || lastChar === '4') {
    tone = 4;
    cleanStr = cleanStr.slice(0, -1);
  } else if (lastChar === '\u02d9' || lastChar === '5') {
    tone = 5;
    cleanStr = cleanStr.slice(0, -1);
  } else if (lastChar === '1') {
    tone = 1;
    cleanStr = cleanStr.slice(0, -1);
  }
  
  // Keep only standard Bopomofo letters (\u3105 to \u3129)
  const symbols = cleanStr.split('').filter(char => {
    return /[\u3105-\u3129]/.test(char);
  });
  
  return {
    symbols: symbols,
    tone: tone
  };
}

// Triggers conversion of the typed text
function triggerConversion() {
  const text = textInput.value;
  if (!text) {
    charactersData = [];
    renderWorksheet();
    return;
  }

  // Ensure pinyinPro is loaded
  if (!window.pinyinPro) {
    console.error('pinyin-pro is not loaded.');
    return;
  }

  const { pinyin } = window.pinyinPro;
  charactersData = [];

  // Match Bopomofo syllable tokens (optional neutral tone, 1-3 bopomofo letters, optional tone symbol/number)
  // Unicode range: Bopomofo \u3105-\u3129, Chinese '一' \u4e00, tones \u02ca\u02c7\u02cb\u02d9
  const bopomofoRegex = /^([\u02d9]?[\u3105-\u3129\u4e00]{1,3}[\u02ca\u02c7\u02cb\u02d91-5]?)/;

  let i = 0;
  while (i < text.length) {
    const remaining = text.slice(i);
    
    // 1. Match Bopomofo token (must contain at least one standard Bopomofo character \u3105-\u3129)
    const bopomofoMatch = remaining.match(bopomofoRegex);
    if (bopomofoMatch) {
      const tokenStr = bopomofoMatch[1];
      if (/[\u3105-\u3129]/.test(tokenStr)) {
        const parsed = parseBopomofoToken(tokenStr);
        
        charactersData.push({
          char: '', // empty Chinese character
          isChinese: true, // Grid-ready
          isBopomofoInput: true,
          pinyin: 'custom',
          options: [tokenStr],
          zhuyin: parsed
        });
        
        i += tokenStr.length;
        continue;
      }
    }
    
    const char = text[i];
    
    // 2. Match Chinese Character (Hanzi)
    if (/[\u4e00-\u9fa5]/.test(char)) {
      const pinyinVal = pinyin(char, { toneType: 'num' }) || '';
      const rawOptions = pinyin(char, { multiple: true, type: 'array', toneType: 'num' }) || [pinyinVal];
      const options = Array.from(new Set(rawOptions.filter(o => o)));
      
      charactersData.push({
        char: char,
        isChinese: true,
        isBopomofoInput: false,
        pinyin: pinyinVal,
        options: options,
        zhuyin: pinyinToZhuyin(pinyinVal)
      });
      
      i++;
      continue;
    }
    
    // 3. Match Whitespace & Newlines & Punctuations
    charactersData.push({
      char: char,
      isChinese: false,
      pinyin: '',
      options: [],
      zhuyin: null
    });
    i++;
  }
  
  renderWorksheet();
}

// Generate cell coordinates map for Vertical Flow
function getVerticalIndexMap(numCols, numRows) {
  const map = [];
  const halfRows = numRows / 2;
  // Top half: rows 0 to (halfRows - 1), columns (numCols - 1) down to 0 (right-to-left vertical flow)
  for (let col = numCols - 1; col >= 0; col--) {
    for (let row = 0; row < halfRows; row++) {
      map.push({ row, col });
    }
  }
  // Bottom half: rows halfRows to (numRows - 1), columns (numCols - 1) down to 0 (right-to-left vertical flow)
  for (let col = numCols - 1; col >= 0; col--) {
    for (let row = halfRows; row < numRows; row++) {
      map.push({ row, col });
    }
  }
  return map;
}

// Render SVG grid cell
function generateGridSVG(charData, type = 'prompt') {
  const size = config.gridSize;
  const isZhuyinOnly = config.layoutMode === 'zhuyin-only';
  
  let width, height, viewBox;
  if (isZhuyinOnly) {
    width = size;
    height = size;
    viewBox = '0 0 100 100';
  } else {
    // Square (100) + Bopomofo Col (30) = 130 width.
    width = size * 1.3;
    height = size;
    viewBox = '0 0 130 100';
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('class', 'grid-svg');

  const gridColor = config.gridColor;

  if (isZhuyinOnly) {
    // 1. Draw outer boundary
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '1');
    rect.setAttribute('y', '1');
    rect.setAttribute('width', '98');
    rect.setAttribute('height', '98');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', gridColor);
    rect.setAttribute('stroke-width', '2');
    svg.appendChild(rect);

    // 2. Draw interior cross lines
    const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineX.setAttribute('x1', '1');
    lineX.setAttribute('y1', '50');
    lineX.setAttribute('x2', '99');
    lineX.setAttribute('y2', '50');
    lineX.setAttribute('stroke', gridColor);
    lineX.setAttribute('stroke-width', '1');
    lineX.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineX);

    const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineY.setAttribute('x1', '50');
    lineY.setAttribute('y1', '1');
    lineY.setAttribute('x2', '50');
    lineY.setAttribute('y2', '99');
    lineY.setAttribute('stroke', gridColor);
    lineY.setAttribute('stroke-width', '1');
    lineY.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineY);

    if (config.gridType === 'mi') {
      const lineD1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineD1.setAttribute('x1', '1');
      lineD1.setAttribute('y1', '1');
      lineD1.setAttribute('x2', '99');
      lineD1.setAttribute('y2', '99');
      lineD1.setAttribute('stroke', gridColor);
      lineD1.setAttribute('stroke-width', '0.7');
      lineD1.setAttribute('stroke-dasharray', '2,4');
      svg.appendChild(lineD1);

      const lineD2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineD2.setAttribute('x1', '99');
      lineD2.setAttribute('y1', '1');
      lineD2.setAttribute('x2', '1');
      lineD2.setAttribute('y2', '99');
      lineD2.setAttribute('stroke', gridColor);
      lineD2.setAttribute('stroke-width', '0.7');
      lineD2.setAttribute('stroke-dasharray', '2,4');
      svg.appendChild(lineD2);
    }
  } else {
    // Green contiguous sheet layout
    const rectOuter = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectOuter.setAttribute('x', '0');
    rectOuter.setAttribute('y', '0');
    rectOuter.setAttribute('width', '130');
    rectOuter.setAttribute('height', '100');
    rectOuter.setAttribute('fill', 'none');
    rectOuter.setAttribute('stroke', gridColor);
    rectOuter.setAttribute('stroke-width', '2');
    svg.appendChild(rectOuter);

    const lineDivider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineDivider.setAttribute('x1', '100');
    lineDivider.setAttribute('y1', '0');
    lineDivider.setAttribute('x2', '100');
    lineDivider.setAttribute('y2', '100');
    lineDivider.setAttribute('stroke', gridColor);
    lineDivider.setAttribute('stroke-width', '2');
    svg.appendChild(lineDivider);

    const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineY.setAttribute('x1', '50');
    lineY.setAttribute('y1', '0');
    lineY.setAttribute('x2', '50');
    lineY.setAttribute('y2', '100');
    lineY.setAttribute('stroke', gridColor);
    lineY.setAttribute('stroke-width', '1');
    lineY.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineY);

    const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineX.setAttribute('x1', '0');
    lineX.setAttribute('y1', '50');
    lineX.setAttribute('x2', '130');
    lineX.setAttribute('y2', '50');
    lineX.setAttribute('stroke', gridColor);
    lineX.setAttribute('stroke-width', '1');
    lineX.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineX);

    if (config.gridType === 'mi') {
      const lineD1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineD1.setAttribute('x1', '0');
      lineD1.setAttribute('y1', '0');
      lineD1.setAttribute('x2', '100');
      lineD1.setAttribute('y2', '100');
      lineD1.setAttribute('stroke', gridColor);
      lineD1.setAttribute('stroke-width', '0.7');
      lineD1.setAttribute('stroke-dasharray', '2,4');
      svg.appendChild(lineD1);

      const lineD2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineD2.setAttribute('x1', '100');
      lineD2.setAttribute('y1', '0');
      lineD2.setAttribute('x2', '0');
      lineD2.setAttribute('y2', '100');
      lineD2.setAttribute('stroke', gridColor);
      lineD2.setAttribute('stroke-width', '0.7');
      lineD2.setAttribute('stroke-dasharray', '2,4');
      svg.appendChild(lineD2);
    }
  }

  const textClass = type === 'trace' ? 'text-trace' : 'text-solid';

  // Retrieve Zhuyin details
  const zInfo = charData ? charData.zhuyin : null;
  const symbols = (zInfo && zInfo.symbols) ? zInfo.symbols : [];
  const len = symbols.length;
  const toneVal = zInfo ? zInfo.tone : 1;

  // Render Decision (Show Hanzi vs Hide Hanzi)
  let hasHanziToDisplay = false;
  if (!isZhuyinOnly && charData && charData.char && config.showHanzi) {
    hasHanziToDisplay = true;
  }

  if (hasHanziToDisplay) {
    // A. SHOW HANZI
    if (type === 'prompt' || type === 'trace') {
      const textHanzi = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textHanzi.setAttribute('x', '50');
      textHanzi.setAttribute('y', '54');
      textHanzi.setAttribute('text-anchor', 'middle');
      textHanzi.setAttribute('dominant-baseline', 'middle');
      textHanzi.setAttribute('class', `hanzi-text ${textClass}`);
      textHanzi.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textHanzi.style.fontSize = '62px';
      textHanzi.textContent = charData.char;
      svg.appendChild(textHanzi);
    }

    // Render Bopomofo in narrow column
    if (len > 0 && type !== 'empty') {
      renderBopomofoInColumn(svg, symbols, toneVal, textClass);
    }
  } else {
    // B. HIDE HANZI / DIRECT BOPOMOFO (Practice book style from photo!)
    if (len > 0 && type !== 'empty') {
      if (len === 1 || isZhuyinOnly || (charData && charData.isBopomofoInput)) {
        // Render in square grid (100x100 area)
        renderBopomofoInSquare(svg, symbols, toneVal, textClass);
      } else {
        // 2. Render in narrow column (X: 100 to 130 area)
        renderBopomofoInColumn(svg, symbols, toneVal, textClass);
      }
    }
  }

  return svg;
}

// Helper to draw Bopomofo inside narrow column (X: 100 to 130)
function renderBopomofoInColumn(svg, syms, toneVal, textClass) {
  const len = syms.length;
  const xCoord = 112; // Center offset to make room for tone mark in narrow column
  const fontSz = '22px';
  const yOffsets = {
    1: [53],
    2: [32, 74],
    3: [24, 53, 80]
  };
  
  const yCoords = yOffsets[len] || [50];

  // Symbols
  syms.forEach((sym, idx) => {
    const textSym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textSym.setAttribute('x', xCoord);
    textSym.setAttribute('y', yCoords[idx]);
    textSym.setAttribute('text-anchor', 'middle');
    textSym.setAttribute('dominant-baseline', 'middle');
    textSym.setAttribute('class', `zhuyin-char ${textClass}`);
    textSym.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
    textSym.style.fontSize = fontSz;
    textSym.textContent = sym;
    svg.appendChild(textSym);
  });

  // Tone mark inside Bopomofo column
  if (toneVal && toneSymbols[toneVal]) {
    const toneMark = toneSymbols[toneVal];
    const textTone = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    
    if (toneVal === 5) {
      const topY = yCoords[0];
      textTone.setAttribute('x', xCoord);
      textTone.setAttribute('y', topY - 16);
      textTone.setAttribute('text-anchor', 'middle');
      textTone.setAttribute('dominant-baseline', 'middle');
      textTone.style.fontSize = '12px';
    } else {
      const bottomY = yCoords[len - 1];
      textTone.setAttribute('x', 124); // aligned right inside Bopomofo column
      textTone.setAttribute('y', bottomY - 14); // Shifted up from -6 to -14
      textTone.setAttribute('text-anchor', 'middle');
      textTone.setAttribute('dominant-baseline', 'middle');
      textTone.style.fontSize = '16px';
    }
    
    textTone.setAttribute('class', `zhuyin-tone ${textClass}`);
    textTone.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
    textTone.textContent = toneMark;
    svg.appendChild(textTone);
  }
}

// Helper to draw Bopomofo inside square grid (100x100 area)
function renderBopomofoInSquare(svg, syms, toneVal, textClass) {
  const len = syms.length;
  const xCoord = 50; // Centered horizontally in the 100x100 square
  
  if (len === 1) {
    // 1 Symbol: centered vertically at y=53. Font size 55px.
    const textSym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textSym.setAttribute('x', xCoord);
    textSym.setAttribute('y', '53');
    textSym.setAttribute('text-anchor', 'middle');
    textSym.setAttribute('dominant-baseline', 'middle');
    textSym.setAttribute('class', `zhuyin-char ${textClass}`);
    textSym.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
    textSym.style.fontSize = '55px';
    textSym.textContent = syms[0];
    svg.appendChild(textSym);

    // Tone at x=78, y=40
    if (toneVal && toneSymbols[toneVal]) {
      const toneMark = toneSymbols[toneVal];
      const textTone = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      if (toneVal === 5) {
        textTone.setAttribute('x', xCoord);
        textTone.setAttribute('y', '20');
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '18px';
      } else {
        textTone.setAttribute('x', '78');
        textTone.setAttribute('y', '40');
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '26px';
      }
      textTone.setAttribute('class', `zhuyin-tone ${textClass}`);
      textTone.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textTone.textContent = toneMark;
      svg.appendChild(textTone);
    }
  } else if (len === 2) {
    // 2 Symbols: top at y=32, bottom at y=72. Font size 42px.
    const yCoords = [32, 72];
    syms.forEach((sym, idx) => {
      const textSym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textSym.setAttribute('x', xCoord);
      textSym.setAttribute('y', yCoords[idx]);
      textSym.setAttribute('text-anchor', 'middle');
      textSym.setAttribute('dominant-baseline', 'middle');
      textSym.setAttribute('class', `zhuyin-char ${textClass}`);
      textSym.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textSym.style.fontSize = '42px';
      textSym.textContent = sym;
      svg.appendChild(textSym);
    });

    // Tone at x=78, y=64 (upper right of the bottom symbol)
    if (toneVal && toneSymbols[toneVal]) {
      const toneMark = toneSymbols[toneVal];
      const textTone = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      if (toneVal === 5) {
        textTone.setAttribute('x', xCoord);
        textTone.setAttribute('y', '12');
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '14px';
      } else {
        textTone.setAttribute('x', '78');
        textTone.setAttribute('y', '54'); // Shifted up from 64 to 54
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '22px';
      }
      textTone.setAttribute('class', `zhuyin-tone ${textClass}`);
      textTone.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textTone.textContent = toneMark;
      svg.appendChild(textTone);
    }
  } else if (len === 3) {
    // 3 Symbols: top at y=25, middle at y=53, bottom at y=80. Font size 32px.
    const yCoords = [25, 53, 80];
    syms.forEach((sym, idx) => {
      const textSym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textSym.setAttribute('x', xCoord);
      textSym.setAttribute('y', yCoords[idx]);
      textSym.setAttribute('text-anchor', 'middle');
      textSym.setAttribute('dominant-baseline', 'middle');
      textSym.setAttribute('class', `zhuyin-char ${textClass}`);
      textSym.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textSym.style.fontSize = '32px';
      textSym.textContent = sym;
      svg.appendChild(textSym);
    });

    // Tone at x=78, y=74 (upper right of the bottom symbol)
    if (toneVal && toneSymbols[toneVal]) {
      const toneMark = toneSymbols[toneVal];
      const textTone = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      if (toneVal === 5) {
        textTone.setAttribute('x', xCoord);
        textTone.setAttribute('y', '10');
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '12px';
      } else {
        textTone.setAttribute('x', '78');
        textTone.setAttribute('y', '66'); // Shifted up from 74 to 66
        textTone.setAttribute('text-anchor', 'middle');
        textTone.setAttribute('dominant-baseline', 'middle');
        textTone.style.fontSize = '18px';
      }
      textTone.setAttribute('class', `zhuyin-tone ${textClass}`);
      textTone.style.fontFamily = '"DFKai-SB", "標楷體", "Microsoft JhengHei", sans-serif';
      textTone.textContent = toneMark;
      svg.appendChild(textTone);
    }
  }
}

// Render worksheet pages
function renderWorksheet() {
  pagesContainer.innerHTML = '';
  
  if (charactersData.length === 0) {
    pagesContainer.innerHTML = `
      <div class="a4-page green-sheet">
        <div class="empty-state">請在左側輸入框輸入中文以產生練習卷</div>
      </div>`;
    return;
  }

  const isZhuyinOnly = config.layoutMode === 'zhuyin-only';
  const numCols = isZhuyinOnly ? 9 : 7;
  const numRows = 12;

  if (config.fillMode === 'char-row') {
    // 1. One Character/Word per Column mode (12 rows vertically per page, flows column by column R-to-L)
    // Group charactersData by line (split by '\n')
    const linesOfGrids = [[]];
    charactersData.forEach((d, idx) => {
      if (d.char === '\n') {
        linesOfGrids.push([]);
      } else if (d.isChinese) {
        linesOfGrids[linesOfGrids.length - 1].push({ charData: d, originalIndex: idx });
      }
    });

    // Trim trailing empty lines to avoid empty pages
    while (linesOfGrids.length > 1 && linesOfGrids[linesOfGrids.length - 1].length === 0) {
      linesOfGrids.pop();
    }
    const activeLines = linesOfGrids;

    const colsPerPage = numCols;
    const totalPages = Math.ceil(activeLines.length / colsPerPage) || 1;
    
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const page = createA4Page();
      pagesContainer.appendChild(page);
      
      const topHalf = page.querySelector('.top-half');
      const bottomHalf = page.querySelector('.bottom-half');
      
      const startIdx = pageNum * colsPerPage;
      const pageColumns = activeLines.slice(startIdx, startIdx + colsPerPage);

      // Create a numRows x numCols grid of SVGs
      const svgGrid = Array(numRows).fill(null).map(() => Array(numCols).fill(null));

      // Populate column by column, right-to-left
      for (let c = 0; c < colsPerPage; c++) {
        const colChars = pageColumns[c];
        const colIdx = numCols - 1 - c; // Right-to-left flow
        
        if (colChars && colChars.length > 0) {
          const L = colChars.length;
          const maxTrace = config.traceCount;
          for (let r = 0; r < numRows; r++) {
            const item = colChars[r % L];
            let type = 'empty';
            if (r < L) {
              type = 'prompt'; // The solid exemplars at the top of the column
            } else if (r < L + maxTrace) {
              type = 'trace'; // The next maxTrace cells are faint gray tracing
            } else {
              type = 'empty'; // Remaining cells below maxTrace are blank
            }
            svgGrid[r][colIdx] = { charData: item.charData, type, originalIndex: item.originalIndex };
          }
        }
      }

      const halfRows = numRows / 2;
      // Render the svgGrid into topHalf and bottomHalf row by row
      for (let r = 0; r < numRows; r++) {
        const targetHalf = r < halfRows ? topHalf : bottomHalf;
        for (let c = 0; c < numCols; c++) {
          const cellInfo = svgGrid[r][c];
          if (cellInfo) {
            const cellSvg = generateGridSVG(cellInfo.charData, cellInfo.type);
            cellSvg.style.cursor = 'pointer';
            cellSvg.addEventListener('click', () => openEditModal(cellInfo.originalIndex));
            targetHalf.appendChild(cellSvg);
          } else {
            const emptyCell = generateGridSVG(null, 'empty');
            targetHalf.appendChild(emptyCell);
          }
        }
      }
    }
  } else {
    // 2. Continuous Grid Flow mode (flows column-by-column or row-by-row, respecting newlines)
    let currentPage = null;
    let topHalf = null;
    let bottomHalf = null;
    let cellGrid = null;
    
    // Position state
    let col = numCols - 1; // Start at rightmost column for vertical
    let row = 0;           // Start at top row
    
    if (config.writingDirection === 'horizontal') {
      col = 0;             // Start at leftmost column for horizontal
      row = 0;             // Start at top row
    }

    const initNewPage = () => {
      currentPage = createA4Page();
      pagesContainer.appendChild(currentPage);
      topHalf = currentPage.querySelector('.top-half');
      bottomHalf = currentPage.querySelector('.bottom-half');
      cellGrid = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
      
      if (config.writingDirection === 'vertical') {
        col = numCols - 1;
        row = 0;
      } else {
        col = 0;
        row = 0;
      }
    };

    initNewPage();

    charactersData.forEach((d, idx) => {
      if (d.char === '\n') {
        // Newline: advance to next column/row
        if (config.writingDirection === 'vertical') {
          col--;
          row = 0;
          if (col < 0) {
            renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows);
            initNewPage();
          }
        } else {
          row++;
          col = 0;
          if (row >= numRows) {
            renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows);
            initNewPage();
          }
        }
      } else if (d.isChinese) {
        // Place character
        cellGrid[row][col] = { charData: d, originalIndex: idx };
        
        // Advance cursor
        if (config.writingDirection === 'vertical') {
          row++;
          if (row >= numRows) {
            row = 0;
            col--;
            if (col < 0) {
              renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows);
              initNewPage();
            }
          }
        } else {
          col++;
          if (col >= numCols) {
            col = 0;
            row++;
            if (row >= numRows) {
              renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows);
              initNewPage();
            }
          }
        }
      }
    });

    // Render the final page only if it has content or is the 1st page
    if (currentPage) {
      const hasAnyChar = cellGrid.some(r => r.some(cell => cell !== null));
      if (hasAnyChar || pagesContainer.children.length === 1) {
        renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows);
      } else {
        if (currentPage.parentNode) {
          currentPage.parentNode.removeChild(currentPage);
        }
      }
    }
  }
}

// Helper to write continuous grid to page halves
function renderGridToPage(cellGrid, topHalf, bottomHalf, numCols, numRows) {
  const halfRows = numRows / 2;
  for (let r = 0; r < numRows; r++) {
    const targetHalf = r < halfRows ? topHalf : bottomHalf;
    for (let c = 0; c < numCols; c++) {
      const cellInfo = cellGrid[r][c];
      
      let renderStyle = 'prompt';
      if (config.lineConfig.prompt === 0) {
        renderStyle = config.lineConfig.trace > 0 ? 'trace' : 'empty';
      }

      if (cellInfo) {
        const cellSvg = generateGridSVG(cellInfo.charData, renderStyle);
        cellSvg.style.cursor = 'pointer';
        cellSvg.addEventListener('click', () => openEditModal(cellInfo.originalIndex));
        targetHalf.appendChild(cellSvg);
      } else {
        const emptyCell = generateGridSVG(null, 'empty');
        targetHalf.appendChild(emptyCell);
      }
    }
  }
}

function formatCharWithRightZhuyin(char, symbols, toneSymbol = '') {
  const lastIdx = symbols.length - 1;
  const symbolSpans = symbols.map((s, idx) => {
    if (idx === lastIdx && toneSymbol) {
      return `
        <span class="last-symbol-wrap">
          <span>${s}</span>
          <span class="zhuyin-tone">${toneSymbol}</span>
        </span>`;
    }
    return `<span>${s}</span>`;
  }).join('');

  return `
    <span class="char-with-zhuyin">
      <span class="char-hanzi">${char}</span>
      <span class="char-zhuyin">
        <span class="zhuyin-symbols">${symbolSpans}</span>
      </span>
    </span>`;
}

// Helper to create the A4 page layout
function createA4Page() {
  const page = document.createElement('div');
  page.className = 'a4-page green-sheet';

  page.innerHTML = `
    <div class="page-header">
      <div class="header-field">
        ${formatCharWithRightZhuyin('班', ['ㄅ', 'ㄢ'], '')}
        ${formatCharWithRightZhuyin('級', ['ㄐ', 'ㄧ'], 'ˊ')}：<span class="header-line line-short"></span>
      </div>
      <div class="header-field">
        ${formatCharWithRightZhuyin('座', ['ㄗ', 'ㄨ', 'ㄛ'], 'ˋ')}
        ${formatCharWithRightZhuyin('號', ['ㄏ', 'ㄠ'], 'ˋ')}：<span class="header-line line-short"></span>
      </div>
      <div class="header-field">
        ${formatCharWithRightZhuyin('姓', ['ㄒ', 'ㄧ', 'ㄥ'], 'ˋ')}
        ${formatCharWithRightZhuyin('名', ['ㄇ', 'ㄧ', 'ㄥ'], 'ˊ')}：<span class="header-line line-long"></span>
      </div>
    </div>
    <div class="sheet-half top-half"></div>
    <div class="sheet-half bottom-half"></div>
  `;

  // Set widths dynamically based on layoutMode and gridSize
  const size = config.gridSize;
  const isZhuyinOnly = config.layoutMode === 'zhuyin-only';
  const numCols = isZhuyinOnly ? 9 : 7;

  const cellWidth = isZhuyinOnly ? size : size * 1.3;
  const rowWidth = numCols * cellWidth;
  
  const header = page.querySelector('.page-header');
  const topHalf = page.querySelector('.top-half');
  const bottomHalf = page.querySelector('.bottom-half');
  
  if (header) {
    header.style.width = `${rowWidth}px`;
    header.style.maxWidth = `${rowWidth}px`;
    header.style.color = config.gridColor;
    header.querySelectorAll('.header-line').forEach(el => {
      el.style.borderColor = config.gridColor;
    });
  }
  if (topHalf) {
    topHalf.style.width = `${rowWidth}px`;
    topHalf.style.maxWidth = `${rowWidth}px`;
    topHalf.style.gridTemplateColumns = `repeat(${numCols}, ${cellWidth}px)`;
  }
  if (bottomHalf) {
    bottomHalf.style.width = `${rowWidth}px`;
    bottomHalf.style.maxWidth = `${rowWidth}px`;
    bottomHalf.style.gridTemplateColumns = `repeat(${numCols}, ${cellWidth}px)`;
  }

  return page;
}

// Open modal to customize character details
function openEditModal(index) {
  if (index === -1 || index === null || !charactersData[index]) return;
  
  selectedCharIndex = index;
  const charData = charactersData[index];
  
  document.getElementById('modal-char').textContent = charData.char || charData.options[0] || '注音';
  
  // Render polyphone options
  const optionList = document.getElementById('polyphone-options');
  optionList.innerHTML = '';
  
  charData.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'polyphone-btn';
    
    // Check if direct Bopomofo or needs pinyinToZhuyin
    let zh;
    if (charData.isBopomofoInput) {
      zh = parseBopomofoToken(option);
    } else {
      zh = pinyinToZhuyin(option);
    }
    
    const zhText = zh.symbols.join('') + toneSymbols[zh.tone];
    
    btn.textContent = `${zhText} (${option})`;
    if (charData.pinyin === option) {
      btn.classList.add('selected');
    }
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.polyphone-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      const zhVal = charData.isBopomofoInput ? parseBopomofoToken(option) : pinyinToZhuyin(option);
      document.getElementById('edit-symbol-1').value = zhVal.symbols[0] || '';
      document.getElementById('edit-symbol-2').value = zhVal.symbols[1] || '';
      document.getElementById('edit-symbol-3').value = zhVal.symbols[2] || '';
      document.getElementById('edit-tone').value = zhVal.tone;
    });
    
    optionList.appendChild(btn);
  });

  // Populate manual inputs
  const currentSymbols = charData.zhuyin ? charData.zhuyin.symbols : [];
  const currentTone = charData.zhuyin ? charData.zhuyin.tone : 1;
  
  document.getElementById('edit-symbol-1').value = currentSymbols[0] || '';
  document.getElementById('edit-symbol-2').value = currentSymbols[1] || '';
  document.getElementById('edit-symbol-3').value = currentSymbols[2] || '';
  document.getElementById('edit-tone').value = currentTone;
  
  document.getElementById('edit-modal').style.display = 'block';
}

// Save manual overrides
function saveManualEdit() {
  if (selectedCharIndex === null) return;
  
  const sym1 = document.getElementById('edit-symbol-1').value.trim();
  const sym2 = document.getElementById('edit-symbol-2').value.trim();
  const sym3 = document.getElementById('edit-symbol-3').value.trim();
  const tone = parseInt(document.getElementById('edit-tone').value, 10);
  
  const symbols = [];
  if (sym1) symbols.push(sym1);
  if (sym2) symbols.push(sym2);
  if (sym3) symbols.push(sym3);
  
  charactersData[selectedCharIndex].zhuyin = {
    symbols: symbols,
    tone: tone
  };
  
  // Custom manual edit is marked
  charactersData[selectedCharIndex].pinyin = 'custom';
  
  renderWorksheet();
  
  document.getElementById('edit-modal').style.display = 'none';
  selectedCharIndex = null;
}
