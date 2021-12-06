<!--歌手列表组件-->
<template>
  <scroll
    class="listview"
    ref="listview"
    @scroll="_scroll"
    :probe-type="probeType"
    :data="data"
    :listen-scroll="listenScroll"
  >
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li
            v-for="item in group.items"
            class="list-group-item"
            @click="selectItem(item)"
          >
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart.stop.prevent="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchend.stop
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :data-index="index"
          class="item"
          :class="{ current: currentIndex === index }"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{ fixedTitle }}</div>
    </div>
    <div class="show" ref="show">{{ fixedTitle }}</div>
    <Loading class="loading-container" v-show="!data.length" />
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from '../scroll/scroll'
import Loading from '../loading/loading'
import {getData} from '../../common/js/dom'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {//获取分类名称  热 A B - Z
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
    this.touch = {}
    this.listHeight = []
  },
  methods: {
    //派发歌手item的点击事件
    selectItem(item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart(e) {
      //anchorIndex:要去的锚点位置的下标
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      // this.touch.y1 = firstTouch.pageY
      this.touch.y1 = firstTouch.clientY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0]
      // this.touch.y2 = firstTouch.pageY
      this.touch.y2 = firstTouch.clientY
      //得到滚动了几个item  或0代表向下取整
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    //监听scroll组件派发的滚动事件
    _scroll(pos) {
      this.scrollY = pos.y
    },
    //计算每个歌手列表的所在位置
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _scrollTo(index) {
      //当点击导航上下两部分的padding的时候，index是没有的
      clearTimeout(this.timer)
      if (!index && index !== 0) {
        return
      }
      //滑动超出控制
      if (index < 0) {
        index = 0
      } else if (index > this.$refs.listGroup.length - 1) {
        index = this.$refs.listGroup.length - 1
      }
      this.$refs.show.style.opacity = 1
      // this.scrollY = -this.listHeight[index]
      //scrollToElement(el, time, offsetX, offsetY, easing) 作用：滚动到指定的目标元素。
      this.currentIndex = index
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      this.timer = setTimeout( () => {
        this.$refs.show.style.opacity = 0
      },1000)

    }
  },
  watch: {
    data() {
      this.$nextTick(() => {
        this._calculateHeight()
      })
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部，newY >0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"

.listview
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  background: $color-background
  .list-group
    padding-bottom: 30px
    .list-group-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
    .list-group-item
      display: flex
      align-items: center
      padding: 20px 0 0 30px
      .avatar
        width: 50px
        height: 50px
        border-radius: 50%
      .name
        margin-left: 20px
        color: $color-text-l
        font-size: $font-size-medium
  .list-shortcut
    position: absolute
    z-index: 30
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 20px
    padding: 20px 0
    border-radius: 10px
    text-align: center
    background: $color-background-d
    font-family: Helvetica
    .item
      padding: 3px
      line-height: 1
      color: $color-text-l
      font-size: $font-size-small
      &.current
        color: $color-theme
  .list-fixed
    position: absolute
    top: -1px
    left: 0
    width: 100%
    .fixed-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
  .show
    width 40px
    height 40px
    position absolute
    top 50%
    left 50%
    transform translate3d(-50%,-50%,0)
    background-color red
    text-align center
    transition opacity .5
    opacity 0
    border-radius 5px
    box-shadow rgba(255,255,255,.5) 0 0 5px 5px
    line-height 40px
</style>
