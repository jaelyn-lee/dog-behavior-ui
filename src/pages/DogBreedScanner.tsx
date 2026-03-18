import axios from 'axios'
import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ── Colour Schema ──────────────────────────────────────────
const C = {
  primary: '#F28F79', // main buttons, accents
  secondary: '#58A690', // sub buttons, stats
  tertiary: '#F2BF91', // highlights, tags
  dark: '#59280B', // text, outlines
  light: '#F2E8E4', // background
}
// ──────────────────────────────────────────────────────────

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
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <span
          className="text-dark"
          style={{
            fontSize: 12,
            opacity: 0.6,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12, color: color, fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 7,
          background: `${C.dark}18`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
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
    <div
      style={{
        minHeight: '100vh',
        background: C.light,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'DM Sans', sans-serif",
        padding: '28px 16px 48px',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Soft bg blobs */}
      <div
        style={{
          position: 'fixed',
          top: -100,
          right: -80,
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.primary}28 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: -60,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.secondary}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28, zIndex: 1 }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>🐾</div>
        <h1
          style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 800,
            color: C.dark,
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          Pup<span style={{ color: C.primary }}>Scan</span>
        </h1>
        <p
          style={{
            color: `${C.dark}88`,
            fontSize: 13,
            margin: '6px 0 0',
            letterSpacing: '0.04em',
          }}
        >
          AI powered dog breed identifier
        </p>
      </div>

      {/* ── Camera card ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          background: '#fff',
          border: `2px solid ${cameraActive ? C.primary : `${C.dark}18`}`,
          boxShadow: cameraActive
            ? `0 8px 32px ${C.primary}33`
            : `0 4px 16px ${C.dark}14`,
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}
      >
        {/* Corner brackets */}
        {cameraActive &&
          ['tl', 'tr', 'bl', 'br'].map((c) => (
            <div
              key={c}
              style={{
                position: 'absolute',
                width: 22,
                height: 22,
                zIndex: 10,
                top: c.startsWith('t') ? 10 : 'auto',
                bottom: c.startsWith('b') ? 10 : 'auto',
                left: c.endsWith('l') ? 10 : 'auto',
                right: c.endsWith('r') ? 10 : 'auto',
                borderTop: c.startsWith('t')
                  ? `2.5px solid ${C.primary}`
                  : 'none',
                borderBottom: c.startsWith('b')
                  ? `2.5px solid ${C.primary}`
                  : 'none',
                borderLeft: c.endsWith('l')
                  ? `2.5px solid ${C.primary}`
                  : 'none',
                borderRight: c.endsWith('r')
                  ? `2.5px solid ${C.primary}`
                  : 'none',
              }}
            />
          ))}

        {/* Scan line */}
        {scanning && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              zIndex: 8,
              top: `${scanLine}%`,
              height: 2.5,
              background: `linear-gradient(90deg, transparent, ${C.primary}, ${C.tertiary}, ${C.primary}, transparent)`,
              boxShadow: `0 0 10px ${C.primary}`,
              transition: 'top 0.016s linear',
            }}
          />
        )}

        {/* Video / Preview */}
        <div
          style={{
            aspectRatio: '4/3',
            position: 'relative',
            background: C.light,
          }}
        >
          {capturedImage && !cameraActive ? (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: cameraActive ? 'block' : 'none',
              }}
            />
          )}

          {!cameraActive && !capturedImage && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `${C.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                }}
              >
                📷
              </div>
              <p
                style={{
                  color: `${C.dark}55`,
                  fontSize: 13,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                Turn on your camera
                <br />
                and show your pup! 🐾
              </p>
            </div>
          )}

          {scanning && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `${C.primary}0a`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  background: '#ffffffcc',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 14,
                  padding: '12px 22px',
                  border: `1.5px solid ${C.primary}55`,
                  color: C.dark,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                🔍 Analysing...
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            gap: 10,
            background: '#fff',
          }}
        >
          {!cameraActive ? (
            <button
              onClick={startCamera}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                background: C.primary,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 16px ${C.primary}55`,
              }}
            >
              📷 Turn on Camera
            </button>
          ) : (
            <>
              <button
                onClick={analyseBreed}
                disabled={scanning}
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: scanning ? 'not-allowed' : 'pointer',
                  background: scanning ? `${C.dark}18` : C.primary,
                  color: scanning ? `${C.dark}55` : '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: scanning ? 'none' : `0 4px 16px ${C.primary}55`,
                  transition: 'all 0.2s',
                }}
              >
                {scanning ? 'Analysing...' : '🐾 Scan Breed'}
              </button>
              <button
                onClick={stopCamera}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: 14,
                  border: `1.5px solid ${C.dark}22`,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: `${C.dark}88`,
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
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
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            marginTop: 14,
            background: `${C.primary}18`,
            border: `1.5px solid ${C.primary}55`,
            borderRadius: 14,
            padding: '12px 16px',
            color: C.dark,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Result Card ── */}
      {result && (
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            marginTop: 20,
            background: '#fff',
            border: `2px solid ${C.dark}14`,
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${C.dark}14`,
            animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {!result.found ? (
            <div style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
              <p style={{ color: `${C.dark}88`, margin: 0, fontSize: 14 }}>
                {result.message}
              </p>
              <button
                onClick={reset}
                style={{
                  marginTop: 18,
                  padding: '10px 24px',
                  borderRadius: 12,
                  border: `1.5px solid ${C.primary}`,
                  background: 'transparent',
                  color: C.primary,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Breed header */}
              <div
                style={{
                  padding: '22px 22px 18px',
                  background: `linear-gradient(135deg, ${C.tertiary}44, ${C.light}88)`,
                  borderBottom: `1.5px solid ${C.dark}12`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.primary,
                        letterSpacing: '0.18em',
                        fontWeight: 800,
                        marginBottom: 5,
                        textTransform: 'uppercase',
                      }}
                    >
                      Breed Identified
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 26,
                        fontWeight: 800,
                        color: C.dark,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {result.korean_breed}
                    </h2>
                    <p
                      style={{
                        margin: '3px 0 0',
                        color: `${C.dark}66`,
                        fontSize: 13,
                      }}
                    >
                      {result.breed}
                    </p>
                  </div>
                  <div
                    style={{
                      background:
                        result.confidence >= 85
                          ? `${C.secondary}20`
                          : `${C.tertiary}60`,
                      border: `1.5px solid ${result.confidence >= 85 ? C.secondary : C.tertiary}`,
                      borderRadius: 14,
                      padding: '8px 14px',
                      textAlign: 'center',
                      minWidth: 62,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: result.confidence >= 85 ? C.secondary : C.dark,
                      }}
                    >
                      {result.confidence}%
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: `${C.dark}66`,
                        letterSpacing: '0.05em',
                      }}
                    >
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 1,
                  background: `${C.dark}12`,
                }}
              >
                {[
                  { label: 'Origin', value: result.origin, icon: '🌍' },
                  { label: 'Size', value: result.size, icon: '📏' },
                  { label: 'Lifespan', value: result.lifespan, icon: '⏳' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: '#fff',
                      padding: '14px 10px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: `${C.dark}66`,
                        marginBottom: 3,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.dark, fontWeight: 700 }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Temperament tags */}
              <div style={{ padding: '18px 22px 10px' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: `${C.dark}66`,
                    letterSpacing: '0.12em',
                    marginBottom: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Temperament
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {result.temperament?.map((t: any) => (
                    <span
                      key={t}
                      style={{
                        background: `${C.tertiary}44`,
                        border: `1.5px solid ${C.tertiary}`,
                        borderRadius: 8,
                        padding: '5px 12px',
                        fontSize: 12,
                        color: C.dark,
                        fontWeight: 600,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ padding: '10px 22px 16px' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: `${C.dark}66`,
                    letterSpacing: '0.12em',
                    marginBottom: 14,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
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
              <div
                style={{
                  margin: '0 22px 22px',
                  background: `${C.primary}14`,
                  border: `1.5px solid ${C.primary}44`,
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#F28F79',
                    fontWeight: 800,
                    marginBottom: 5,
                    letterSpacing: '0.08em',
                  }}
                >
                  💡 Fun Fact
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: '#59280B',
                    lineHeight: 1.65,
                    opacity: 0.85,
                  }}
                >
                  {result.fun_fact}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 14,
                    border: `1.5px solid ${C.primary}`,
                    background: 'transparent',
                    color: C.primary,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  🔄 Rescan
                </button>
                {cameraActive && (
                  <button
                    onClick={analyseBreed}
                    style={{
                      flex: 1,
                      padding: '13px',
                      borderRadius: 14,
                      border: 'none',
                      background: C.secondary,
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: `0 4px 12px ${C.secondary}44`,
                    }}
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
