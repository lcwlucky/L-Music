<template>
  <div ref="singer">
    <horizon
      @onClick="handleChangeCategory"
      title="分类(默认热门):"
      :list="categoryTypes"
      :oldVal="category"
    ></horizon>
    <horizon
      @onClick="handleChangeAlpha"
      title="首字母:"
      :list="alphaTypes"
      :oldVal="alpha"
    ></horizon>
    <scroll
      :data="singers"
      ref="scroll"
      class="list"
      :style="{ height: '100%', overflow: 'hidden' }"
    >
      <div>
        <div
          class="list-item"
          v-for="(item, i) in singers"
          :key="i"
          @click="selectSinger(item)"
        >
          <div class="img_wrapper">
            <img
              :src="`${item.picUrl}?param=300x300`"
              width="100%"
              height="100%"
              alt="music"
            />
          </div>
          <span class="name">{{ item.name }}</span>
        </div>
      </div>
    </scroll>
    <!-- <Listview :data="singers" @select="selectSinger" ref="list" /> -->
    <router-view></router-view>
  </div>
</template>

<script>
import { ERR_OK } from '../../api/config';
import { getSingerListRequest, getHotSingerListRequest } from '../../api';
import Listview from '../../base/listview/listview';
import { mapMutations } from 'vuex';
import { playlistMixin } from '../../common/js/mixin';
import Horizon from './Horizon.vue';
import { categoryTypes, alphaTypes } from '../../api/config';
import Scroll from '../../base/scroll/scroll.vue';

export default {
  mixins: [playlistMixin],
  data() {
    return {
      singers: [],
      categoryTypes,
      alphaTypes,
      category: '',
      alpha: '',
    };
  },
  created() {
    this.getSingerList();
  },
  watch: {
    async category(val) {
      const res = await getSingerListRequest(val, this.alpha);
      if (res.code === ERR_OK) {
        this.singers = res.artists;
      }
    },
    async alpha(val) {
      const res = await getSingerListRequest(this.category, val);
      if (res.code === ERR_OK) {
        this.singers = res.artists;
      }
    },
  },
  methods: {
    // 获取歌手数据
    async getSingerList() {
      const res = await getHotSingerListRequest(0);
      if (res.code === ERR_OK) {
        this.singers = res.artists;
      }
    },

    handleChangeCategory(category) {
      this.category = category;
    },

    handleChangeAlpha(alpha) {
      this.alpha = alpha;
    },

    // listview组件item的回调
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`,
      });
      this.setSinger(singer);
    },
    ...mapMutations({
      setSinger: 'SET_SINGER',
    }),

    handlePlaylist(playlist) {
      // mixin中当播放列表发生变化时
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.singer.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },
  },
  components: {
    Listview,
    Horizon,
    Scroll,
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
.list
  position: fixed
  top: 148px
  bottom: 0
  width: 100%
  overflow hidden
.list-item
  display: flex
  align-items: center
  margin: 0 5px;
  padding: 5px 10px;
.img_wrapper
  margin-right: 20px;
  img
    width: 50px
    height: 50px
    border-radius: 3px
.name
  font-size: 14px;
  color: $color-text-ll;
  font-weight: 500;
</style>
