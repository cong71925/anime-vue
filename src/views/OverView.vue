<template>
    <div class="flex">
        <n-image class="w-60" :src="`/api/getImg?id=${route.params.id}&type=poster&size=md`" preview-disabled />
        <div class="w-4"></div>
        <div class="flex flex-1 flex-col">
            <h1 class="text-4xl font-bold">{{ mediaContent?.name || '' }}</h1>
            <div class="h-4"></div>
            <span>{{ mediaContent?.overview || '' }}</span>
        </div>
    </div>
    <n-tabs type="line" :default-value="0" animated>
        <n-tab-pane v-for="(season, index) in mediaContent?.seasonList" :key="`${id}_${season.seasonIndex}`" :name="index"
            :tab="`第${season.seasonIndex}季`">
            <div class="grid md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
                <RouterLink v-for="item in season.episodeList" :key="`${id}_${season.seasonIndex}_${item.episodeIndex}`"
                    :to="`/play/${route.params.id}?season=${season.seasonIndex}&episode=${item.episodeIndex}`" class="my-1">
                    <NCard>
                        <template #header>
                            <div class="truncate">{{ `第${item.episodeIndex}话 ${item.name}` }}</div>
                        </template>
                        <template #cover>
                            <n-image class="w-full"
                                :src="`/api/getImg?id=${route.params.id}&season=${season.seasonIndex}&episode=${item.episodeIndex}&type=still&size=original`"
                                preview-disabled />
                        </template>
                    </NCard>
                </RouterLink>
            </div>
        </n-tab-pane>
    </n-tabs>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NCard, NImage, NTabs, NTabPane } from 'naive-ui'
import { getMedia } from '@/api/video'
import { message } from '@/utils/naiveApi'
import type { MediaContent } from '@/types/media'
const mediaContent = ref<MediaContent>()
const route = useRoute()
const id = computed(() => route.params.id)
watch(id, () => {
    if (!id.value) {
        return
    }
    getMedia({ id: Number(id.value) })
        .then((data) => {
            mediaContent.value = data
        }).catch(error => {
            message.error(error)
        })
}, { immediate: true })
</script>