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
    params: { id, limit: 30 }
  });
}

// 获取歌曲播放地址
export function getSongUrl(id) {
  return request.get('/song/url', { params: { id } });
}

// 获取歌词
export const getLyricRequest = id => {
  return request.get(`/lyric?id=${id}`);
};
