# QR Code Treasure Hunt - Project Documentation

## Project Overview

The QR Code Treasure Hunt is an interactive web application designed to engage participants in a treasure hunt experience across a physical location (like a campus). Participants scan QR codes placed at various locations, collect virtual IoT components, and follow clues to find the next location. The project combines web technologies with physical exploration to create an engaging, gamified experience.

## Key Features

1. **QR Code Scanning**: Users scan QR codes using their phone's camera or Google Lens
2. **Component Collection**: Each QR code represents a virtual IoT component that users collect
3. **Dynamic Clue System**: Randomized clues guide users to the next location
4. **Progress Tracking**: Real-time progress tracking shows collected components and completion status
5. **User Authentication**: Registration-based system with cookie authentication
6. **Leaderboard**: Competitive element showing user ranking
7. **Prize System**: Tiered rewards for completion and placement
8. **Admin Dashboard**: Administrative controls for verification and monitoring
9. **Responsive Design**: Mobile-first approach with glassmorphism styling
10. **MongoDB Integration**: Persistent data storage for user progress and components

## Technical Architecture

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Animation**: Framer Motion for smooth transitions and effects
- **State Management**: React hooks and context for local state management
- **Authentication**: Cookie-based authentication system

### Backend
- **API Routes**: Next.js API routes for server-side operations
- **Database**: MongoDB for data persistence
- **Authentication**: Custom authentication middleware
- **Verification System**: Payment verification system with admin controls

### Data Models
- **Users**: Stores user registration and progress information
- **Components**: Virtual IoT components that users collect
- **QR Codes**: Mapping between physical QR codes and virtual components
- **Scans**: Record of QR code scans for analytics
- **Completions**: Tracking of milestone achievements

## Implementation Details

### Randomized Clue System
The application implements a dynamic clue system that randomly selects from multiple clue variations for each component. This ensures that different users may receive different clues for the same location, adding variety and replay value to the hunt.

```typescript
// Example of clue randomization logic
export function getRandomClueForComponent(componentId: number): Clue {
  const clueSet = CLUE_SETS.find(set => set.id === componentId);
  
  if (!clueSet) {
    throw new Error(`No clue set found for component ID: ${componentId}`);
  }
  
  // Check if we have a stored clue for this component in this session
  const storedClue = getStoredClue(componentId);
  if (storedClue) {
    return storedClue;
  }
  
  // Create a new clue with a random variation
  const newClue = { ...clueSet };
  
  if (newClue.alternateClues && newClue.alternateClues.length > 0) {
    // 50% chance to use an alternate clue
    if (Math.random() > 0.5) {
      const randomIndex = Math.floor(Math.random() * newClue.alternateClues.length);
      newClue.clue = newClue.alternateClues[randomIndex];
    }
  }
  
  // Store the selected clue for this session
  storeClue(componentId, newClue);
  
  return newClue;
}

