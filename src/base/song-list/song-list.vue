<!--歌曲列表组件-->
<template>
  <div class="song-list">
    <ul>
      <li
        class="item"
        @click="selectItem(song, index)"
        v-for="(song, index) in songs"
        :key="index"
      >
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{ song.name }}</h2>
          <p class="desc">{{ getDesc(song) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: [],
    },
    rank: {
      // 标志是否是排行榜显示
      type: Boolean,
      default: false,
    },
  },
  methods: {
    // 歌曲描述
    getDesc(song) {
      return song.ar && song.ar.length > 0 ? song.ar[0].name : '未知歌手';
    },
    selectItem(item, index) {
      this.$emit('select', item, index); // 派发item的点击事件
    },
    getRankCls(index) {
      if (index <= 2) {
        return `icon icon${index}`;
      } else {
        return 'text';
      }
    },
    getRankText(index) {
      if (index > 2) {
        return index + 1;
      }
    },
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"

.song-list
  .item
    display: flex
    align-items: center
    box-sizing: border-box
    height: 64px
    font-size: $font-size-medium
    .rank
      flex: 0 0 25px
      width: 25px
      margin-right: 30px
      text-align: center
      .icon
        display: inline-block
        width: 25px
        height: 24px
        background-size: 25px 24px
        &.icon0
          bg-image('first')
        &.icon1
          bg-image('second')
        &.icon2
          bg-image('third')
      .text
        color: $color-theme
        font-size: $font-size-large
    .content
      flex: 1
      line-height: 20px
      overflow: hidden
      .name
        no-wrap()
        color: $color-text
      .desc
        no-wrap()
        margin-top: 4px
        color: $color-text-d
</style>
