
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
  },
  {
    "renderMode": 2,
    "route": "/idea/signup"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 7622, hash: 'e112b8e0338edaac0c0db108a2806d633d76d022e9a429b0d363592a43c119cb', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 956, hash: '77fb949e1a9bc0bebac002322cf8dcd5dcf180a3cf27f12a297af8c141f7fabd', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 70945, hash: 'e22654518f92b657ad2b93f56fe66d047d04a6dabe98ff7aca2a1df45c6bacab', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'signup/index.html': {size: 16948, hash: '32e616ed578e710b855ee00c4b3fa04b9ee8b00fc7cb43a26e75bf6f0bb65d96', text: () => import('./assets-chunks/signup_index_html.mjs').then(m => m.default)},
    'signin/index.html': {size: 16555, hash: 'b569864df310b764b8a320b84e13d0a9b6f2bf8c74564c6e2dbe32c81be483ec', text: () => import('./assets-chunks/signin_index_html.mjs').then(m => m.default)},
    'styles-STIIYGDT.css': {size: 29209, hash: 'oHOwotsC6Ec', text: () => import('./assets-chunks/styles-STIIYGDT_css.mjs').then(m => m.default)}
  },
};
