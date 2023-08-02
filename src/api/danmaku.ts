import axios from 'axios'

interface DanmakuResponse extends ResponseContent {
    data: Array<DanmakuData> 
}

interface ResponseContent {
    code: number
    message: string
}


interface DanmakuData {
    text: string
    mode: 0 | 1
    time: number
}

export const getDanmaku = (params: { id: Number, season: number, episode: number }) => new Promise<Array<DanmakuData>>((resolve, reject) => {
    axios.get('/api/getDanmaku', { params })
        .then((response) => {
            const { code, message, data }: DanmakuResponse = response.data
            if (200 === code) resolve(data)
            else reject(message)
        })
        .catch((error) => {
            reject(error)
        })
})