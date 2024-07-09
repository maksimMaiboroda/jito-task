import { z } from 'zod'

const tableSchema = z.object({
    id: z.number(),
    name: z.string(),
    capacity: z.number(),
    holeCards: z.array(z.union([z.array(z.string()), z.null()])),
    communityCards: z.array(z.string())
})

const tableInfoSchema = tableSchema.pick({
    id: true,
    name: true
})
type Table = z.infer<typeof tableSchema>
type TableInfo = z.infer<typeof tableInfoSchema>

export function getTables(): Promise<TableInfo[]> {
    return fetch('/api/tables')
        .then((r) => r.json())
        .then((data) => z.array(tableInfoSchema).parse(data))
}

export function getTable(id: number): Promise<Table> {
    return fetch(`/api/tables/${id}`)
        .then((r) => r.json())
        .then((data) => tableSchema.parse(data))
}

export function createTable(input: Omit<Table, 'id'>): Promise<Table> {
    return fetch('/api/tables', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
        .then((r) => r.json())
        .then((data) => tableSchema.parse(data))
}

export async function askAIForRecommendation(tableId: number): Promise<string> {
    try {
        const table = await getTable(tableId);
        const formattedState = formatTableState(table);
        const aiStrategy = await getAiStrategy(formattedState);
        return aiStrategy;
    } catch (error) {
        console.error('Failed to get AI recommendation', error);
        throw new Error('Failed to get AI recommendation');
    }
}

async function getAiStrategy(state: string): Promise<string> {
    const response = await fetch('https://rlbot-svc.prod.kashxa-infra.com/act', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'dc929e5e5e6d83784baa294a1819dfe1'
        },
        body: new URLSearchParams({
            format: '3blinds-ante',
            state: state
        }).toString()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch AI strategy');
    }

    const data = await response.json();

    const strategy: Record<string, number> = data.strategy;

    const maxKey = Object.entries(strategy).reduce((max, entry) => {
        const current = entry[1];
        if (typeof current === 'number' && current > strategy[max]) {
            return entry[0];
        } else {
            return max;
        }
    }, Object.keys(strategy)[0]);

    return maxKey;
}


function formatTableState(table: Table): string {
    const { capacity, holeCards } = table;

    const playerCards = holeCards.map(cards => cards ? cards.join('') : '').join('|');
    const balances = new Array(capacity).fill('1000').join('|');
    const state = `:${playerCards}:${balances}`;

    return state;
}

