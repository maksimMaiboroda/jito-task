<script setup lang="ts">
const props = defineProps<{
  card: string
}>()

type CardConfig = {
  text: string
  class: string
}
const suits: Record<string, CardConfig> = {
  h: { text: '♥', class: 'text-red-500' },
  d: { text: '♦', class: 'text-red-500' },
  c: { text: '♣', class: 'text-black' },
  s: { text: '♠', class: 'text-black' }
}

const values: Record<string, CardConfig> = {
  A: { text: 'A', class: '' },
  K: { text: 'K', class: '' },
  Q: { text: 'Q', class: '' },
  J: { text: 'J', class: '' },
  T: { text: '10', class: '' },
  '9': { text: '9', class: '' },
  '8': { text: '8', class: '' },
  '7': { text: '7', class: '' },
  '6': { text: '6', class: '' },
  '5': { text: '5', class: '' },
  '4': { text: '4', class: '' },
  '3': { text: '3', class: '' },
  '2': { text: '2', class: '' }
}
</script>
<template>
  <div class="p-2 bg-white relative w-16 h-24 rounded-xl">
    <div
      :class="suits[card[1]].class"
      class="absolute top-0 left-0 font-bold text-2xl w-6 text-center"
    >
      {{ values[card[0]]!.text }}
    </div>
    <div class="absolute left-0 w-6 text-center top-6 text-xl" :class="suits[card[1]].class">
      {{ suits[card[1]].text }}
    </div>
    <div class="absolute right-0 bottom-0 text-center text-5xl" :class="suits[card[1]].class">
      {{ suits[card[1]].text }}
    </div>
  </div>
</template>
