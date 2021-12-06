<!--搜索结果列表组件-->
<template>
  <scroll
    ref="suggest"
    class="suggest"
    :data="result"
    :pullup="pullup"
    :beforeScroll="beforeScroll"
    @scrollToEnd="searchMore"
    @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from '../../base/scroll/scroll'
import Loading from '../../base/loading/loading'
import NoResult from '../../base/no-result/no-result'
import {search} from '../../api/search'
import {ERR_OK} from '../../api/config'
import {createSong,processSongsUrl} from '../../common/js/song'
import {mapMutations, mapActions} from 'vuex'
import Singer from '../../common/js/singer'

const TYPE_SINGER = 'singer'
const perpage = 20 //一次最多搜索几条数据

export default {
  props: {
    showSinger: {
      type: Boolean,
      default: true
    },
    query: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      page: 1, //搜索的页数
      pullup: true, //是否需要上拉加载更多
      beforeScroll: true,
      hasMore: true, //是否还有更多数据
      result: []
    }
  },
  methods: {
    refresh() {
      this.$refs.suggest.refresh()
    },
    //搜索
    search() {
      this.page = 1 //如果query关键词变化了，搜索的页码和srcoll要重置
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)

      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result
          })
          this._checkMore(res.data)//检查是否还有更多数据，为了上拉加载更多
        }
      })
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
    selectItem(item) {
      if (item.type === TYPE_SINGER) { //如果是歌手跳到歌手详细页二级路由
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      //派发点击事件，存储搜索记录在本地
      this.$emit('select', this.getDisplayName(item))
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) { //搜索结果是歌手
        return item.singername
      } else {//搜索结果是歌曲
        return `${item.name}-${item.singer}`
      }
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
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
  .suggest-list
    padding: 0 30px
    .suggest-item
      display: flex
      align-items: center
      padding-bottom: 20px
    .icon
      flex: 0 0 30px
      width: 30px
      [class^="icon-"]
        font-size: 14px
        color: $color-text-d
    .name
      flex: 1
      font-size: $font-size-medium
      color: $color-text-d
      overflow: hidden
      .text
        no-wrap()
  .no-result-wrapper
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
