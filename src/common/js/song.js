import { ERR_OK } from '../../api/config';
import { getLyric, getSongsUrl } from '../../api/song';
import { Base64 } from 'js-base64';

// 歌曲类
export default class Song {
  constructor({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.filename = `C400${this.mid}.m4a`;
    this.url = url;
  }

  // 获取歌词
  getLyric() {
    if (this.lyric) {
      // 如果已经获取过歌词了，就不用每次都去获取了
      return Promise.resolve(this.lyric);
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric); // 获取到的歌词格式为Base64编码的，使用js-base64库进行解码
          resolve(this.lyric);
        } else {
          reject(new Error('no lyric'));
        }
      });
    });
  }
}

// 创建歌曲类的工厂函数
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url,
  });
}

function filterSinger(singer) {
  let ret = [];
  if (!singer) {
    return '';
  }
  singer.forEach((s) => {
    ret.push(s.name);
  });
  return ret.join('/');
}

export function isValidMusic(musicData) {
  return (
    musicData.songid &&
    musicData.albummid &&
    (!musicData.pay || musicData.pay.payalbumprice === 0)
  );
}

/* 解析歌曲的播放地址 */
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs);
  }
  return getSongsUrl(songs).then((purlMap) => {
    songs = songs.filter((song) => {
      const purl = purlMap[song.mid];
      if (purl) {
        song.url =
          purl.indexOf('http') === -1
            ? `http://dl.stream.qqmusic.qq.com/${purl}`
            : purl;
        return true;
      }
      return false;
    });
    return songs;
  });
}
