import * as types from './mutation-types';
import { shuffle } from '../common/js/utils';
import { playMode } from '../common/js/config';
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite,
} from '../common/js/cache';

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id;
  });
}
export default {
  //点击某首音乐播放
  setSelectPlay({ commit, state }, { list, index }) {
    console.log(index);
    commit(types.SET_SEQUENCE_LIST, list); //音乐顺序列表
    if (state.mode === playMode.random) {
      //如果播放模式是随机
      let randomList = shuffle(list); //设置播放列表为乱序
      commit(types.SET_PLAYLIST, randomList);
      index = randomList.findIndex((item) => item.id === list[index].id); //找到当前点击的歌曲在乱序中的下标位置
    } else {
      commit(types.SET_PLAYLIST, list); //音乐播放列表
    }

    commit(types.SET_CURRENT_INDEX, index); //当前播放下标
    commit(types.SET_FULL_SCREEN, true); //全屏标志
    commit(types.SET_PLAYING_STATE, true); //播放状态
  },

  randomPlay({ commit }, { list }) {
    //music-list 组件中随机播放按钮点击事件
    commit(types.SET_PLAY_MODE, playMode.random); //设置播放模式
    commit(types.SET_SEQUENCE_LIST, list); //音乐顺序列表
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList); //音乐播放列表
    commit(types.SET_CURRENT_INDEX, 0); //当前音乐播放下标
    commit(types.SET_FULL_SCREEN, true); //全屏标志
    commit(types.SET_PLAYING_STATE, true); //播放状态
  },

  /*插入一首歌到播放列表中*/
  insertSong({ commit, state }, song) {
    let playlist = state.playList.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;
    // 记录当前歌曲
    let currentSong = playlist[currentIndex];
    // 查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song);
    // 因为是插入歌曲，所以索引+1
    currentIndex++;
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song);
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
      // 如果当前插入的序号大于列表中的序号
      if (currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1);
        currentIndex--;
      } else {
        playlist.splice(fpIndex + 1, 1);
      }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1;
    let fsIndex = findIndex(sequenceList, song);
    sequenceList.splice(currentSIndex, 0, song);
    if (fsIndex > -1) {
      if (currentSIndex > fsIndex) {
        sequenceList.splice(fsIndex, 1);
      } else {
        sequenceList.splice(fsIndex + 1, 1);
      }
    }

    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
  },

  /*插入一条记录到搜索记录中*/
  saveSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query));
  },

  deleteSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
  },

  clearSearchHistory({ commit }) {
    commit(types.SET_SEARCH_HISTORY, clearSearch());
  },

  //从播放列表中删除某首歌
  deleteSong({ commit, state }, song) {
    let playlist = state.playList.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;
    let pIndex = findIndex(playlist, song);
    playlist.splice(pIndex, 1);
    let sIndex = findIndex(sequenceList, song);
    sequenceList.splice(sIndex, 1);
    if (currentIndex > pIndex || currentIndex === playlist.length) {
      currentIndex--;
    }

    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);

    if (!playlist.length) {
      commit(types.SET_PLAYING_STATE, false);
    } else {
      commit(types.SET_PLAYING_STATE, true);
    }
  },

  //清空播放列表
  deleteSongList({ commit }) {
    commit(types.SET_CURRENT_INDEX, -1);
    commit(types.SET_PLAYLIST, []);
    commit(types.SET_SEQUENCE_LIST, []);
    commit(types.SET_PLAYING_STATE, false);
  },

  //插入一首歌到播放历史中
  savePlayHistory({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song));
  },

  saveFavoriteList({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song));
  },

  deleteFavoriteList({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
  },
};
