<template>
    <div class="w-full h-10 border-b-2">
        <div class="container mx-auto flex mt-1">
            <RouterLink to="/">
                <n-icon size="32">
                    <Home />
                </n-icon>
            </RouterLink>
            <a v-if="route.path !== '/'" @click="router.back()" class="cursor-pointer">
                <n-icon size="32">
                    <ArrowBack />
                </n-icon>
            </a>
            <div class="flex-1"></div>
            <div class="w-56 relative">
                <n-input v-model:value="input" @focus="() => listShow = true" @blur="blur" round placeholder="搜索">
                    <template #suffix>
                        <n-icon size="24" class="cursor-pointer">
                            <Search />
                        </n-icon>
                    </template>
                </n-input>
                <n-list v-if="input && listShow" class="absolute top-12 z-40 border rounded">
                    <n-list-item v-for="item in store.serchList(input)" :key="item.mediaContent.id" class="mx-2">
                        <RouterLink :to="`/overview/${item.mediaContent.id}`" class="flex">
                            <n-image class="w-16" :src="`/api/getImg?id=${item.mediaContent.id}&type=poster&size=sm`"
                                preview-disabled />
                            <div class="w-2"></div>
                            <div>
                                <div class="text-base font-bold">{{ item.mediaContent.name }}</div>
                                <n-ellipsis :line-clamp="4" class="w-96 text-xs">{{ item.mediaContent.overview
                                }}</n-ellipsis>
                            </div>
                        </RouterLink>
                    </n-list-item>
                </n-list>
            </div>

            <div class="flex-1"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Home, ArrowBack, Search } from '@vicons/ionicons5'
import { NIcon, NInput, NList, NListItem, NImage, NEllipsis } from 'naive-ui'
import { useMediaListStore } from '@/stores/mediaList'
const router = useRouter()
const route = useRoute()
const store = useMediaListStore()
const input = ref('')
const listShow = ref(false)
const blur = () => {
    setTimeout(() => listShow.value = false, 300)
}
</script>
