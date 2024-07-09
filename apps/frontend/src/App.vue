<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import LoadingIndicator from './components/LoadingIndicator.vue'
import { getTables } from './api'

import { RouterLink, RouterView } from 'vue-router'

const { data: tables, isPending } = useQuery({
  queryKey: ['tables'],
  queryFn: getTables,
  refetchInterval: 5000,
  throwOnError: true
})
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <div class="hidden md:flex flex-col w-64 bg-gray-800 p-2">
      <LoadingIndicator v-if="isPending" class="ml-auto mr-auto pt-4" />
      <template v-else>
        <ul class="list-none text-white text-xl pb-4">
          <li v-for="table in tables" :key="table.id">
            <RouterLink
              :to="{ name: 'table', params: { id: table.id } }"
              class="p-2"
              active-class="font-bold underline"
            >
              {{ table.name }}
            </RouterLink>
          </li>
        </ul>
        <label
          class="text-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Add table
          <input class="hidden" type="file" />
        </label>
      </template>
    </div>
    <div class="p-4 w-full">
      <RouterView />
    </div>
  </div>
</template>
