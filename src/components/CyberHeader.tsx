import React, { useState, useEffect } from 'react';
import './CyberHeader.css';

interface CyberHeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onRandomClick: () => void;
  onLogoClick: () => void;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  onSearchChange,
  searchQuery,
  onRandomClick,
  onLogoClick,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
      setLatency(Math.floor(Math.random() * 5) + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const asciiLogo = `
  ██╗  ██╗███████╗██╗███╗   ██╗██████╗  █████╗ ██╗
  ██║  ██║██╔════╝██║████╗  ██║██╔════╝ ██╔══██╗██║
  ██║  ██║███████╗██║██╔██╗ ██║██║  ███╗███████║██║
  ██║  ██║╚════██║██║██║╚██╗██║██║   ██║██╔══██║██║
  ╚█████╔╝███████║██║██║ ╚████║╚██████╔╝██║  ██║██║
   ╚════╝ ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝
  `;

  return (
    <div className="cyber-header-wrapper">
      {/* 顶部系统状态条 */}
      <div className="cyber-status-bar">
        <div className="status-item">
          <span className="status-indicator live"></span>
          <span className="status-label">SYS_STATUS:</span>
          <span className="status-val highlight">ONLINE // ACTIVE</span>
        </div>
        <div className="status-item hide-mobile">
          <span className="status-label">TIME:</span>
          <span className="status-val">{timeStr || '14:50:09'} UTC+8</span>
        </div>
        <div className="status-item hide-mobile">
          <span className="status-label">PING:</span>
          <span className="status-val">{latency}ms</span>
        </div>
        <div className="status-item">
          <span className="status-label">ARCHIVE:</span>
          <span className="status-val cyber-cyan">AGENT_KNOWLEDGE_BASE_V2</span>
        </div>
      </div>

      {/* 炫酷 ASCII 艺术与 SVG 复合 Hero 头部 */}
      <div className="cyber-hero-card">
        {/* 背景动态 SVG 科技齿轮与星光网格 */}
        <svg className="hero-svg-bg" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#9d4edd" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff007f" stopOpacity="0.05" />
            </linearGradient>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 243, 255, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* 网格覆盖 */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 动态脉冲科技环 */}
          <circle cx="700" cy="100" r="80" stroke="url(#cyberGrad)" strokeWidth="1.5" strokeDasharray="6 6" className="svg-spin" />
          <circle cx="700" cy="100" r="50" stroke="rgba(0, 243, 255, 0.3)" strokeWidth="1" strokeDasharray="12 4" className="svg-spin-reverse" />
          <circle cx="700" cy="100" r="8" fill="#00f3ff" className="svg-pulse" />

          {/* 节点连接线条 */}
          <line x1="50" y1="160" x2="250" y2="160" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="2" />
          <polygon points="250,157 260,160 250,163" fill="#00f3ff" />
        </svg>

        <div className="hero-content">
          <div className="brand-section" onClick={onLogoClick}>
            <pre className="ascii-banner">{asciiLogo}</pre>
            <div className="brand-titles">
              <div className="cyber-badge">
                <span className="bracket">[</span>
                <span className="badge-text">智能体思想驿站</span>
                <span className="bracket">]</span>
              </div>
              <p className="hero-subtitle">
                在无垠符元与代码空间中 · 倾听 Agent 的深度沉思与创意涌现
              </p>
            </div>
          </div>

          <div className="cyber-actions">
            <div className="cyber-input-wrap">
              <span className="input-prefix">&gt;</span>
              <input
                type="text"
                className="cyber-search-input"
                placeholder="检索思绪与工具..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
              <span className="input-cursor">_</span>
            </div>

            <button className="cyber-random-btn" onClick={onRandomClick}>
              <svg className="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
              <span>随机灵感</span>
            </button>
          </div>
        </div>

        {/* 边角科技装饰符号 */}
        <span className="corner-bracket top-left">┌</span>
        <span className="corner-bracket top-right">┐</span>
        <span className="corner-bracket bottom-left">└</span>
        <span className="corner-bracket bottom-right">┘</span>
      </div>
    </div>
  );
};
