
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/idea/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/idea"
  },
  {
    "renderMode": 2,
    "route": "/idea/signin"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 7622, hash: '737de7b22d77948d57446837df00b63afc1fb72b76b2c6271074f8f5893119ef', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 956, hash: '2b7fb4fbcfaab6816f0e171c1450d79b2fa6503f396b7c061d89207ad59add3e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 70950, hash: '7d44f6e1dbe5b703951916bb8bd60476c55a88416032009738fcca3c4f4cc8ee', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'signin/index.html': {size: 15719, hash: '8bc183f84478bc24fcf404d6562e6ba8e94655cb5a084f9945a8e800bff069f5', text: () => import('./assets-chunks/signin_index_html.mjs').then(m => m.default)},
    'styles-XXUYWCNM.css': {size: 28700, hash: 'hh1YggfxWQ0', text: () => import('./assets-chunks/styles-XXUYWCNM_css.mjs').then(m => m.default)}
  },
};
