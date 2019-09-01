<!--歌手、歌单详情-->
<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll class="list" ref="list" :data="songs" :probe-type="probeType" :listen-scroll="listenScroll"
      @scroll="scroll">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectSong" :rank="rank"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from '../../base/scroll/scroll'
  import Loading from '../../base/loading/loading'
  import SongList from '../../base/song-list/song-list'
  import {prefixStyle} from '../../common/js/dom'
  import {mapActions} from 'vuex'
  import {playlistMixin} from '../../common/js/mixin'

  const RESERVED_HEIGHT = 40  //顶部titleBar的高度
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter') //模糊，iphone下有效

  export default {
    mixins:[playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {  //标志是否是排行榜显示
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created(){
      this.probeType = 3
      this.listenScroll = true
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      },
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      //缓存顶部歌手图片高度。不用每次都进行dom操作
      this.imageHeight = this.$refs.bgImage.clientHeight
      //layer层向上移动的最小距离，即能滑到最上面
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
      //设置scroll组件的top值，恰好在图片下面
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      handlePlaylist(playlist) { //mixin中当播放列表发生变化时
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      //监听scroll组件的回调
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()
      },
      random() {//点击随机播放
        this.randomPlay({
          list: this.songs
        })
      },
      //监听song-list的点击事件
      selectSong(item,index) {
        this.setSelectPlay({
          list:this.songs,
          index
        })
      },

      ...mapActions(['setSelectPlay','randomPlay'])
    },
    watch: {
      scrollY(newVal) {
        let zIndex = 0 //bgImage图片容器的层级
        let scale = 1 ////向下滑动图片大小放大的比例
        let blur = 0
        const percent = Math.abs(newVal / this.imageHeight) //放大因子
        // layer层最多移动到titleBer底下
        let translateY =  Math.max(this.minTransalteY, newVal)
        if (newVal > 0) { //sroll组件大于0表示向下拉
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20, percent * 20)
        }
        //用一个layer层铺在scroll的下面，当设置scroll滚动可以超出，滚动scroll组件时layer层也跟着上下移动
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        this.$refs.filter.style[backdrop] = `blur(${blur}px)` //模糊效果，只在iPhone下有效
        //如果滑动距离超过了titleBar底下
        if(newVal < translateY){
          // 歌手图片的层级要提高以盖住scroll文字,且高度要改变为定义的titleBar的高度
          zIndex = 10
          this.$refs.bgImage.style.height = RESERVED_HEIGHT + 'px'
          this.$refs.bgImage.style.paddingTop = '0'
          this.$refs.playBtn.style.display = 'none'
        }else{//如果滑动距离不超过titleBar底下，则bgImage不变
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style[transform]= `scale(${scale})`
      }
    },
    components: {
      Scroll,
      Loading,
      SongList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      /*图片的宽高比为10:7  是通过容器的高度为0，paddingTop为70%实现的*/
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
