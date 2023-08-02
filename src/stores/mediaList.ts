import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getVideoList } from '@/api/video'
import type { MediaContent } from '@/types/media'


export const useMediaListStore = defineStore('mediaList', () => {
    const mediaList = ref<MediaContent[]>([])


    const setMediaList = (payload: MediaContent[]) => {
        mediaList.value = payload
    }

    if (!mediaList.value || !mediaList.value.length) {
        getVideoList().then((data) => {
            setMediaList(data)
        })
    }

    const serchList = computed(() => (payload: string, count: number = 5) => {
        const result: { mediaContent: MediaContent, index: number }[] = []
        for (let index = 0, { length } = mediaList.value; index < length; index++) {
            const mediaContent = mediaList.value[index]
            const regxRes = new RegExp(payload).exec(`${mediaContent.id}${mediaContent.name}${mediaContent.overview}`)
            if (!regxRes) {
                continue
            }
            result.push({ mediaContent, index: regxRes.index })
        }
        return result.sort((a, b) => a.index - b.index).filter((item, index) => index < count)
    })

    return { mediaList, setMediaList, serchList }
})