import { playMode } from '../common/js/config';
import { loadSearch, loadPlay, loadFavorite } from '../utils/cache';

const state = {
  singer: {},
  playing: false, // 是否正在播放音乐
  fullScreen: false, // 播放音乐是否全屏
  playList: [], // 播放列表
  sequenceList: [], // 获取到歌曲的顺序队列列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放的音乐下标
  disc: {}, // 当前歌单
  rankList: {}, // 当前点击的排行榜列表
  searchHistory: loadSearch(), // 搜索记录
  playHistory: loadPlay(), // 播放历史
  favoriteList: loadFavorite(),
};
export default state;
