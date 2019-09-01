<!--排行榜列表组件-->
<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from '../music-list/music-list'
  import {getMusicList} from '../../api/rank'
  import {ERR_OK} from '../../api/config'
  import {mapGetters} from 'vuex'
  import {createSong,processSongsUrl} from '../../common/js/song'

  export default {
    computed: {
      title() {
        return this.rankList.topTitle
      },
      bgImage() {
        //本身排行榜的图片太丑了，这里使用第一首歌曲的图片
        if (this.songs.length) {
          return this.songs[0].image
        }
        return this.rankList.picUrl
      },
      ...mapGetters([
        'rankList'
      ])
    },
    data() {
      return {
        songs: [],
        rank: true //标志传入musicList组件的是排行榜
      }
    },
    created() {
      //获取该排行榜下的歌曲列表
      this._getMusicList()
    },
    methods: {
      _getMusicList() {
        if (!this.rankList.id) {  //当用户在该页面刷新的时候
          this.$router.push('/rank')
          return
        }
        getMusicList(this.rankList.id).then((res) => {
          if (res.code === ERR_OK) {
            // this.songs = this._normalizeSongs(res.songlist)
            //为每首歌获取播放地址
            processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
