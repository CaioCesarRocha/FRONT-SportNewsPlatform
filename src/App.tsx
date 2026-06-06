import Header from './components/header'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import AppRoutes from './routes'

function App() {
  return (
    <div className="flex flex-col w-full min-h-screen gap-2">
      <Header />
      <ToastContainer />
      <AppRoutes />
    </div>
  )
}

export default App
