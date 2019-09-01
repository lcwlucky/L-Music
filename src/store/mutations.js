import * as types from './mutation-types'

export default {
  [types.SET_SINGER](state,singer){
    state.singer = singer
  },
  [types.SET_PLAYING_STATE](state,isPlaying){
    state.playing = isPlaying
  },
  [types.SET_FULL_SCREEN](state,fullScreen){
    state.fullScreen = fullScreen
  },
  [types.SET_PLAYLIST](state,list){
    state.playList = list
  },
  [types.SET_CURRENT_INDEX](state,index){
    state.currentIndex = index
  },
  [types.SET_SEQUENCE_LIST](state,list){
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE](state,mode){
    state.mode = mode
  },
  [types.SET_DISC](state,disc){
    state.disc = disc
  },
  [types.SET_RANK_LIST](state,rankList){
    state.rankList = rankList
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  },
}
