import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Admin from './pages/Admin'
import RSVP from './pages/RSVP'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="/rsvp/:token" element={<RSVP />} />
    </Routes>
  )
}
