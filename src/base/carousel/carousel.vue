<template>
  <div
    class="carousel-wrap"
    :needCarousel="needCarousel"
    :needAuto="needAuto"
    ref="carouselWrap"
    @touchstart.prevent="touchStart"
    @touchmove.prevent="touchMove"
    @touchend.prevent="touchEnd"
  >
    <ul class="list" :style="{ width: `${imgs.length}00%` }" ref="ulNode">
      <li
        v-for="(item, index) in imgs"
        :key="index"
        :style="{ width: `${(1 / imgs.length) * 100}%` }"
      >
        <a :href="item.linkUrl">
          <img
            :src="item.picUrl"
            alt=""
            ref="imgNodes"
            class="needsclick"
            @load="loadImage(index)"
          />
        </a>
      </li>
    </ul>
    <div class="points-wrap" ref="pointsWrap">
      <span
        :class="{ active: currentIndex === index }"
        v-for="(item, index) in datas"
        :key="index"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    needCarousel: {
      type: Boolean,
      default: true,
    },
    needAuto: {
      type: Boolean,
      default: true,
    },
    delay: {
      type: Number,
      default: 3000,
    },
    datas: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      currentIndex: 0,
      imgs: [],
    };
  },
  created() {
    this.position = {
      index: 0,
      startX: 0,
      startY: 0,
      elementX: 0,
      elementY: 0,
      isX: true,
      isFirst: true,
    };
  },
  mounted() {
    // 为了无缝滑屏
    this.imgs = this.datas.concat(this.datas);

    this.timer = 0;
    if (this.needAuto) {
      // 自动轮播
      this.auto();
    }
  },

  methods: {
    touchStart(ev) {
      var TouchC = ev.changedTouches[0];
      this.$refs.ulNode.style.transition = 'none';
      // 如果需要无限循环
      /* 点击第一组的第一张时 瞬间跳到第二组的第一张
            点击第二组的最后一张时  瞬间跳到第一组的最后一张 */
      if (this.needCarousel) {
        let index =
          this.css(this.$refs.ulNode, 'translateX') /
          document.documentElement.clientWidth;
        if (index === 0) {
          index = -this.datas.length;
          this.css(
            this.$refs.ulNode,
            'translateX',
            index * document.documentElement.clientWidth
          );
        } else if (-index === this.imgs.length - 1) {
          index = -(this.datas.length - 1);
          this.css(
            this.$refs.ulNode,
            'translateX',
            index * document.documentElement.clientWidth
          );
        }
      }

      this.position.startX = TouchC.clientX;
      this.position.startY = TouchC.clientY;
      this.position.elementX = this.css(this.$refs.ulNode, 'translateX');
      this.position.elementY = this.css(this.$refs.ulNode, 'translateY');
      // 清除定时器
      clearInterval(this.timer);
      this.position.isX = true;
      this.position.isFirst = true;
    },

    touchMove(ev) {
      if (!this.position.isX) {
        return;
      }
      let TouchC = ev.changedTouches[0];
      let nowX = TouchC.clientX;
      let nowY = TouchC.clientY;
      let disX = nowX - this.position.startX;
      let disY = nowY - this.position.startY;
      // 首次判断用户的滑动方向
      if (this.position.isFirst) {
        this.position.isFirst = false;
        // 判断用户的滑动方向
        if (Math.abs(disY) > Math.abs(disX)) {
          this.position.isX = false;
          return;
        }
      }
      this.css(this.$refs.ulNode, 'translateX', this.position.elementX + disX);
    },

    touchEnd(ev) {
      // index抽象了ul的实时位置
      let index =
        this.css(this.$refs.ulNode, 'translateX') /
        document.documentElement.clientWidth;
      index = Math.round(index); // 四舍五入，滑到一半换一张，不到一半就不换
      // 超出控制
      if (index > 0) {
        index = 0;
      } else if (index < 1 - this.imgs.length) {
        index = 1 - this.imgs.length;
      }
      this.currentIndex = -(index % this.datas.length);
      this.$refs.ulNode.style.transition = '.5s transform';
      this.css(
        this.$refs.ulNode,
        'translateX',
        index * document.documentElement.clientWidth
      );
      // 开启自动轮播
      if (this.needAuto) {
        this.auto();
      }
    },

    auto() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        let index =
          this.css(this.$refs.ulNode, 'translateX') /
          document.documentElement.clientWidth;
        if (index === 1 - this.imgs.length) {
          this.$refs.ulNode.style.transition = 'none';
          index = 1 - this.datas.length;
          this.currentIndex = 0;
          this.css(
            this.$refs.ulNode,
            'translateX',
            index * document.documentElement.clientWidth
          );
        }
        setTimeout(() => {
          // 开启延时是因为js执行很快，前面设置的ulNode.style.transition="none"可能会被覆盖
          index--;
          this.$refs.ulNode.style.transition = '1s transform';
          this.currentIndex = -index % this.datas.length;
          this.css(
            this.$refs.ulNode,
            'translateX',
            index * document.documentElement.clientWidth
          );
        }, 10);
      }, this.delay);
    },

    loadImage(index) {
      if (!this.checkloaded) {
        this.checkloaded = true; // 设置一个标志位，只要有一张轮播图图片成功回调后就可以获取高度了，防止重复无意义的执行
        this.$refs.carouselWrap.style.height =
          this.$refs.imgNodes[index].offsetHeight + 'px';
        this.$emit('loadFinish');
      }
    },

    css(node, type, val) {
      // 如果初始node节点没有transfom属性，添加一个对象属性
      if (
        typeof node === 'object' &&
        typeof node['transform'] === 'undefined'
      ) {
        node['transform'] = {};
      }

      // 如果参数大于三个代表要设置（参照jQuery）
      if (arguments.length >= 3) {
        var text = '';
        node['transform'][type] = val;
        for (let item in node['transform']) {
          if (node['transform'].hasOwnProperty(item)) {
            switch (item) {
              case 'translateX':
              case 'translateY':
              case 'translateZ':
                text += item + '(' + node['transform'][item] + 'px)';
                break;
              case 'scale':
                text += item + '(' + node['transform'][item] + ')';
                break;
              case 'rotate':
                text += item + '(' + node['transform'][item] + 'deg)';
                break;
            }
          }
        }
        node.style.transform = node.style.webkitTransform = text;
      } else if (arguments.length === 2) {
        // 读取
        val = node['transform'][type];
        if (typeof val === 'undefined') {
          switch (type) {
            case 'translateX':
            case 'translateY':
            case 'translateZ':
            case 'rotate':
              val = 0;
              break;
            case 'scale':
              val = 1;
              break;
          }
        }
        return val;
      }
    },
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
.carousel-wrap
  position relative;
  width 100%
  height 150px
  min-height 1px
  .list
    list-style none;
    overflow hidden;
    position absolute;
    li
     float left
     a
      display block
      img
       display block
       width 100%
  .points-wrap
    position absolute
    bottom 5px
    width 100%
    text-align center
    z-index 1
    span
      display inline-block
      width 10px
      height 10px
      border-radius 50%
      background: $color-text-l
      margin-left 5px;
      &.active
        width 20px
        border-radius 5px
        background $color-text-ll
</style>
