<!--搜索框组件-->
<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :placeholder="placeholder" />
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
import { debounce } from '../../utils';
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手',
    },
  },
  data() {
    return {
      query: '',
    };
  },
  created() {
    this.$watch(
      'query',
      debounce((newQuery) => {
        this.$emit('query', newQuery);
      }, 200)
    );
  },
  methods: {
    clear() {
      this.query = '';
    },
    setQuery(query) {
      this.query = query;
    },
    //取消聚焦，让键盘消失
    blur() {
      this.$refs.query.blur();
    },
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"

.search-box
  display: flex
  align-items: center
  box-sizing: border-box
  width: 100%
  padding: 0 6px
  height: 40px
  background: $color-highlight-background
  border-radius: 6px
  .icon-search
    font-size: 24px
    color: $color-background
  .box
    flex: 1
    margin: 0 5px
    line-height: 25px
    padding 0 5px
    background: $color-highlight-background
    color: $color-text
    outline: none
    border: none
    font-size: $font-size-medium
    &::placeholder
      color: $color-text-d
  .icon-dismiss
    font-size: 16px
    color: $color-background
</style>
