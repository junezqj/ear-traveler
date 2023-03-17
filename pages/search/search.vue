<template>
	<view class="search">
		<musichead title='搜索' :icon='true' :iconblack='true'></musichead>
		<view class="container">
			<scroll-view scroll-y="true" >
				<view class="search-search">
					<text class="iconfont icon-search"></text>
					<input 
						type="text" 
						placeholder="搜索歌曲" 
						v-model="searchWord"
						@confirm="handleToSearch(searchWord)"
						@input="handleToSuggest"
					>
					<text 
						class="iconfont icon-guanbi" 
						v-show="searchType != 1"
						@tap="handleToClose"
					></text>
				</view>
				<block v-if="searchType == 1">
					<view class="search-history">
						<view class="search-history-head">
							<text>历史记录</text>
							<text class="iconfont icon-lajitong" @tap="handleToClear"></text>
						</view>
						<view class="search-history-list">
							<view 
								v-for="(item, index) in searchHistory" 
								:key="index"
								@tap="handleToWord(item)"
							>{{item}}</view>
						</view>
					</view>
					<view class="search-hot">
						<view class="search-hot-head">
							热搜榜
						</view>
						<view 
							class="search-hot-item" 
							v-for="(item, index) in searchHot" 
							:key="index"
							@tap="handleToWord(item.searchWord)"
						>
							<view class="search-hot-top">{{index+1}}</view>
							<view class="search-hot-word">
								<view>
									{{item.searchWord}}
									<img :src="item.iconUrl" alt="" mode="aspectFit">
								</view>
								<view>{{item.content}}</view>
							</view>
							<text class="search-hot-count">{{item.score}}</text>
						</view>
					</view>
				</block>
				<block v-else-if="searchType == 2">
					<view class="search-result">
						<view 
							class="search-result-item" 
							v-for="(item, index) in searchList" 
							:key="index"
							@tap="handleToDetail(item.id)"
						>
							<view class="search-result-word">
								<view>{{item.name}}</view>
								<view>{{item.artists[0].name}} - {{item.album.name}}</view>
							</view>
							<text class="iconfont icon-bofang"></text>
						</view>
					</view>
				</block>
				<block v-else-if="searchType == 3">
					<view class="search-suggest">
						<view class="search-suggest-head">搜索“{{searchWord}}”</view>
						<view 
							class="search-suggest-item" 
							v-for="(item, index) in searchSuggest"
							:key="index"
							@tap="handleToWord(item.keyword)"
						>
							<text class="iconfont icon-search"></text>{{item.keyword}}
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import musichead from '../../components/musichead/musichead.vue'
	import '@/common/iconfont.css'
	import {searchHot, searchWord, searchSuggest} from '../../common/api.js'
	export default {
		data() {
			return {
				searchHot: [],
				searchWord: '',
				searchHistory: [],
				searchType: 1,
				searchList: [],
				searchSuggest: []
			}
		},
		onLoad() {
			searchHot().then((res) => {
				if(res.data.code == '200'){
					this.searchHot = res.data.data
				}
			})
			uni.getStorage({
				key: 'searchHistory',
				success: (res) => {
					this.searchHistory = res.data
				}
			})
		},
		components: {
			musichead
		},
		methods: {
			handleToWord(word){
				this.searchWord = word
				this.handleToSearch(word)
			},
			handleToSearch(word){
				this.searchHistory.unshift(word)
				this.searchHistory = [...new Set(this.searchHistory)]
				if(this.searchHistory.length > 10){
					this.searchHistory.length = 10
				}
				uni.setStorage({
					key: 'searchHistory',
					data: this.searchHistory
				})
				this.getSearchList(word)
			},
			handleToClear(){
				uni.removeStorage({
					key: 'searchHistory',
					success: (res) => {
						this.searchHistory = []
					}
				})
			},
			getSearchList(word){
				searchWord(word).then((res) => {
					if(res.data.code == '200'){
						this.searchList = res.data.result.songs
						this.searchType = 2
					}
				})
			},
			handleToClose(){
				this.searchWord = ''
				this.searchType = 1
			},
			handleToDetail(songId){
				uni.navigateTo({
					url: '/pages/detail/detail?songId=' + songId
				})
			},
			handleToSuggest(e){
				let value = e.detail.value
				if(!value){
					this.searchType = 1
					return
				}
				searchSuggest(value).then((res) => {
					if(res.data.code == '200'){
						this.searchSuggest = res.data.result.allMatch
						this.searchType = 3
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.search{
	
	&-search{
		display: flex;
		align-items: center;
		height: 70rpx;
		margin: 70rpx 30rpx 50rpx 30rpx;
		background: #f7f7f7;
		border-radius: 50rpx;
		
		text{
			margin: 0 26rpx;
		}
		
		input{
			flex: 1;
			font-size: 26rpx;
		}
	}
	
	&-history{
		margin: 0 30rpx 50rpx 30rpx;
		font-size: 26rpx;
		
		&-head{
			display: flex;
			justify-content: space-between;
			margin-bottom: 36rpx;
		}
		
		&-list{
			display: flex;
			flex-wrap: wrap;
			
			view{
				padding: 16rpx 28rpx;
				border-radius: 40rpx;
				margin-right: 30rpx;
				margin-bottom: 30rpx;
				background: #f7f7f7;
			}
		}
	}
	
	&-hot{
		margin: 0 30rpx;
		font-size: 26rpx;
		
		&-head{
			margin-bottom: 36rpx;
		}
		
		&-item{
			display: flex;
			align-items: center;
			margin-bottom: 58rpx;
			
			.search-hot-top{
				color: #fb2222;
				width: 60rpx;
				margin-left: 8rpx;
			}
			
			.search-hot-word{
				flex: 1;
				
				image{
					width: 48rpx;
					height: 22rpx;
				}
				
				view:nth-child(1){
					font-size: 30rpx;
					color: black;
				}
				
				view:nth-child(2){
					font-size: 24rpx;
					color: #878787;
				}
			}
			
			.search-hot-count{
				color: #878787;
			}
		}
	}

	&-result{
		border-top: 2rpx solid #e4e4e4;
		padding: 30rpx;
		
		&-item{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 30rpx;
			margin-bottom: 30rpx;
			border-bottom: 2rpx solid #e4e4e4;
			
			.search-result-word{
				
				view:nth-child(1){
					font-size: 28rpx;
					color: #235790;
					margin-bottom: 12rpx;
				}
				
				view:nth-child(2){
					font-size: 22rpx;
					color: #898989;
				}
			}
			
			text{
				font-size: 50rpx;
			}
		}
	}

	&-suggest{
		border-top: 2rpx solid #e4e4e4;
		padding: 30rpx;
		font-size: 26rpx;
		
		&-head{
			color: #4574a5;
			margin-bottom: 74rpx;
		}
		
		&-item{
			color: #5d5d5d;
			margin-bottom: 74rpx;
			
			text{
				color: #bdbdbd;
				margin-right: 28rpx;
				position: relative;
				top: 2rpx;
			}
		}
	}
}	
</style>
