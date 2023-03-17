<template>
	<view class="list">
		<view class="fixbg" :style="{ 'backgroundImage' : 'url(' + playlist.coverImgUrl + ')'}"></view>
			<musichead title='歌单' :icon='true' color='white'></musichead>
			<view class="container" v-show="!isLoading">
				<scroll-view scroll-y="true">
					<view class="list-head">
						<view class="list-head-img">
							<img :src="playlist.coverImgUrl" alt="">
							<text class="iconfont icon-yousanjiao">
								{{playlist.playCount | formatCount}}
							</text>
						</view>
						<view class="list-head-text">
							<view>{{playlist.name}}</view>
							<view>
								<img :src="playlist.creator.avatarUrl" alt="">{{playlist.creator.nickname}}
							</view>
							<view>{{playlist.description}}</view>
						</view>
					</view>
					<!-- #ifdef MP-WEIXIN -->
					<button class="list-share" open-type="share">
						<text class="iconfont icon-share"></text>分享给微信好友
					</button>
					<!-- #endif -->
					<view class="list-music">
						<view class="list-music-head" @tap="handleToAll(playlist.tracks[0].id)">
							<text class="iconfont icon-bofang"></text>
							<text>播放全部</text>
							<text>（共{{playlist.trackCount}}首）</text>
						</view>
						<view 
							class="list-music-item" 
							v-for="(item, index) in playlist.tracks" 
							:key="index"
							@tap="handleToDetail(item.id)"
						>
							<view class="list-music-item-top">{{index + 1}}</view>
							<view class="list-music-item-song">
								<view>{{item.name}}</view>
								<view class="">
									<image 
										v-if="item.id % 2 == 0"
										src="../../static/dujia.png" 
										mode=""
									></image>
									<image src="../../static/sq.png" mode=""></image>
									{{item.ar[0].name}} - {{item.name}}
								</view>
							</view>
							<text class="iconfont icon-bofang1"></text>
						</view>
					</view>	
				</scroll-view>
			</view>
	</view>
</template>

<script>
	import musichead from '../../components/musichead/musichead.vue'
	import '@/common/iconfont.css'
	import {list} from '../../common/api.js';
	export default {
		data() {
			return {
				playlist: {
					coverImgUrl: '',
					creator: {
						avatarUrl: ''
					},
					trackCount: ''
				},
				isLoading: true
			}
		},
		components: {
			musichead
		},
		onLoad(options) {
			uni.showLoading({
				title: 'Loading...'
			})
			
			list(options.listId).then((res)=>{
				if(res.data.code =='200') {
					this.playlist = res.data.playlist
					this.privileges = res.data.privileges
					this.$store.commit('INIT_TOPLISTIDS', res.data.playlist.trackIds)
					this.isLoading = false
					uni.hideLoading()
				}
			})
		},
		methods: {
			handleToDetail(songId) {
				uni.navigateTo({
					url: '/pages/detail/detail?songId=' + songId
				})
			},
			handleToAll(songId){
				this.handleToDetail(songId)
			}
		}
	}
</script>

<style scoped lang="scss">
.list {
	&-head {
		display: flex;
		margin: 30rpx;
		
		&-img {
			width: 264rpx;
			height: 264rpx;
			border-radius: 30rpx;
			overflow: hidden;
			position: relative;
			margin-right: 42rpx;
			
			image {
				width: 100%;
				height: 100%;
			}
			
			text {
				position: absolute;
				right: 8rpx;
				top: 8rpx;
				color: white;
				font-size: 26rpx;
			}
		}
		
		&-text {
			flex: 1;
			color: #f0f2f7;
			
			view:nth-child(1) {
				color: white;
				font-size: 34rpx;
			}
			
			view:nth-child(2) {
				display: flex;
				margin: 20rpx 0;
				font-size: 24rpx;
				align-items: center;
				
				image {
					width: 54rpx;
					height: 54rpx;
					border-radius: 50%;
					margin-right: 14rpx;
				}
			}
			
			view:nth-child(3) {
				line-height: 34rpx;
				font-size: 22rpx;
			}
		}
	}
	
	&-share {
		width: 330rpx;
		height: 74rpx;
		margin: 0 auto;
		background: rgba(0, 0, 0, .4);
		border-radius: 37rpx;
		color: white;
		text-align: center;
		line-height: 74rpx;
		font-size: 28rpx;
		
		text {
			margin-right: 16rpx;
		}
	}
	
	&-music {
		background: white;
		border-radius: 50rpx;
		margin-top: 40rpx;
		overflow: hidden;
		
		&-head {
			height: 50rpx;
			margin: 30rpx 0 70rpx 22rpx;
			
			text:nth-child(1){
				height: 50rpx;
				font-size: 50rpx;
			}
			
			text:nth-child(2){
				font-size: 30rpx;
				margin: 0 10rpx 0 26rpx;
			}
			
			text:nth-child(3){
				font-size: 26rpx;
				color: #b2b2b2;
			}
		}
		
		&-item {
			display: flex;
			margin: 0 32rpx 66rpx 46rpx;
			align-items: center;
			color: #959595;
			
			&-top {
				width: 58rpx;
				font-size: 30rpx;
				line-height: 50rpx;
			}
			
			&-song {
				flex: 1;
				
				view:nth-child(1) {
					font-size: 28rpx;
					color: black;
					width: 70vw;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				
				view:nth-child(2) {
					font-size: 20rpx;
					align-items: center;
					width: 70vw;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					
					image {
						width: 32rpx;
						height: 20rpx;
						margin-right: 10rpx;			
					}
				}
			}
			
			text {
				font-size: 50rpx;
				color: #c7c7c7;
			}
		}
	}
}
</style>
