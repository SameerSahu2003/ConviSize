// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const uploadArea = document.getElementById('uploadArea');
const fileCard = document.getElementById('fileCard');
const fileName = document.getElementById('fileName');
const fileType = document.getElementById('fileType');
const filePreview = document.getElementById('filePreview');
const fileSize = document.getElementById('fileSize');
const fileDimensions = document.getElementById('fileDimensions');
const fileFormat = document.getElementById('fileFormat');
const loadingInput = document.getElementById('loadingInput');
const formatSelect = document.getElementById('formatSelect');
const qualitySlider = document.getElementById('qualitySlider');
const convertButton = document.getElementById('convertButton');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const aspectRatioCheck = document.getElementById('aspectRatioCheck');
const premiumBtn = document.querySelector('.premium-btn');
const resultArea = document.getElementById('resultArea');
const resultImage = document.getElementById('resultImage');
const downloadButton = document.getElementById('downloadButton');
const loadingOutput = document.getElementById('loadingOutput');
const resultInfo = document.getElementById('resultInfo');
const resultSize = document.getElementById('resultSize');
const resultDimensions = document.getElementById('resultDimensions');
const batchModeCheck = document.getElementById('batchModeCheck');
const batchContainer = document.getElementById('batchContainer');
const batchFiles = document.getElementById('batchFiles');
const batchTotalFiles = document.getElementById('batchTotalFiles');
const batchProcessed = document.getElementById('batchProcessed');
const batchSavings = document.getElementById('batchSavings');
const batchClearButton = document.getElementById('batchClearButton');
const batchProcessButton = document.getElementById('batchProcessButton');

// State variables
let uploadedFile = null;
let originalDimensions = { width: 0, height: 0 };
let aspectRatio = 1;
let convertedBlob = null;
let batchMode = false;
let batchFilesArray = [];
let processedFiles = 0;
let totalSavings = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

// Initialize the application
function initApp() {
  // Premium button click
  premiumBtn.addEventListener('click', () => {
    window.location.href = 'premium.html';
  });
  
  // Upload button click
  uploadButton.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', handleFileSelection);
  
  // Drag and drop events
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-green-500');
    uploadArea.style.borderColor = 'var(--primary-color)';
    uploadArea.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelection();
    }
  });
  
  // Convert button click
  convertButton.addEventListener('click', handleConversion);
  
  // Download button click
  downloadButton.addEventListener('click', handleDownload);
  
  // Dimension inputs change
  widthInput.addEventListener('input', handleWidthChange);
  heightInput.addEventListener('input', handleHeightChange);
  
  // Batch mode toggle
  batchModeCheck.addEventListener('change', (e) => {
    batchMode = e.target.checked;
    if (batchMode) {
      batchContainer.classList.remove('hidden');
    } else {
      batchContainer.classList.add('hidden');
    }
  });
  
  // Batch clear button
  batchClearButton.addEventListener('click', clearBatchFiles);
  
  // Batch process button
  batchProcessButton.addEventListener('click', processBatchFiles);
}

// Handle file selection
function handleFileSelection() {
  if (!fileInput.files || fileInput.files.length === 0) return;
  
  const file = fileInput.files[0];
  uploadedFile = file;
  
  // Show loading
  loadingInput.classList.remove('hidden');
  fileCard.classList.add('hidden');
  
  // Update the file info
  fileName.textContent = file.name;
  fileType.textContent = file.type.split('/')[1].toUpperCase();
  fileSize.textContent = formatFileSize(file.size);
  
  // Create a preview
  const reader = new FileReader();
  reader.onload = function(e) {
    filePreview.src = e.target.result;
    
    // Get dimensions
    const img = new Image();
    img.onload = function() {
      originalDimensions = {
        width: img.width,
        height: img.height
      };
      aspectRatio = img.width / img.height;
      
      fileDimensions.textContent = `${img.width} x ${img.height} px`;
      fileFormat.textContent = file.type.split('/')[1].toUpperCase();
      
      // Enable the convert button
      convertButton.disabled = false;
      
      // Set initial values for width and height inputs
      widthInput.value = img.width;
      heightInput.value = img.height;
      
      // Hide loading and show file card
      loadingInput.classList.add('hidden');
      fileCard.classList.remove('hidden');
      
      // Add to batch if batch mode is enabled
      if (batchMode) {
        addToBatch(file, e.target.result);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Handle width input change
function handleWidthChange() {
  if (!aspectRatioCheck.checked) return;
  const width = parseInt(widthInput.value) || 0;
  const height = Math.round(width / aspectRatio);
  heightInput.value = height;
}

// Handle height input change
function handleHeightChange() {
  if (!aspectRatioCheck.checked) return;
  const height = parseInt(heightInput.value) || 0;
  const width = Math.round(height * aspectRatio);
  widthInput.value = width;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle conversion
function handleConversion() {
  if (!uploadedFile) return;
  
  // Show loading
  loadingOutput.classList.remove('hidden');
  resultInfo.classList.add('hidden');
  resultImage.classList.add('hidden');
  downloadButton.classList.add('hidden');
  
  // Get conversion options
  const format = formatSelect.value;
  const quality = parseInt(qualitySlider.value) / 100;
  const width = parseInt(widthInput.value) || originalDimensions.width;
  const height = parseInt(heightInput.value) || originalDimensions.height;
  
  // Simulate conversion (in a real app, this would use a library like sharp or imagemagick)
  setTimeout(() => {
    convertImage(uploadedFile, format, quality, width, height)
      .then(result => {
        // Update result image
        resultImage.src = result.dataUrl;
        resultImage.classList.remove('hidden');
        
        // Update result info
        resultSize.textContent = formatFileSize(result.size);
        resultDimensions.textContent = `${width} x ${height} px`;
        resultInfo.classList.remove('hidden');
        
        // Show download button
        downloadButton.classList.remove('hidden');
        
        // Store converted blob
        convertedBlob = result.blob;
        
        // Hide loading
        loadingOutput.classList.add('hidden');
        
        // Clear the result area message
        const resultMessage = resultArea.querySelector('p');
        if (resultMessage) {
          resultMessage.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Conversion error:', error);
        // Handle error
        loadingOutput.classList.add('hidden');
        
        // Display a more specific error message
        let errorMessage = 'Error converting image. Please try again.';
        
        if (error && error.message) {
          errorMessage = error.message;
        } else if (format === 'pdf') {
          errorMessage = 'PDF conversion failed. Please make sure the image is valid and try again.';
        }
        
        // Show error message
        alert(errorMessage);
        
        // Update result area with error message
        const resultMessage = resultArea.querySelector('p');
        if (resultMessage) {
          resultMessage.style.display = 'block';
          resultMessage.textContent = errorMessage;
          resultMessage.style.color = 'red';
        }
      });
  }, 1500); // Simulating processing time
}

// Convert image (mock implementation)
async function convertImage(file, format, quality, width, height) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // Special handling for PDF format
        if (format === 'pdf') {
          try {
            // Check if jsPDF is available
            if (typeof window.jspdf === 'undefined') {
              throw new Error('PDF conversion library (jsPDF) is not available');
            }
            
            // Get proper dimensions in mm (jsPDF works better with mm)
            // Fix scaling factor to maintain proper aspect ratio and size
            const pdfWidth = width / 2.83; // Improved scaling factor (72dpi to 25.4mm conversion)
            const pdfHeight = height / 2.83; // Improved scaling factor (72dpi to 25.4mm conversion)
            
            // Create a new jsPDF instance using the window.jspdf.jsPDF constructor
            const pdf = new window.jspdf.jsPDF({
              orientation: width > height ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [pdfWidth, pdfHeight]
            });
            
            // Create a temporary canvas to draw the image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Add the image to the PDF - use mm for dimensions
            const imgData = canvas.toDataURL('image/jpeg', quality);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            // Generate PDF as blob
            const pdfBlob = pdf.output('blob');
            const pdfDataUrl = URL.createObjectURL(pdfBlob);
            
            // Calculate a reasonable output size
            const originalSize = file.size;
            const newSize = originalSize * 0.8; // Estimate PDF size
            
            resolve({
              blob: pdfBlob,
              dataUrl: pdfDataUrl,
              size: Math.round(newSize)
            });
            return;
          } catch (error) {
            console.error('PDF conversion error:', error);
            reject({
              message: 'PDF conversion failed: ' + (error.message || 'Unknown error'),
              originalError: error
            });
            return;
          }
        }
        
        // For non-PDF formats, use the existing canvas approach
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to the requested format
        let mimeType;
        let dataUrl;
        
        // Handle format selection
        switch(format) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'webp':
            mimeType = 'image/webp';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          case 'tiff':
            mimeType = 'image/tiff';
            break;
          default:
            mimeType = 'image/jpeg';
        }
        
        // For GIF format, we need special handling
        if (format === 'gif') {
          // Create a temporary canvas with optimal settings for GIF
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d', {
            willReadFrequently: true,
            alpha: true
          });
          
          // Apply better image rendering
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = 'high';
          
          // Clear the canvas and draw with white background for better GIF quality
          tempCtx.fillStyle = '#FFFFFF';
          tempCtx.fillRect(0, 0, width, height);
          tempCtx.drawImage(img, 0, 0, width, height);
          
          // Convert to GIF
          dataUrl = tempCanvas.toDataURL(mimeType, quality);
        } else {
          // For other formats, use the main canvas
          dataUrl = canvas.toDataURL(mimeType, quality);
          
          // Update the UI to show conversion is complete
          loadingOutput.classList.add('hidden');
          resultInfo.classList.remove('hidden');
          resultImage.classList.remove('hidden');
          downloadButton.classList.remove('hidden');
        }
        
        // Convert data URL to blob
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        
        // Calculate a reasonable output size (in a real app, this would be the actual size)
        // Here we're just simulating a reduction based on quality and format
        const originalSize = file.size;
        let newSize;
        if (format === 'png') {
          // PNG is lossless so size mainly depends on dimensions
          newSize = originalSize * (width * height) / (originalDimensions.width * originalDimensions.height);
        } else if (format === 'webp') {
          // WebP is typically more efficient
          newSize = originalSize * quality * 0.7;
        } else {
          // JPEG and others
          newSize = originalSize * quality * 0.9;
        }
        
        resolve({
          blob,
          dataUrl,
          size: Math.round(newSize)
        });
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle download
function handleDownload() {
  if (!convertedBlob) return;
  
  const format = formatSelect.value;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(convertedBlob);
  
  // Use appropriate file extension and name
  const fileName = uploadedFile ? uploadedFile.name.split('.')[0] : 'converted_image';
  link.download = `${fileName}.${format}`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
}

// Add file to batch
function addToBatch(file, preview) {
  // Check if file is already in batch
  if (batchFilesArray.some(item => item.name === file.name && item.size === file.size)) {
    return;
  }
  
  // Add to batch array
  batchFilesArray.push({
    file: file,
    preview: preview,
    name: file.name,
    size: file.size,
    status: 'pending'
  });
  
  // Update UI
  updateBatchUI();
}

// Update batch UI
function updateBatchUI() {
  // Clear batch files container
  batchFiles.innerHTML = '';
  
  // Add each file
  batchFilesArray.forEach((fileItem, index) => {
    const fileElement = document.createElement('div');
    fileElement.className = 'batch-file';
    
    const statusClass = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'error': 'status-error'
    }[fileItem.status];
    
    fileElement.innerHTML = `
      <img src="${fileItem.preview}" alt="Preview" class="batch-file-preview">
      <div class="batch-file-info">
        <div class="batch-file-name">${fileItem.name}</div>
        <div class="batch-file-meta">
          <span>${formatFileSize(fileItem.size)}</span>
          <span>${fileItem.file.type.split('/')[1].toUpperCase()}</span>
        </div>
      </div>
      <div class="batch-file-status ${statusClass}">
        ${fileItem.status.charAt(0).toUpperCase() + fileItem.status.slice(1)}
      </div>
    `;
    
    batchFiles.appendChild(fileElement);
  });
  
  // Update stats
  batchTotalFiles.textContent = batchFilesArray.length;
  batchProcessed.textContent = processedFiles;
  batchSavings.textContent = formatFileSize(totalSavings);
}

// Clear batch files
function clearBatchFiles() {
  batchFilesArray = [];
  processedFiles = 0;
  totalSavings = 0;
  updateBatchUI();
}

// Process batch files
function processBatchFiles() {
  if (batchFilesArray.length === 0) return;
  
  // Get conversion options
  const format = formatSelect.value;
  const quality = parseInt(qualitySlider.value) / 100;
  const useResize = widthInput.value.trim() !== '' && heightInput.value.trim() !== '';
  const width = useResize ? (parseInt(widthInput.value) || 0) : 0;
  const height = useResize ? (parseInt(heightInput.value) || 0) : 0;
  
  // Show a message if PDF format is selected in batch mode
  if (format === 'pdf') {
    console.log('Processing batch files to PDF format');
  }
  
  // Process each file
  let processingPromises = batchFilesArray
    .filter(item => item.status === 'pending')
    .map(item => {
      // Update status
      item.status = 'processing';
      updateBatchUI();
      
      // Process file
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate conversion
          convertImage(item.file, format, quality, width || null, height || null)
            .then(result => {
              // Update status
              item.status = 'completed';
              processedFiles++;
              totalSavings += (item.size - result.size);
              
              // Trigger download
              const link = document.createElement('a');
              link.href = URL.createObjectURL(result.blob);
              link.download = `${item.name.split('.')[0]}.${format}`;
              link.click();
              URL.revokeObjectURL(link.href);
              
              resolve();
            })
            .catch(error => {
              console.error('Batch conversion error:', error);
              item.status = 'error';
              
              // Store error message for potential display
              item.errorMessage = error && error.message ? error.message : 'Conversion failed';
              
              // If it's a PDF error, add more specific information
              if (format === 'pdf' && (!error || !error.message)) {
                item.errorMessage = 'PDF conversion failed. Please check if the image is valid.';
              }
              
              resolve();
            })
            .finally(() => {
              updateBatchUI();
            });
        }, 1000 + Math.random() * 1000); // Random processing time for simulation
      });
    });
  
  // Update UI when all processing is done
  Promise.all(processingPromises).then(() => {
    updateBatchUI();
  });
}