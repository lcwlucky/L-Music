<template>
  <transition name="slide">
    <music-list
      :title="artist.name"
      :bgImage="artist.img1v1Url"
      :songs="songs"
    ></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import {getSingerInfoRequest} from '../../api'
import {mapGetters} from 'vuex'
import MusicList from '../../components/music-list/music-list'

export default {
  data(){
    return {
      songs:[],
      artist: {},
    }
  },
  created(){
    this.getSingerDetail()
  },
  methods:{
    async getSingerDetail(){
      if(!this.currentSinger.id){
        this.$router.replace('/singer')
        return
      }
      const res = await getSingerInfoRequest(this.$route.params.id)
      this.songs =  res.hotSongs
      this.artist = res.artist
    },
  },

  computed: {
    ...mapGetters(['currentSinger'])
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active
  transition: transform  0.5s
.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
