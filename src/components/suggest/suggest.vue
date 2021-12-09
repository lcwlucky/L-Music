<!--搜索结果列表组件-->
<template>
  <scroll
    ref="suggest"
    class="suggest"
    :pullup="false"
    :beforeScroll="true"
    @scrollToEnd="searchMore"
    @beforeScroll="listScroll"
  >
    <div
      v-if="!albums.length && !artists.length && !songs.length"
      class="no-result-wrapper"
    >
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
    <div v-else class="suggest-list">
      <template v-if="artists.length">
        <h1 class="title">相关歌手</h1>
        <div class="suggest-item" v-for="(item, i) in artists" :key="i">
          <div class="img_wrapper">
            <img :src="item.picUrl" width="100%" height="100%" alt="music" />
          </div>
          <span class="name">歌手: {{ item.name }}</span>
        </div>
      </template>

      <template v-if="albums.length">
        <h1 class="title">相关歌单</h1>
        <div class="suggest-item" v-for="(item, i) in albums" :key="i">
          <div class="img_wrapper">
            <img
              :src="item.coverImgUrl"
              width="100%"
              height="100%"
              alt="music"
            />
          </div>
          <span class="name">歌单: {{ item.name }}</span>
        </div>
      </template>

      <ul v-if="songs.length">
        <li
          class="song-item"
          v-for="item in songs"
          :key="item.id"
          @click="selectItem(item)"
        >
          <p class="song-name">{{ item.name }}</p>
          <p class="song-art">
            {{ `${getName(item.artists)} - ${item.album.name}` }}
          </p>
        </li>
      </ul>
    </div>
    <!-- <ul class="suggest-list">
      <li
        @click="selectItem(item)"
        class="suggest-item"
        v-for="(item, i) in result"
        :key="i"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul> -->
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from '../../base/scroll/scroll'
import Loading from '../../base/loading/loading'
import NoResult from '../../base/no-result/no-result'
import {getSuggestListRequest, getResultSongsListRequest, getSongDetailRequest} from '../../api'
import {ERR_OK} from '../../api/config'
import {mapMutations, mapActions} from 'vuex'
import {getName} from '../../utils'

const TYPE_SINGER = 'singer'
const perpage = 20 //一次最多搜索几条数据

export default {
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // page: 1, //搜索的页数
      // pullup: true, //是否需要上拉加载更多
      // beforeScroll: true,
      // hasMore: true, //是否还有更多数据
      // result: [],
      albums: [],
      artists: [],
      songs: [],
    }
  },
  methods: {
    getName,
    refresh() {
      this.$refs.suggest.refresh()
    },
    //搜索
    async search(newQuery) {
      // this.page = 1 //如果query关键词变化了，搜索的页码和srcoll要重置
      // this.hasMore = true
      // this.$refs.suggest.scrollTo(0, 0)
      const {result: {
        playlists = [],
        artists = [],
      }} = await getSuggestListRequest(newQuery);
      this.albums = playlists;
      this.artists = artists;
      const res = await getResultSongsListRequest(newQuery)
      this.songs = res.result.songs
    },
    //下拉加载更多
    searchMore() {
      if (!this.hasMore) { //如果没有数据了
        return
      }
      this.page++ //搜索下一页
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
          })
          this._checkMore(res.data)
        }
      })
    },
    listScroll() {
      this.$emit('listScroll') //在滑动之前派发一个事件，用于搜索页面搜索框失去焦点取消键盘显示
    },
    async selectItem(item) {
      // 获取歌曲详情
      const {songs, code} = await getSongDetailRequest(item.id)
      if(code === ERR_OK && songs.length >=1) {
        this.insertSong(songs[0])
        //派发点击事件，存储搜索记录在本地
        this.$emit('select', this.getDisplayName(item))
      }
    },
    getDisplayName(item) {
      return item.name
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
        this.hasMore = false
      }
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query(newQuery) { //监听到关键词的变化就去搜索
      if(newQuery) //如果关键词不为空才搜索
        this.search(newQuery)
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"

.suggest
  height: 100%
  overflow: hidden

.title
  margin-bottom: 10px
  font-size: 14px

.suggest-list
  padding: 0 15px

.no-result-wrapper
  position: absolute
  width: 100%
  top: 50%
  transform: translateY(-50%)

.suggest-item
  display: flex
  align-items: center
  padding-bottom: 15px

.img_wrapper
  height: 50px
  width: 50px
  border-radius: 5px
  overflow: hidden
  margin-right: 12px
  .img
    object-fit: cover

.name
  flex: 1
  font-size: $font-size-medium
  color: $color-text-ll
  overflow: hidden
  no-wrap()

.song-item
  padding: 12px 0
  border-bottom: 1px solid rgba(255,255,255,0.2)
.song-name
  font-size: 14px
  color: $color-text-ll
.song-art
  margin-top: 10px
  font-size: 12px
  color: $color-text-l
</style>
