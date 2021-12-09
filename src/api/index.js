import request from './fetch';

// 获取轮播图
export function getBanner() {
  return request('/banner');
}

// 获取推荐页歌单列表
export function getRecommedList() {
  return request('/personalized');
}

// 获取歌单歌曲列表
export function getSongList(id) {
  return request.get('/playlist/track/all', {
    params: { id, limit: 30 },
  });
}

// 获取歌曲播放地址
export function getSongUrl(id) {
  return request.get('/song/url', { params: { id } });
}

// 获取歌词
export const getLyricRequest = (id) => {
  return request.get(`/lyric?id=${id}`);
};

//获取热门歌手列表
export const getHotSingerListRequest = (offset) => {
  return request.get(`/top/artists?offset=${offset}`);
};

// 获取歌手列表
export const getSingerListRequest = (category, alpha, count = 0) => {
  return request.get(
    `/artist/list?cat=${category}&initial=${alpha.toLowerCase()}&offset=${count}`
  );
};

// 获取歌手详情
export const getSingerInfoRequest = (id) => {
  return request.get(`/artists?id=${id}`);
};

// 获取热门搜索
export const getHotKeyWordsRequest = () => {
  return request.get(`/search/hot`);
};

// 根据关键词搜索推荐
export const getSuggestListRequest = (query) => {
  return request.get(`/search/suggest?keywords=${query}`);
};

// 根据关键词搜索歌曲
export const getResultSongsListRequest = (query) => {
  return request.get(`/search?keywords=${query}`);
};

// 获取歌曲详情
export const getSongDetailRequest = (id) => {
  return request.get(`/song/detail?ids=${id}`);
};

// 获取排行榜
export const getRankListRequest = () => {
  return request.get(`/toplist/detail`);
};

// 获取排行榜详情
export const getAlbumDetailRequest = (id) => {
  return request.get(`/playlist/detail?id=${id}`);
};
