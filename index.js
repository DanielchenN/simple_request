const formats = new Set(['json', 'buffer', 'string'])
const methodList = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD'])


module.exports = (request) => (...params) => {
  let url
  let method
  let statusCode = new Set([200])
  let format
  let headers = {}

  params.forEach(param =>{
    if (typeof param === 'number') {
      statusCode.add(param)
    } else if (typeof param === 'string') {
      if (param.startsWith('http:') || param.startsWith('https:')) {
        url = param
      } else if (methodList.has(param)) {
        method = param.toUpperCase()
      } else if (formats.has(param)) {
        format = param
      } else {
        throw new Error(`unknown param ${param}` )
      }
    } else if ( typeof param === 'object') {  
      headers = param
    } else {
      throw new Error(`unknown param: ${typeof arg}`)
    }
  })

  if(!method) method = 'GET'

  // console.log('url', url)
  // console.log('method', method)
  // console.log('statusC', statusCode)
  // console.log('forma', format)
  // console.log('head', headers)


  return request(url, method, statusCode, format, headers)
}

