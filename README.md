# 🚀 Solar System Todo App v0.2.0

3D Solar System Todo App built with React Three Fiber - Interactive solar system simulation with comprehensive todo functionality

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-black.svg)
![Tests](https://img.shields.io/badge/tests-passing-green.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25-yellow.svg)

## ✨ Features

### 🎯 Complete Todo Management System
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete todos
- 🌌 **Space-themed Interface** - Mission control style dark UI
- 🪐 **Planetary Categories** - Organize todos by solar system objects
- 🎨 **Priority System** - High/Medium/Low priority with color coding
- 📊 **Real-time Statistics** - Live count of total, completed, and pending missions
- 🔍 **Advanced Filtering** - Filter by completion status
- 💾 **Local Storage** - Automatic data persistence
- 📱 **Responsive Design** - Optimized for mobile and desktop

### 🌟 3D Solar System Scene
- 🌞 **Animated Sun** - Rotating 3D sun with emissive materials
- 🎮 **Orbit Controls** - Mouse/touch navigation
- 🌌 **Space Environment** - Full-screen cosmic background

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

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## 📋 Sample Data

The app comes with 6 pre-loaded space missions:

- 🌞 **태양의 표면 온도 조사하기** (Solar research, high priority)
- 🌍 **지구의 자전축 기울기 23.5도 확인** (Earth studies, completed)
- 🔴 **화성 탐사 로버 데이터 분석** (Mars exploration, high priority)
- 🪐 **목성의 대적점 관측 일지 작성** (Jupiter research, low priority)
- 🪐 **토성 고리의 구성 물질 연구** (Saturn analysis, completed)
- 🚀 **혜성 궤도 계산 프로그램 완성하기** (General mission, high priority)

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Scene.js              # 3D scene component
│   ├── Sun.js                # Animated sun component
│   ├── TodoManager.js        # Main todo state management
│   ├── TodoList.js           # Todo list renderer
│   ├── TodoItem.js           # Individual todo item
│   ├── TodoForm.js           # Add/edit todo form
│   ├── TodoManager.css       # Todo system styles
│   └── __tests__/            # Unit tests
├── App.js                    # Root component
├── App.css                   # Global styles
└── index.js                  # App entry point
```

## 🛠️ Technology Stack

- **Frontend Framework:** React 19.1.0
- **3D Graphics:** Three.js 0.178.0 + React Three Fiber 9.2.0
- **3D Utilities:** React Three Drei 10.5.1
- **Testing:** Jest + React Testing Library
- **Build Tool:** Create React App 5.0.1
- **State Management:** React Hooks
- **Data Persistence:** Local Storage

## 🎮 Usage

### Adding a New Mission
1. Click the "+ New Mission" button
2. Enter your mission description
3. Select a category (Sun, Earth, Mars, etc.)
4. Choose priority level
5. Click "Launch Mission"

### Managing Missions
- **Complete Mission:** Click the ⭕/✅ button
- **Edit Mission:** Click the ✏️ edit button
- **Delete Mission:** Click the 🗑️ delete button (with confirmation)

### Filtering Missions
- **All Missions:** View all todos
- **Pending:** Show only incomplete missions
- **Completed:** Show only finished missions

## 🧪 Test Coverage

The application maintains 80%+ test coverage including:

- ✅ Todo state management
- ✅ CRUD operations
- ✅ Local storage integration
- ✅ Form validation
- ✅ User interactions
- ✅ Component rendering
- ✅ Filter functionality

## 🚀 Development Workflow

1. **Branch Creation:** Create feature branches for all changes
2. **Test-Driven Development:** Write tests for new functionality
3. **Quality Assurance:** Ensure all tests pass before PR
4. **Documentation:** Update specifications after testing
5. **Version Management:** Increment version with each release

## 🔮 Upcoming Features (v0.3.0)

- 🪐 **Planet Integration:** Click planets to filter related todos
- 🏷️ **3D Labels:** Show todo counts on planets
- 🎨 **Visual Feedback:** Planet effects based on completion status
- 🔍 **Search Functionality:** Find todos by text
- 📅 **Due Dates:** Add deadlines to missions
- 🔄 **Drag & Drop:** Reorder todos

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with 🚀 and ❤️ for space exploration enthusiasts**