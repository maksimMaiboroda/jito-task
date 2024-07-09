<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import LoadingIndicator from '../components/LoadingIndicator.vue';
import PokerCard from '../components/PokerCard.vue';
import { getTable, askAIForRecommendation } from '../api';
import { CardGroup, OddsCalculator } from 'poker-tools';

const route = useRoute();
const tableId = computed(() => route.params.id);

const { data: table, isPending, refetch } = useQuery({
  queryKey: ['table', tableId],
  queryFn: () => getTable(Number(tableId.value)),
  enabled: false
});

watch(tableId, (newId) => {
  if (newId) {
    refetch();
  }
}, { immediate: true }); 

const winningCards = computed(() => {
  if (table?.value && table.value.communityCards.length === 5) {
    const playerCards = table.value.holeCards
      .filter(cards => cards !== null && cards.length === 2)
      .map(cards => CardGroup.fromString(cards!.join('')));

    const board = CardGroup.fromString(table.value.communityCards.join(''));

    const result = OddsCalculator.calculateWinner(playerCards, board);

    if (result.length > 0) {
      const winningIndexes = result[0].map(hand => hand.index);
      const winningCards = [];
      for (const index of winningIndexes) {
        if (table.value.holeCards[index]) {
          winningCards.push(...table.value.holeCards[index]);
        }
      }
      return winningCards;
    }
  }
  return [];
});


const askAI = async () => {
  try {
    if (table?.value) {
      console.log({table: table.value});
      const aiStrategy = await askAIForRecommendation(table.value.id);

      console.log({aiStrategy});
      refetch();
      alert(`AI Strategy: ${aiStrategy}`);
    } else {
      alert('Table data is not available yet');
    }
  } catch (error) {
    console.error('Error asking AI for recommendation:', error);
    alert('Failed to get AI recommendation');
  }
};
</script>

<template>
  <div class="p-2">
    <LoadingIndicator v-if="isPending" class="ml-auto mr-auto pt-4" />
    <template v-else-if="table">
      <h1 class="text-2xl py-4">{{ table.name }}</h1>
      <div class="grid grid-cols-4 gap-2">
        <template v-for="index in Math.min(4, table.capacity)" :key="index">
          <div
            class="border-solid solid border-2 p-2 rounded-xl flex items-center justify-center gap-2 w-full relative"
            :class="{
              'bg-green-200 border-4 border-black': index === 1
            }"
          >
            <template v-if="index === 1">
              <div class="absolute top-0 right-0 z-10 leading-[0]">
                <button
                  class="bg-blue-500 text-white p-1 text-xs rounded-tr-lg rounded-bl-lg"
                  @click="askAI"
                >
                  Ask AI
                </button>
              </div>
            </template>

            <template v-if="table.holeCards[index - 1]?.length">
              <PokerCard
                v-for="card in table.holeCards[index - 1]"
                :key="card"
                :card="card"
                :class="{'opacity-30': winningCards.includes(card)}"
                class="transition-opacity duration-1000"
              />
            </template>
            <template v-else><span class="font-bold text-2xl">Folded</span></template>
          </div>
        </template>
      </div>
      <div
        class="p-8 my-2 bg-green-800 rounded-xl flex gap-2 items-center justify-center text-white"
      >
        <template v-if="table.communityCards.length">
          <PokerCard
            v-for="card in table.communityCards"
            :key="card"
            :card="card"
            :class="{'opacity-30': !winningCards.includes(card)}"
            class="transition-opacity duration-1000"
          />
        </template>
        <template v-else> No cards on table </template>
      </div>
      <div v-if="table.capacity > 4" class="grid grid-cols-4 gap-2">
        <template v-for="index in table.capacity - 4" :key="index + 4">
          <div
            class="border-solid solid border-2 p-2 rounded-xl flex items-center justify-center gap-2 w-full"
          >
            <template v-if="table.holeCards[index - 1 + 4]?.length">
              <PokerCard
                v-for="card in table.holeCards[index - 1 + 4]"
                :key="card"
                :card="card"
                :class="{'opacity-30': !winningCards.includes(card)}"
                class="transition-opacity duration-1000"
              />
            </template>
            <template v-else><span class="font-bold text-2xl">Folded</span></template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
