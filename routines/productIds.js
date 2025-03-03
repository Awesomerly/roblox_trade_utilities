import obj from '../modules/objects.js'

import fetch from 'node-fetch'

const url = 'https://gist.githubusercontent.com/codet-t/4281d2fdfb7baefe0a1ce1ed5d8679c0/raw/'

async function routine() {

    let response = await fetch(url).then(res=>res.json())
    obj.ProductIdList = response
}

export default routine
