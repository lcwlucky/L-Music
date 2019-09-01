<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>

</template>

<script type="text/ecmascript-6">
  import {getSingerDetail} from '../../api/singer'
  import {ERR_OK} from '../../api/config'
  import {mapGetters} from 'vuex'
  import song, {createSong,isValidMusic, processSongsUrl} from '../../common/js/song'
  import MusicList from '../../components/music-list/music-list'

  export default {
    data(){
      return {
        songs:[]
      }
    },
    created(){
      this._getSingerDetail()
    },
    methods:{
      _getSingerDetail(){
        if(!this.currentSinger.id){
          this.$router.replace('/singer')
          return
        }
        getSingerDetail(this.currentSinger.id).then(res => {
          if(ERR_OK == 0){
            // this.songs = this._normalizeSongs(res.data.list)
            //为每首歌获取播放地址
            processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },

      //得到qq音乐的数据后封装成我们想要的数据列表
      _normalizeSongs(list){
        let ret = []
        list.forEach((item,index) => {
          let {musicData} = item
          if(index == 0)
            console.log(musicData);
          // if (musicData.songid && musicData.albummid) {
          //   ret.push(createSong(musicData))
          // }
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },

    computed: {
      title() {
        return this.currentSinger.name
      },
      bgImage() {
        return this.currentSinger.avatar
      },
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
