module.exports = {
  content: ['./*.html', './*/index.html', './*/*/index.html', './scripts/*.mjs'],
  theme: { extend: {
    colors: {
      ae: { 50:'#f7f8fb',100:'#eef2fb',200:'#e4e9f5',300:'#c9d2e8',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#1e293b',800:'#0a1a3f',900:'#060f2b',950:'#05102a' },
      brand: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b' },
      jarvis: { 50:'#f1f2ff',100:'#e6e8ff',200:'#d0d6ff',300:'#b0baff',400:'#8b96ff',500:'#6e8bff',600:'#8b5cf6',700:'#7c3aed' },
    },
    fontFamily: { sans:['Inter','system-ui','-apple-system','sans-serif'], mono:['JetBrains Mono','ui-monospace','SFMono-Regular','Menlo','monospace'] },
  } },
};
