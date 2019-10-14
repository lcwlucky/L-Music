import jsonp from '../common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

const debug = process.env.NODE_ENV !== 'production'

export function getRecommend () {
  //qq音乐推荐轮播图的接口
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  //请求参数对象
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 798443266, //QQ号，没有为0
    needNewCode: 1
  })

  return jsonp(url, data, options)  //自己封装的jsonp()返回的是promise，所以这里返回的也是promise
}

export function getDiscList () {
  //qq音乐此接口设置了后端的host和refer，jsonp也不能访问,我们利用服务器反向代理伪造host和referer解决
  const url = debug ? '/api/getDiscList' : '/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })

}

//获取歌单歌曲列表
export function getSongList (disstid) {
  const url = debug ? '/api/getCdInfo' : '/getCdInfo'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
