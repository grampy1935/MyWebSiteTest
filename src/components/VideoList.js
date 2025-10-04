import React, { useState } from 'react';
import videosData from '@site/static/videos.json'; // Docusaurus の static 配下を読み込む場合
 
function Pagination({ currentPage, totalPages, onPageChange }) {
  // 前後3ページの範囲を計算
  const pageNumbers = [];
  for (
    let i = Math.max(1, currentPage - 3);
    i <= Math.min(totalPages, currentPage + 3);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination" style={{ margin: "20px 0", textAlign: "center" }}>
      {/* 先頭へ */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        ≪
      </button>

      {/* 前へ */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ＜
      </button>

      // 先頭に…を挿入するか
      if (currentPage > 4) {
        <div>...</div>
      }

      {/* ページ番号 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
          style={{
            fontWeight: page === currentPage ? "bold" : "normal",
            margin: "0 3px"
          }}
        >
          {page}
        </button>
      ))}

      {/* 次へ */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ＞
      </button>

      {/* 最後へ */}
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
            <h3 className="video-title">{video.title}</h3>
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
          .pagination button {
            margin: 0 8px;
            padding: 8px 16px;
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