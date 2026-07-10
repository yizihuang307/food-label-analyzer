import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { ResultPage } from '@/pages/ResultPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { ScanPage } from '@/pages/ScanPage'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-svh bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
