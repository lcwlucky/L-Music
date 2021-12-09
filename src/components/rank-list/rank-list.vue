<!--排行榜列表组件-->
<template>
  <transition name="slide">
    <music-list
      :rank="true"
      :title="playlist.name"
      :bg-image="playlist.coverImgUrl"
      :songs="playlist.tracks"
    ></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from '../music-list/music-list'
import {getAlbumDetailRequest} from '../../api'
import {mapGetters} from 'vuex'

export default {
  computed: {
    title() {
      return this.rankList.topTitle
    },
    ...mapGetters([
      'rankList'
    ])
  },
  data() {
    return {
      songs: [],
      playlist: {},
    }
  },
  created() {
    //获取该排行榜下的歌曲列表
    this.getMusicList()
  },
  methods: {
    async getMusicList() {
      if (!this.rankList.id) {  //当用户在该页面刷新的时候
        this.$router.push('/rank')
        return
      }
      const res = await getAlbumDetailRequest(this.$route.params.id)
      this.playlist = res.playlist
    },
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
