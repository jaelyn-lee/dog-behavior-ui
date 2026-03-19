import axios from 'axios'
import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function StatBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between mb-1">
        <span className="text-dark text-xs opacity-60">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-[7px] bg-dark/10 rounded overflow-hidden">
        <div
          className="h-full rounded transition-[width] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

export const DogBreedScanner = () => {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanAnimRef = useRef<NodeJS.Timeout | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanLine, setScanLine] = useState(0)

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  useEffect(() => {
    if (scanning) {
      let pos = 0,
        dir = 1
      scanAnimRef.current = setInterval(() => {
        pos += dir * 2
        if (pos >= 100) dir = -1
        if (pos <= 0) dir = 1
        setScanLine(pos)
      }, 16)
    } else {
      if (scanAnimRef.current) clearInterval(scanAnimRef.current)
    }
    return () => {
      if (scanAnimRef.current) clearInterval(scanAnimRef.current)
    }
  }, [scanning])

  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setResult(null)
      setCapturedImage(null)
    } catch {
      setError(
        'Camera access is required. Please allow it in your browser settings.',
      )
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
    setResult(null)
    setCapturedImage(null)
    setScanning(false)
  }

  const analyseBreed = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return
    setScanning(true)
    setError(null)
    setResult(null)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9))

    try {
      let token = null
      if (user) {
        const { data: sessionData } = await supabase.auth.getSession()
        token = sessionData.session?.access_token
      }

      const response = await axios.post(
        `${process.env.REACT_APP_RENDER_API_URL}/api/analyses/breed-scan`,
        { imageBase64: base64 },
        user ? { headers: { Authorization: `Bearer ${token}` } } : {},
      )
      const parsed = response.data.result

      setResult(parsed)
    } catch {
      setError('Error occurred during analysis. Please try again 🐾')
    } finally {
      setScanning(false)
    }
  }, [scanning, user])

  const reset = () => {
    setResult(null)
    setCapturedImage(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-light flex flex-col items-center pb-12 relative">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Soft bg blobs */}
      <div className="fixed -top-[100px] -right-[80px] w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,#F28F7928_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed -bottom-[60px] -left-[60px] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,#58A69022_0%,transparent_70%)] pointer-events-none" />

      {/* ── Header ── */}
      <div className="text-center mb-7 z-[1]">
        <div className="text-[40px] mb-1.5">🐾</div>
        <h1 className="text-[clamp(24px,5vw,32px)] font-extrabold text-dark m-0 tracking-[-0.03em]">
          Pup<span className="text-primary">Scan</span>
        </h1>
        <p className="text-dark/50 text-[13px] mt-1.5 tracking-[0.04em]">
          AI powered dog breed identifier
        </p>
      </div>

      {/* ── Camera card ── */}
      <div
        className={`w-full max-w-[480px] rounded-[24px] overflow-hidden relative bg-white border-2 transition-[border-color,box-shadow] duration-[400ms] ${
          cameraActive
            ? 'border-primary shadow-[0_8px_32px_#F28F7933]'
            : 'border-dark/10 shadow-[0_4px_16px_#59280B14]'
        }`}
      >
        {/* Corner brackets */}
        {cameraActive &&
          (
            [
              'absolute w-[22px] h-[22px] z-10 top-[10px] left-[10px] border-t-[2.5px] border-l-[2.5px] border-primary',
              'absolute w-[22px] h-[22px] z-10 top-[10px] right-[10px] border-t-[2.5px] border-r-[2.5px] border-primary',
              'absolute w-[22px] h-[22px] z-10 bottom-[10px] left-[10px] border-b-[2.5px] border-l-[2.5px] border-primary',
              'absolute w-[22px] h-[22px] z-10 bottom-[10px] right-[10px] border-b-[2.5px] border-r-[2.5px] border-primary',
            ] as const
          ).map((cls, i) => <div key={i} className={cls} />)}

        {/* Scan line */}
        {scanning && (
          <div
            className="absolute left-0 right-0 z-[8] h-[2.5px] shadow-[0_0_10px_#F28F79] transition-[top] duration-[16ms] linear bg-[linear-gradient(90deg,transparent,#F28F79,#F2BF91,#F28F79,transparent)]"
            style={{ top: `${scanLine}%` }}
          />
        )}

        {/* Video / Preview */}
        <div className="aspect-[4/3] relative bg-white/10">
          {capturedImage && !cameraActive ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
          )}

          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
              <div className="w-[72px] h-[72px] rounded-full bg-primary/10 flex items-center justify-center text-[32px]">
                📷
              </div>
              <p className="text-dark text-sm text-center m-0">
                Turn on your camera
                <br />
                and show your pup! 🐾
              </p>
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 bg-primary/[0.04] flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-[10px] rounded-[14px] px-[22px] py-3 border border-primary/30 text-dark text-[13px] font-bold tracking-[0.05em]">
                🔍 Analysing...
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="py-[14px] px-4 flex gap-2.5 bg-white">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="flex-1 py-[13px] rounded-[14px] border-0 cursor-pointer bg-primary text-white font-bold text-sm shadow-[0_4px_16px_#F28F7955]"
            >
              📷 Turn on Camera
            </button>
          ) : (
            <>
              <button
                onClick={analyseBreed}
                disabled={scanning}
                className={`flex-[2] py-[13px] rounded-[14px] border-0 font-bold text-sm transition-all duration-200 ${
                  scanning
                    ? 'cursor-not-allowed bg-dark/10 text-dark/30 shadow-none'
                    : 'cursor-pointer bg-primary text-white shadow-[0_4px_16px_#F28F7955]'
                }`}
              >
                {scanning ? 'Analysing...' : '🐾 Scan Breed'}
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 py-[13px] rounded-[14px] border border-dark/10 cursor-pointer bg-transparent text-dark/50 font-semibold text-[13px]"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Error */}
      {error && (
        <div className="bg-primary/10 border border-primary/55 rounded-[14px] p-[12px_16px] text-dark text-[13px] text-center mt-4">
          {error}
        </div>
      )}

      {/* ── Result Card ── */}
      {result && (
        <div className="w-full max-w-[480px] mt-5 bg-white rounded-[24px] overflow-hidden border-2 border-dark/10 shadow-[0_8px_32px_#59280B14] [animation:slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
          {!result.found ? (
            <div className="p-7 text-center">
              <div className="text-[44px] mb-2.5">🔍</div>
              <p className="text-dark/50 m-0 text-[14px]">{result.message}</p>
              <button
                onClick={reset}
                className="mt-4 px-6 py-2.5 rounded-[12px] border-2 border-primary bg-transparent text-primary font-bold text-[13px] cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Breed header */}
              <div className="p-[22px_22px_18px] bg-gradient-to-br from-tertiary/44 to-light/88 border-b-[1.5px] border-dark/12">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-primary text-[10px] tracking-[0.18em] font-extrabold mb-[5px] uppercase">
                      Breed Identified
                    </div>
                    <h2 className="text-dark m-0 text-[26px] font-extrabold tracking-[-0.02em]">
                      {result.korean_breed}
                    </h2>
                    <p className="text-dark/65 m-0 text-[13px]">
                      {result.breed}
                    </p>
                  </div>
                  <div
                    className={`rounded-[14px] px-[14px] py-2 text-center min-w-[62px] border ${
                      result.confidence >= 85
                        ? 'bg-secondary/20 border-secondary'
                        : 'bg-tertiary/60 border-tertiary'
                    }`}
                  >
                    <div
                      className={`text-[20px] font-extrabold ${result.confidence >= 85 ? 'text-secondary' : 'text-dark'}`}
                    >
                      {result.confidence}%
                    </div>
                    <div className="text-dark/40 text-[10px] tracking-[0.05em]">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-3 gap-px bg-dark/10">
                {[
                  { label: 'Origin', value: result.origin, icon: '🌍' },
                  { label: 'Size', value: result.size, icon: '📏' },
                  { label: 'Lifespan', value: result.lifespan, icon: '⏳' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white py-[14px] px-2.5 text-center"
                  >
                    <div className="text-[20px] mb-1">{item.icon}</div>
                    <div className="text-dark/60 text-[11px] mb-[3px]">
                      {item.label}
                    </div>
                    <div className="text-[12px] text-dark font-bold">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Temperament tags */}
              <div className="px-[22px] pt-[18px] pb-2.5">
                <div className="text-dark/60 text-[11px] tracking-[0.12em] mb-2.5 font-bold uppercase">
                  Temperament
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  {result.temperament?.map((t: any) => (
                    <span
                      key={t}
                      className="bg-tertiary/40 border border-tertiary rounded-[8px] px-3 py-[5px] text-[12px] text-dark font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="px-[22px] pt-2.5 pb-4">
                <div className="text-[11px] text-dark/60 tracking-[0.12em] mb-[14px] font-bold uppercase">
                  Trait Indicators
                </div>
                <StatBar
                  label="Energy"
                  value={result.energy}
                  color={'#F28F79'}
                />
                <StatBar
                  label="Friendliness"
                  value={result.friendliness}
                  color={'#58A690'}
                />
                <StatBar
                  label="Trainability"
                  value={result.trainability}
                  color="#C8914A"
                />
              </div>

              {/* Fun fact */}
              <div className="mx-[22px] mb-[22px] bg-primary/[0.08] border border-primary/40 rounded-[14px] px-4 py-[14px]">
                <div className="text-[11px] text-primary font-extrabold mb-[5px] tracking-[0.08em]">
                  💡 Fun Fact
                </div>
                <p className="m-0 text-[13px] text-dark leading-[1.65] opacity-85">
                  {result.fun_fact}
                </p>
              </div>

              {/* Action buttons */}
              <div className="px-[22px] pb-[22px] flex gap-2.5">
                <button
                  onClick={reset}
                  className="flex-1 py-[13px] rounded-[14px] border border-primary bg-transparent text-primary cursor-pointer text-[13px] font-bold"
                >
                  🔄 Rescan
                </button>
                {cameraActive && (
                  <button
                    onClick={analyseBreed}
                    className="flex-1 py-[13px] rounded-[14px] border-0 bg-secondary text-white cursor-pointer text-[13px] font-bold shadow-[0_4px_12px_#58A69044]"
                  >
                    📷 Retake
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
