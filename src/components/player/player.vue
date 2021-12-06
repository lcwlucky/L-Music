<!--播放器组件-->
<template>
  <div class="player" v-show="playList.length">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="miniOrNormal(1)">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!--转盘-->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <!--歌词-->
          <scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  v-for="(line, index) in currentLyric.lines"
                  class="text"
                  :class="{ current: currentLineNum === index }"
                >
                  {{ line.txt }}
                </p>
              </div>
            </div>
          </scroll>
        </div>

        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <!--进度条-->
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @percentChange="onProgressBarChangeByUser"
              ></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="iconPlay" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i
                class="icon"
                @click="toggleFavorite(currentSong)"
                :class="getFavoriteIcon(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="miniOrNormal(2)">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls" />
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i
              @click.stop="togglePlaying"
              class="icon-mini"
              :class="iconPlayMini"
            ></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <play-list ref="playlist"></play-list>
    <audio
      ref="audio"
      @play="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import animations from 'create-keyframe-animation'; //js中创建CSS动画的第三方库
import { prefixStyle } from '../../common/js/dom';
import ProgressBar from '../../base/progress-bar/progress-bar';
import ProgressCircle from '../../base/progress-circle/progress-circle';
import { playMode } from '../../common/js/config';
import { shuffle } from '../../common/js/utils';
import Lyric from 'lyric-parser'; //解析歌词的第三方库
import Scroll from '../../base/scroll/scroll';
import PlayList from '../../components/playlist/playlist';

import { playerMixin } from '../../common/js/mixin';

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');

export default {
  mixin: [],
  data() {
    return {
      songReady: false, //判断歌曲是否准备好，用来防止连续快速点击上下切换歌曲
      currentTime: 0, //当前歌曲播放的进度
      radius: 32, //传入的圆形进度条宽度
      currentLyric: null, //当前歌词对象
      currentLineNum: 0, //当前歌词播放到第几行
      currentShow: 'cd', //当前显示cd转片还是歌词列表
      playingLyric: '', //正在播放到的歌词
    };
  },
  created() {
    this.touch = {};
  },
  methods: {
    showPlaylist() {
      this.$refs.playlist.show();
    },
    //放大或缩小播放器
    miniOrNormal(type) {
      // console.log(this.currentSong);
      if (type === 1) {
        this.setFullScreen(false);
      } else {
        this.setFullScreen(true);
      }
    },
    togglePlaying() {
      //设置播放状态
      if (!this.songReady) {
        return;
      }
      this.setPlayingState(!this.playing);
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    //播放下一首,当currentIndex改变时，currentSong也会改变
    next() {
      if (!this.songReady) {
        //防止连续点击
        return;
      }
      if (this.playList.length === 1) {
        //播放列表只有一首歌
        this.loop();
        return;
      } else {
        let index = this.currentIndex + 1;
        if (index == this.playList.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          //切换暂停按钮的显示
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    prev() {
      if (!this.songReady) {
        return;
      }
      if (this.playList.length === 1) {
        //播放列表只有一首歌
        this.loop();
        return;
      } else {
        let index = this.currentIndex - 1;
        if (index == -1) {
          index = this.playList.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          //切换暂停按钮的显示
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    disableCls() {
      return this.songReady ? '' : 'disable';
    },
    //audio加载成功的回调
    ready() {
      this.songReady = true;
      //将当前歌曲加入到播放历史中
      this.savePlayHistory(this.currentSong);
    },
    //audio加载失败的回调
    error() {
      this.songReady = true;
    },
    //audio时间更新的回调
    updateTime(e) {
      this.currentTime = e.target.currentTime;
    },
    //audio播放完成的回调
    end() {
      if (this.mode == playMode.loop) {
        //单曲循环
        this.loop();
      } else {
        this.next();
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      if (this.currentLyric) {
        this.currentLyric.seek(0); //歌词要重新开始
      }
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite';
      }
      return 'icon-not-favorite';
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id;
      });
      return index > -1;
    },
    //用户操作进度条变化的监听
    onProgressBarChangeByUser(percent) {
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      if (!this.playing) {
        this.togglePlaying();
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    //改变播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list); //设置当前的歌曲的index，防止改变播放模式之后歌曲播放顺序变了会导致当前的歌曲也会变化
      this.setPlayList(list);
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => item.id === this.currentSong.id);
      this.setCurrentIndex(index);
    },
    //获取歌词
    getLyric() {
      this.currentSong
        .getLyric()
        .then((lyric) => {
          // if (this.currentSong.lyric !== lyric) {
          //   return
          // }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          if (this.playing) {
            this.currentLyric.play(); //歌词滚动
          }
        })
        .catch(() => {
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0;
        });
    },
    //歌词播放的回调 lineNum：播放到的行数，txt：歌词信息
    handleLyric({ lineNum, txt }) {
      this.currentLineNum = lineNum;
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      this.playingLyric = txt;
    },
    //格式化时间
    format(interval) {
      interval = interval | 0;
      const minute = (interval / 60) | 0;
      const second = this._pad(interval % 60);
      return `${minute}:${second}`;
    },
    //时间不足两位的，在前面补0
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = '0' + num;
        len++;
      }
      return num;
    },

    /*
        左右滑动更改cd转盘和歌词
      * */
    middleTouchStart(e) {
      this.touch.initiated = true;
      // 用来判断是否是一次移动
      this.touch.moved = false;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      if (!this.touch.moved) {
        this.touch.moved = true;
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      );
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
    },
    middleTouchEnd() {
      if (!this.touch.moved) {
        return;
      }
      let offsetWidth;
      let opacity;
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          this.currentShow = 'cd';
          opacity = 1;
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      const time = 300;
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
      this.touch.initiated = false;
    },

    /*
         cd转片进入的动画效果
       */
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`,
        },
        70: {
          transform: `translate3d(0,0,0) scale(1.2)`,
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`,
        },
      };

      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear',
        },
      });

      animations.runAnimation(this.$refs.cdWrapper, 'move', done);
    },
    afterEnter() {
      animations.unregisterAnimation('move');
      this.$refs.cdWrapper.style.animation = '';
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s';
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      this.$refs.cdWrapper.addEventListener('transitionend', done);
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = '';
      this.$refs.cdWrapper.style[transform] = '';
    },

    //cd转动盘初始动画的坐标
    _getPosAndScale() {
      const targetWidth = 40; //底部小cd转片的宽度
      const paddingLeft = 40; //小cd转片中心距离左边的距离
      const paddingBottom = 30; //小cd转片中心距离底部的距离
      const paddingTop = 80; //大cd转片中心距离顶部的距离
      const width = window.innerWidth * 0.8; //大cd转片的宽度 样式设置为80%
      const scale = targetWidth / width; //缩放比例
      const x = -(window.innerWidth / 2 - paddingLeft); //初始时大cd转片的x偏移量
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom; //初始时大cd转片的Y偏移量
      return {
        x,
        y,
        scale,
      };
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
    }),
    ...mapActions([
      'savePlayHistory',
      'deleteFavoriteList',
      'saveFavoriteList',
    ]),
  },
  computed: {
    //播放进度
    percent() {
      return this.currentTime / this.currentSong.duration;
    },
    cdCls() {
      //唱片的转动
      return this.playing ? 'play' : 'play pause'; //添加相应的class，class中有annimation动画
    },
    //播放暂停图片的改变
    iconPlay() {
      return this.playing ? 'icon-pause' : 'icon-play';
    },
    iconPlayMini() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
    },
    iconMode() {
      if (this.mode === playMode.loop) {
        return 'icon-loop';
      }
      if (this.mode === playMode.random) {
        return 'icon-random';
      }
      return 'icon-sequence';
      // return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.random ? 'icon-random' : 'icon-loop'
    },
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList',
      'favoriteList',
    ]),
  },
  watch: {
    //监视播放状态的变化让audio暂停或停止
    playing(newPlay) {
      this.$nextTick(() => {
        const audio = this.$refs.audio;
        newPlay ? audio.play() : audio.pause();
      });
    },
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return;
      }
      if (this.currentLyric) {
        //如果当前有歌词解析对象，先停止
        this.currentLyric.stop();
        this.currentTime = 0;
        this.playingLyric = '';
        this.currentLineNum = 0;
      }
      this.songReady = false;
      this.$refs.audio.src = newSong.url;
      this.$nextTick(() => {
        this.$refs.audio.play();
        this.getLyric(); //获取歌词
      });
    },
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList,
  },
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/variable.styl"
@import "../../common/stylus/mixin.styl"
.player
  .normal-player
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 150
    background: $color-background

    .background
      position: absolute
      left: 0
      top: 0
      width: 100%
      height: 100%
      z-index: -1
      opacity: 0.6
      filter: blur(20px)

    .top
      position: relative
      margin-bottom: 25px

      .back
        position absolute
        top: 0
        left: 6px
        z-index: 50

        .icon-back
          display: block
          padding: 9px
          font-size: $font-size-large-x
          color: $color-theme
          transform: rotate(-90deg)

      .title
        width: 70%
        margin: 0 auto
        line-height: 40px
        text-align: center
        no-wrap()
        font-size: $font-size-large
        color: $color-text

      .subtitle
        line-height: 20px
        text-align: center
        font-size: $font-size-medium
        color: $color-text

    .middle
      position: fixed
      width: 100%
      top: 80px
      bottom: 170px
      white-space: nowrap
      font-size: 0

      .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-top: 80%

        .cd-wrapper
          position: absolute
          left: 10%
          top: 0
          width: 80%
          height: 100%

          .cd
            width: 100%
            height: 100%
            box-sizing: border-box
            border: 10px solid rgba(255, 255, 255, 0.1)
            border-radius: 50%

            &.play
              animation: rotate 20s linear infinite

            &.pause
              animation-play-state: paused

            .image
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              border-radius: 50%

        .playing-lyric-wrapper
          width: 80%
          margin: 30px auto 0 auto
          overflow: hidden
          text-align: center

          .playing-lyric
            height: 20px
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-l

      .middle-r
        display: inline-block
        vertical-align: top
        width: 100%
        height: 100%
        overflow: hidden

        .lyric-wrapper
          width: 80%
          margin: 0 auto
          overflow: hidden
          text-align: center

          .text
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium

            &.current
              color: $color-theme

    .bottom
      position: absolute
      bottom: 50px
      width: 100%

      .dot-wrapper
        text-align: center
        font-size: 0

        .dot
          display: inline-block
          vertical-align: middle
          margin: 0 4px
          width: 8px
          height: 8px
          border-radius: 50%
          background: $color-text-l

          &.active
            width: 20px
            border-radius: 5px
            background: $color-text-ll

      .progress-wrapper
        display: flex
        align-items: center
        width: 80%
        margin: 0px auto
        padding: 10px 0

        .time
          color: $color-text
          font-size: $font-size-small
          flex: 0 0 30px
          line-height: 30px
          width: 30px

          &.time-l
            text-align: left

          &.time-r
            text-align: right

        .progress-bar-wrapper
          flex: 1

      .operators
        display: flex
        align-items: center

        .icon
          flex: 1
          color: $color-theme

          &.disable
            color: $color-theme-d

          i
            font-size: 30px

        .i-left
          text-align: right

        .i-center
          padding: 0 20px
          text-align: center

          i
            font-size: 40px

        .i-right
          text-align: left

        .icon-favorite
          color: $color-sub-theme

    &.normal-enter-active, &.normal-leave-active
      transition: all 0.4s

      .top, .bottom
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

    &.normal-enter, &.normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)

  .mini-player
    display: flex
    align-items: center
    position: fixed
    left: 0
    bottom: 0
    z-index: 180
    width: 100%
    height: 60px
    background: $color-highlight-background

    &.mini-enter-active, &.mini-leave-active
      transition: all 0.4s

    &.mini-enter, &.mini-leave-to
      opacity: 0

    .icon
      flex: 0 0 40px
      width: 40px
      padding: 0 10px 0 20px

      img
        border-radius: 50%

        &.play
          animation: rotate 10s linear infinite

        &.pause
          animation-play-state: paused

    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 20px
      overflow: hidden

      .name
        margin-bottom: 2px
        no-wrap()
        font-size: $font-size-medium
        color: $color-text

      .desc
        no-wrap()
        font-size: $font-size-small
        color: $color-text-d

    .control
      flex: 0 0 30px
      width: 30px
      padding: 0 10px

      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size: 30px
        color: $color-theme-d

      .icon-mini
        font-size: 32px
        position: absolute
        left: 0
        top: 0

@keyframes rotate
  0%
    transform: rotate(0)
  100%
    transform: rotate(360deg)
</style>
