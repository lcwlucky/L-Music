import {ERR_OK} from '../../api/config'
import { getLyric, getSongsUrl } from '../../api/song'
import {Base64} from 'js-base64'

//歌曲类
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.filename = `C400${this.mid}.m4a`
    this.url = url
  }

  //获取歌词
  getLyric() {
    if (this.lyric) { //如果已经获取过歌词了，就不用每次都去获取了
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric) //获取到的歌词格式为Base64编码的，使用js-base64库进行解码
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

//创建歌曲类的工厂函数
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    // url:'http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/C400003e4b5o0jOMXV.m4a?guid=1206724366&vkey=DDEFB5CD9CB247878F549CDD808CBC0527DE0C747770B6D9736AF2E5FA5B9943F2DC16817D49360BAB589391451F4BAB42B733B522BF1729&uin=0&fromtag=38'
    // url:'http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com/C400001fkWNw2eaEYT.m4a?guid=3250507966&vkey=F92F6303F890271021F7E7696978996B2C5DDEECD714B7F9F30A84C827AD6E400E0E4D67124B7910383712AA15B23BBD0158F2D58832E0CA&uin=0&fromtag=38'
    url:musicData.url
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

export function isValidMusic(musicData) {
  return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

/*解析歌曲的播放地址*/
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then((purlMap) => {
    songs = songs.filter((song) => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url = purl.indexOf('http') === -1 ? `http://dl.stream.qqmusic.qq.com/${purl}` : purl
        return true
      }
      return false
    })
    return songs
  })
}

