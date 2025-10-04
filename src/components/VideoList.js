import React, { useState } from 'react';
import videosData from '@site/static/videos.json'; // Docusaurus の static 配下を読み込む場合
 
export default function VideoGallery() {
  const [page, setPage] = useState(0);
  const perPage = 10; // 1ページあたりの動画件数
  const totalPages = Math.ceil(videosData.length / perPage);
 
  const pageVideos = videosData.slice(page * perPage, (page + 1) * perPage);
 
  return (
    <div> 
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          前
        </button>
        <span> {page + 1} / {totalPages} </span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
          次
        </button>
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