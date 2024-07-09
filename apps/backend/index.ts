import fastify from 'fastify'
import { z } from 'zod'
import _ from 'lodash'

const tableSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  holeCards: z.array(z.union([z.array(z.string()), z.null()])),
  communityCards: z.array(z.string()),
})
type Table = z.infer<typeof tableSchema>

const tableWithoutIdSchema = tableSchema.omit({ id: true })

const server = fastify()

const tables: Array<Table> = []

function generateDeck() {
  const suits = ['h', 's', 'd', 'c']
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
  const deck: string[] = []
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(rank + suit)
    }
  }
  return _.shuffle(deck)
}

const decks = new Map<Table, string[]>()

function generateTable(idx: number, forcedAmount = 0) {
  const playersAmount = forcedAmount || Math.floor(Math.random() * 6) + 2
  const communityCardsCount = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 3) + 3
  const deck = generateDeck()
  const table: Table = {
    id: idx,
    name: `Live ${idx + 1}`,
    capacity: playersAmount,
    holeCards: Array.from({ length: playersAmount }, () => [deck.pop(), deck.pop()]),
    communityCards: Array.from({ length: communityCardsCount }, () => deck.pop()),
  }

  return { table, deck }
}

for (let i = 0; i < 10; i++) {
  const { table, deck } = generateTable(i)
  tables.push(table)
  decks.set(table, deck)
}

function tableRunner() {
  for (const table of tables) {
    if (!table.name.startsWith('Live')) {
      continue
    }

    const deck = decks.get(table)!
    if (table.communityCards.length === 5) {
      const { deck, table: newTable } = generateTable(table.id, table.capacity)
      Object.assign(table, newTable, { name: table.name })
      decks.set(table, deck)
    } else if (table.communityCards.length === 0) {
      table.communityCards.push(...[deck.pop()!, deck.pop()!, deck.pop()!])
    } else {
      table.communityCards.push(deck.pop()!)
    }
  }
  setTimeout(tableRunner, 10000)
}
setTimeout(tableRunner, 10000)

server.get('/api/tables', async (request, reply) => {
  return tables.map(({ id, name }) => ({ id, name }))
})

server.get<{ Params: { id: string } }>('/api/tables/:id', async (request, reply) => {
  const id = Number(request.params.id)
  const table = tables.find((table) => table.id === id)
  if (!table) {
    reply.status(404)
    return { error: 'Table not found' }
  }
  return table
})

server.post('/api/tables', async (request) => {
  const rawTable = tableWithoutIdSchema.parse(request.body)
  const id = tables.length
  const table = { id, ...rawTable }
  tables.push(table)
  return table
})

const start = async () => {
  try {
    await server.listen({ port: 3000 })
    console.log('Server is running on http://localhost:3000')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
