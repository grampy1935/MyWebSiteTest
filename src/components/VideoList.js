import React, { useState } from 'react';
import videosData from '@site/static/videos.json'; // Docusaurus の static 配下を読み込む場合
import he from "he";
 
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto", // 横スクロールを有効にする
        whiteSpace: "nowrap", // 改行せずに横並び
        padding: "5px 0",
        gap: "4px",
      }}
    >
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
          style={{
            minWidth: "32px",
            padding: "5px 8px",
            fontWeight: page === currentPage ? "bold" : "normal",
            flex: "0 0 auto", // 横スクロールで縮まないように固定
          }}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

export default function VideoGallery() {
  const [page, setPage] = useState(1);
  const perPage = 10; // 1ページあたりの動画件数
  const totalPages = Math.ceil(videosData.length / perPage);
 
  const startIndex = (page - 1) * perPage;
  const pageVideos = videosData.slice(startIndex, startIndex + perPage);
  
  return (
    <div> 
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
          .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
          }
          .video-container iframe {
            width: 100%;
            aspect-ratio: 16/9;
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