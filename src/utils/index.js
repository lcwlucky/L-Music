export const getName = (list = []) => {
  let str = '';
  list.map((item, index) => {
    str += index === 0 ? item.name : '/' + item.name;
    return item;
  });
  return str;
};

export const formatPlayTime = (interval) => {
  interval = interval | 0;
  const minute = (interval / 60) | 0;
  const second = (interval % 60).toString().padStart(2, '0');
  return `${minute}:${second}`;
};

// 返回min到max之间随机的整数 Math.random() 返回0-1，不包括1
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 打乱数组
export function shuffle(arr) {
  let _arr = arr.slice();
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i);
    let t = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = t;
  }
  return _arr;
}

// 函数防抖
export function debounce(func, delay) {
  let timer;

  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function saveStorage(key, name) {
  let arr = getStorage(key);
  let index = arr.findIndex(function (item) {
    return item == name;
  });

  if (index >= 0) {
    // 如果之前有了这个记录
    arr.splice(index, 1);
    arr.unshift(name);
  } else {
    arr.unshift(name);
    if (arr.length > 15) {
      arr.pop();
    }
  }
  localStorage.setItem(key, JSON.stringify(arr));
}

export function getStorage(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

//处理数据，找出第一个没有歌名的排行榜的索引
export const filterIndex = rankList => {
  for (let i = 0; i < rankList.length - 1; i++) {
    if (rankList[i].tracks.length && !rankList[i + 1].tracks.length) {
      return i + 1;
    }
  }
};
