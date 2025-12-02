// TimeRangeSelector.js
// Renders a time range selector and handles changes

export default function TimeRangeSelector(root, selected, ranges, onChange) {
  root.innerHTML = `<div class="time-range-selector">
    ${ranges.map(r => `<button class="time-range-btn${selected===r.value?' selected':''}" data-value="${r.value}">${r.label}</button>`).join('')}
  </div>`;
  root.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => onChange(Number(btn.dataset.value));
  });
}
