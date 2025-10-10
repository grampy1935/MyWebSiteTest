const fullFetch = process.argv[2] === "true"; // 空文字やundefinedなら false 扱い
console.log("DEBUG: argv:", process.argv);
console.log("DEBUG: process.argv[2] =", process.argv[2]);
console.log("DEBUG fullFetch:", fullFetch);

const fs = require("fs");
const fetch = require("node-fetch");

const cacheFile = "static/videos.json";  // ← 出力先を static にする
//const cacheFile = ".youtube-cache.json";
const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const channelId = "UCQNEsdkAIU2Nebbb0fxNxww"; // ← youtubeのチャンネルID

// キャッシュ読み込み
let cache = [];
if (fs.existsSync(cacheFile)) cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));

/**
 * 最新動画を maxResults 件取得（tags含む）
 */
async function fetchLatest(maxResults = 10) {
  console.log("DEBUG: fetchLatest");

  // ① search API で動画ID取得
  const searchUrl = `${BASE_URL}/search?part=id&channelId=${channelId}&order=date&maxResults=${maxResults}&key=${API_KEY}`;
  console.log("DEBUG: Request URL =", searchUrl);
  const searchData = await fetch(searchUrl).then(res => res.json());
  console.log("DEBUG: raw search data =", JSON.stringify(searchData, null, 2));

  const videoIds = searchData.items
    .filter(i => i.id.kind === "youtube#video")
    .map(i => i.id.videoId)
    .join(",");

  if (!videoIds) return [];

  // ② videos API で詳細データ取得
  const videosUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
  const videosData = await fetch(videosUrl).then(res => res.json());

  // ③ 整形して返す
  return videosData.items.map(item => ({
    id: item.id,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    tags: item.snippet.tags || [],
  }));
}

/**
 * チャンネル内すべての動画を取得（複数ページ対応）
 */
async function fetchAll(maxResults = 50) {
  console.log("DEBUG: fetchAllFromUploadsPlaylist");

  // ① チャンネル情報を取得し、uploadsプレイリストIDを得る
  const channelUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
  const channelData = await fetch(channelUrl).then(res => res.json());
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    console.error("❌ uploads playlist not found");
    return [];
  }

  console.log("✅ uploadsPlaylistId =", uploadsPlaylistId);

  // ② プレイリスト内の全動画を取得
  let allVideos = [];
  let nextPageToken = "";

  do {
    const playlistUrl = `${BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${
      nextPageToken ? `&pageToken=${nextPageToken}` : ""
    }&key=${API_KEY}`;
    const playlistData = await fetch(playlistUrl).then(res => res.json());

    const videoIds = playlistData.items
      .map(i => i.contentDetails.videoId)
      .join(",");

    // ③ 動画詳細を取得
    const videosUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
    const videosData = await fetch(videosUrl).then(res => res.json());

    const videos = videosData.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      tags: item.snippet.tags || [],
    }));

    allVideos.push(...videos);
    nextPageToken = playlistData.nextPageToken || "";

    console.log(`✅ Added ${videos.length} videos, total ${allVideos.length}`);
  } while (nextPageToken);

  console.log(`🎉 Completed: ${allVideos.length} videos`);
  return allVideos;
}

(async () => {
  const excludeIds = ["5lNoj9EKuUM", "e3Ocd4BkArs", "jZ1UPjQD0hI", "CuQjypPdhFY", "YzvCrjbESSQ"]; // 除外したい動画ID
  //      "videoId":  "5lNoj9EKuUM", "title": "16秒ごとの時間と瞬間の時間（1985）",
  //      "videoId":  "e3Ocd4BkArs", "ロール楽譜の作り方",
  //      "videoId":  "jZ1UPjQD0hI", "「キラキラ星」を....。ショート No.1"
  //      "videoId":  "CuQjypPdhFY", "「Pretender」撮影時のNG動画" "other"
  //      "videoId":  "YzvCrjbESSQ", "ソーラー回転台の速度調節" "other"
  
  console.log("Tag情報も取得！");

  let videos;
  if (fullFetch) {
    console.log("📦 全件取得モード");
    videos = await fetchAll();
  } else {
    console.log("📦 最新10件取得モード");
    const latest = await fetchLatest(10);
    // 差分追加
    videos = [...latest.filter(l => !cache.find(c => c.id === l.id)), ...cache];
  }

  // videos から指定したidの動画を除外
  //videos = videos.filter(v => !excludeIds.includes(v.id));
  videos = videos.filter(v => v.id && !excludeIds.includes(v.id));

  // キャッシュ保存
  fs.writeFileSync(cacheFile, JSON.stringify(videos, null, 2));
  console.log(`✅ cache 更新済み: ${videos.length} 件`);

/*  // Markdown生成
  console.log(`videos.length: ${videos.length}`)
  const md = "# 動画一覧（Video List）\n\n" + generateMarkdown(videos);  // allVideos は fetch で取得した配列
  fs.writeFileSync("docs/gallery/videos.md", md); */
})();
