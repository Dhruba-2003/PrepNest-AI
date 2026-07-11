import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { 
  BsFileEarmarkPdf, 
  BsUpload, 
  BsCheckCircleFill, 
  BsXCircleFill, 
  BsExclamationTriangleFill, 
  BsArrowLeft, 
  BsCoin, 
  BsPrinter, 
  BsPlayFill,
  BsLightningCharge
} from 'react-icons/bs'

function AtsChecker() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Form states
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  
  // Loading & Flow states
  const [loading, setLoading] = useState(false)
  const [scanStep, setScanStep] = useState('uploading')
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false)

  // Scanning steps timeline
  useEffect(() => {
    if (!loading) return

    const timers = [
      setTimeout(() => setScanStep('parsing'), 2000),
      setTimeout(() => setScanStep('evaluating'), 4500),
      setTimeout(() => setScanStep('finalizing'), 7000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [loading])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Only PDF files are supported.')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Only PDF files are supported.')
      }
    }
  }

  const triggerSearch = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select or drag a PDF resume file.')
      return
    }
    if (!jobRole.trim()) {
      setError('Please specify a target Job Role.')
      return
    }
    if (!userData) {
      setError('You must be logged in to analyze your resume.')
      return
    }
    if (userData.credits < 5) {
      setError('Insufficient credits. You need at least 5 credits.')
      return
    }

    setLoading(true)
    setScanStep('uploading')
    setError('')
    setReport(null)

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobRole', jobRole)
    formData.append('jobDescription', jobDescription)

    try {
      const response = await axios.post(ServerUrl + '/api/interview/check-ats', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setReport(response.data.report)
      
      // Update redux user credits
      dispatch(setUserData({
        ...userData,
        credits: response.data.creditsLeft
      }))
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to complete resume ATS analysis.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // Green
    if (score >= 50) return '#f59e0b' // Yellow/Orange
    return '#ef4444' // Red
  }

  const getScoreBgClass = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setFile(null)
    setJobRole('')
    setJobDescription('')
    setReport(null)
    setError('')
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col print:bg-white'>
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className='flex-1 px-4 py-12 md:px-8 print:p-0'>
        <div className='max-w-5xl mx-auto'>
          
          {/* Breadcrumb / Title */}
          <div className="mb-8 flex items-center justify-between print:hidden">
            <button 
              onClick={() => report ? handleReset() : navigate('/')} 
              className="flex items-center gap-2 text-gray-500 hover:text-black transition text-sm font-medium"
            >
              <BsArrowLeft />
              {report ? 'Check Another Resume' : 'Back to Home'}
            </button>

            <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xs text-sm">
              <BsCoin className="text-amber-500" />
              <span className="font-semibold text-gray-700">{userData?.credits || 0} Credits</span>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-gray-500">Scan costs 5 credits</span>
            </div>
          </div>

          <div className="text-center mb-10 print:mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-gray-900">
              ATS Resume <span className="text-green-600">Checker</span>
            </h1>
            <p className="text-gray-500 mt-2 text-md max-w-xl mx-auto print:hidden">
              Analyze your resume's parser friendliness, benchmark keywords against targeted job requirements, and fix structural flags.
            </p>
          </div>

          {/* Form Setup View */}
          {!loading && !report && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 shadow-sm max-w-3xl mx-auto"
            >
              <form onSubmit={triggerSearch} className="space-y-6">
                
                {/* Drag and Drop File Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF only)</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                      dragActive ? 'border-green-500 bg-green-50/20' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      id="resume-upload" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden"
                    />

                    {!file ? (
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 transition group-hover:scale-105">
                          <BsUpload size={22} />
                        </div>
                        <span className="font-semibold text-gray-700">Drag & Drop your resume here</span>
                        <span className="text-xs text-gray-400 mt-1">or click to browse from computer (Max 5MB)</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full max-w-md">
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg">
                          <BsFileEarmarkPdf size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFile(null)}
                          className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Role Input */}
                <div>
                  <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobRole"
                    placeholder="e.g. Frontend Developer, Senior Data Analyst"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800"
                    required
                  />
                </div>

                {/* Job Description TextArea */}
                <div>
                  <label htmlFor="jobDesc" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    id="jobDesc"
                    rows={4}
                    placeholder="Paste the target job description here to extract exact missing keywords and check relevance mapping..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800 resize-none"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2"
                  >
                    <BsXCircleFill />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-black text-white hover:opacity-95 transition py-3.5 rounded-full font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BsLightningCharge />
                    Analyze Resume (Costs 5 Credits)
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    By submitting, 5 credits will be deducted from your account. Analysis uses advanced AI schemas.
                  </p>
                </div>

              </form>
            </motion.div>
          )}

          {/* Scanning / Loading Screen */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm max-w-lg mx-auto text-center flex flex-col items-center"
            >
              <div className="relative w-48 h-60 border border-dashed border-green-400 rounded-2xl overflow-hidden bg-green-50/10 mb-8 flex flex-col items-center justify-center">
                <BsFileEarmarkPdf className="text-6xl text-red-500 mb-2 animate-bounce" />
                <p className="text-xs font-semibold text-gray-600 px-4 truncate max-w-full">{file?.name}</p>
                <p className="text-[10px] text-gray-400">{(file?.size / (1024 * 1024)).toFixed(2)} MB</p>

                {/* Scanning sweep laser */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_12px_#22c55e]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <h3 className="text-xl font-semibold mb-2">Analyzing ATS Friendliness...</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {scanStep === 'uploading' && 'Uploading document to parser...'}
                {scanStep === 'parsing' && 'Extracting semantic structure and headings...'}
                {scanStep === 'evaluating' && 'Evaluating formatting guidelines and tables...'}
                {scanStep === 'finalizing' && 'Checking keywords match and finalizing report...'}
              </p>

              {/* Progress lights */}
              <div className="flex gap-2 mt-6">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${scanStep === 'uploading' ? 'bg-green-500 scale-125' : 'bg-gray-200'}`} />
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${scanStep === 'parsing' ? 'bg-green-500 scale-125' : 'bg-gray-200'}`} />
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${scanStep === 'evaluating' ? 'bg-green-500 scale-125' : 'bg-gray-200'}`} />
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${scanStep === 'finalizing' ? 'bg-green-500 scale-125' : 'bg-gray-200'}`} />
              </div>
            </motion.div>
          )}

          {/* Results Dashboard Report */}
          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header Overview Card */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
                <div className="w-36 h-36 flex-shrink-0">
                  <CircularProgressbar 
                    value={report.score} 
                    text={`${report.score}%`} 
                    styles={buildStyles({
                      pathColor: getScoreColor(report.score),
                      textColor: '#1f2937',
                      trailColor: '#f3f4f6',
                      textSize: '18px',
                      strokeLinecap: 'round',
                    })}
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">ATS Audit Score</h2>
                    <span className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full uppercase self-center md:self-auto ${getScoreBgClass(report.score)}`}>
                      {report.score >= 80 ? 'ATS Friendly' : report.score >= 50 ? 'Needs Tweaking' : 'Critical Issues'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {report.summary}
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs text-gray-500">
                    <div>
                      <span className="font-semibold text-gray-700">Role Analysed:</span> {jobRole}
                    </div>
                    {jobDescription && (
                      <div>
                        <span className="font-semibold text-gray-700">Target Match:</span> Custom Job Description
                      </div>
                    )}
                  </div>
                </div>

                {/* Print CTA inside the overview card for desktop */}
                <div className="absolute top-6 right-6 flex items-center gap-2 print:hidden hidden md:flex">
                  <button 
                    onClick={handlePrint}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 cursor-pointer"
                    title="Print Report"
                  >
                    <BsPrinter size={18} />
                  </button>
                </div>
              </div>

              {/* Four Core Dimension Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { key: 'formatting', title: 'Formatting', label: 'Layout & Fonts' },
                  { key: 'structure', title: 'Structure', label: 'Key Sections' },
                  { key: 'content', title: 'Content Quality', label: 'Metrics & Verbs' },
                  { key: 'keywordMatch', title: 'Keyword Match', label: 'Skills Coverage' },
                ].map((dim) => {
                  const data = report.dimensions?.[dim.key] || { score: 0, feedback: '' }
                  const scorePct = data.score * 10
                  return (
                    <div key={dim.key} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm print:shadow-none">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{dim.title}</span>
                        <span 
                          className="text-lg font-bold" 
                          style={{ color: getScoreColor(scorePct) }}
                        >
                          {data.score}/10
                        </span>
                      </div>
                      
                      {/* Visual bar */}
                      <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${scorePct}%`,
                            backgroundColor: getScoreColor(scorePct) 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{data.feedback}</p>
                    </div>
                  )
                })}
              </div>

              {/* Keywords Comparative Audits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Matched Keywords */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm print:shadow-none">
                  <div className="flex items-center gap-2 mb-6">
                    <BsCheckCircleFill className="text-green-500 flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-gray-800">Matched Keywords & Skills ({report.keywords?.matched?.length || 0})</h3>
                  </div>

                  {report.keywords?.matched && report.keywords.matched.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.matched.map((kw, i) => (
                        <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No matching keywords identified. Check formatting or spelling.</p>
                  )}
                </div>

                {/* Missing Keywords */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm print:shadow-none">
                  <div className="flex items-center gap-2 mb-6">
                    <BsXCircleFill className="text-red-500 flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-gray-800">Missing Keywords & Skills ({report.keywords?.missing?.length || 0})</h3>
                  </div>

                  {report.keywords?.missing && report.keywords.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.missing.map((kw, i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-medium">
                          +{kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 font-medium">Excellent! Your resume covers all relevant keywords for this role.</p>
                  )}
                </div>
              </div>

              {/* Identified Issues & Fix Instructions */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm print:shadow-none">
                <h3 className="font-semibold text-lg text-gray-800 mb-6">Identified ATS Red Flags</h3>
                
                {report.issues && report.issues.length > 0 ? (
                  <div className="space-y-4">
                    {report.issues.map((issue, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 transition">
                        <div className="mt-1 flex-shrink-0">
                          {issue.severity === 'critical' ? (
                            <BsXCircleFill className="text-red-500 text-lg" title="Critical Issue" />
                          ) : (
                            <BsExclamationTriangleFill className="text-amber-500 text-lg" title="Warning" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Section: {issue.section}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          
                          <p className="text-sm font-semibold text-gray-800">{issue.message}</p>
                          <p className="text-xs text-gray-500 leading-relaxed"><span className="font-semibold text-green-600">How to Fix:</span> {issue.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 flex flex-col items-center">
                    <BsCheckCircleFill className="text-green-500 text-4xl mb-2" />
                    <p className="font-medium text-gray-700">No issues found!</p>
                    <p className="text-xs">Your resume complies with the top standard ATS rules.</p>
                  </div>
                )}
              </div>

              {/* Actions Plan & Quick checklist */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm print:shadow-none">
                  <h3 className="font-semibold text-lg text-gray-800 mb-6">Action Plan Checklist</h3>
                  <ul className="space-y-3.5">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 items-start text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* End Report Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 print:hidden">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 transition px-8 py-3 rounded-full text-sm font-medium cursor-pointer"
                >
                  Scan Another Resume
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto bg-gray-200 text-gray-800 hover:bg-gray-300 transition px-8 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BsPrinter />
                    Print / Save PDF Report
                  </button>

                  <button
                    onClick={() => navigate('/interview')}
                    className="w-full sm:w-auto bg-black text-white hover:opacity-90 transition px-8 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BsPlayFill size={18} />
                    Start Mock Interview
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}

export default AtsChecker
