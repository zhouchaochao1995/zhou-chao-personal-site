import { useState } from 'react';
import './ModelComparison.css';

function CompareCard({ title, beforeSrc, afterSrc }) {
  const [position, setPosition] = useState(50);

  return (
    <article className="model-compare-card">
      <div className="model-compare-frame" style={{ '--compare-position': `${position}%` }}>
        <img className="model-compare-image model-compare-after" src={afterSrc} alt={`${title}最终渲染效果`} draggable="false" />
        <div className="model-compare-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img className="model-compare-image" src={beforeSrc} alt={`${title}白模效果`} draggable="false" />
        </div>
        <span className="model-compare-label model-compare-label-before" aria-hidden="true">白模</span>
        <span className="model-compare-label model-compare-label-after" aria-hidden="true">最终渲染</span>
        <span className="model-compare-divider" aria-hidden="true"><i /></span>
        <input
          className="model-compare-range"
          type="range"
          min="0"
          max="100"
          value={position}
          aria-label={`拖动对比${title}的白模与最终渲染`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
      <div className="model-compare-control">
        <input
          className="model-compare-control-range"
          type="range"
          min="0"
          max="100"
          value={position}
          style={{ '--compare-position': `${position}%` }}
          aria-label={`调整${title}的白模与最终渲染分割位置`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
    </article>
  );
}

export default function ModelComparison({ items }) {
  return (
    <section className="model-comparison" aria-label="产品白模与最终渲染对比">
      <div className="model-comparison-grid">
        {items.map((item) => (
          <CompareCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
