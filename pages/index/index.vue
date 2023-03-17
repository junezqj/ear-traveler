<template>
	<view class="index">
		<musichead title='带上耳朵去旅行' :icon='false'></musichead>
		<view class="container">
			<scroll-view scroll-y="true" >
				<view class="index-search" @tap="handleToSearch">
					<text class="iconfont icon-search"></text>
					<input type="text" placeholder="搜索歌曲">
				</view>
				<view v-if="isLoading">
					<m-for-skeleton
					    :avatarSize="200"
					    :row="3"
					    :loading="isLoading"
					    isarc="square"
					    v-for="(item,key) in 3"
						:titleStyle = "{}"
						:title="false"
					    :key="key"
					>
					</m-for-skeleton>
				</view>
				<view class="index-list" v-else>
					<view 
						class="index-list-item" 
						v-for="(item, index) in topList" 
						:key="index" 
						@tap="handleToList(item.id)"
					>
						<view class="index-list-img">
							<img :src="item.coverImgUrl" alt="">
							<text>{{item.updateFrequency}}</text>
						</view>
						<view class="index-list-text">
							<view v-for="(item, index) in item.tracks" :key="index">
								{{index+1}}.{{item.first}} - {{item.second}}
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import '@/common/iconfont.css'
	import musichead from '../../components/musichead/musichead.vue'
	import { topList } from '../../common/api.js'
	import mForSkeleton from "@/components/m-for-skeleton/m-for-skeleton"
	export default {
		data() {
			return {
				topList: [],
				isLoading: true
			}
		},
		components:{
			musichead,
			mForSkeleton
		},
		onLoad() {
			topList().then((res) => {
				if(res.length) {
					setTimeout(() => {
						this.isLoading =false
						this.topList = res
					}, 1000)
				}
			})
		},
		methods: {
			handleToList(listId) {
				uni.navigateTo({
					url:'/pages/list/list?listId=' + listId
				})
			},
			handleToSearch(){
				uni.navigateTo({
					url:'/pages/search/search'
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.index{
		&-search{
			display: flex;
			align-items: center;
			height: 70rpx;
			margin: 70rpx 30rpx 30rpx 30rpx;
			background-color: #f7f7f7;
			border-radius: 50rpx;
			
			
			text{
				font-size: 26rpx;
				margin-right: 26rpx;
				margin-left: 28rpx;
			}
			
			input{
				font-size: 28rpx;
				flex: 1;
			}
		}
	
		&-list{
			margin: 0 30rpx;
			
			&-item{
				display: flex;
				margin-bottom: 34rpx;
			}
			
			&-img{
				width: 212rpx;
				height: 212rpx;
				position: relative;
				border-radius: 30rpx;
				overflow: hidden;
				margin-right: 22rpx;
				
				image{
					width: 100%;
					height: 100%;
				}
				
				text{
					position: absolute;
					left: 12rpx;
					bottom: 16rpx;
					color: white;
					font-size: 20rpx;
				}
				
			}
			
			&-text{
				font-size: 24rpx;
				line-height: 66rpx;
			}
		}
	}
</style>
