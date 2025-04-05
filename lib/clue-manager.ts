// Define the clue structure
export interface Clue {
  id: number
  title: string
  clue: string
  hint: string
  alternateClues?: string[]
}

// Define our clue sets with multiple variations for each component
export const CLUE_SETS: Clue[] = [
  {
    id: 1,
    title: "First Component",
    clue: "Among the books, quite & bright find your clue at the top",
    hint: "Library daggaralo pegions chalaa unnay!",
    alternateClues: [
      "Knowledge surrounds you, look where silence is golden and wisdom is stored on shelves.",
      "Seek the quiet place where stories live, your component awaits on the highest shelf.",
      "In the realm of knowledge and learning, look up to find what you seek.",
    ],
  },
  {
    id: 2,
    title: "Second Component",
    clue: "Where snacks and lunch fill the air where your clue hidden somewhere.",
    hint: "College mottam lo lovers andaru ikkade kurchuntaruu endukoo marii!",
    alternateClues: [
      "Hunger leads to this place, where friends gather and meals are shared.",
      "Follow the aroma of food and the sound of chatter to find your next component.",
      "Where students refuel their bodies and minds, your next clue awaits.",
    ],
  },
  {
    id: 3,
    title: "Third Component",
    clue: "Where grass is green and skies are wide, look near the tree for what you can't hide.",
    hint: "Lunch break lo tindam ante snakes untay antunnaruuu!",
    alternateClues: [
      "Nature's carpet beneath your feet, find the guardian of shade that stands tall.",
      "The open space where sun and clouds play, search near the wooden sentinel.",
      "Breathe the fresh air and look for the oldest living thing in this open area.",
    ],
  },
  {
    id: 4,
    title: "Fourth Component",
    clue: "Where payments are paid and step raise high, you clue will be on the bottom of the high.",
    hint: "Fess pay chese place daggaralo ah machine enduku pettaroo.",
    alternateClues: [
      "Transactions happen here, look low where steps lead high.",
      "Money changes hands in this place, search beneath the ascending path.",
      "Where students ensure their place, find the treasure at the base of elevation.",
    ],
  },
  {
    id: 5,
    title: "Final Component",
    clue: "Start where doors to the college opens wide right the entrence where all the paths collide.",
    hint: "Main entrence road lo trees bale natural ga unnay kada mamaaa!",
    alternateClues: [
      "The beginning of all journeys on campus, where everyone first steps foot.",
      "The gateway to knowledge stands tall, search near where all enter.",
      "First impressions are made here, find your final piece where paths begin.",
    ],
  },
]

// Function to get a random clue for a specific component
export function getRandomClueForComponent(componentId: number): Clue {
  const clueSet = CLUE_SETS.find((set) => set.id === componentId)

  if (!clueSet) {
    throw new Error(`No clue set found for component ID: ${componentId}`)
  }

  // Check if we have a stored clue for this component in this session
  const storedClue = getStoredClue(componentId)
  if (storedClue) {
    return storedClue
  }

  // Create a new clue with a random variation
  const newClue = { ...clueSet }

  if (newClue.alternateClues && newClue.alternateClues.length > 0) {
    // 50% chance to use an alternate clue
    if (Math.random() > 0.5) {
      const randomIndex = Math.floor(Math.random() * newClue.alternateClues.length)
      newClue.clue = newClue.alternateClues[randomIndex]
    }
  }

  // Store the selected clue for this session
  storeClue(componentId, newClue)

  return newClue
}

// Store the clue in session storage
function storeClue(componentId: number, clue: Clue): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`clue_${componentId}`, JSON.stringify(clue))
  }
}

// Get a stored clue from session storage
function getStoredClue(componentId: number): Clue | null {
  if (typeof window !== "undefined") {
    const storedClue = sessionStorage.getItem(`clue_${componentId}`)
    if (storedClue) {
      return JSON.parse(storedClue)
    }
  }
  return null
}

// Clear all stored clues
export function clearStoredClues(): void {
  if (typeof window !== "undefined") {
    CLUE_SETS.forEach((set) => {
      sessionStorage.removeItem(`clue_${set.id}`)
    })
  }
}

// Function to reset a specific clue (for testing)
export function resetClue(componentId: number): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`clue_${componentId}`)
  }
}

