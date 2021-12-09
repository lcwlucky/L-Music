<template>
  <div :style="wrapStyle" v-if="list.length">
    <h1>{{ title }}</h1>
    <ul :class="{ 'list-wrap': true, global: isGlobal }">
      <li
        v-for="(item, i) in list"
        :key="i"
        @click="onClick(item)"
      >
        <div
          class="img_wrapper"
          :style="{
            width: isGlobal ? '32vw' : '27vw',
            height: isGlobal ? '32vw' : '27vw',
          }"
        >
          <img v-lazy="item.coverImgUrl" alt="" />
          <span class="update_frequecy">{{ item.updateFrequency }}</span>
        </div>
        <ul v-if="item.tracks.length" class="song-list">
          <li v-for="(track, i) in item.tracks" :key="i">
            {{ i + 1 }}. {{ track.first }} - {{ track.second }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
    },
    list: {
      type: Array,
      default: [],
    },
    wrapStyle: {
      type: Object,
      default: null,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    onClick(item) {
      this.$emit('selectItem', item)
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.list-wrap
  margin-top: 10px;
  padding: 0 5px;
  &.global
    display: flex
    justify-content: space-between;
    flex-wrap: wrap;
  li
    padding: 3px 0;
    display: flex
    align-items: center
  .img_wrapper
    border-radius: 3px;
    position: relative;
    img{
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
    .update_frequecy{
      position: absolute;
      left: 7px;
      bottom: 7px;
      font-size: 10px;
      color: #f1f1f1;
    }
.song-list
  margin-left: 12px
  li
    padding: 5px 0
    font-size: 12px
    color: $color-text-ll
h1
  margin: 10px 5px
  font-weight: 700
  font-size: 14px
</style>
