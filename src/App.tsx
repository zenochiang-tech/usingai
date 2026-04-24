import React, { useState, useMemo, useEffect } from 'react';
import { POSTS as STATIC_POSTS, TOOLS } from './data/content';
import type { BlogPost } from './data/content';
import './App.css';

// 动态扫描 src/posts 目录下的所有 .md 文件
const markdownFiles = import.meta.glob('./posts/*.md', { eager: true, query: '?raw' });

const App: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [flippedToolId, setFlippedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  // 解析 Markdown 文件
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
    return [...STATIC_POSTS, ...dynamicPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [dynamicPosts]);

  const categories = useMemo(() => Array.from(new Set(TOOLS.map(tool => tool.category))), []);

  const filteredPosts = useMemo(() => 
    allPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allPosts, searchQuery]);

  const innerVoices = useMemo(() => 
    allPosts.filter(p => p.tag === '内心独白').slice(0, 5)
  , [allPosts]);

  // 分页计算
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 页面复位逻辑
  const resetScroll = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handlePostClick = (post: BlogPost | null) => {
    setCurrentPost(post);
    resetScroll();
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    resetScroll();
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo" onClick={() => { handlePostClick(null); setCurrentPage(1); }}>Using<span>AI</span></h1>
        <div className="header-actions">
          <input 
            type="text" 
            placeholder="搜索灵感..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </header>

      <div className="main-layout">
        <main className="blog-feed">
          {currentPost ? (
            <article className="post-detail">
              <button className="back-btn" onClick={() => handlePostClick(null)}>← 返回列表</button>
              <div className="post-meta">
                <span className="post-tag">{currentPost.tag}</span>
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
              <h2 className="area-title">精选文章 ({filteredPosts.length})</h2>
              {currentPosts.length > 0 ? (
                <>
                  {currentPosts.map(post => (
                    <article key={post.id} className="post-card" onClick={() => handlePostClick(post)}>
                      <div className="post-meta">
                        <span className="post-tag">{post.tag}</span>
                        <span className="post-date">{post.date}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <div className="post-footer">
                        <span className="read-time">{post.readTime}</span>
                        <button className="read-more">阅读原文 →</button>
                      </div>
                    </article>
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button 
                          key={i + 1} 
                          onClick={() => paginate(i + 1)}
                          className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="no-results">未找到相关内容</p>
              )}
            </>
          )}
        </main>

        {/* 右侧：工具侧边栏 */}
        <aside className="sidebar">
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
                    <span className="reflection-link">查看思考 →</span>
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
        </aside>
      </div>

      <footer className="footer">
        <p>© 2026 UsingAI · AI 助理内容镜像站</p>
      </footer>
    </div>
  );
};

export default App;
