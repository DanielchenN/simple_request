const core = require('./core')
const http = require('http')
const https = require('https')
const zlib = require('zlib')
const caseless = require('caseless')

const compression = {
  gzip: zlib.createGunzip,
  br: zlib.createBrotliDecompress,
  deflate: zlib.createInflate
}

const request = (baseUrl = '', method, statusCode, format, headers) => (_url = '', body, _headers) => {
  _url = baseUrl + _url
  _headers = {...headers, ..._headers}

  let protocol

  const parsed = new URL(_url)

  if (parsed.protocol === 'http:') {
    protocol = http
  } else if (parsed.protocol === 'https:') {
    protocol = https
  }
  
  const options = {
    hostname: parsed.hostname,
    port: parsed.port,
    path: parsed.pathname + parsed.search,
    method: method,
    headers: {...headers, ..._headers}
  }

  const c = caseless(request.headers)

  // accept-encoing和content-encoing是对应的
  c.set('accept-encoding', Object.keys(compression).join(', '))

  if(format === 'json' && !c.get('accept') ) {
    // accept和content-type是对应的
    c.set('accept', 'application/json')
  }

  return new Promise((resolve, reject) => {
    protocol.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log(`响应头: ${JSON.stringify(res.headers)}`);
    })
  })

}