/**
 * Google Apps Script for Qiskit Fall Fest 2026 (SRM University-AP)
 * 
 * Purpose:
 * 1. Automatically syncs new Google Form submissions to the official website database (Supabase + Redis)
 *    so participants are immediately whitelisted with ZERO extra forms to fill on the website.
 * 2. Automatically dispatches a personalized Registration Confirmation & Portal Pass email.
 * 3. Records sync status and email status in the spreadsheet to prevent duplicate communication.
 * 4. Adds a custom menu in Google Sheets for 1-click batch syncing of past submissions.
 * 5. Serves as a Web App (doPost) so participants registering directly on the website also receive
 *    the exact same branded pass email and appear under a "Website_Registrations" sheet tab.
 *
 * Setup Instructions:
 * 1. Open your Google Form or the linked Google Sheet.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any code in the editor and paste this entire file.
 * 4. Replace WEBHOOK_SECRET below if you changed it in your environment variables.
 * 5. Click "Save" (disk icon).
 * 6. Set up the automated trigger for Form submissions:
 *    - Click the clock icon ("Triggers") on the left sidebar.
 *    - Click "+ Add Trigger" (bottom right).
 *    - Choose function to run: "onFormSubmit"
 *    - Select event source: "From spreadsheet" (or "From form")
 *    - Select event type: "On form submit"
 *    - Click "Save" and authorize Google permissions.
 * 7. Deploy as Web App (for Website Registration Email Relay):
 *    - Click "Deploy" (top right blue button) -> "New deployment".
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: "Qiskit Fall Fest 2026 Web Relay"
 *    - Execute as: "Me (your email address)"
 *    - Who has access: "Anyone"
 *    - Click "Deploy", authorize access, and copy the Web App URL.
 *    - Add this URL to Vercel and .env.local as:
 *      GOOGLE_APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 */

var WEBHOOK_URL = 'https://www.qffsrmap2026.com/api/webhooks/google-form';
var WEBHOOK_SECRET = 'qff-srmap-2026-sync-secret'; // Must match GOOGLE_FORM_SYNC_SECRET in your .env

/**
 * Creates custom menu when opening the Google Sheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Qiskit Fall Fest 2026')
    .addItem('Sync All Unsynced Rows to Portal', 'syncAllUnsyncedRows')
    .addItem('Send Missing Welcome Emails', 'sendMissingWelcomeEmails')
    .addSeparator()
    .addItem('Send Test Email to sahgyan9@gmail.com', 'testSendToGyan')
    .addToUi();
}

/**
 * Triggered automatically upon each Google Form submission.
 */
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = e ? e.range.getRow() : sheet.getLastRow();
  
  syncSingleRow(sheet, row);
}

/**
 * Normalizes headers and returns column index map.
 */
function getHeaderMap(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).trim().toLowerCase();
    map[h] = i + 1; // 1-based column index
  }
  return map;
}

/**
 * Locates or creates a tracking column in the sheet.
 */
function getOrCreateColumn(sheet, columnName) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim().toLowerCase() === columnName.toLowerCase()) {
      return i + 1;
    }
  }
  // Add new column at the end
  var newCol = headers.length + 1;
  sheet.getRange(1, newCol).setValue(columnName);
  return newCol;
}

/**
 * Syncs a single row to the portal and dispatches confirmation email.
 */
function syncSingleRow(sheet, rowNumber) {
  if (rowNumber <= 1) return;
  
  var syncCol = getOrCreateColumn(sheet, 'Portal_Sync_Status');
  var emailCol = getOrCreateColumn(sheet, 'Welcome_Email_Status');
  
  var currentSyncStatus = sheet.getRange(rowNumber, syncCol).getValue();
  var currentEmailStatus = sheet.getRange(rowNumber, emailCol).getValue();
  
  // Extract values
  var rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var record = {};
  for (var i = 0; i < headers.length; i++) {
    var key = String(headers[i]).trim();
    record[key] = rowData[i];
  }
  
  // Resolve standard fields from form questions
  var name = findField(record, ['Name of the Participant', 'Name', 'Full Name']) || 'Participant';
  var email = findField(record, ['Email ID', 'Email', 'Email Address']) || '';
  var phone = findField(record, ['WhatsApp Contact', 'Phone', 'Contact Number', 'WhatsApp']) || '';
  var education = findField(record, ['Highest Education', 'Highest Education (eg: B.Tech CSE )', 'Education']) || '';
  var role = findField(record, ['Current Role', 'Role']) || 'Undergraduate Student';
  var college = findField(record, ['College / University / Organization', 'College', 'Institution']) || 'SRM University-AP';
  var collegeEmail = findField(record, ['College/ University/ Organization Mail ID (if Applicable)', 'College Mail ID', 'College Email']) || '';
  var yearOfStudy = findField(record, ['Year of Study', 'Year']) || '';
  
  email = String(email).trim().toLowerCase();
  if (!email || email.indexOf('@') === -1) {
    sheet.getRange(rowNumber, syncCol).setValue('SKIPPED (No valid email)');
    return;
  }
  
  // 1. Send HTTP POST to Webhook
  if (currentSyncStatus !== 'SYNCED') {
    try {
      var payload = {
        name: name,
        email: email,
        phone: String(phone),
        education: education,
        role: role,
        institution: college,
        collegeEmail: String(collegeEmail).trim().toLowerCase(),
        yearOfStudy: yearOfStudy
      };
      
      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'x-sync-secret': WEBHOOK_SECRET
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
      var resCode = response.getResponseCode();
      
      if (resCode >= 200 && resCode < 300) {
        sheet.getRange(rowNumber, syncCol).setValue('SYNCED');
      } else {
        sheet.getRange(rowNumber, syncCol).setValue('FAILED (' + resCode + '): ' + response.getContentText().slice(0, 100));
      }
    } catch (err) {
      sheet.getRange(rowNumber, syncCol).setValue('ERROR: ' + err.toString().slice(0, 100));
    }
  }
  
  // 2. Dispatch Confirmation Email (Ensuring zero duplicate communication)
  if (!currentEmailStatus || String(currentEmailStatus).indexOf('SENT') === -1) {
    try {
      sendWelcomeEmail(email, name);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.getRange(rowNumber, emailCol).setValue('SENT (' + timestamp + ' IST)');
    } catch (mailErr) {
      sheet.getRange(rowNumber, emailCol).setValue('MAIL ERROR: ' + mailErr.toString().slice(0, 100));
    }
  }
}

/**
 * Sends the branded, anti-slop confirmation email to participant.
 */
function sendWelcomeEmail(recipientEmail, participantName) {
  var subject = 'Confirmed: Access Pass for IBM Qiskit Fall Fest 2026 — Hackathon & Competition Arena';
  
  var htmlBody = '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"></head>'
    + '<body style="margin:0;padding:24px 12px;background-color:#f5efea;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#231f20;line-height:1.65;">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background-color:#ffffff;border:1px solid #e4dacb;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(124,20,21,0.06);">'
    + '<tr><td style="padding:0;background-color:#faf7f2;text-align:center;">'
    + '<img src="https://www.qffsrmap2026.com/brand/qiskit-fall-fest-banner.png" alt="IBM Qiskit Fall Fest 2026 — Partner Plus Host at SRM University-AP" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;outline:none;">'
    + '</td></tr>'
    + '<tr><td style="background-color:#7c1415;padding:12px 24px;text-align:center;">'
    + '<span style="font-family:\'Georgia\',serif;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#fdf8f0;font-weight:bold;">'
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · REGISTRATION CONFIRMED'
    + '</span></td></tr>'
    + '<tr><td style="padding:32px 32px 36px 32px;">'
    + '<p style="margin:0 0 16px 0;font-size:16px;color:#231f20;font-weight:bold;">Dear ' + participantName + ',</p>'
    + '<p style="margin:0 0 16px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'Thank you for registering for <strong>Partner Plus IBM Qiskit Fall Fest 2026</strong> at SRM University-AP. Your participant access pass is confirmed and pre-authorized for <strong>' + recipientEmail + '</strong>.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f4;border:1px solid #dfcfb9;border-top:4px solid #7c1415;border-radius:8px;margin:24px 0;padding:20px;text-align:center;">'
    + '<tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#7c1415;margin-bottom:8px;">Instant Single Sign-On Active</div>'
    + '<h3 style="margin:0 0 10px 0;font-size:20px;color:#7c1415;font-weight:bold;">Enter Hackathon & Competition Arena</h3>'
    + '<p style="margin:0 0 18px 0;font-size:13.5px;color:#554c4a;line-height:1.6;">'
    + 'Your account is pre-approved. Click below and select <strong>"Continue with Google"</strong> using your registered email (' + recipientEmail + ') to enter the arena immediately—form your hackathon team, solve live Qiskit challenges on the leaderboard, or submit your competition entries.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">'
    + '<tr><td style="border-radius:6px;background-color:#7c1415;">'
    + '<a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="display:inline-block;padding:12px 28px;font-size:13.5px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;">'
    + 'Enter Hackathon & Competition Arena &rarr;'
    + '</a></td></tr></table>'
    + '</td></tr></table>'
    + '<h3 style="margin:24px 0 10px 0;font-size:16px;color:#7c1415;font-weight:bold;">Choose Your Flexible Festival Tracks</h3>'
    + '<p style="margin:0 0 14px 0;font-size:14px;color:#4f4645;line-height:1.65;">'
    + 'You are free to participate in any one or more of the following tracks based on your interests:'
    + '</p>'
    + '<ul style="margin:0 0 20px 0;padding-left:20px;font-size:14px;color:#3d3635;line-height:1.7;">'
    + '<li><strong>Track 1: Flagship Quantum Hackathon (Team Track · ₹1,00,000 Prize Pool + Internships)</strong> — Form a team of 2 to 6 members to solve cutting-edge industry problems across 5 domain tracks. <em>(Note: Participation in the hackathon is optional—you can also focus exclusively on other tracks!)</em></li>'
    + '<li><strong>Track 2: Python Coding Challenges in Qiskit</strong> — Solve 9 interactive quantum coding problems directly in your browser with live test validation and leaderboard points. (100% Individual)</li>'
    + '<li><strong>Track 3: Creative Competitions (₹20,000 Prize Pool)</strong> — Submit entries for Tech Reels (₹10,000), Digital Poster (₹5,000), or Technical Essay (₹5,000). (Individual submissions)</li>'
    + '<li><strong>Track 4: IBM Quantum Masterclasses & Quizzes</strong> — Watch 5 recorded expert sessions and complete concept check quizzes to qualify for the verified completion certificate. (100% Individual & Self-Paced)</li>'
    + '</ul>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:16px;margin:20px 0;">'
    + '<tr><td>'
    + '<strong style="color:#7c1415;font-size:14px;">Official WhatsApp Community:</strong>'
    + '<p style="margin:6px 0 12px 0;font-size:13px;color:#4f443b;line-height:1.5;">'
    + 'Join our verified participant group for instant announcements, lecture slides, and live support:'
    + '</p>'
    + '<a href="https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW" target="_blank" style="display:inline-block;padding:8px 18px;background-color:#2a6a43;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;border-radius:5px;">'
    + 'Join WhatsApp Community &rarr;'
    + '</a>'
    + '</td></tr></table>'
    + '<p style="margin:24px 0 16px 0;font-size:14px;color:#3d3635;line-height:1.6;">'
    + 'If you have any questions, reach out to us at <a href="mailto:qiskitfallfest@srmap.edu.in" style="color:#7c1415;">qiskitfallfest@srmap.edu.in</a>.'
    + '</p>'
    + '<p style="margin:0;font-size:14px;color:#231f20;">'
    + 'Best regards,<br>'
    + '<strong>Organizing Committee</strong><br>'
    + 'IBM Qiskit Fall Fest 2026<br>'
    + 'SRM University-AP'
    + '</p>'
    + '</td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:16px;text-align:center;font-size:11px;color:#7d726e;">'
    + 'Hackathon Arena: <a href="https://www.qffsrmap2026.com/learning/hackathon" style="color:#7c1415;">qffsrmap2026.com/learning/hackathon</a> · SRM University-AP, Amaravati, Andhra Pradesh'
    + '</td></tr></table>'
    + '</body></html>';
    
  var plainText = 'Dear ' + participantName + ',\n\n'
    + 'Your registration for Partner Plus IBM Qiskit Fall Fest 2026 is confirmed!\n\n'
    + 'Your access pass is confirmed for: ' + recipientEmail + '\n\n'
    + '1. Enter Hackathon Arena: https://www.qffsrmap2026.com/learning/hackathon\n'
    + '2. Sign in with "Continue with Google" using ' + recipientEmail + '\n'
    + '3. Your profile is pre-authorized, so you will enter directly without extra forms.\n\n'
    + 'Festival Tracks (Choose any):\n'
    + '- Flagship Quantum Hackathon (Team Track - 2 to 6 members · ₹1,00,000 Prize Pool)\n'
    + '- Python Coding Challenges in Qiskit (Individual · Leaderboard)\n'
    + '- Creative Competitions: Reels, Poster, Essay (Individual · ₹20,000 Prize Pool)\n'
    + '- Masterclasses & Quizzes (Individual · Verified Certificate)\n\n'
    + 'Join WhatsApp Community: https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW\n\n'
    + 'Best regards,\nOrganizing Committee, IBM Qiskit Fall Fest 2026';
    
  GmailApp.sendEmail(recipientEmail, subject, plainText, {
    htmlBody: htmlBody,
    name: 'IBM Qiskit Fall Fest 2026'
  });
}

/**
 * 1-Click batch sync of all unsynced rows in the spreadsheet.
 */
function syncAllUnsyncedRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('No data found in sheet.');
    return;
  }
  
  var syncCol = getOrCreateColumn(sheet, 'Portal_Sync_Status');
  var syncValues = sheet.getRange(2, syncCol, lastRow - 1, 1).getValues();
  var count = 0;
  
  for (var i = 0; i < syncValues.length; i++) {
    var rowNum = i + 2;
    var status = syncValues[i][0];
    if (status !== 'SYNCED') {
      syncSingleRow(sheet, rowNum);
      count++;
      Utilities.sleep(300); // polite rate limit
    }
  }
  
  SpreadsheetApp.getUi().alert('Batch sync completed: ' + count + ' row(s) processed.');
}

/**
 * 1-Click batch dispatch for any missing welcome emails.
 */
function sendMissingWelcomeEmails() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  var emailCol = getOrCreateColumn(sheet, 'Welcome_Email_Status');
  var emailValues = sheet.getRange(2, emailCol, lastRow - 1, 1).getValues();
  var count = 0;
  
  for (var i = 0; i < emailValues.length; i++) {
    var rowNum = i + 2;
    var status = emailValues[i][0];
    if (!status || String(status).indexOf('SENT') === -1) {
      syncSingleRow(sheet, rowNum);
      count++;
      Utilities.sleep(500);
    }
  }
  
  SpreadsheetApp.getUi().alert('Email dispatch completed: ' + count + ' welcome email(s) dispatched.');
}

/**
 * Helper to extract value by matching any candidate field name.
 */
function findField(record, candidateNames) {
  for (var i = 0; i < candidateNames.length; i++) {
    var candidate = candidateNames[i].toLowerCase();
    for (var key in record) {
      if (key.toLowerCase() === candidate || key.toLowerCase().indexOf(candidate) !== -1) {
        var val = record[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

/**
 * Test function: Dispatches the exact confirmation email to sahgyan9@gmail.com
 * for visual verification and testing.
 */
function testSendToGyan() {
  var testEmail = 'sahgyan9@gmail.com';
  var testName = 'Gyan Kumar Sah';
  
  sendWelcomeEmail(testEmail, testName);
  Logger.log('Test confirmation email dispatched to: ' + testEmail);
  
  try {
    SpreadsheetApp.getUi().alert('Test Email Sent!\n\nA sample confirmation email has been dispatched to ' + testEmail + '.\nPlease check your Gmail Inbox (and Updates/Spam folders).');
  } catch (e) {
    // Silent if executed without active spreadsheet UI
  }
}

/**
 * Web App entrypoint to handle incoming HTTP POST requests from Next.js website registrations.
 * Dispatches the branded pass email and logs the registration in a "Website_Registrations" sheet.
 */
function doPost(e) {
  try {
    var rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(rawData);
    
    // Validate secret token from JSON payload or URL query parameter
    var token = data.secretToken || (e && e.parameter && e.parameter.secret);
    if (token !== WEBHOOK_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Unauthorized: Invalid secret token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var email = String(data.email || '').trim().toLowerCase();
    var name = String(data.name || data.fullName || 'Participant').trim();
    
    if (!email || email.indexOf('@') === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid recipient email address'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. Dispatch the branded confirmation pass email
    sendWelcomeEmail(email, name);
    
    // 2. Record registration under "Website_Registrations" sheet tab
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Website_Registrations');
      if (!sheet) {
        sheet = ss.insertSheet('Website_Registrations');
        sheet.appendRow([
          'Timestamp',
          'Full Name',
          'Email',
          'Institution',
          'Role',
          'Phone',
          'Year of Study',
          'Interests',
          'Email_Status'
        ]);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f5efea');
      }
      
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.appendRow([
        timestamp,
        name,
        email,
        data.college || data.institution || 'SRM University-AP',
        data.role || 'Undergraduate Student',
        data.phone || '',
        data.yearOfStudy || '',
        Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''),
        'SENT (' + timestamp + ' IST)'
      ]);
    } catch (sheetErr) {
      Logger.log('Sheet recording note: ' + sheetErr);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Confirmation email dispatched and recorded successfully.'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Health check endpoint for testing the Web App URL in a browser.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'IBM Qiskit Fall Fest 2026 Email & Sync Relay',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

