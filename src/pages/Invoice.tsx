import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './Invoice.css'

function Invoice() {
  const { shopName } = useParams<{ shopName: string }>()
  const navigate = useNavigate()

  // Determine shop details based on URL parameter
  const isCalcuttaMotors = shopName === 'calcutta-motors'
  const isNewCalcuttaMotors = shopName === 'new-calcutta-motors'

  // Helper function to get today's date in YYYY-MM-DD format for input
  const getTodayDateInput = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper function to convert date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}-${month}-${year}`
  }

  // Helper function to format number with commas
  const formatNumber = (num: number): string => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // // Helper function to convert string number to number (removes commas)
  // const parseNumber = (str: string): number => {
  //   return parseFloat(str.replace(/,/g, '')) || 0
  // }

  // Helper function to convert number to words (Indian numbering system)
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero only'

    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ]

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ]

    const convertHundreds = (n: number): string => {
      if (n === 0) return ''
      let result = ''
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred'
        n %= 100
        if (n > 0) result += ' '
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)]
        n %= 10
        if (n > 0) result += ' '
      }
      if (n > 0) {
        result += ones[n]
      }
      return result.trim()
    }

    const convertThousands = (n: number): string => {
      if (n === 0) return ''
      if (n < 1000) return convertHundreds(n)
      const thousands = Math.floor(n / 1000)
      const remainder = n % 1000
      let result = convertHundreds(thousands) + ' Thousand'
      if (remainder > 0) {
        result += ' ' + convertHundreds(remainder)
      }
      return result.trim()
    }

    const convertLakhs = (n: number): string => {
      if (n === 0) return ''
      if (n < 100000) return convertThousands(n)
      const lakhs = Math.floor(n / 100000)
      const remainder = n % 100000
      let result = convertHundreds(lakhs) + ' Lakh'
      if (lakhs > 1) result += 's'
      if (remainder > 0) {
        result += ' ' + convertThousands(remainder)
      }
      return result.trim()
    }

    const convertCrores = (n: number): string => {
      if (n === 0) return ''
      if (n < 10000000) return convertLakhs(n)
      const crores = Math.floor(n / 10000000)
      const remainder = n % 10000000
      let result = convertHundreds(crores) + ' Crore'
      if (crores > 1) result += 's'
      if (remainder > 0) {
        result += ' ' + convertLakhs(remainder)
      }
      return result.trim()
    }

    // Get integer part (round to nearest integer for display)
    const integerPart = Math.round(num)

    let words = ''
    if (integerPart >= 10000000) {
      words = convertCrores(integerPart)
    } else if (integerPart >= 100000) {
      words = convertLakhs(integerPart)
    } else if (integerPart >= 1000) {
      words = convertThousands(integerPart)
    } else if (integerPart >= 100) {
      words = convertHundreds(integerPart)
    } else if (integerPart >= 20) {
      words = tens[Math.floor(integerPart / 10)]
      if (integerPart % 10 > 0) {
        words += ' ' + ones[integerPart % 10]
      }
    } else if (integerPart > 0) {
      words = ones[integerPart]
    } else {
      words = 'Zero'
    }

    // Capitalize first letter
    if (words.length > 0) {
      words = words.charAt(0).toUpperCase() + words.slice(1)
    }

    return words.trim() + ' only'
  }

  // State for editable fields
  const [dateInput, setDateInput] = useState<string>(getTodayDateInput())
  const [invoiceNo, setInvoiceNo] = useState<string>('1')
  const [cgst, setCgst] = useState<string>('9')
  const [sgst, setSgst] = useState<string>('9')
  
  // State for receiver/billed to fields (empty by default)
  const [receiverName, setReceiverName] = useState<string>('')
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [receiverGstin, setReceiverGstin] = useState<string>('')
  const [vehicleNo, setVehicleNo] = useState<string>('')
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  const [invoiceNoTouched, setInvoiceNoTouched] = useState<boolean>(false)
  
  // Fixed non-editable values
  const state = 'U.P.'
  const stateCode = '09'

  // State for items (15 rows)
  interface Item {
    description: string
    hsnSac: string
    qty: string
    rate: string
  }

  const [items, setItems] = useState<Item[]>(
    Array.from({ length: 12 }, () => ({
      description: '',
      hsnSac: '',
      qty: '',
      rate: ''
    }))
  )

  // IGST is now auto-calculated, no need for state

  // Helper function to update an item
  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Calculate amount for each item (qty * rate)
  const calculateItemAmount = (qty: string, rate: string): number => {
    const qtyNum = parseFloat(qty.replace(/,/g, '')) || 0
    const rateNum = parseFloat(rate.replace(/,/g, '')) || 0
    return qtyNum * rateNum
  }

  // Calculate total amount before tax (sum of all item amounts)
  const calculateTotalBeforeTax = (): number => {
    return items.reduce((total, item) => {
      return total + calculateItemAmount(item.qty, item.rate)
    }, 0)
  }

  // Static data
  const invoiceData = {
    gstin: isCalcuttaMotors ? '09BGTPS0158R1Z9' : (isNewCalcuttaMotors ? '09AFMPS0274D1ZB' : '09BGTPS0158R1Z9'),
    shopName: isCalcuttaMotors ? 'M/s Calcutta Motors' : (isNewCalcuttaMotors ? 'M/s New Calcutta Motors' : 'M/s Calcutta Motors'),
    address: 'NORMAL SCHOOL ROAD, KHURRAMPUR, GORAKHPUR',
    phone1: '9415280266',
    phone2: '9935922535',
    phone3: '8840958369',
    email: 'alokshaw83@gmail.com',
    bankName: 'UNION BANK OF INDIA',
    bankAddress: 'Raiganj, Pandeyhata, Gorakhpur - 273001',
    bankAccount: isCalcuttaMotors ? '296111100002111' : (isNewCalcuttaMotors ? '296111100001547' : '296111100002111'),
    ifscCode: isCalcuttaMotors ? 'UBIN0829617' : (isNewCalcuttaMotors ? 'UBIN0829617' : 'UBIN0829617'),
  }

  // Calculate all financial values
  const totalBeforeTaxNum = calculateTotalBeforeTax()
  const cgstPercent = parseFloat(cgst) || 0
  const sgstPercent = parseFloat(sgst) || 0
  const cgstAmount = (totalBeforeTaxNum * cgstPercent) / 100
  const sgstAmount = (totalBeforeTaxNum * sgstPercent) / 100
  
  // Calculate IGST: Step 1: Take amount (totalBeforeTax + CGST + SGST)
  // Step 2: Find next whole number (ceiling)
  // Step 3: Subtract original from ceiling
  const amountBeforeIgst = totalBeforeTaxNum + cgstAmount + sgstAmount
  const ceilingAmount = Math.ceil(amountBeforeIgst)
  const igstAmountNum = ceilingAmount - amountBeforeIgst
  
  const totalAfterTax = totalBeforeTaxNum + cgstAmount + sgstAmount + igstAmountNum

  const totalBeforeTaxFormatted = formatNumber(totalBeforeTaxNum)
  const cgstAmountFormatted = formatNumber(cgstAmount)
  const sgstAmountFormatted = formatNumber(sgstAmount)
  const igstAmountFormatted = formatNumber(igstAmountNum)
  const totalAfterTaxFormatted = formatNumber(totalAfterTax)

  // Calculate amount in words
  const amountInWords = numberToWords(totalAfterTax)

  const handlePrint = async () => {
    // Validate required fields before generating PDF
    if (!receiverName.trim()) {
      setNameTouched(true)
      alert('Please fill in the Name field before generating PDF.')
      return
    }
    if (!invoiceNo.trim()) {
      setInvoiceNoTouched(true)
      alert('Please fill in the Invoice Number field before generating PDF.')
      return
    }

    try {
      const invoicePageElement = document.querySelector('.invoice-page') as HTMLElement
      if (!invoicePageElement) {
        alert('Invoice content not found')
        return
      }

      // Hide action buttons temporarily
      const actionsElement = document.querySelector('.invoice-actions')
      if (actionsElement) {
        ;(actionsElement as HTMLElement).style.display = 'none'
      }

      // Add a class to hide input labels/borders for PDF generation
      invoicePageElement.classList.add('pdf-generation')
      
      // Convert inputs to text elements for better PDF capture
      const allInputs = invoicePageElement.querySelectorAll('input')
      const inputReplacements = new Map<HTMLInputElement, { placeholder: string; span: HTMLSpanElement }>()
      
      allInputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement
        let value = htmlInput.value.trim()
        const placeholder = htmlInput.placeholder
        
        // Format date input to DD-MM-YYYY format
        if (htmlInput.type === 'date' && value) {
          value = formatDateDDMMYYYY(value)
        }
        
        // Create a span element to replace the input
        const span = document.createElement('span')
        span.textContent = value || ''
        
        // Check if this is invoice number, date, or tax input for proper alignment
        const isInvoiceNoOrDate = htmlInput.classList.contains('invoice-no-input') || 
                                  htmlInput.classList.contains('date-input')
        const isTaxInput = htmlInput.classList.contains('tax-input')
        
        // Use inline display to keep on same line
        span.style.display = 'inline'
        span.style.color = value ? '#000' : 'transparent'
        span.style.fontSize = window.getComputedStyle(htmlInput).fontSize
        span.style.fontFamily = window.getComputedStyle(htmlInput).fontFamily
        span.style.padding = '0'
        span.style.margin = '0'
        span.style.whiteSpace = 'nowrap'
        span.style.lineHeight = '1.2'
        
        // For invoice number, date, and tax inputs, use baseline alignment to match label level
        if (isInvoiceNoOrDate || isTaxInput) {
          span.style.verticalAlign = 'baseline'
        } else {
          span.style.verticalAlign = 'top'
        }
        
        span.className = 'pdf-input-value'
        
        // For table cells, ensure the span doesn't affect row height
        if (htmlInput.closest('td')) {
          span.style.display = 'block'
          span.style.minHeight = '20px'
          span.style.height = '20px'
        }
        
        // Replace input with span
        if (htmlInput.parentNode) {
          htmlInput.parentNode.insertBefore(span, htmlInput)
          htmlInput.style.display = 'none'
        }
        
        inputReplacements.set(htmlInput, { placeholder, span })
      })

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 200))

      // Generate canvas from HTML - ensure full content is captured
      const canvas = await html2canvas(invoicePageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: invoicePageElement.scrollWidth,
        height: invoicePageElement.scrollHeight,
        windowWidth: invoicePageElement.scrollWidth,
        windowHeight: invoicePageElement.scrollHeight
      })

      // Restore inputs from spans
      inputReplacements.forEach((replacement, htmlInput) => {
        const span = replacement.span
        if (span.parentNode && htmlInput.parentNode) {
          span.parentNode.removeChild(span)
          htmlInput.style.display = ''
          htmlInput.placeholder = replacement.placeholder
        }
      })
      
      // Remove the PDF generation class
      invoicePageElement.classList.remove('pdf-generation')

      // Show action buttons again
      if (actionsElement) {
        ;(actionsElement as HTMLElement).style.display = 'flex'
      }

      const imgData = canvas.toDataURL('image/png')
      
      // A4 size in mm (portrait)
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      
      // Calculate scaling to fit content on A4 page without cutting
      const imgAspectRatio = canvas.width / canvas.height
      const pdfAspectRatio = pdfWidth / pdfHeight
      
      let finalWidth = pdfWidth
      let finalHeight = pdfHeight
      let xOffset = 0
      let yOffset = 0
      
      // Scale to fit within A4 dimensions
      if (imgAspectRatio > pdfAspectRatio) {
        // Content is wider than A4, fit to width
        finalHeight = pdfWidth / imgAspectRatio
        if (finalHeight > pdfHeight) {
          // If still too tall, scale down to fit height
          finalHeight = pdfHeight
          finalWidth = pdfHeight * imgAspectRatio
          xOffset = (pdfWidth - finalWidth) / 2
        } else {
          // Center vertically
          yOffset = (pdfHeight - finalHeight) / 2
        }
      } else {
        // Content is taller than A4, fit to height
        finalWidth = pdfHeight * imgAspectRatio
        if (finalWidth > pdfWidth) {
          // If still too wide, scale down to fit width
          finalWidth = pdfWidth
          finalHeight = pdfWidth / imgAspectRatio
          yOffset = (pdfHeight - finalHeight) / 2
        } else {
          // Center horizontally
          xOffset = (pdfWidth - finalWidth) / 2
        }
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Add image to PDF (scaled to fit A4 without cutting)
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
      
      // Add page border - draw rectangle around the entire A4 page
      pdf.setDrawColor(0, 0, 0) // Black color
      pdf.setLineWidth(1) // 1mm border width for visibility
      // Draw border around the entire page with small margin
      const margin = 3 // 3mm margin from edges
      pdf.rect(margin, margin, pdfWidth - (margin * 2), pdfHeight - (margin * 2))

      // Generate filename: first 10 chars of name + _ + invoice number
      // Remove special characters and replace with underscore, pad if needed
      let namePrefix = receiverName.trim().substring(0, 10).replace(/[^a-zA-Z0-9]/g, '_')
      if (!namePrefix || namePrefix.length === 0) {
        namePrefix = 'Invoice'
      }
      // Clean invoice number (remove special characters)
      const cleanInvoiceNo = invoiceNo.trim().replace(/[^a-zA-Z0-9]/g, '_') || '1'
      const filename = `${namePrefix}_${cleanInvoiceNo}.pdf`

      // Save PDF
      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleReset = () => {
    // Reset all values to defaults
    setDateInput(getTodayDateInput())
    setInvoiceNo('1')
    setCgst('9')
    setSgst('9')
    setReceiverName('')
    setReceiverAddress('')
    setReceiverGstin('')
    setVehicleNo('')
    setNameTouched(false)
    setInvoiceNoTouched(false)
    setItems(
      Array.from({ length: 12 }, () => ({
        description: '',
        hsnSac: '',
        qty: '',
        rate: ''
      }))
    )
  }

  return (
    <div className="invoice-container">
      <div className="invoice-actions">
        <button onClick={handleBack} className="btn-back">← Back to Home</button>
        <button onClick={handleReset} className="btn-reset">Reset</button>
        <button onClick={handlePrint} className="btn-print">Print Invoice</button>
      </div>
      
      <div className="invoice-page">
        {/* Header Section */}
        <div className="invoice-header">
          <div className="seller-info">
            <h2 className="seller-name">{invoiceData.shopName}</h2>
            <p className="seller-address">{invoiceData.address}</p>
            <p className="seller-phone">
              {invoiceData.phone1}, {invoiceData.phone2}, {invoiceData.phone3}
            </p>
          </div>
          
          <div className="invoice-details">
            <h1 className="invoice-title">INVOICE</h1>
            <div className="invoice-meta">
              <p><strong>GSTIN:</strong> {invoiceData.gstin}</p>
              <p className="invoice-no-field">
                <strong>
                  INVOICE NO.:
                  <span className="required-asterisk" title="This field is required">*</span>
                </strong>{' '}
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  onBlur={() => setInvoiceNoTouched(true)}
                  className={`invoice-no-input ${invoiceNoTouched && !invoiceNo.trim() ? 'error' : ''}`}
                  placeholder="Enter invoice number"
                  required
                  title={invoiceNoTouched && !invoiceNo.trim() ? 'Invoice number is required' : 'Enter the invoice number'}
                />
                {invoiceNoTouched && !invoiceNo.trim() && (
                  <span className="error-message-inline">Invoice number is required</span>
                )}
              </p>
              <p className="date-field">
                <strong>DATE:</strong>{' '}
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="date-input"
                  title="Select date"
                />
              </p>
              <p className="state-field">
                <strong>STATE:</strong> {state}{' '}
                <strong>STATE CODE:</strong> {stateCode}
              </p>
            </div>
          </div>
        </div>

        {/* Receiver Section */}
        <div className="receiver-section">
          <h3 className="receiver-title text-white-blue-bg">DETAILS OF RECIEVER BILLED TO</h3>
          <div className="receiver-info">
            <p className="receiver-field">
              <strong>
                Name:
                <span className="required-asterisk" title="This field is required">*</span>
              </strong>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                className={`receiver-input ${nameTouched && !receiverName.trim() ? 'error' : ''}`}
                placeholder="Enter receiver name"
                required
                title={nameTouched && !receiverName.trim() ? 'Name is required' : 'Enter the receiver name'}
              />
              {nameTouched && !receiverName.trim() && (
                <span className="error-message">Name is required</span>
              )}
            </p>
            <p className="receiver-field">
              <strong>Address:</strong>
              <input
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="receiver-input"
                placeholder="Enter address"
              />
            </p>
            <p className="receiver-field">
              <strong>GSTIN/UIN:</strong>
              <input
                type="text"
                value={receiverGstin}
                onChange={(e) => setReceiverGstin(e.target.value)}
                className="receiver-input"
                placeholder="Enter GSTIN/UIN"
              />
            </p>
            <p className="receiver-field">
              <strong>Vehicle No.:</strong>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="receiver-input"
                placeholder="Enter vehicle number"
              />
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>HSN SAC</th>
                <th>Qty.</th>
                <th>Rate</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const amount = calculateItemAmount(item.qty, item.rate)
                const amountFormatted = amount > 0 ? formatNumber(amount) : ''
                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="item-input"
                        placeholder="Enter item name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => updateItem(index, 'hsnSac', e.target.value)}
                        className="item-input"
                        placeholder="HSN/SAC"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        className="item-input"
                        placeholder="Qty"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className="item-input"
                        placeholder="Rate"
                      />
                    </td>
                    <td className="amount-cell">{amountFormatted}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="financial-section">
          <div className="amount-words">
            <p><strong>Total Invoice Amount In Words:</strong></p>
            <p>{amountInWords}</p>
          </div>
          
          <div className="financial-summary">
            <div className="summary-row">
              <span><strong>TOTAL AMOUNT BEFORE TAX</strong></span>
              <span>{totalBeforeTaxFormatted}</span>
            </div>
            <div className="summary-row">
              <span><strong>Add:CGST</strong>{' '}
                <input
                  type="number"
                  value={cgst}
                  onChange={(e) => setCgst(e.target.value)}
                  className="tax-input"
                  min="0"
                  max="100"
                  step="0.01"
                />
                %
              </span>
              <span>{cgstAmountFormatted}</span>
            </div>
            <div className="summary-row">
              <span><strong>Add:SGST</strong>{' '}
                <input
                  type="number"
                  value={sgst}
                  onChange={(e) => setSgst(e.target.value)}
                  className="tax-input"
                  min="0"
                  max="100"
                  step="0.01"
                />
                %
              </span>
              <span>{sgstAmountFormatted}</span>
            </div>
            <div className="summary-row">
              <span><strong>Add:IGST</strong>{' '}</span>
              <span></span>
            </div>
            <div className="summary-row">
              <span><strong>Tax Amount IGST</strong></span>
              <span>{igstAmountFormatted}</span>
            </div>
            <div className="summary-row total-row">
              <span>TOTAL AMOUNT AFTER TAX</span>
              <span>{totalAfterTaxFormatted}</span>
            </div>
          </div>
        </div>

        {/* Bank Details and Signature Section */}
        <div className="footer-section ">
          <div className="bank-details">
            <h4>Bank Details</h4>
            <p><strong>Bank Name:</strong> {invoiceData.bankName}</p>
            <p><strong>Address:</strong> {invoiceData.bankAddress}</p>
            <p><strong>Bank A/c No.:</strong> {invoiceData.bankAccount}</p>
            <p><strong>Bank Branch IFSC Code:</strong> {invoiceData.ifscCode}</p>
          </div>

          <div className="signature-section">
            <p className="certification">
              Certified that the Particulars given above are true and correct
            </p>
            <div className="signature-box">
              <p className="for-company">For {invoiceData.shopName}</p>
              <div className="signature-line">
                <div className="signature-space"></div>
              </div>
              <p className="signatory">Authorised Signatory</p>
            </div>
          </div>
        </div>

        {/* Contact and Terms */}
        <div className="contact-terms-section">
          <div className="contact-info">
            <p>
              <strong>Contact:</strong> If you have any questions about this invoice, 
              please contact {invoiceData.shopName}, {invoiceData.email}
            </p>
          </div>
          
          <div className="terms-conditions">
            <h4>Terms and Conditions:</h4>
            <ul>
              <li>E. & O.E.</li>
              <li>Goods once sold are not taken back</li>
              <li>All Disputes are Subjected to Gorakhpur Jurisdiction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice

