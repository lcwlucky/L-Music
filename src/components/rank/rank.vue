<template>
  <scroll class="rank" ref="rank">
    <div>
      <list title="官方榜" :list="officialList" @selectItem="selectItem"></list>
      <list
        title="全球榜"
        :list="globalList"
        :isGlobal="true"
        @selectItem="selectItem"
        :wrapStyle="{ paddingTop: `${officialList.length ? 12 : 0}px` }"
      ></list>
      <div class="loading-container" v-show="!rankList.length">
        <loading></loading>
      </div>
    </div>
    <router-view></router-view>
  </scroll>
</template>

<script>
import Scroll from '../../base/scroll/scroll';
import Loading from '../../base/loading/loading';
import { getRankListRequest } from '../../api';
import { ERR_OK } from '../../api/config';
import { playlistMixin } from '../../common/js/mixin';
import { mapMutations } from 'vuex';
import { filterIndex } from '../../utils';
import List from './list.vue';

export default {
  mixins: [playlistMixin],
  created() {
    this.getRankList();
  },
  data() {
    return {
      rankList: [],
      officialList: [],
      globalList: [],
    };
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.rank.style.bottom = bottom;
    },
    selectItem(item) {
      this.$router.push({
        path: `/rank/${item.id}`,
      });
      this.setRankList(item);
    },
    async getRankList() {
      const res = await getRankListRequest();
      if (res.code === ERR_OK) {
        this.rankList = res.list;
        const globalStartIndex = filterIndex(this.rankList);
        this.officialList = this.rankList.slice(0, globalStartIndex);
        this.globalList = this.rankList.slice(globalStartIndex);
      }
    },
    ...mapMutations({
      setRankList: 'SET_RANK_LIST',
    }),
  },
  components: {
    Scroll,
    Loading,
    List,
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"

.rank
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  overflow hidden
  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
