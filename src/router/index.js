import Vue from 'vue';
import Router from 'vue-router';
//路由懒加载
const Recommend = (resolve) => {
  import('../components/recommend/recommend').then((module) => {
    resolve(module);
  });
};

const Singer = (resolve) => {
  import('../components/singer/singer').then((module) => {
    resolve(module);
  });
};

const Rank = (resolve) => {
  import('../components/rank/rank').then((module) => {
    resolve(module);
  });
};

const Search = (resolve) => {
  import('../components/search/search').then((module) => {
    resolve(module);
  });
};
const SingerDetail = (resolve) => {
  import('../components/singer-detail/singer-detail').then((module) => {
    resolve(module);
  });
};
const Disc = (resolve) => {
  import('../components/disc/disc').then((module) => {
    resolve(module);
  });
};

const RankList = (resolve) => {
  import('../components/rank-list/rank-list').then((module) => {
    resolve(module);
  });
};

const UserCenter = (resolve) => {
  import('../components/user-center/user-center').then((module) => {
    resolve(module);
  });
};

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend',
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc,
        },
      ],
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail,
        },
      ],
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail,
        },
      ],
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: RankList,
        },
      ],
    },
    {
      path: '/user',
      component: UserCenter,
    },
  ],
});
