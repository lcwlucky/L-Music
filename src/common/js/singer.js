//歌手类
export default class Singer {
  constructor ({id,name}){
    this.id = id
    this.name = name
    //头像地址
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}
