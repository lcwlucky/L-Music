<!--添加歌曲到列表的组件-->
<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box
          ref="searchBox"
          @query="onQueryChange"
          placeholder="搜索歌曲"
        ></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches
          :switches="switches"
          :currentIndex="currentIndex"
          @switch="switchItem"
        ></switches>
        <div class="list-wrapper">
          <scroll
            ref="songList"
            v-if="currentIndex === 0"
            class="list-scroll"
            :data="playHistory"
          >
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"> </song-list>
            </div>
          </scroll>
          <scroll
            :refreshDelay="refreshDelay"
            ref="searchList"
            v-if="currentIndex === 1"
            class="list-scroll"
            :data="searchHistory"
          >
            <div class="list-inner">
              <search-list
                @delete="deleteSearchHistory"
                @select="addQuery"
                :searches="searchHistory"
              ></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest
          :query="query"
          :showSinger="showSinger"
          @select="selectSuggest"
          @listScroll="blurInput"
        ></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from '../../base/search-box/search-box'
import SongList from '../../base/song-list/song-list'
import SearchList from '../../base/search-list/search-list'
import Scroll from '../../base/scroll/scroll'
import Switches from '../../base/switches/switches'
import TopTip from '../../base/top-tip/top-tip'
import Suggest from '../../components/suggest/suggest'
import {searchMixin} from '../../common/js/mixin'
import {mapGetters, mapActions} from 'vuex'

export default {
  mixins: [searchMixin],
  data() {
    return {
      showFlag: false, //是否显示add-song本组件
      showSinger: false,
      currentIndex: 0, //当前切换按钮的下标
      songs: [],
      switches: [ //传入切换按钮的信息
        {
          name: '最近播放'
        },
        {
          name: '搜索历史'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  methods: {
    show() {
      this.showFlag = true
      setTimeout(() => { //初始显示的时候要refresh一下，要不然滑不动
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    //点击播放历史中的某条插入到播放列表中
    selectSong(song, index) {
      if (index !== 0) { //第一条为正在播放的不用管
        this.insertSong(song)
        this.$refs.topTip.show()
      }
    },
    //点击某条搜索结果，保存到搜索记录中
    selectSuggest() {
      this.$refs.topTip.show()
      this.saveSearch()
    },
    //当切换按钮改变时
    switchItem(index) {
      this.currentIndex = index
    },
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    SearchBox,
    SongList,
    SearchList,
    Scroll,
    Switches,
    TopTip,
    Suggest
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"

.add-song
  position: fixed
  top: 0
  bottom: 0
  width: 100%
  z-index: 200
  background: $color-background
  &.slide-enter-active, &.slide-leave-active
    transition: all 0.3s
  &.slide-enter, &.slide-leave-to
    transform: translate3d(100%, 0, 0)
  .header
    position: relative
    height: 44px
    text-align: center
    .title
      line-height: 44px
      font-size: $font-size-large
      color: $color-text
    .close
      position: absolute
      top: 0
      right: 8px
      .icon-close
        display: block
        padding: 12px
        font-size: 20px
        color: $color-theme

  .search-box-wrapper
    margin: 20px
  .shortcut
    .list-wrapper
      position: absolute
      top: 165px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
  .search-result
    position: fixed
    top: 124px
    bottom: 0
    width: 100%
  .tip-title
    text-align: center
    padding: 18px 0
    font-size: 0
    .icon-ok
      font-size: $font-size-medium
      color: $color-theme
      margin-right: 4px
    .text
      font-size: $font-size-medium
      color: $color-text
</style>
