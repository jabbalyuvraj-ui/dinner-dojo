import { useState, useEffect } from 'react'
import Welcome from './components/Welcome'
import Onboarding from './components/Onboarding'
import Preferences from './components/Preferences'
import Result from './components/Result'
import Recipe from './components/Recipe'
import ShoppingList from './components/ShoppingList'
import Timer from './components/Timer'
import ForkRamseyChat from './components/ForkRamsey'
import WeeklyPlanner, { useBannedDishes, saveTodaysDish } from './components/WeeklyPlanner'
import FoodFact from './components/FoodFact'

const THEMES = ['theme-pink', 'theme-green', 'theme-blue']
const THEME_INTERVAL = 120000
const PREV_KEY = 'dinnerDojo_prevUserData'

const DEFAULT_USERDATA = {
  ingredients: [],
  cuisines: [],
  flavors: { sweet: false, salty: false, sour: false, spicy: false, savoury: false, bitter: false },
  people: 2,
  dietary: [],
}

function App() {
  const [screen, setScreen]         = useState('welcome')
  const [themeIndex, setThemeIndex] = useState(0)
  const [userData, setUserData]     = useState(DEFAULT_USERDATA)
  const [likedDishes, setLikedDishes] = useState([])
  const [finalDish, setFinalDish]   = useState(null)
  const [recipeData, setRecipeData] = useState(null)
  const { banned, banDish, isBanned } = useBannedDishes()

  // Rotate background
  useEffect(() => {
    const iv = setInterval(() => setThemeIndex(p => (p + 1) % THEMES.length), THEME_INTERVAL)
    return () => clearInterval(iv)
  }, [])

  const navigate = (s) => setScreen(s)
  const showChat    = !['welcome','onboarding'].includes(screen)
  const showSidebars = screen === 'onboarding'

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <Welcome onStart={() => navigate('onboarding')} />

      case 'onboarding':
        return (
          <Onboarding
            userData={userData}
            setUserData={setUserData}
            onNext={() => navigate('preferences')}
          />
        )

      case 'preferences':
        return (
          <Preferences
            userData={userData}
            likedDishes={likedDishes}
            setLikedDishes={setLikedDishes}
            bannedDishes={banned}
            onComplete={(dish) => {
              setFinalDish(dish)
              saveTodaysDish(dish)
              navigate('result')
            }}
            onBack={() => navigate('onboarding')}
          />
        )

      case 'result':
        return (
          <Result
            dish={finalDish}
            onFindRecipe={(recipe) => { setRecipeData(recipe); navigate('recipe') }}
            onTryAgain={() => {
              setLikedDishes([])
              setFinalDish(null)
              navigate('onboarding')
            }}
          />
        )

      case 'recipe':
        return (
          <Recipe
            recipe={recipeData}
            dish={finalDish}
            onShoppingList={() => navigate('shopping')}
            onTimer={() => navigate('timer')}
            onBack={() => navigate('result')}
          />
        )

      case 'shopping':
        return (
          <ShoppingList
            recipeData={recipeData}
            userIngredients={userData.ingredients}
            people={userData.people}
            onBack={() => navigate('recipe')}
          />
        )

      case 'timer':
        return (
          <Timer
            recipeData={recipeData}
            onBack={() => navigate('recipe')}
          />
        )

      default:
        return <Welcome onStart={() => navigate('onboarding')} />
    }
  }

  return (
    <div className={`app theme-wrapper ${THEMES[themeIndex]}`}>
      {/* Weekly Planner sidebar — visible on onboarding screen */}
      {showSidebars && <WeeklyPlanner onBanDish={banDish} />}

      {/* Food Fact panel — right side on onboarding screen */}
      {showSidebars && <FoodFact />}

      {/* Centred card frame — restores the narrow card + photo background look */}
      <div className="app-frame">
        {renderScreen()}
      </div>

      {showChat && <ForkRamseyChat recipeData={recipeData} />}
    </div>
  )
}

export default App
