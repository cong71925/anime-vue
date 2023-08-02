<template>
  <div class="flex">
    <VideoPlayer :option="option" :subtitle-list="subtitle" :fonts="fonts" :danmaku-data="danmaku"
      @get-instance="getInstance" class="h-[38rem] w-full min-w-[32rem]" />
    <div class="w-4"></div>
    <n-skeleton v-if="!mediaContent || !seasonContent" class="h-[38rem] w-[30rem]" />
    <n-card v-else :title="`${mediaContent?.name || ''}  第${season}季`" class="h-[38rem] w-[30rem]">
      <n-scrollbar class="h-[32rem]">
        <n-list>
          <n-list-item v-for="item in seasonContent?.episodeList" class="w-full">
            <RouterLink :to="`/play/${id}?season=${season}&episode=${item.episodeIndex}`" class="truncate">
              第{{ String(item.episodeIndex) || '' }}集 {{ item.name || '' }}
            </RouterLink>
          </n-list-item>
        </n-list>
      </n-scrollbar>
    </n-card>
  </div>
  <div class="h-4"></div>
  <n-card>
    <div class="flex">
      <n-image class="w-32" :src="`/api/getImg?id=${id}&type=poster&size=sm`" preview-disabled />
      <div class="w-4"></div>
      <div>
        <div class="text-lg font-medium truncate">
          第{{ episode || '' }}集:{{ episodeContent?.name || '' }}
        </div>
        <div class="h-4"></div>
        <div class="text-clip">{{ episodeContent?.overview || '' }}</div>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import Artplayer from 'artplayer'
import VideoPlayer from '@/components/VideoPlayer.vue'
import { RouterLink } from 'vue-router'
import { NList, NListItem, NCard, NScrollbar, NImage, NSkeleton } from 'naive-ui'
import { getEpisode, getSeason, getMedia, getVideoPreviewData } from '@/api/video'
import { getDanmaku } from '@/api/danmaku'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { message } from '@/utils/naiveApi'
import type { MediaContent, SeasonContent, EpisodeContent } from '@/types/media'
import axios from 'axios'
const mediaContent = ref<MediaContent>()
const seasonContent = ref<SeasonContent>()
const episodeContent = ref<EpisodeContent>()
const route = useRoute()
const id = computed(() => route.params.id)
const season = computed(() => route.query.season)
const episode = computed(() => route.query.episode)
const videoUrl = computed(() => `/api/redirectVideoViewUrl?id=${id.value}&season=${season.value}&episode=${episode.value}`)
const imgPosterUrl = computed(() => `/api/getImg?id=${id.value}&season=${season.value}&episode=${episode.value}&type=still&size=original`)

interface DanmakuData {
  text: string
  mode: 0 | 1
  time: number
}

let instance: Artplayer

const subtitle = ref<{ url: string, html: string, type: string }[] | null>(null)
const fonts = ref<string[] | null>(null)
const danmaku = ref<DanmakuData[] | null>(null)

const getData = () => {
  getEpisode({ id: Number(id.value), season: Number(season.value), episode: Number(episode.value) }).then(async data => {
    episodeContent.value = data
    fonts.value = data.fonts?.map((name) => axios.getUri({
      url: '/api/redirectFontUrl', params: {
        id: id.value,
        season: season.value,
        episode: episode.value,
        filename: name
      }
    })) || null
    subtitle.value = data.subtitleList?.map(({ fileName }) => ({
      url: `/api/redirectSubtitleUrl?id=${id.value}&season=${season.value}&episode=${episode.value}&subtitle=${fileName}`,
      type: fileName.split('.').pop() || '',
      html: fileName
    })) || null
  }).catch((error) => {
    console.error(error)
  })

  getVideoPreviewData({ id: Number(id.value), season: Number(season.value), episode: Number(episode.value) }).then(data => {
    instance.quality = [{ default: true, url: videoUrl.value, html: '原画' }, ...data.map(({ url, name }) => ({ url: url, html: name }))]
  }).catch(error => {
    console.error(error)
  })

  getDanmaku({ id: Number(id.value), season: Number(season.value), episode: Number(episode.value) }).then(data => {
    danmaku.value = data
  }).catch(error => {
    console.error(error)
  })
}
watch([id, season, episode], () => {
  if (!id.value || !season.value || !episode.value || !instance) {
    return
  }
  instance.switchUrl(videoUrl.value)
  instance.poster = imgPosterUrl.value
  getData()
})

const getInstance = (payload: Artplayer) => {
  instance = payload
  getData()
}

getSeason({ id: Number(id.value), season: Number(season.value) })
  .then((data) => {
    seasonContent.value = data
  }).catch(error => {
    message.error(error)
  })

getMedia({ id: Number(id.value) })
  .then((data) => {
    mediaContent.value = data
  }).catch(error => {
    message.error(error)
  })

const option = {
  url: videoUrl.value,
  poster: imgPosterUrl.value
}
</script>

