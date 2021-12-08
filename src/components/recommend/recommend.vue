<!--首页推荐组件-->
<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div
          v-if="recommends.length"
          class="slider-wrapper"
          ref="sliderWrapper"
        >
          <Carousel
            :datas="recommends"
            :delay="delay"
            @loadFinish="loadFinish"
          />
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              v-for="(item, i) in discList"
              :key="i"
              class="item"
              @click="selectItem(item)"
            >
              <div class="icon">
                <img width="60" height="60" v-lazy="item.picUrl" />
              </div>
              <div class="text">
                <p class="name" v-html="item.name"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading title="努力请求中..." />
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { ERR_OK } from '../../api/config';
import { getRecommedList, getBanner } from '../../api';
import Slider from '../../base/slider/slider';
import Scroll from '../../base/scroll/scroll';
import Loading from '../../base/loading/loading';
import { playlistMixin } from '../../common/js/mixin';
import { mapMutations } from 'vuex';
import Carousel from '../../base/carousel/carousel';

export default {
  mixins: [playlistMixin],
  data() {
    return {
      recommends: [],
      discList: [],
      delay: 3000
    };
  },
  created() {
    this._getBanner(); // 获取轮播图
    this._getRecommedList();
  },
  methods: {
    async _getBanner() {
      const res = await getBanner();
      if (res.code === ERR_OK) {
        this.recommends = res.banners;
      }
    },

    async _getRecommedList() {
      const res = await getRecommedList();
      if (res.code === ERR_OK) {
        this.discList = res.result;
      }
    },
    // 轮播图图片加载成功的回调
    loadFinish() {
      // 刷新sroll，重新渲染高度，这样做的目的的防止底部歌单列表先渲染于轮播图组件列表，这样scroll组件就没有轮播图组件的高度了
      // 这样之后轮播图组件渲染出来占用一部分scroll组件的高度后，底部歌单列表滑不到底部
      this.$refs.scroll.refresh();
    },
    selectItem(item) {
      this.$router.push({ path: `/recommend/${item.id}` });
      this.setCurrentDisc(item);
    },

    handlePlaylist(playlist) {
      // mixin中当播放列表发生变化时
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.recommend.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },

    ...mapMutations({
      setCurrentDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Loading,
    Scroll,
    Carousel
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
.recommend
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  .recommend-content
    height: 100%
    overflow: hidden
    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden
    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme
      .item
        display: flex
        box-sizing: border-box
        align-items: center
        padding: 0 20px 20px 20px
        .icon
          flex: 0 0 60px
          width: 60px
          padding-right: 20px
        .text
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium
          .name
            color: $color-text
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
