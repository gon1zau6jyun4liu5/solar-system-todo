# Solar System Todo App

🌌 A 3D interactive solar system simulation built with React Three Fiber, combining beautiful 3D graphics with todo functionality.

## Features

- 🌟 3D Solar System simulation with rotating sun
- 🚀 Interactive camera controls (orbit, zoom, pan)
- ⚛️ Built with React Three Fiber and Three.js
- 📱 Responsive design
- 🎨 Modern UI with space theme

## Tech Stack

- **React 19** - Latest React features
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **Three.js** - 3D graphics library
- **Create React App** - Development setup

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gon1zau6jyun4liu5/solar-system-todo.git
cd solar-system-todo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/
│   ├── Scene.js      # Main 3D scene setup
│   └── Sun.js        # Rotating sun component
├── App.js            # Main app component
├── App.css           # App styles
├── index.js          # React entry point
└── index.css         # Global styles
```

## Current Features

### 🌞 Solar System Simulation
- Rotating sun with emissive yellow material
- 3D scene with ambient and point lighting
- Orbit controls for camera interaction

## Roadmap

- [ ] Add planets (Mercury, Venus, Earth, Mars, etc.)
- [ ] Implement orbital mechanics
- [ ] Add todo functionality integrated with celestial objects
- [ ] Planet information panels
- [ ] Realistic textures and materials
- [ ] Sound effects and ambient music
- [ ] Mobile touch controls optimization

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- React Three Fiber community for excellent 3D React tools
- Three.js for the powerful 3D graphics library
- NASA for inspiring space exploration

---

**Version:** 0.1.0  
**Created with:** ❤️ and curiosity about the cosmos
