const fullFetch = process.argv[2] === "true"; // 空文字やundefinedなら false 扱い
console.log("DEBUG: argv:", process.argv);
console.log("DEBUG: process.argv[2] =", process.argv[2]);
console.log("DEBUG fullFetch:", fullFetch);

const fs = require("fs");
const fetch = require("node-fetch");

const cacheFile = "static/videos.json";  // ← 出力先を static にする
//const cacheFile = ".youtube-cache.json";
const channelId = "UCQNEsdkAIU2Nebbb0fxNxww"; // ← youtubeのチャンネルID

// キャッシュ読み込み
let cache = [];
if (fs.existsSync(cacheFile)) cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));

async function fetchLatest(maxResults) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`;
  console.log("DEBUG: Request URL =", url);
  const res = await fetch(url);
  const data = await res.json();

  console.log("DEBUG: raw data = ", JSON.stringify(data, null, 2)); // 👈 追加

  return (data.items || []).map(i => ({
    id: i.id?.videoId,
    title: i.snippet?.title,
    publishedAt: i.snippet?.publishedAt,
  }));
}

async function fetchAll() {
  let all = [];
  let nextPageToken = "";
  let url = "";
  let maxResults = 50;
  do {
    if (nextPageToken != "") {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${process.env.YOUTUBE_API_KEY}`;
    } else {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`;
    }

    //const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${channelId}&part=id&order=date&maxResults=50&pageToken=${nextPageToken}`;
    const data = await fetch(url).then(res => res.json());

    //console.log("DEBUG: items = ", JSON.stringify(data.items, null, 2));

    if (!data.items) break;
    all.push(...data.items.map(i => ({ id: i.id.videoId, title: i.snippet.title, publishedAt: i.snippet.publishedAt })));
    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);
  return all;
}

/* function generateMarkdown(videos) {
  return videos.map(v => `
### ${v.title}
<div class="video-container">
    <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/${v.id}"
    allowfullscreen
    title="${v.title}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    allowfullscreen>
    </iframe>
</div>
${v.description || ''}
`).join('\n');
} */

(async () => {
  const excludeIds = ["5lNoj9EKuUM", "e3Ocd4BkArs"]; // 除外したい動画ID
  //      "videoId": "5lNoj9EKuUM", "title": "16秒ごとの時間と瞬間の時間（1985）",
  //      "videoId": "e3Ocd4BkArs", "ロール楽譜の作り方",

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
