import {
	baseUrl
} from './config.js'

export function topList() {
	return new Promise(function(resolve, reject) {
		uni.request({
			url: `${baseUrl}/toplist/detail`,
			method: 'GET',
			success(res) {
				let result = res.data.list
				result.length = 3
				resolve(result)
			}
		})
	})
}

export function list(listId) {
	return uni.request({
		url: `${baseUrl}/top/list?id=${listId}`,
		method: 'GET'
	})
}

//详情信息   /song/detail?ids=347230
export function songDetail(songId) {
	return uni.request({
		url: `${baseUrl}/song/detail?ids=${songId}`,
		method: 'GET'
	})
}

//相似歌曲   /simi/song?id=347230
export function songSimi(songId) {
	return uni.request({
		url: `${baseUrl}/simi/song?id=${songId}`,
		method: 'GET'
	})
}

//评论        /comment/music?id=186016&limit=1
export function songComment(songId) {
	return uni.request({
		url: `${baseUrl}/comment/music?id=${songId}`,
		method: 'GET'
	})
}

// 获取歌词:  /lyric?id=33894312
export function songLyric(songId) {
	return uni.request({
		url: `${baseUrl}/lyric?id=${songId}`,
		method: 'GET'
	})
}

//歌曲链接   /song/url?id=33894312
export function songUrl(songId) {
	return uni.request({
		url: `${baseUrl}/song/url?id=${songId}`,
		method: 'GET'
	})
}

//热搜列表(详细)   /search/hot/detail
export function searchHot(){
	return uni.request({
		url:`${baseUrl}/search/hot/detail`,
		method:'GET'
	})
}

//搜索    /search?keywords=海阔天空
export function searchWord(word){
	return uni.request({
		url:`${baseUrl}/search?keywords=${word}`,
		method:'GET'
	})
}

//搜索建议     /search/suggest?keywords=海阔天空&type=mobile
export function searchSuggest(word){
	return uni.request({
		url:`${baseUrl}/search/suggest?keywords=${word}&type=mobile`,
		method:'GET'
	})
}
