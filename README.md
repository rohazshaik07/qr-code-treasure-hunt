
# QR Code Treasure Hunt

![QR Code Treasure Hunt Banner](https://github.com/user-attachments/assets/7ea7cf0e-47e6-4a81-87ca-e8c9fb22e735)

## Overview

**QR Code Treasure Hunt** is an interactive web application that transforms physical spaces into an engaging treasure hunt experience. Participants scan QR codes placed at various locations (e.g., a campus) to collect virtual IoT components, follow dynamic clues to the next spot, and compete on a leaderboard. This project blends physical exploration with modern web technologies, featuring a payment integration for event registration and a sleek, mobile-first design.

Deployed at: [qr-code-treasure-hunt](https://qr-code-treasure-hunt.vercel.app/)

## Key Features

- **QR Code Scanning**: Scan codes using a phone camera or Google Lens to unlock components.
- **Dynamic Clue System**: Randomized clues for each location, enhancing replayability.
- **IoT Component Collection**: Gather virtual components that linked to physical QR codes which can be collected virtuallty after scanning.
- **Payment Integration**: Secure registration via Cashfree payment form links.
- **Leaderboard**: Real-time ranking of participants based on progress.
- **Progress Tracking**: Visual feedback on collected components and hunt completion.
- **Admin Dashboard**: Tools for monitoring and verifying participant activity.
- **Responsive Design**: Mobile-first UI with glassmorphism styling.
- **Persistent Storage**: MongoDB for user data, progress, and analytics.

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Hooks & Context API

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Payment Gateway**: Cashfree API for secure transactions
- **Authentication**: Cookie-based session management

### Deployment
- **Hosting**: Vercel

## Project Architecture

- **Frontend**: Handles personal dashboard, clue display, and user interaction with a responsive UI.
- **Backend**: Manages user registration, payment processing, QR code mapping, and data persistence.
- **Database**: Stores user profiles, collected components, scan history, and leaderboard data.
- **Payment Flow**: Integrates Cashfree for registration fees, with webhook verification for payment status.

## Installation

To run the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rohazshaik07/qr-code-treasure-hunt.git
   cd qr-code-treasure-hunt
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory with:
     ```
     MONGODB_URI=your-mongodb-connection-string
     CASHFREE_APP_ID=your-cashfree-app-id
     CASHFREE_SECRET_KEY=your-cashfree-secret-key
     NODE_ENV=development
     ```

4. **Run the Application**:
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Register**: Sign up and complete payment via the Cashfree gateway.
2. **Start Hunting**: Scan QR codes at designated locations to collect components.
3. **Follow Clues**: Use randomized clues to find the next QR code.
4. **Track Progress**: Monitor your collected components and leaderboard rank.
5. **Admin Access**: Use the dashboard (if authorized) to manage the hunt.
6. **Page Access**: Use Registration IDs like 22F01A4949 or 22F01A4947. The 7th and 8th digits must be 49.

**Available Links**

- [QR Code link 1] (https://qr-code-treasure-hunt.vercel.app/scan/6ba7b810-9dad-11d1-80b4-00c04fd430c8)
- [QR Code link 2] (https://qr-code-treasure-hunt.vercel.app/scan/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d)
- [QR Code link 3] (https://qr-code-treasure-hunt.vercel.app/scan/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed)
- [QR Code link 4] (https://qr-code-treasure-hunt.vercel.app/scan/f47ac10b-58cc-4372-a567-0e02b2c3d479)
- [QR Code link 5] (https://qr-code-treasure-hunt.vercel.app/scan/550e8400-e29b-41d4-a716-446655440000)

## Screenshots

| Component Collection | Leaderboard | Admin Page |
|----------------------|-------------|--------------|
| ![Collection Interface](https://github.com/user-attachments/assets/11b03b51-525d-4031-baa9-2dd258fd1d25) | ![Leaderboard](https://github.com/user-attachments/assets/8bd78287-bcc3-48d7-9498-337a49f5bd8f) | ![Admin](https://github.com/user-attachments/assets/1438ac1f-fa45-48ab-ad15-fdb569917d28) |

## Code Highlights

### Dynamic Clue Randomization
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
```

### Payment Integration (Cashfree)
```typescript
export async function createPaymentOrder(orderData: CashfreePaymentOrder): Promise<CashfreePaymentResponse> {
  const response = await fetch(CASHFREE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": "2022-09-01",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error(`Cashfree API error: ${await response.text()}`);
  return await response.json();
}
```

## Future Enhancements
- Add AR overlays for QR code locations.
- Implement real-time notifications for new clues or leaderboard updates.
- Support multiplayer teams for collaborative hunts- **License**: MIT License

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m "Add YourFeature"`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
- **Author**: Rohaz Shaik
- **Email**: shaikrohaz@gmail.com
- **GitHub**: [rohazshaik07](https://github.com/rohazshaik07)
- **Live Demo**: [qr-code-treasure-hunt](https://qr-code-treasure-hunt.vercel.app/)
