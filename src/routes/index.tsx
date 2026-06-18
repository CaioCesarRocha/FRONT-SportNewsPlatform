import { Route, Routes } from 'react-router-dom'
import Championships from '../pages/championships'
import ChampionshipDetail from '../pages/championship'
import Clubs from '../pages/clubs'
import Home from '../pages/home'
import Ranking from '../pages/ranking'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/championships" element={<Championships />} />
      <Route path="/championship/:id" element={<ChampionshipDetail />} />
      <Route path="/clubs" element={<Clubs />} />
      <Route path="/ranking" element={<Ranking />} />
    </Routes>
  )
}
