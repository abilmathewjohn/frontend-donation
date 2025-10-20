import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF for team registration details
 */
export const generateTeamPDF = async (donation, teamId) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary div to render the PDF content
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '210mm'; // A4 width
      element.style.padding = '20mm';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      element.style.color = 'black';

      const actualAmount = donation.actualAmount || donation.amount || 0;
      const registrationDate = new Date(donation.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px; font-size: 28px;">Team Registration Confirmation</h1>
          <p style="color: #6b7280; font-size: 16px;">Official Registration Document</p>
        </div>

        <div style="border: 2px solid #2563eb; border-radius: 12px; padding: 25px; margin-bottom: 25px; background: #f8fafc;">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px; font-size: 22px;">Team ID: ${teamId}</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #374151; margin-bottom: 10px; font-size: 16px;">Team Captain</h3>
              <p style="font-size: 18px; font-weight: bold; color: #111827;">${donation.participantName}</p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #374151; margin-bottom: 10px; font-size: 16px;">Teammate</h3>
              <p style="font-size: 18px; font-weight: bold; color: #111827;">${donation.teammateName || 'Not specified'}</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px; text-align: center;">Registration Details</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #6b7280;">Email:</strong>
                <p style="margin: 5px 0; color: #111827;">${donation.email}</p>
              </div>
              <div>
                <strong style="color: #6b7280;">Contact Number:</strong>
                <p style="margin: 5px 0; color: #111827;">${donation.contactNumber1}</p>
              </div>
              <div>
                <strong style="color: #6b7280;">Amount Paid:</strong>
                <p style="margin: 5px 0; color: #111827; font-weight: bold;">€${parseFloat(actualAmount).toFixed(2)}</p>
              </div>
              <div>
                <strong style="color: #6b7280;">Registration Date:</strong>
                <p style="margin: 5px 0; color: #111827;">${registrationDate}</p>
              </div>
              <div>
                <strong style="color: #6b7280;">Zone:</strong>
                <p style="margin: 5px 0; color: #111827;">${donation.zone}</p>
              </div>
              <div>
                <strong style="color: #6b7280;">Diocese:</strong>
                <p style="margin: 5px 0; color: #111827;">${donation.diocese}</p>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #166534; margin-bottom: 10px; font-size: 18px;">📋 Important Instructions</h3>
          <ul style="color: #166534; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Keep this Team ID (${teamId}) safe for event check-in</li>
            <li style="margin-bottom: 8px;">Present this document at the registration desk</li>
            <li style="margin-bottom: 8px;">Arrive 30 minutes early on event day</li>
            <li>Both team members must be present for verification</li>
          </ul>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
          <p style="margin: 5px 0;">Generated on: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0; font-size: 12px;">This is an official registration document</p>
        </div>
      `;

      document.body.appendChild(element);

      // Generate PDF
      html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add new pages if content is too long
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Clean up
        document.body.removeChild(element);

        // Save the PDF
        const fileName = `team-registration-${teamId}-${donation.participantName.replace(/\s+/g, '-')}.pdf`;
        pdf.save(fileName);
        
        resolve({
          success: true,
          fileName: fileName,
          message: 'PDF generated successfully'
        });
      }).catch(error => {
        document.body.removeChild(element);
        reject({
          success: false,
          error: 'Failed to generate PDF: ' + error.message
        });
      });

    } catch (error) {
      reject({
        success: false,
        error: 'PDF generation failed: ' + error.message
      });
    }
  });
};

/**
 * Generates a simple text version for quick download
 */
export const generateTeamTextFile = (donation, teamId) => {
  const actualAmount = donation.actualAmount || donation.amount || 0;
  const content = `
TEAM REGISTRATION CONFIRMATION
==============================

Team ID: ${teamId}
Registration Date: ${new Date().toLocaleDateString()}

TEAM DETAILS:
-------------
Team Captain: ${donation.participantName}
Teammate: ${donation.teammateName || 'Not specified'}
Email: ${donation.email}
Contact: ${donation.contactNumber1}
Zone: ${donation.zone}
Diocese: ${donation.diocese}

PAYMENT INFORMATION:
-------------------
Amount Paid: €${parseFloat(actualAmount).toFixed(2)}
Payment Status: Confirmed

IMPORTANT NOTES:
----------------
1. Keep this Team ID safe for event access
2. Present this confirmation at registration
3. Arrive 30 minutes early on event day
4. Both team members must be present

This is an official registration confirmation.
Generated on: ${new Date().toLocaleString()}
  `.trim();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `team-${teamId}-details.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return {
    success: true,
    fileName: `team-${teamId}-details.txt`
  };
};