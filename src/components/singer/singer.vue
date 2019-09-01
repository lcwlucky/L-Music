<template>
  <div class="singer" ref="singer">
    <Listview :data="singers" @select="selectSinger" ref="list"/>
    <router-view></router-view>
  </div>
</template>

<script>
  import {ERR_OK} from '../../api/config'
  import {getSingerList} from '../../api/singer'
  import Singer from  '../../common/js/singer'
  import Listview from '../../base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from '../../common/js/mixin'

  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'

  export default {
    mixins:[playlistMixin],
    data(){
      return {
        singers:[],
      }
    },
    created () {
      this._getSingerList()
    },
    methods:{
      //获取歌手数据
      _getSingerList(){
        getSingerList().then(res => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },

      //初始化歌手数组，让其按 热门 A B - Z排序
      _normalizeSinger(list){
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })
        // 为了得到有序列表，我们需要处理 map
        let ret = []
        let hot = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },

      //listview组件item的回调
      selectSinger(singer){
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer)
      },
      ...mapMutations({
        setSinger:'SET_SINGER'
      }),

      handlePlaylist(playlist) { //mixin中当播放列表发生变化时
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },

    },
    components:{
      Listview,
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  /*使用scroll必须有高度，这样才能根据子元素高度计算滑动距离*/
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
