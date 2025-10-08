import React, { useState } from 'react';
import videosData from './videos.json';
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
  const [filter, setFilter] = useState("all"); // ← 絞り込み状態
  const [page, setPage] = useState(1);

  const perPage = 10; // 1ページあたりの動画件数

  // 絞り込み処理
  const filteredVideos = videosData.filter(v => {
    if (filter === "short") return v.tags?.includes("short");
    if (filter === "normal") return !v.tags?.includes("short");
    return true;
  });

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
            {f === "all" ? "全て" : f === "short" ? "ショート" : "動画"}
          </button>
        ))}
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

      <style>
        {`
          /* --- 共通コンテナ --- */
          .center-flex {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem; /* Tailwindの gap-2 に相当 */
            margin: 1rem 0;
          }
          /* --- ボタン共通 --- */
          .btn {
            padding: 0.5rem 1rem; /* py-2 px-4 */
            border-radius: 0.5rem; /* rounded-lg */
            border: 1px solid #ccc; /* border-gray-300 */
            background-color: #fff;
            color: #444;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn:hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
          }
          /* --- ボタン選択中 --- */
          .btn.active {
            background-color: #1f2937; /* bg-gray-800 */
            border-color: #1f2937;
            color: #fff;
          }
          /* --- ページ番号 --- */
          .page-number {
            padding: 0.4rem 0.8rem;
            border-radius: 0.4rem;
            border: 1px solid #ccc;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .page-number:hover {
            background-color: #f3f4f6;
          }
          .page-number.active {
            background-color: #1f2937;
            border-color: #1f2937;
            color: #fff;
          }
          .pagination {
            margin-top: 16px;
            text-align: center;
          }
          .pagination {
            display: flex;
            flex-wrap: wrap;       /* 幅が狭いと折り返す */
            justify-content: center; /* 中央寄せ */
            gap: 0.5rem;           /* ボタン間の間隔 */
            max-width: 100%;       /* 画面幅からはみ出さない */
            overflow-x: auto;      /* はみ出したら横スクロール */
          }
          .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
          }
          .video-container iframe {
            width: 100%;
            aspect-ratio: 16/9;
          }
          .video-list {
            display: flex;
            flex-direction: column; /* 縦並び */
            gap: 2rem; /* 動画の間隔 */
          }
          .video-item {
            display: flex;
            flex-direction: column;
            align-items: center; /* 中央寄せ */
          }
          .video-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            align-self: flex-start; /* ← タイトルだけ左寄せ */
            text-align: left;
          }
          .video-wrapper {
            width: 100%;
            max-width: 560px; /* PC の場合の最大幅 */
            aspect-ratio: 16 / 9; /* 動画をアスペクト比固定でレスポンシブ */
          }
          .video-wrapper iframe {
            width: 100%;
            height: 100%;
          }
        `}
      </style>
    </div>
  );
}
