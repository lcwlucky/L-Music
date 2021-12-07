import request from './fetch';

export function getRecommend() {
  return request('/banner');
}

export function getDiscList() {
  return request('/personalized');
}

// 获取歌单歌曲列表
export function getSongList(id) {
  return request.get('/playlist/track/all', {
    params: { id, limit: 30 }
  });
}

export function getSongUrl(id) {
  return request.get('/song/url', { params: { id } });
}
