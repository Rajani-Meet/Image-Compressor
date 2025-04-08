import { useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
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

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    
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
        <h1><span className="highlight">Image</span> Compressor</h1>
        <p className="subtitle">Optimize your images with just a few clicks</p>
      </header>
      
      <div className="upload-container" 
           onDrop={handleDrop} 
           onDragOver={handleDragOver}>
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
            <p>Drag & drop your image here or</p>
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
                <h3>Original</h3>
                <div className="image-wrapper">
                  <img src={selectedImage} alt="Original" className="preview-image" />
                </div>
                <p className="file-info">{formatFileSize(originalSize)}</p>
              </div>
              
              {compressedImage && (
                <div className="image-container compressed">
                  <h3>Compressed</h3>
                  <div className="image-wrapper">
                    <img src={compressedImage} alt="Compressed" className="preview-image" />
                  </div>
                  <p className="file-info">
                    {formatFileSize(compressedSize)}
                    {isReductionSignificant && (
                      <span className="reduction-badge">-{compressionRatio}%</span>
                    )}
                  </p>
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
                  <span>High</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={compressImage} 
                  className="compress-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "Compress Image"
                  )}
                </button>
                
                {compressedImage && (
                  <button onClick={handleDownload} className="download-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setSelectedImage(null)
                    setCompressedImage(null)
                    setQuality(80)
                  }} 
                  className="reset-btn"
                >
                  Choose Another Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Upload, compress, and download - Simple image optimization for everyone</p>
      </footer>
    </div>
  )
}

export default App
