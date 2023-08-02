<template >
  <div class="text-lg font-medium">最近更新</div>
  <n-scrollbar x-scrollable>
    <div class="flex">
      <RouterLink v-for="(item, index) in lastUpdateMediaList" :class="index !== 0 ? 'ml-4' : ''"
        :to="`/play/${item.id}?season=${item.lastUpdateInfo.seasonIndex}&episode=${item.lastUpdateInfo.episodeIndex}`">
        <NCard class="w-96">
          <template #header>
            <div class="truncate">{{ item.name }}</div>
          </template>
          <template #cover>
            <img
              :src="`/api/getImg?id=${item.id}&season=${item.lastUpdateInfo.seasonIndex}&episode=${item.lastUpdateInfo.episodeIndex}&type=still&size=original`">
          </template>
          <div class="truncate">第{{ item.lastUpdateInfo.seasonIndex }}季-第{{ item.lastUpdateInfo.episodeIndex }}话:{{
            item.lastUpdateInfo.name }}</div>
        </NCard>
      </RouterLink>
    </div>
  </n-scrollbar>
  <div class="text-lg font-medium mt-4">番剧列表</div>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    <RouterLink v-for="item in showVideoList" :key="item.id" :to="`/overview/${item.id}`">
      <NCard>
        <template #header>
          <div class="truncate">{{ item.name }}</div>
        </template>
        <template #cover>
          <n-image :src="`/api/getImg?id=${item.id}&type=poster&size=md`" preview-disabled />
        </template>
      </NCard>
    </RouterLink>
  </div>
  <n-pagination v-model:page="page" :page-slot="12" :page-count="pageCount" class="mt-2"></n-pagination>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getVideoList, getLastUpdateMediaInfo } from '@/api/video'
import { NCard, NScrollbar, NImage, NPagination } from 'naive-ui'
import { message } from '@/utils/naiveApi'
import type { MediaContent } from '@/types/media'
import type { LastUpdateMediaContent } from '@/api/video'
const videoList = ref<MediaContent[]>([])
const lastUpdateMediaList = ref<LastUpdateMediaContent[]>([])
const page = ref(1)
const pageSize = 12
const pageCount = computed(() => videoList.value.length ? Math.ceil(videoList.value.length / pageSize) : 1)
const showVideoList = computed(() => videoList.value.filter((item, index) => index < pageSize * page.value && index >= (page.value - 1) * pageSize))
getVideoList()
  .then((data) => {
    videoList.value = data
  })
  .catch((error) => {
    message.error(error)
  })
getLastUpdateMediaInfo()
  .then((data) => lastUpdateMediaList.value = data)
  .catch((error) => {
    message.error(error)
  })
</script>