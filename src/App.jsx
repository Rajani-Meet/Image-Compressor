import { useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateBase64Size = (base64String) => {
    const stringLength = base64String.length - 'data:image/jpeg;base64,'.length
    const sizeInBytes = Math.ceil((stringLength / 4) * 3)
    return sizeInBytes
  }

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      // Reset states
      setCompressedImage(null)
      setCompressedSize(0)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
        setOriginalSize(file.size)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragEnter = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleImageUpload({ target: { files: event.dataTransfer.files } })
    }
  }, [handleImageUpload])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const compressImage = useCallback(() => {
    if (!selectedImage) return

    setIsProcessing(true)

    // Use setTimeout to allow UI to update before starting compression
    setTimeout(() => {
      const img = new Image()
      img.src = selectedImage

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas dimensions
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0)
        
        // Compress image
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100)
        setCompressedImage(compressedDataUrl)
        setCompressedSize(calculateBase64Size(compressedDataUrl))
        setIsProcessing(false)
      }
    }, 100)
  }, [selectedImage, quality])

  const handleDownload = useCallback(() => {
    if (!compressedImage) return

    const link = document.createElement('a')
    link.href = compressedImage
    link.download = 'compressed-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [compressedImage])

  const compressionRatio = compressedSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0
  const isReductionSignificant = compressionRatio > 5

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <svg className="logo-icon" viewBox="0 0 24 24" width="32" height="32">
            <path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7 10 12 15 17 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Image</span> Compressor
        </h1>
        <p className="subtitle">Optimize your images with just a few clicks</p>
      </header>
      
      <div 
        className={`upload-container ${isDragging ? 'dragging' : ''} ${selectedImage ? 'has-image' : ''}`}
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="file-input"
        />
        {!selectedImage ? (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p>{isDragging ? 'Drop your image here' : 'Drag & drop your image here or'}</p>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="upload-btn"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="preview-section">
            <div className="images-comparison">
              <div className="image-container original">
                <div className="container-header">
                  <h3>Original</h3>
                  <p className="file-info">{formatFileSize(originalSize)}</p>
                </div>
                <div className="image-wrapper">
                  <img src={selectedImage} alt="Original" className="preview-image" />
                </div>
              </div>
              
              {compressedImage && (
                <div className="image-container compressed">
                  <div className="container-header">
                    <h3>Compressed</h3>
                    <div className="file-info-wrapper">
                      <p className="file-info">
                        {formatFileSize(compressedSize)}
                      </p>
                      {isReductionSignificant && (
                        <span className="reduction-badge">-{compressionRatio}%</span>
                      )}
                    </div>
                  </div>
                  <div className="image-wrapper">
                    <img src={compressedImage} alt="Compressed" className="preview-image" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="controls-panel">
              <div className="quality-control">
                <div className="quality-label">
                  <span>Quality:</span>
                  <span className="quality-value">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="quality-slider"
                />
                <div className="quality-markers">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={compressImage} 
                  className="primary-btn compress-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="m8 17 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Compress Image</span>
                    </>
                  )}
                </button>
                
                {compressedImage && (
                  <button onClick={handleDownload} className="secondary-btn download-btn">
                    <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7 10 12 15 17 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Download</span>
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setSelectedImage(null)
                    setCompressedImage(null)
                    setQuality(80)
                  }} 
                  className="text-btn reset-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Choose Another Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Upload, compress, and download - Simple image optimization for everyone</p>
        <div className="features">
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Fast Processing</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" width="16" height="16">
              <path d="M18 8h1a4 4 0 010 8h-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="1" x2="6" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="14" y1="1" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Privacy-Focused</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Free to Use</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
