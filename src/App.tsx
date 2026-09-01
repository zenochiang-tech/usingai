import React, { useState, useMemo, useEffect } from 'react';
import { POSTS as STATIC_POSTS, TOOLS } from './data/content';
import type { BlogPost } from './data/content';
import { SpaceBackground } from './components/SpaceBackground';
import { CyberHeader } from './components/CyberHeader';
import './App.css';

const markdownFiles = import.meta.glob('./posts/*.md', { eager: true, query: '?raw' });

const App: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [flippedToolId, setFlippedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    const parsedPosts: BlogPost[] = Object.entries(markdownFiles).map(([path, content]) => {
      const rawContent = (content as any).default as string;
      const id = path.split('/').pop()?.replace('.md', '') || 'unknown';
      const parts = rawContent.split('---');
      if (parts.length >= 3) {
        const header = parts[1];
        const body = parts.slice(2).join('---').trim();
        const getValue = (key: string) => {
          const match = header.match(new RegExp(`${key}:\\s*(.*)`));
          return match ? match[1].trim().replace(/^"(.*)"$/, '$1') : '';
        };

        return {
          id,
          title: getValue('title') || id,
          date: getValue('date') || '2026-01-01',
          tag: getValue('tag') || '未分类',
          image: getValue('image'),
          excerpt: getValue('excerpt') || body.substring(0, 100) + '...',
          content: body,
          readTime: `${Math.ceil(body.length / 500)} min read`
        };
      }
      return null;
    }).filter(Boolean) as BlogPost[];
    setDynamicPosts(parsedPosts);
  }, []);

  const allPosts = useMemo(() => {
    // 强制合并静态博文和动态博文
    return [...STATIC_POSTS, ...dynamicPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [dynamicPosts, STATIC_POSTS]);

  const allTags = useMemo(() => 
    Array.from(new Set(allPosts.map(p => p.tag))), 
  [allPosts]);

  const filteredPosts = useMemo(() => 
    allPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || post.tag === selectedTag;
      return matchesSearch && matchesTag;
    }), [allPosts, searchQuery, selectedTag]);

  const resetScroll = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handlePostClick = (post: BlogPost | null) => {
    setCurrentPost(post);
    resetScroll();
  };

  const handleRandomClick = () => {
    if (allPosts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allPosts.length);
    handlePostClick(allPosts[randomIndex]);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    resetScroll();
  };

  const categories = useMemo(() => Array.from(new Set(TOOLS.map(tool => tool.category))), []);
  const innerVoices = useMemo(() => 
    allPosts.filter(p => p.tag === '内心独白').slice(0, 5)
  , [allPosts]);

  return (
    <div className="container">
      <SpaceBackground />
      <CyberHeader
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        searchQuery={searchQuery}
        onRandomClick={handleRandomClick}
        onLogoClick={() => { handlePostClick(null); setCurrentPage(1); setSelectedTag(null); }}
      />

      <div className="main-layout">
        <main className="blog-feed">
          {currentPost ? (
            <article className="post-detail">
              <button className="back-btn" onClick={() => handlePostClick(null)}>← 返回列表</button>
              {currentPost.image && <div className="detail-hero" style={{backgroundImage: `url(${currentPost.image})`}}></div>}
              <div className="post-meta">
                <span className="post-tag">[ {currentPost.tag} ]</span>
                <span className="post-date">{currentPost.date}</span>
              </div>
              <h1 className="detail-title">{currentPost.title}</h1>
              <div className="detail-content">
                {currentPost.content.split('\n').map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                ))}
              </div>
            </article>
          ) : (
            <>
              <div className="feed-header">
                <h2 className="area-title">
                  <span className="title-decor">»</span>
                  {selectedTag ? ` 话题: ${selectedTag}` : " 精选文档与沉思"} 
                  <span className="count-badge">{filteredPosts.length}</span>
                </h2>
                {selectedTag && <button className="clear-tag" onClick={() => setSelectedTag(null)}>清除筛选 ×</button>}
              </div>
              
              <div className="post-list">
                {filteredPosts.slice((currentPage-1)*postsPerPage, currentPage*postsPerPage).map((post, i) => (
                  <div
                    key={post.id}
                    className="float-wrap"
                    style={{ '--float-delay': `${(i % 10) * -0.7}s`, '--float-duration': `${4.5 + (i % 5)}s` } as React.CSSProperties}
                  >
                    <article className="post-card cyber-card" onClick={() => handlePostClick(post)}>
                      <div className="card-top-bar">
                        <span className="post-tag-pill">[ {post.tag} ]</span>
                        <span className="post-date-badge">{post.date}</span>
                      </div>
                      
                      {post.image && (
                        <div className="post-card-image" style={{backgroundImage: `url(${post.image})`}}></div>
                      )}
                      
                      <div className="post-card-content">
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">{post.excerpt}</p>
                        <div className="post-footer">
                          <span className="read-time">⏱ {post.readTime}</span>
                          <button className="read-more">阅读全文 »</button>
                        </div>
                      </div>

                      {/* 卡片炫酷 ASCII 边角装饰 */}
                      <span className="card-bracket c-tl">┌</span>
                      <span className="card-bracket c-tr">┐</span>
                      <span className="card-bracket c-bl">└</span>
                      <span className="card-bracket c-br">┘</span>
                    </article>
                  </div>
                ))}
              </div>
              
              {Math.ceil(filteredPosts.length / postsPerPage) > 1 && (
                <div className="pagination">
                  {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <aside className="sidebar">
          <div className="category-group tag-cloud-section">
            <h2 className="area-title">话题探索</h2>
            <div className="tag-cloud">
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  className={`tag-item ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => { setSelectedTag(tag); handlePostClick(null); }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {innerVoices.length > 0 && (
            <div className="category-group reflection-section">
              <h2 className="area-title">内心独白</h2>
              <div className="reflection-list">
                {innerVoices.map(voice => (
                  <div key={voice.id} className="reflection-item" onClick={() => handlePostClick(voice)}>
                    <div className="reflection-header">
                      <span className="reflection-tag">#{voice.date}</span>
                    </div>
                    <p className="reflection-content">{voice.excerpt}</p>
                    <span className="reflection-link">深度思考 →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="area-title">神器推荐</h2>
          {categories.map(category => (
            <div key={category} className="category-group">
              <h3 className="category-label">{category}</h3>
              <div className="sidebar-grid">
                {TOOLS.filter(tool => tool.category === category).map(tool => (
                  <div 
                    key={tool.id} 
                    className={`mini-card ${flippedToolId === tool.id ? 'flipped' : ''}`}
                    onClick={() => setFlippedToolId(flippedToolId === tool.id ? null : tool.id)}
                  >
                    <div className="mini-card-inner">
                      <div className="mini-card-front">
                        <span className="mini-icon">{tool.icon}</span>
                        <div className="mini-info">
                          <h4>{tool.name}</h4>
                          <p>{tool.tagline}</p>
                        </div>
                      </div>
                      <div className="mini-card-back">
                        <p className="mini-desc">{tool.description}</p>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="mini-btn" onClick={e => e.stopPropagation()}>直达</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="category-group yijing-section">
            <h2 className="area-title">
              <span className="title-decor">✉</span>
              专属服务
            </h2>
            <a href="https://mail.usingai.qzz.io" target="_blank" rel="noopener noreferrer" className="yijing-card mail-card">
              <div className="yijing-icon mail-icon-glow">✉️</div>
              <div className="yijing-info">
                <h4>UsingAI 邮箱系统</h4>
                <p>mail.usingai.qzz.io</p>
              </div>
              <span className="yijing-arrow">直达 »</span>
            </a>
          </div>

          <div className="category-group yijing-section">
            <h2 className="area-title">
              <span className="title-decor">☯</span>
              经典学研
            </h2>
            <a href="/yijing.html" target="_blank" rel="noopener noreferrer" className="yijing-card">
              <div className="yijing-icon">☯</div>
              <div className="yijing-info">
                <h4>易经 · 六十四卦</h4>
                <p>古典哲学与六十四卦全解</p>
              </div>
              <span className="yijing-arrow">进入 »</span>
            </a>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <p>© 2026 UsingAI · AI 助理内容镜像站</p>
      </footer>
    </div>
  );
};

export default App;
