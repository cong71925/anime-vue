<template>
    <div ref="ArtRef"></div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, defineEmits, nextTick, watch } from 'vue'
import Artplayer from 'artplayer'
import SubtitlesOctopus from 'libass-wasm'
import Worker from 'libass-wasm/dist/js/subtitles-octopus-worker.js?url'
import WorkerLegacy from 'libass-wasm/dist/js/subtitles-octopus-worker-legacy?url'
import Wasm from 'libass-wasm/dist/js/subtitles-octopus-worker.wasm?url'
import FangZheng from '@/assets/FangZhengHeiTi-GBK-1.woff2?url'
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku'
import type { PropType } from 'vue'
import type { Option } from 'artplayer/types/option'
import type Hls from 'hls.js'
import type { MediaPlayerClass } from 'dashjs'
import type FlvJs from 'flv.js'

console.log(Wasm)

let hls: Hls
let dash: MediaPlayerClass
let flv: FlvJs.Player
let subtitlesOctopus: SubtitlesOctopus | null = null
let subtitleOffset = 0

// const fontSize = ref('24px')
const defaultOption: Option = {
    url: '',
    container: '',
    volume: 0.6,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    setting: true,
    fullscreen: true,
    fullscreenWeb: true,
    fastForward: true,
    autoOrientation: true,
    // subtitleOffset: true,
    autoPlayback: true,
    airplay: true,
    plugins: [
        artplayerPluginDanmuku({ antiOverlap: false, danmuku: [] })
    ],
    settings: [
        {
            name: 'subtitle-offset',
            html: '字幕偏移',
            tooltip: '0s',
            range: [subtitleOffset, -7, 7, 0.1],
            onChange(item) {
                subtitleOffset = item.range
                if (subtitlesOctopus) {
                    subtitlesOctopus.timeOffset = 0 - item.range
                }
                this.subtitleOffset = item.range
                return item.range + 's'
            },
        },
        {
            name: 'subtitle-fontsize',
            html: '字幕大小',
            tooltip: '20px',
            range: [20, 20, 48, 1],
            onChange(item) {
                this.subtitle.style({ fontSize: item.range + 'px' })
                return item.range + 'px'
            },
        }
    ],
    customType: {
        m3u8: async (video: HTMLMediaElement, url: string) => {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url
                return
            }
            const { default: Hls } = await import('hls.js')
            if (!Hls.isSupported()) {
                instance.notice.show = 'Unsupported playback format: m3u8'
                return
            }
            hls?.destroy()
            hls = new Hls()
            hls.loadSource(url)
            hls.attachMedia(video)
            if (!video.src) {
                video.src = url
            }
        },
        mdp: async (video: HTMLMediaElement, url: string) => {
            const { default: Dashjs } = await import('dashjs')
            if (!Dashjs.supportsMediaSource()) {
                instance.notice.show = 'Unsupported playback format: mpd'
                return
            }
            dash?.destroy()
            dash = Dashjs.MediaPlayer().create()
            dash.initialize(video, url, instance.option.autoplay)
        },
        flv: async (video: HTMLMediaElement, url: string) => {
            const { default: FlvJs } = await import('flv.js')
            if (!FlvJs.isSupported()) {
                instance.notice.show = 'Unsupported playback format: flv'
                return
            }
            flv?.destroy()
            flv = FlvJs.createPlayer({ type: 'flv', url })
            flv.attachMediaElement(video)
            flv.load()
        }
    }
}

interface SubtitleItem {
    url: string, html: string, type: string
}

interface DanmakuData {
    text: string
    mode: 0 | 1
    time: number
}

const props = defineProps({
    option: {
        type: Object as PropType<Omit<Option, 'container'>>
    },
    subtitleList: {
        type: Object as PropType<SubtitleItem[] | null>
    },
    fonts: {
        type: Object as PropType<string[] | null>
    },
    danmakuData: {
        type: Object as PropType<DanmakuData[] | null>
    }
})

const ArtRef = ref('')
let instance: Artplayer
const emit = defineEmits<{ (e: 'get-instance', instance: Artplayer, ArtRef: string): void }>()

const cleanSubtitle = () => {
    if (subtitlesOctopus) {
        subtitlesOctopus.freeTrack()
    }
    if (instance) {
        instance.subtitle.switch('/')
    }
}

const useFonts = false

const switchSubtitle = async (subtitle: SubtitleItem, fonts?: string[] | null) => {
    cleanSubtitle()
    if (subtitle.type === 'ass') {
        const res = await fetch(subtitle.url)
        const subContent = await res.text()
        if (subtitlesOctopus) {
            subtitlesOctopus.setTrack(subContent)
        } else {
            let viewFonts
            if (fonts && useFonts) {
                const res = await Promise.allSettled(fonts.map(url => fetch(url).then(res => res.blob()))) as { status: 'fulfilled' | 'rejected', value: Blob }[]
                viewFonts = res.filter(({ status }) => status === 'fulfilled').map(({ value }) => URL.createObjectURL(value))
            }
            subtitlesOctopus = new SubtitlesOctopus({
                video: instance.video,
                subContent,
                fonts: viewFonts,
                workerUrl: Worker,
                legacyWorkerUrl: WorkerLegacy,
                fallbackFont: FangZheng,
            })
        }
    } else {
        instance.subtitle.switch(subtitle.url, { type: subtitle.type })
    }
}

watch(() => props.danmakuData, (danmuku) => {
    if (!instance || !instance.plugins || !instance.plugins.artplayerPluginDanmuku || !danmuku) {
        return
    }
    instance.plugins.artplayerPluginDanmuku.config({ danmuku })
    instance.plugins.artplayerPluginDanmuku.reset()
    instance.plugins.artplayerPluginDanmuku.load()
})

watch([() => props.subtitleList, () => props.fonts], ([subtitles, fonts]) => {
    cleanSubtitle()
    if (instance && instance.setting.find('subtitle')) {
        instance.setting.remove('subtitle')
    }
    if (!instance || !subtitles || !subtitles[0]) {
        return
    }
    const defaultSubtitle = subtitles[0]
    instance.setting.update({
        name: 'subtitle',
        html: '字幕选择',
        width: 250,
        tooltip: `<div class="truncate w-24">${defaultSubtitle.html}</div>`,
        selector: [{ url: '/', html: '关闭', type: 'srt' }, ...subtitles.map((item, index) => ({ default: index === 0, ...item }))],
        onSelect(item) {
            switchSubtitle(item as unknown as SubtitleItem, fonts)
            return `<div class="truncate w-24 text-right">${item.html}</div>`
        },
    })
    switchSubtitle(defaultSubtitle, fonts)
})

onMounted(() => {
    instance = new Artplayer({
        ...defaultOption,
        ...props.option,
        container: ArtRef.value,
    })
    nextTick(() => {
        instance.on('ready', () => {
            let range = instance.setting.find('subtitle-offset').$range
            range.min = '-7'
            range.max = '7'
            range.step = '0.1'
            range = instance.setting.find('subtitle-fontsize').$range
            range.value = '20'
            range.min = '20'
            range.max = '48'
            range.step = '1'
        })
        instance.on('restart', () => {
            let range = instance.setting.find('subtitle-offset').$range
            range.min = '-7'
            range.max = '7'
            range.step = '0.1'
            range = instance.setting.find('subtitle-fontsize').$range
            range.value = '20'
            range.min = '20'
            range.max = '48'
            range.step = '1'
        })
        emit('get-instance', instance, ArtRef.value)
    })
})
onBeforeUnmount(() => {
    hls?.destroy()
    dash?.destroy()
    flv?.destroy()
    subtitlesOctopus?.dispose()
    instance?.destroy()
})
</script>
<style scoped>
:deep(.art-danmuku-emitter) {
    display: none;
}

:deep(.ASS-container) {
    width: 100%;
    height: 100%;
}


:deep(.libassjs-canvas-parent) {
    z-index: 20;
}
</style>