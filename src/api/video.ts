import axios from 'axios'
import { useMediaListStore } from '@/stores/mediaList'
import type { MediaContent, EpisodeContent, SeasonContent } from '@/types/media'

interface ResponseContent {
    code: number
    message: string
}

interface TranscodedContent {
    url: string
    name: string
    width: number
    height: number
}

export const getVideoPreviewData = (params: { id: number, season: number, episode: number }) => new Promise<TranscodedContent[]>((resolve, reject) => {
    axios.get('/api/getVideoPreviewData', { params })
        .then((response) => {
            const { code, message, data }: { data: TranscodedContent[] } & ResponseContent = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})

export const getEpisode = (params: { id: number, season: number, episode: number }) => new Promise<EpisodeContent>((resolve, reject) => {
    axios.get('/api/getEpisode', { params })
        .then((response) => {
            const { code, message, data }: { data: EpisodeContent } & ResponseContent = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})

export const getSeason = (params: { id: number, season: number }) => new Promise<SeasonContent>((resolve, reject) => {
    axios.get('/api/getSeason', { params })
        .then((response) => {
            const { code, message, data }: { data: SeasonContent } & ResponseContent = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})


export const getVideoList = () => new Promise<MediaContent[]>((resolve, reject) => {
    const store = useMediaListStore()
    axios.get('/api/getVideoList')
        .then((response) => {
            const { code, message, data }: { data: MediaContent[] } & ResponseContent = response.data
            if (200 === code) {
                store.setMediaList(data)
                resolve(data)
            }
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})

export const getMedia = (params: { id: number }) => new Promise<MediaContent>((resolve, reject) => {
    axios.get('/api/getMedia', { params })
        .then((response) => {
            const { code, message, data }: { data: MediaContent } & ResponseContent = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})

export interface LastUpdateMediaContent {
    name: string
    id: number
    lastUpdateInfo: { seasonIndex: number } & EpisodeContent
}

export const getLastUpdateMediaInfo = (params?: { count: number }) => new Promise<LastUpdateMediaContent[]>((resolve, reject) => {
    axios.get('/api/getLastUpdateMediaInfo', { params })
        .then((response) => {
            const { code, message, data }: { data: LastUpdateMediaContent[] } & ResponseContent = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})
