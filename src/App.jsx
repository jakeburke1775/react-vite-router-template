import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Main>
        <Home />
      </Main>
      <Footer />
    </div>
  )
}

export default App
