# 🚀 Solar System Todo App v0.3.0

**3D Solar System Todo App built with React Three Fiber** - Interactive planetary orbital system with comprehensive todo functionality and deadline management

![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-black.svg)
![Tests](https://img.shields.io/badge/tests-passing-green.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25+-yellow.svg)

## ✨ What's New in v0.3.0

### 🌌 **Complete Orbital System**
- **8 Planets with Realistic Orbits** - From Mercury to Neptune
- **Interactive Planet Clicking** - Click planets with pending tasks to filter todos
- **Orbital Mechanics** - Each planet has unique orbit radius, speed, and size
- **Visual Task Indicators** - 3D text showing pending task count above planets

### ⏰ **Advanced Deadline System**
- **Deadline Setting** - Optional deadline for each mission
- **Urgency Color Coding** - 5-level system from normal to overdue
- **Real-time Progress Bars** - Visual time remaining indicators
- **Critical Animations** - Pulsing effects for urgent and overdue tasks

### 🎯 **Enhanced Interactivity**
- **Smart Planet Visibility** - Only planets with pending tasks are clickable
- **Category Filtering** - Click planets to focus on specific mission types
- **Completed Task Hiding** - Finished missions don't clutter planet view
- **Dynamic Statistics** - Real-time mission counts per planet

## 🌟 Core Features

### 🌍 **3D Solar System**
- **Complete Planetary System** - All 8 planets with accurate relative sizes
- **Orbital Animations** - Realistic orbital speeds and rotations
- **Interactive Controls** - Mouse/touch navigation with zoom and pan
- **Space Environment** - Cosmic background with orbital trail visualization

### 📋 **Advanced Todo Management**
- **Full CRUD Operations** - Create, Read, Update, Delete missions
- **Planet-based Categories** - 10 categories including all planets and sun
- **Priority System** - High/Medium/Low with color coding
- **Deadline Management** - Optional deadlines with urgency tracking
- **Smart Filtering** - Filter by status, category, or planet selection
- **Local Storage** - Automatic data persistence

### 🎨 **Urgency Visualization System**
- **🟢 Normal (51-100%)** - Plenty of time remaining
- **🟡 Warning (26-50%)** - Approaching deadline
- **🟠 Urgent (11-25%)** - Time running short
- **🔴 Critical (1-10%)** - Very urgent with pulsing animation
- **⚫ Overdue (0%)** - Past deadline with alert animation

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/gon1zau6jyun4liu5/solar-system-todo.git

# Navigate to project directory
cd solar-system-todo

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage (80%+ target)
npm run test:coverage

# Build for production
npm run build
```

## 🎮 How to Use

### **Creating Missions**
1. Click the "+ New Mission" button
2. Enter your mission description
3. Select a planet category (Mercury through Neptune)
4. Choose priority level (Low/Medium/High)
5. Optionally set a deadline for urgency tracking
6. Click "Launch Mission"

### **Planet Interaction**
- **Click planets** with pending tasks to filter missions
- **Task counters** appear above planets with active missions
- **Completed missions** automatically hide from planet view
- Use **"Show All"** button to return to full mission view

### **Deadline Management**
- Set deadlines when creating or editing missions
- Watch **color-coded progress bars** show time remaining
- **Critical missions** pulse red when time is running out
- **Overdue missions** flash to grab attention

## 📊 Planet Categories

| Planet | Category | Icon | Orbit | Color |
|--------|----------|------|--------|-------|
| Sun | `sun` | ☀️ | Center | Yellow |
| Mercury | `mercury` | 🌑 | Innermost | Gray-Brown |
| Venus | `venus` | 💛 | 2nd | Golden |
| Earth | `earth` | 🌍 | 3rd | Blue |
| Mars | `mars` | 🔴 | 4th | Red |
| Jupiter | `jupiter` | 🪐 | 5th | Tan |
| Saturn | `saturn` | 🪐 | 6th | Pale Gold |
| Uranus | `uranus` | 🔵 | 7th | Cyan |
| Neptune | `neptune` | 🔷 | Outermost | Deep Blue |

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Scene.js              # 3D environment setup
│   ├── SolarSystem.js        # Planet system manager
│   ├── Planet.js             # Individual planet component
│   ├── Sun.js                # Central sun component
│   ├── TodoManager.js        # Todo state management
│   ├── TodoList.js           # Todo list renderer
│   ├── TodoItem.js           # Individual todo with urgency
│   ├── TodoForm.js           # Create/edit form with deadline
│   ├── TodoManager.css       # Enhanced styling
│   └── __tests__/            # Comprehensive test suite
├── App.js                    # Root component with state
├── App.css                   # Global styles
└── index.js                  # Application entry point
```

## 🛠️ Technology Stack

- **Frontend Framework:** React 19.1.0
- **3D Graphics:** Three.js 0.178.0 + React Three Fiber 9.2.0
- **3D Utilities:** React Three Drei 10.5.1 (Text, OrbitControls)
- **Testing:** Jest + React Testing Library
- **Build Tool:** Create React App 5.0.1
- **State Management:** React Hooks
- **Data Persistence:** Local Storage API

## 📋 Sample Mission Data

The app includes 6 pre-loaded space missions with deadlines:

1. **태양의 표면 온도 조사하기** (Solar research, high priority, due 2025-07-25)
2. **지구의 자전축 기울기 23.5도 확인** (Earth studies, completed, was due 2025-07-22)
3. **화성 탐사 로버 데이터 분석** (Mars exploration, high priority, due 2025-07-23)
4. **목성의 대적점 관측 일지 작성** (Jupiter research, low priority, due 2025-07-30)
5. **토성 고리의 구성 물질 연구** (Saturn analysis, completed, was due 2025-07-24)
6. **혜성 궤도 계산 프로그램 완성하기** (General mission, high priority, due 2025-07-22)

## 🧪 Test Coverage

The application maintains 80%+ test coverage including:

- ✅ Planet orbital mechanics and rendering
- ✅ Todo CRUD operations with deadlines
- ✅ Urgency calculation algorithms
- ✅ Planet click interactions
- ✅ Category filtering logic
- ✅ Local storage integration
- ✅ Form validation and deadline handling
- ✅ Component rendering and user interactions

## 🚀 Development Workflow

1. **Branch Creation:** Feature branches for all changes (`feature/feature-name-v0.X.X`)
2. **Test-Driven Development:** Write tests for new functionality
3. **Quality Assurance:** All tests must pass before PR
4. **Documentation:** Update specifications after testing
5. **Version Management:** Increment version with each release and display on screen

## 🔮 Upcoming Features (v0.4.0)

### **Productivity Enhancements**
- 🔔 **Browser Notifications** - Deadline reminders
- 📊 **Analytics Dashboard** - Productivity metrics and charts
- 🏷️ **Mission Templates** - Reusable mission patterns
- 🔍 **Advanced Search** - Find missions by text content
- 📱 **PWA Support** - Offline functionality

### **3D System Expansion**
- 🌙 **Moon System** - Add major moons to planets
- ☄️ **Asteroid Belt** - Interactive asteroid field
- 🚀 **Space Stations** - 3D mission hubs
- 🌌 **Star Field** - Dynamic background stars

## ⚡ Performance Features

- **Optimized Rendering:** 60fps target with efficient Three.js usage
- **Smart Re-rendering:** React hooks for minimal updates
- **Memory Management:** Proper cleanup of 3D resources
- **Responsive Design:** Mobile and desktop optimized
- **Local Storage:** Instant load times with cached data

## 🌐 Browser Support

- **Chrome:** 90+ (Recommended)
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+
- **Mobile:** iOS Safari 14+, Chrome Mobile 90+

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm run test:coverage`)
5. Update documentation if needed
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- **Three.js Community** - For the amazing 3D library
- **React Three Fiber** - For seamless React/Three.js integration
- **NASA** - For planetary data inspiration
- **Space Exploration Enthusiasts** - For motivation

---

**Made with 🚀 and ❤️ for space exploration and productivity**

**Current Status:** Production-ready v0.3.0 with complete orbital mechanics, deadline management, and interactive planet system.