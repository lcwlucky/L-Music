<!--歌单列表组件-->
<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from '../music-list/music-list'
import {getSongList} from '../../api/recommend'
import {ERR_OK} from '../../api/config'
import {mapGetters} from 'vuex'
import {createSong,processSongsUrl} from '../../common/js/song'

export default {
  computed: {
    title() {
      return this.currentDisc.dissname
    },
    bgImage() {
      return this.currentDisc.imgurl
    },
    ...mapGetters([
      'currentDisc'
    ])
  },
  data() {
    return {
      songs: []
    }
  },
  created() {
    this._getSongList()
  },
  methods: {
    _getSongList() {
      if (!this.currentDisc.dissid) { //如果用户在本页面刷新，没有重recommend传过来，当前没有歌单
        this.$router.push('/recommend')
        return
      }
      //传入歌单id获取歌单歌曲数据
      getSongList(this.currentDisc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          // this.songs = this._normalizeSongs(res.cdlist[0].songlist)
          //解析每首歌的播放地址
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
            this.songs = songs
          })
        }

      })
    },
    //把数据转成我们想要的格式化数据
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active
  transition: all 0.3s
.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
