import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [quality, setQuality] = useState(80)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const compressImage = () => {
    if (!selectedImage) return

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
    }
  }

  const handleDownload = () => {
    if (!compressedImage) return

    const link = document.createElement('a')
    link.href = compressedImage
    link.download = 'compressed-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="app-container">
      <h1>Image Compressor</h1>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          className="upload-btn"
        >
          Select Image
        </button>
      </div>

      {selectedImage && (
        <div className="preview-section">
          <div className="image-container">
            <h3>Original Image</h3>
            <img src={selectedImage} alt="Original" className="preview-image" />
          </div>
          
          <div className="controls">
            <div className="quality-control">
              <label>Quality: {quality}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              />
            </div>
            
            <button onClick={compressImage} className="compress-btn">
              Compress Image
            </button>
          </div>

          {compressedImage && (
            <div className="image-container">
              <h3>Compressed Image</h3>
              <img src={compressedImage} alt="Compressed" className="preview-image" />
              <button onClick={handleDownload} className="download-btn">
                Download Compressed Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
