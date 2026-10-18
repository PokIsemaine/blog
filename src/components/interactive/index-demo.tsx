"use client";
import { useState } from "react";
import { lookup } from "./index-model";
export function IndexDemo({ lang = "en" }: { lang?: "en" | "zh" }) {
  const [target, setTarget] = useState(750);
  const zh = lang === "zh";
  const scan = lookup(1024, target, false).comparisons,
    index = lookup(1024, target, true).comparisons;
  return (
    <section
      className="demo"
      aria-label={zh ? "索引交互实验" : "Index experiment"}
    >
      <p className="eyebrow">{zh ? "交互实验 / 01" : "INTERACTIVE / 01"}</p>
      <h3>{zh ? "查找一条记录" : "Find one record"}</h3>
      <label>
        {zh ? "目标键" : "Target key"}: <output>{target}</output>
        <input
          type="range"
          min="1"
          max="1024"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
      </label>
      <div className="metric">
        <span>{zh ? "顺序扫描" : "Sequential scan"}</span>
        <meter min={0} max={1024} value={scan} />
        <b>{scan}</b>
      </div>
      <div className="metric">
        <span>{zh ? "二分查找" : "Binary search"}</span>
        <meter min={0} max={1024} value={index} />
        <b>{index}</b>
      </div>
      <small aria-live="polite">
        {zh
          ? "键比较次数；不代表磁盘 I/O 或实际延迟。"
          : "Key comparisons only; not disk I/O or measured latency."}
      </small>
    </section>
  );
}
