export default {
  currentSinger(state) {
    return state.singer;
  },
  playing(state) {
    return state.playing;
  },
  fullScreen(state) {
    return state.fullScreen;
  },
  playList(state) {
    return state.playList;
  },
  sequenceList(state) {
    return state.sequenceList;
  },
  mode(state) {
    return state.mode;
  },
  currentIndex(state) {
    return state.currentIndex;
  },
  currentSong(state) {
    return state.playList[state.currentIndex] || {};
  },
  currentDisc(state) {
    return state.disc;
  },
  rankList(state) {
    return state.rankList;
  },
  searchHistory(state) {
    return state.searchHistory;
  },
  playHistory(state) {
    return state.playHistory;
  },
  favoriteList(state) {
    return state.favoriteList;
  },
};
