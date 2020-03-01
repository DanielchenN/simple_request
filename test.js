const request = require('./node.js')


const testString = async function () {
  const rquestStr = request('string')
  const str = await rquestStr('https://zh-hans.reactjs.org/static/d/986/path---docs-accessibility-html-b-94-11a-dAsKYAeanMyeEdSlsj1r1NDnq8.json')
  console.log('str', str)
}

const testJSON = async function() {
  const requestJSON = request('json')
  const str = await requestJSON('https://api.bilibili.com/x/web-interface/search/default')
  console.log('str', str)
}

testJSON()