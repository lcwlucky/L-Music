<template>
  <scroll direction="horizontal" class="root">
    <div class="list">
      <span class="title">{{ title }}</span>
      <span
        class="item"
        @click="onClick(item)"
        v-for="(item, i) in list"
        :key="i"
        :class="{ selected: oldVal === item.key }"
        >{{ item.name }}</span
      >
    </div>
  </scroll>
</template>

<script>
import scroll from '../../base/scroll/scroll.vue';

export default {
  components: { scroll },
  props: {
    list: {
      type: Array,
      default: [],
    },
    oldVal: {},
    title: {},
  },
  methods: {
    onClick(item) {
      this.$emit('onClick', item.key);
    },
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
.root
  width: 100%;
  overflow hidden
.list
  display: inline-flex;
  flex-wrap: nowrap
  align-items: center;
  height: 30px;
  span
    flex: 0 0 auto;
    font-size: 14px;
    padding: 5px 8px;
    opacity: 0.8;
    &.selected
      border-radius: 10px;
      border: 1px solid $color-theme;
  .title
    margin-right: 5px;
    padding: 5px 0;
    vertical-align: middle;
    color: $color-text-ll;
    border: none;
</style>
