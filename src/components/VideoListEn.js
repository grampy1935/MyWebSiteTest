import "./VideoList.css";
import React, { useState, useMemo } from 'react';

let videosData;
if (process.env.NODE_ENV === 'development') {
  // ローカル開発時（npm run start）
  videosData = require('../../videos.json');
} else {
  // ビルド・本番時（npm run build / GitHub Pages）
  videosData = require('@site/static/videos.json');
}

//export default videosData;
//import videosData from '../../videos.json';
//import videosData from '@site/static/videos.json'; // Docusaurus の static 配下を読み込む場合
import he from "he";
 
function Pagination({ currentPage, totalPages, onPageChange }) {
  const range = 3; // 現在ページ前後の表示範囲
  const pages = [];

  const start = Math.max(1, currentPage - range);
  const end = Math.min(totalPages, currentPage + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexWrap: "nowrap",
      }}
    >
      {/* 先頭 */}
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        ≪
      </button>

      {/* 前へ */}
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        ＜
      </button>

      {/* 横スクロール可能なページ番号部分 */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          whiteSpace: "nowrap",
          gap: "4px",
          flex: "1 1 auto",
        }}
      >
        {start > 1 && <span style={{ padding: "0 4px" }}>…</span>}

        {pages.map((page) => (
          <button
            key={page}
            className={`page-number ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}

        {end < totalPages && <span style={{ padding: "0 4px" }}>…</span>}
      </div>

      {/* 次へ */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ＞
      </button>

      {/* 最後 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        ≫
      </button>
    </div>
  );
}

export default function VideoGallery() {
  const [searchQuery, setSearchQuery] = useState(''); // 検索ワード
  const [reverse, setReverse] = useState(false);  //  表示順序 
  const [filter, setFilter] = useState("all");          //  絞り込み状態
  const [page, setPage] = useState(1);
  const perPage = 10; // 1ページあたりの動画件数

  // 絞り込み＋検索＋順序反転
  const filteredVideos = useMemo(() => {
    let list = videosData;

    // タグによる short / normal 絞り込み
    if (filter === 'short') {
      list = list.filter((v) => v.tags?.includes('short'));
    } else if (filter === 'normal') {
      list = list.filter((v) => !v.tags?.includes('short'));
    }

    // タイトル or タグに検索文字列が含まれているか
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // 順序反転
    if (reverse) {
      list = [...list].reverse();
    }

    return list;
  }, [filter, searchQuery, reverse]);

  const totalPages = Math.ceil(filteredVideos.length / perPage);
  const startIndex = (page - 1) * perPage;
  const pageVideos = filteredVideos.slice(startIndex, startIndex + perPage);

  // ページ変更時に先頭にスクロール
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <div> 
      {/* ✅ 絞り込みボタン */}
      <div className="center-flex">
        {["all", "short", "normal"].map(f => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              //setPage(Math.ceil(1));
              // フィルター後の総ページ数を仮計算して調整
              const newTotalPages = Math.ceil(
                videosData.filter(v =>
                  f === "short" ? v.tags?.includes("short")
                  : f === "normal" ? !v.tags?.includes("short")
                  : true
                ).length / perPage
              );

              setPage(p => (p > newTotalPages ? newTotalPages || 1 : p));
            }}
            className={`btn ${filter === f ? "active" : ""}`}
          >
            {f === "all" ? "All" : f === "short" ? "Short" : "Movie"}
          </button>
        ))}

        {/* 並び順ボタン */}
        <button
          onClick={() => setReverse(!reverse)}
          className={`btn ${reverse ? "" : ""}`}
        >
          {reverse ? "Oldest△" : "Newest▽"}
        </button>        
      </div>

      {/* 検索ボックス */}
      <div className="center-flex-vertical">
        Search
        <input
          type="text"
          placeholder="Search by Title or Tag ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '50%', padding: '0.5rem', marginBottom: '1rem', verticalAlign: 'top', }}
        />
        {searchQuery && (
          <button
            className="btn"
            style={{
              padding: '0.4rem 0.8rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
            onClick={() => setSearchQuery('')}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ✅ ページネーション */}
      <div className="pagination">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <div className="video-list">
        {pageVideos.map(video => (
          <div key={video.id} className="video-item">
            <h3 className="video-title">{he.decode(video.title)}</h3>
            <div className="video-wrapper">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
