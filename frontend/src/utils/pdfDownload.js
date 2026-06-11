/**
 * Triggers a browser file download from a raw binary response (Blob)
 * @param {Blob|Response} blobData - The binary blob contents of the PDF
 * @param {string} defaultFilename - The filename to write on download
 */
const pdfDownload = (blobData, defaultFilename = 'udhar_statement.pdf') => {
  if (!blobData) return;

  try {
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const blobURL = window.URL.createObjectURL(blob);
    
    const linkElement = document.createElement('a');
    linkElement.href = blobURL;
    linkElement.setAttribute('download', defaultFilename);
    
    document.body.appendChild(linkElement);
    linkElement.click();
    
    // Clean up temporary DOM reference and object URL
    document.body.removeChild(linkElement);
    window.URL.revokeObjectURL(blobURL);
  } catch (error) {
    console.error('Failed to download PDF stream:', error);
    alert('Failed to download PDF. Please try again.');
  }
};

export default pdfDownload;
