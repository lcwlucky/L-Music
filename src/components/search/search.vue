<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                @click="addQuery(item.k)"
                class="item"
                v-for="item in hotKeys"
                :key="item.first"
              >
                <span>{{ item.first }}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="clearHistory">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list
              :searches="searchHistory"
              @select="selectHistory"
              @delete="delectOneHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest
        ref="suggest"
        :query="query"
        @listScroll="blurInput"
        @select="saveHistory"
      ></suggest>
    </div>
    <confirm
      @confirm="confirmClear"
      text="是否清空搜索记录"
      ref="confirm"
    ></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from '../../base/search-box/search-box';
import Scroll from '../../base/scroll/scroll';
import SearchList from '../../base/search-list/search-list';
import Suggest from '../../components/suggest/suggest';
import { ERR_OK } from '../../api/config';
import { mapGetters, mapActions } from 'vuex';
import { playlistMixin } from '../../common/js/mixin';
import Confirm from '../../base/confirm/confirm';
import { getHotKeyWordsRequest } from '../../api';

const KEY = 'SEARCH_HISTORY';

export default {
  mixins: [playlistMixin],
  data() {
    return {
      hotKeys: [],
      query: '',
    };
  },
  created() {
    this.getHotKeyWords();
  },
  computed: {
    shortcut() {
      //scroll组件传入的data
      return this.hotKeys.concat(this.searchHistory);
    },
    ...mapGetters(['searchHistory']),
  },
  methods: {
    handlePlaylist(playlist) {
      //mixin中当播放列表发生变化时
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.searchResult.style.bottom = bottom;
      this.$refs.suggest.refresh();

      this.$refs.shortcutWrapper.style.bottom = bottom;
      this.$refs.shortcut.refresh();
    },
    async getHotKeyWords() {
      const res = await getHotKeyWordsRequest();
      if (res.code === ERR_OK) {
        if (res.result.hots <= 10) {
          this.hotKeys = res.result.hots;
        } else {
          this.hotKeys = res.result.hots.slice(0, 10);
        }
      }
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    //监听搜索框query关键词的变化
    onQueryChange(newQuery) {
      this.query = newQuery;
    },
    blurInput() {
      this.$refs.searchBox.blur();
    },
    //保存搜索记录
    saveHistory(item) {
      this.saveSearchHistory(item);
    },
    //选中某条搜索记录
    selectHistory(item) {
      this.$refs.searchBox.setQuery(item);
    },
    //删除某条搜索记录
    delectOneHistory(item) {
      this.deleteSearchHistory(item);
    },
    confirmClear() {
      this.clearSearchHistory();
      this.$refs.confirm.hide();
    },
    //清空搜索历史
    clearHistory() {
      this.$refs.confirm.show();
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory',
    ]),
  },
  components: {
    SearchBox,
    Scroll,
    Suggest,
    SearchList,
    Confirm,
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"

.search
  .search-box-wrapper
    margin: 20px
  .shortcut-wrapper
    position: fixed
    top: 178px
    bottom: 0
    width: 100%
    .shortcut
      height: 100%
      overflow: hidden
      .hot-key
        margin: 0 20px 20px 20px
        .title
          margin-bottom: 20px
          font-size: $font-size-medium
          color: $color-text-l
        .item
          display: inline-block
          padding: 5px 10px
          margin: 0 20px 10px 0
          border-radius: 6px
          background: $color-highlight-background
          font-size: $font-size-medium
          color: $color-text-d
      .search-history
        position: relative
        margin: 0 20px
        .title
          display: flex
          align-items: center
          height: 40px
          font-size: $font-size-medium
          color: $color-text-l
          .text
            flex: 1
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
  .search-result
    position: fixed
    width: 100%
    top: 178px
    bottom: 0
</style>
