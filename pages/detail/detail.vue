<template>
	<view class="detail">
		<view class="fixbg" :style="{ 'backgroundImage' : 'url('+ songDetail.al.picUrl + ')'}"></view>
		<musichead :title='songDetail.name' :icon='true' color='white'></musichead>
		<view class="container" v-show="!isLoading">
			<scroll-view scroll-y="true">
				<view class="detail-play" @tap="handleToPlay">
					<img 
						:src="songDetail.al.picUrl" 
						:class="{'detail-play-run' : isPlayRotate}"
						alt=""
					>
					<text class="iconfont" :class="iconPlay"></text>
					<view></view>
				</view>
				<view class="detail-lyric">
					<view 
						class="detail-lyric-wrap" 
						:style="{transform : 'translateY(' + -(lyricIndex - 1) * 82 + 'rpx)'}"
					>
						<view 
							class="detail-lyric-wrap-item" 
							:class="{ active : lyricIndex == index}"
							v-for="(item, index) in songLyric" 
							:key="index"
						>
							{{item.lyric}}
						</view>
					</view>
				</view>
				<view class="detail-like">
					<view class="detail-like-head">
						喜欢这首歌的人也听
					</view>
					<view 
						class="detail-like-item" 
						v-for="(item, index) in songSimi" 
						:key="index"
						@tap="handleToSimi(item.id)"
					>
						<view class="detail-like-item-img">
							<img :src="item.album.picUrl" alt="">
						</view>
						<view class="detail-like-item-song">
							<view>{{item.name}}</view>
							<view>
								<img 
									src="../../static/dujia.png" 
									alt=""
								>
								<img 
									src="../../static/sq.png" 
									alt=""
									v-if="item.id % 2 == 0"
								>
								{{item.album.artists[0].name}} - {{item.name}}
							</view>
						</view>
						<text class="iconfont icon-bofang"></text>
					</view>
				</view>
				<view class="detail-comment">
					<view class="detail-comment-head">精彩评论</view>
					<view class="detail-comment-item" v-for="(item, index) in songComment" :key="index">
						<view class="detail-comment-img">
							<img :src="item.user.avatarUrl" alt="">
						</view>
						<view class="detail-comment-content">
							<view class="detail-comment-title">
								<view class="detail-comment-name">
									<view>{{item.user.nickname}}</view>
									<view>{{item.time | formatTime}}</view>
								</view>
								<view class="detail-comment-like">
									{{item.likedCount | formatCount}}
									<text class="iconfont icon-like"></text>
								</view>
							</view>
							<view class="detail-comment-text">
								{{item.content}}
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import musichead from '../../components/musichead/musichead.vue'
	import '@/common/iconfont.css'
	import {songDetail, songSimi, songComment, songLyric, songUrl} from '../../common/api.js'
	export default {
		data() {
			return {
				songDetail: {
					al: {
						picUrl: ''
					}
				},
				songSimi: [],
				songComment: [],
				songLyric: [],
				lyricIndex: 0,
				iconPlay: 'icon-pause',
				isPlayRotate: true,
				isLoading: true
			}
		},
		components: {
			musichead
		},
		onLoad(options) {
			this.getMusic(options.songId)
		},
		onUnload() {
			this.cancelLyricIndex()
			// #ifdef H5
			this.bgAudioManager.destroy()
			// #endif
		},
		onHide() {
			this.cancelLyricIndex()
			// #ifdef H5
			this.bgAudioManager.destroy()
			// #endif
		},
		methods: {
			getMusic(songId) {
				this.$store.commit('NEXT_ID', songId)
				uni.showLoading({
					title: 'Loading...'
				})
				this.isLoading = true
				Promise.all([
					songDetail(songId), 
					songSimi(songId), 
					songComment(songId),
					songLyric(songId),
					songUrl(songId)
				]).then((res) => {
					if(res[0].data.code == '200'){
						this.songDetail = res[0].data.songs[0]
					}
					if(res[1].data.code == '200'){
						this.songSimi = res[1].data.songs
					}
					if(res[2].data.code == '200'){
						this.songComment = res[2].data.hotComments
					}
					if(res[3].data.code == '200'){
						let lyric = res[3].data.lrc.lyric
						let re = /\[([^\]]+)\]([^\[]+)/g
						let result = []
						lyric.replace(re, ($0, $1, $2) => {
							result.push({ "time" : this.formatTimeToSec($1), "lyric" : $2})
						})
						this.songLyric = result
					}
					if(res[4].data.code == '200'){
						// #ifdef MP-WEIXIN
						this.bgAudioManager = uni.getBackgroundAudioManager()
						this.bgAudioManager.title = this.songDetail.name
						// #endif
						
						// #ifdef H5
						if(!this.bgAudioManager){
							this.bgAudioManager = uni.createInnerAudioContext()
						}
						this.iconPlay = 'icon-bofang1'
						this.isPlayRotate = false
						// #endif
						
						this.bgAudioManager.src = res[4].data.data[0].url || ''
						this.listenLyricIndex()
						this.bgAudioManager.onPlay(() => {
							this.iconPlay = 'icon-pause'
							this.isPlayRotate = true
							this.listenLyricIndex()
						})
						this.bgAudioManager.onPause(() => {
							this.iconPlay = 'icon-bofang1'
							this.isPlayRotate = false
							this.cancelLyricIndex()
						})
						this.bgAudioManager.onEnded(() => {
							this.getMusic(this.$store.state.nextId)
						}) 
					}
					this.isLoading = false
					uni.hideLoading()
				})
			},
			formatTimeToSec(val){
				let arr = val.split(':')
				return (Number(arr[0]*60) + Number(arr[1])).toFixed(1)
			},
			handleToPlay(){
				if(this.bgAudioManager.paused){
					this.bgAudioManager.play()
				} else {
					this.bgAudioManager.pause()
				}
			},
			listenLyricIndex(){
				clearInterval(this.timer)
				this.timer = setInterval(() => {
					for(let i = 0; i < this.songLyric.length; i++){
						if(this.bgAudioManager.currentTime > this.songLyric[this.songLyric.length-1].time){
							this.lyricIndex = this.songLyric.length - 1
							break
						}
						if(this.bgAudioManager.currentTime > this.songLyric[i].time && 
						   this.bgAudioManager.currentTime < this.songLyric[i+1].time){
								this.lyricIndex = i	
						}
					}
				}, 500)
			},
			cancelLyricIndex(){
				clearInterval(this.timer)
			},
			handleToSimi(songId){
				this.getMusic(songId)
			}
		}
	}
</script>

<style lang="scss" scoped>

@mixin key_frame($name: "move", $duration: 10s, $speed: linear, $count: infinite) {
    @keyframes move {
		from{
			transform: rotate(0deg);
		}
		to{
			transform: rotate(360deg);
		}
	}
	animation: $name $duration $speed $count;
}
	
.detail {
	&-play {
		width: 580rpx;
		height: 580rpx;
		background: url(~@/static/disc.png);
		background-size: cover;
		margin: 214rpx auto 0 auto;
		position: relative;
		
		image {
			width: 370rpx;
			height: 370rpx;
			border-radius: 50%;
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			right: 0;
			margin: auto;
			@include key_frame(move);
			animation-play-state: paused;
			
			&.detail-play-run {
				animation-play-state: running;
			}
		}	
		
		text {
			width: 100rpx;
			height: 100rpx;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
			font-size: 100rpx;
			color: white;
			margin: auto;
		}
		
		view {
			width: 230rpx;
			height: 360rpx;
			background: url(~@/static/needle.png);
			position: absolute;
			left: 100rpx;
			top: -200rpx;
			right: 0;
			margin: auto;
			background-size: cover;
		}
	}
	
	&-lyric {
		font-size: 32rpx;
		line-height: 82rpx;
		height: 246rpx;
		text-align: center;
		overflow: hidden;
		color: #6f6e73;
		
		&-wrap {
			transition: .5s;
		
			&-item {
				height: 82rpx;
			
				&.active {
					color: white;
				}
			}
		}
	}
	
	&-like {
		margin: 0 30rpx;
		
		&-head {
			font-size: 36rpx;
			color: white;
			margin: 50rpx 0;
		}
		
		&-item {
			display: flex;
			align-items: center;
			margin-bottom: 28rpx;
			
			text {
				font-size: 50rpx;
				color: #c6c2bf;
			}
			
			&-img {
				width: 82rpx;
				height: 82rpx;
				margin-right: 20rpx;
				
				image {
					width: 100%;
					height: 100%;
					border-radius: 20rpx;
					overflow: hidden;
				}
			}
			
			&-song {
				flex: 1;
				color: #c6c2bf;
				
				view:nth-child(1) {
					font-size: 28rpx;
					color: white;
					margin-bottom: 12rpx;
				}
				
				view:nth-child(2) {
					font-size: 22rpx;
					color: #c6c2bf;
				}
				
				image {
					width: 26rpx;
					height: 20rpx;
					margin-right: 10rpx;
				}
			}
		}
	}
	
	&-comment {
		margin: 0 30rpx;
		
		&-head {
			font-size: 36rpx;
			color: white;
			margin: 50rpx 0;
		}
		
		&-item {
			margin-bottom: 28rpx;
			display: flex;
			
			.detail-comment-img {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
				overflow: hidden;
				margin-right: 18rpx;
				
				image {
					width: 100%;
					height: 100%;
				}
			}
			
			.detail-comment-content {
				flex: 1;
				color: #cbcacf;
				
				.detail-comment-title {
					display: flex;
					justify-content: space-between;
					
					.detail-comment-name {
						
						view:nth-child(1) {
							font-size: 26rpx;
						}
						
						view:nth-child(2) {
							font-size: 20rpx;
						}
					}
				
					.detail-comment-like {
						font-size: 28rpx;
					}
				}
				
				.detail-comment-text {
					line-height: 40rpx;
					font-size: 28rpx;
					color: white;
					margin-top: 20rpx;
					border-bottom: 1px solid #e0e0e0;
					padding-bottom: 40rpx;
				}
			}
		}
	}
}
</style>
