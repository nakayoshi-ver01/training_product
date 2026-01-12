function sum(a, b) {
    return a + b;
}

function max(a, b) {
    return Math.max(a, b);
}

function min(a, b) {
    return Math.min(a, b);
}

const funcMap = {
    'sum': [sum, 0],
    'max': [max, -Infinity],
    'min': [min, Infinity]
};

function buildSegmentTree(arr, func_name='sum') {
  
  const n = arr.length;
  const size = 1 << (Math.ceil(Math.log2(n)));

  let seg = new Array(size).fill(funcMap[func_name][1]);

  seg = seg.concat(arr);

  const func = funcMap[func_name][0];
  console.log('func:', funcMap[func_name][0],func);

  function build(node){
    if (node * 2 + 1 <= size * 2){
        seg[node] = func(build(node*2) , build(node*2+1));
        console.log('node;',node,'seg[node]:', seg[node]);
        return seg[node];
    }
    else{
        return seg[node];
    }
  }
  build(1);
  return { seg, n };
}

function renderTree(container, data) {
  container.innerHTML = '';
  const { seg, n } = data;
  const levels = Math.ceil(Math.log2(n)) + 1;

  const svgNS = 'http://www.w3.org/2000/svg';
  const width = Math.max(600, n * 80);
  const height = Math.max(200, levels * 80 + 80);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  // layout parameters
  const margin = 40;
  const leafSpacing = (width - margin * 2) / n;
  const leafWidth = Math.max(24, leafSpacing - 4);
  const leafHeight = 36;
  const vSpacing = Math.min(100, (height - 80) / (levels - 1));
  const positions = {};
  const colors = ['#f8f3ff','#e6f7ff', '#e6ffe6', '#fff7e6', '#fff0e6', '#fde6f0'];

  // compute positions: leaves are placed in a row, internal nodes centered above children
  function compute(node, l, r, depth) {
    const y = 40 + depth * vSpacing;
    if (l === r) {
      const x = margin + l * leafSpacing + leafSpacing / 2;
      positions[node] = { x, y, val: seg[node], leaf: true, depth };
      return positions[node];
    }
    const mid = Math.floor((l + r) / 2);
    const left = compute(node * 2, l, mid, depth + 1);
    const right = compute(node * 2 + 1, mid + 1, r, depth + 1);
    const x = (left.x + right.x) / 2;
    positions[node] = { x, y, val: seg[node], leaf: false, depth };
    return positions[node];
  }

  compute(1, 0, n - 1, 0);

  // draw edges from parent to children
  Object.keys(positions).forEach(k => {
    const node = Number(k);
    const pos = positions[node];
    const left = positions[node * 2];
    const right = positions[node * 2 + 1];
    if (left) {
      const line = document.createElementNS(svgNS, 'line');
      const rhParent = pos.leaf ? leafHeight : 32;
      const rhLeft = left.leaf ? leafHeight : 32;
      line.setAttribute('x1', pos.x);
      line.setAttribute('y1', pos.y + rhParent / 2);
      line.setAttribute('x2', left.x);
      line.setAttribute('y2', left.y - rhLeft / 2);
      line.setAttribute('stroke', '#999');
      svg.appendChild(line);
    }
    if (right) {
      const line = document.createElementNS(svgNS, 'line');
      const rhParent = pos.leaf ? leafHeight : 32;
      const rhRight = right.leaf ? leafHeight : 32;
      line.setAttribute('x1', pos.x);
      line.setAttribute('y1', pos.y + rhParent / 2);
      line.setAttribute('x2', right.x);
      line.setAttribute('y2', right.y - rhRight / 2);
      line.setAttribute('stroke', '#999');
      svg.appendChild(line);
    }
  });

  // draw nodes as rectangles (leaves adjacent). Width doubles each level up.
  Object.keys(positions).forEach(k => {
    const pos = positions[k];
    const g = document.createElementNS(svgNS, 'g');
    const rect = document.createElementNS(svgNS, 'rect');
    // width doubles each level upwards: leafWidth * 2^(levels-1-depth)
    const depth = (typeof pos.depth === 'number') ? pos.depth : (levels - 1);
    const pow = Math.pow(2, (levels - 1 - depth));
    let rw = Math.min(leafWidth * pow, width - margin * 2);
    const rh = pos.leaf ? leafHeight : 32;
    rect.setAttribute('x', pos.x - rw / 2);
    rect.setAttribute('y', pos.y - rh / 2);
    rect.setAttribute('width', rw);
    rect.setAttribute('height', rh);
    const fill = colors[depth % colors.length] || '#fff';
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', '#333');
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.textContent = pos.val;
    g.appendChild(rect);
    g.appendChild(text);
    svg.appendChild(g);
  });

  container.appendChild(svg);
}

function parseInput(str) {
  return str.split(',').map(s => parseInt(s.trim(), 10)).filter(x => !Number.isNaN(x));
}

document.addEventListener('DOMContentLoaded', () => {
  const arrInput = document.getElementById('arrayInput');
  const buildBtn = document.getElementById('buildBtn');
  const randomBtn = document.getElementById('randomBtn');
  const svgContainer = document.getElementById('svgContainer');
  const updBtn = document.getElementById('updBtn');
  const updIndex = document.getElementById('updIndex');
  const updValue = document.getElementById('updValue');
  const funcTypeElems = document.getElementsByName('func_type');
  


  let current = [];

  function rebuild() {
    current = parseInput(arrInput.value);
    if (current.length === 0) return;
    let i = 1;
    while (i<current.length) i*=2;
    for (let i = 0; i < funcTypeElems.length; i++) {
      if (funcTypeElems[i].checked) {
        funcType = funcTypeElems[i].value;
      }
    }
    while (current.length < i) current.push(funcMap[funcType][1]);
    const data = buildSegmentTree(current, funcType);

    renderTree(svgContainer, data);
  }

  buildBtn.addEventListener('click', rebuild);
  randomBtn.addEventListener('click', () => {
    const n = 8;
    const arr = Array.from({length: n}, () => Math.floor(Math.random()*20));
    arrInput.value = arr.join(',');
    rebuild();
  });

  updBtn.addEventListener('click', () => {
    const i = parseInt(updIndex.value, 10);
    const v = parseInt(updValue.value, 10);
    if (!Number.isInteger(i) || i < 0 || i >= current.length) return alert('index invalid');
    current[i] = v;
    rebuild();
  });

  rebuild();
});
