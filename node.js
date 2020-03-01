const core = require('./index')
const http = require('http')
const https = require('https')
const zlib = require('zlib')
const { PassThrough } = require('stream')
const caseless = require('caseless')

const compression = {
  gzip: zlib.createGunzip,
  br: zlib.createBrotliDecompress,
  deflate: zlib.createInflate
}

const fromatRes = function(res) {
  const pt = new PassThrough()
  if (res.headers['content-encoding']) {
    const arr = res.headers['content-encoding'].split(', ').reverse()
    for (const encoding of arr) {
      res = res.pipe(compression[encoding]())
    }
  }
  return res.pipe(pt)
}

const getBuffer = (res) => new Promise((resolve, reject) => {
  const arr = []
  res.on('data', (chunk) => {
    arr.push(chunk)
  })
  res.on('end', () => {
    console.log('end')
    resolve(Buffer.concat(arr))
  })
  res.on('error', () => {
    reject()
  })
})

const request = (baseUrl = '', method, statusCodes, format, headers) => (_url = '', body, _headers) => {
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
    const req = protocol.request(options, async (res) => {
      // console.log(`状态码: ${res.statusCode}`)
      // console.log(`响应头: ${JSON.stringify(res.headers)}`)

      // @TODO: 把res抛出去
      if(!statusCodes.has(res.statusCode)) reject(new Error('mismatch status code'))

      // 返回流可能是加密过的，要根据content-encoding判断
      const response = fromatRes(res)
      if(!format) return resolve(response)

      const buff = await getBuffer(response)
      //然后要通过各种encoding的方式 对流做变换
      if (format === 'string') {
        return resolve(buff.toString())
      } else if (format === 'json') {
        try {
          const out = JSON.parse(buff.toString())
          resolve(out)
        } catch(e) {
          e.message += `error "${buff.toString()}"`
          reject(e)
        }
      } else if(format === 'buffer') {
        return resolve(buff)
      }

    })
    
    if (!body) req.end()
    if (body) {
      if (typeof body === 'string') {
        body = Buffer.from(body)
      } else if (typeof body === 'object') {
        body = Buffer.from(JSON.stringify(body))
      } else if (Buffer.isBuffer(body)) {

      } else if (isStream(body)) {
        body.pipe(req)
        body = null
      }
    }

    if(body) {
      req.end(body)
    }

  })
}

module.exports = core(request)