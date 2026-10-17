/**
 * Google Apps Script for Qiskit Fall Fest 2026 (SRM University-AP)
 * 
 * Purpose:
 * 1. Automatically syncs new Google Form submissions to the official website database (Supabase + Redis)
 *    so participants are immediately whitelisted with ZERO extra forms to fill on the website.
 * 2. Automatically dispatches a personalized Registration Confirmation & Portal Pass email.
 * 3. Records sync status and email status in the spreadsheet to prevent duplicate communication.
 * 4. Adds a custom menu in Google Sheets / Google Forms for 1-click batch syncing.
 * 5. Serves as a Web App (doPost) so participants registering directly on the website also receive
 *    the exact same branded pass email and appear under a "Website_Registrations" sheet tab.
 *
 * Setup Instructions:
 * 1. Open your Google Form (or linked Google Sheet).
 * 2. Click "Extensions" -> "Apps Script" (or the 3 dots in Google Forms -> "Script editor").
 * 3. Delete any code in the editor and paste this entire file.
 * 4. (Optional) Paste your Google Sheet URL or ID into SPREADSHEET_ID_OR_URL below if this script
 *    is running inside the Google Form editor rather than the Google Sheet.
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
 */

var WEBHOOK_URL = 'https://www.qffsrmap2026.com/api/webhooks/google-form';
var WEBHOOK_SECRET = 'qff-srmap-2026-sync-secret'; // Must match GOOGLE_FORM_SYNC_SECRET in your .env

// Configured for Qiskit_Fall_Fest (Responses)
var SPREADSHEET_ID_OR_URL = '1mWBUDchcuUsG0J9dbWjdbduLHt0CBCYbQeBe8QzcJBE';

/**
 * Safely resolves the target Google Spreadsheet across all contexts:
 * 1. Sheet-bound script: SpreadsheetApp.getActiveSpreadsheet()
 * 2. Explicit ID or URL in SPREADSHEET_ID_OR_URL
 * 3. Form-bound script: FormApp.getActiveForm().getDestinationId()
 */
function getTargetSpreadsheet() {
  // 1. Check if bound to active spreadsheet
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  
  // 2. Check explicit ID or URL fallback
  if (typeof SPREADSHEET_ID_OR_URL !== 'undefined' && SPREADSHEET_ID_OR_URL && SPREADSHEET_ID_OR_URL.trim() !== '') {
    try {
      var target = SPREADSHEET_ID_OR_URL.trim();
      if (target.indexOf('http') === 0) {
        return SpreadsheetApp.openByUrl(target);
      } else {
        return SpreadsheetApp.openById(target);
      }
    } catch (e) {
      Logger.log('getTargetSpreadsheet openById/Url error: ' + e);
    }
  }

  // 3. Check if attached to Google Form with linked destination sheet
  try {
    var form = FormApp.getActiveForm();
    if (form) {
      var destId = form.getDestinationId();
      if (destId) {
        return SpreadsheetApp.openById(destId);
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Creates custom menu when opening the Google Sheet or Google Form.
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.createMenu('Qiskit Fall Fest 2026')
        .addItem('1. Setup "General_Pass_Recipients" Sheet', 'setupGeneralPassRecipientsSheet')
        .addItem('2. Send Test Pass Email to sahgyan9@gmail.com', 'sendTestGeneralPassEmail')
        .addItem('3. Start General Pass Email Campaign', 'startGeneralPassEmailCampaign')
        .addSeparator()
        .addItem('Sync All Unsynced Rows to Portal', 'syncAllUnsyncedRows')
        .addItem('Send Missing Welcome Emails', 'sendMissingWelcomeEmails')
        .addSeparator()
        .addItem('Send Welcome Email Test to sahgyan9@gmail.com', 'testSendToGyan')
        .addToUi();
    }
  } catch (e) {
    // If running in Form UI context:
    try {
      var formUi = FormApp.getUi();
      if (formUi) {
        formUi.createMenu('Qiskit Fall Fest 2026')
          .addItem('Sync All Form Submissions to Portal', 'syncAllFormResponses')
          .addItem('Send Test Email to sahgyan9@gmail.com', 'testSendToGyan')
          .addToUi();
      }
    } catch (fErr) {}
  }
}

/**
 * Triggered automatically upon each Google Form submission.
 * Resilient to both Form triggers (e.response) and Spreadsheet triggers (e.range).
 */
function onFormSubmit(e) {
  try {
    // Case 1: Trigger is bound to Google Sheet (e.range exists)
    if (e && e.range) {
      var sheet = e.range.getSheet();
      var row = e.range.getRow();
      syncSingleRow(sheet, row);
      return;
    }
    
    // Case 2: Trigger is bound to Google Form (e.response exists)
    if (e && e.response) {
      var record = extractRecordFromFormResponse(e.response);
      processParticipantRecord(record);
      
      // Update linked spreadsheet status if accessible
      try {
        var ss = getTargetSpreadsheet();
        if (ss) {
          var targetSheet = ss.getSheetByName('Form Responses 1') || ss.getSheets()[0];
          var participantEmail = findField(record, ['Email ID', 'Email', 'Email Address']);
          if (participantEmail) {
            updateRowStatusForEmail(targetSheet, participantEmail, 'SYNCED', 'SENT');
          }
        }
      } catch (sheetErr) {
        Logger.log('Could not update status in sheet: ' + sheetErr);
      }
      return;
    }
    
    // Case 3: Manual execution or fallback without event object
    var ssFallback = getTargetSpreadsheet();
    if (ssFallback) {
      var activeSheet = ssFallback.getSheetByName('Form Responses 1') || ssFallback.getSheets()[0];
      syncSingleRow(activeSheet, activeSheet.getLastRow());
    } else {
      Logger.log('onFormSubmit: No event object and no spreadsheet available.');
    }
  } catch (err) {
    Logger.log('onFormSubmit fatal error: ' + err);
  }
}

/**
 * Extracts a key-value record from a Google Form FormResponse object.
 */
function extractRecordFromFormResponse(response) {
  var record = {};
  var itemResponses = response.getItemResponses();
  for (var i = 0; i < itemResponses.length; i++) {
    var item = itemResponses[i];
    var title = item.getItem().getTitle();
    var val = item.getResponse();
    record[title] = val;
  }
  var respondentEmail = response.getRespondentEmail();
  if (respondentEmail && !findField(record, ['Email ID', 'Email', 'Email Address'])) {
    record['Email ID'] = respondentEmail;
  }
  return record;
}

/**
 * Processes a single participant record: syncs to portal webhook and dispatches welcome email.
 */
function processParticipantRecord(record) {
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
    Logger.log('processParticipantRecord: Invalid email: ' + email);
    return false;
  }
  
  // 1. Post to Webhook
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
    
    var res = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Webhook sync status for ' + email + ': ' + res.getResponseCode());
  } catch (syncErr) {
    Logger.log('Webhook sync error for ' + email + ': ' + syncErr);
  }
  
  // 2. Dispatch Confirmation Email
  try {
    sendWelcomeEmail(email, name);
    Logger.log('Welcome email dispatched to: ' + email);
  } catch (mailErr) {
    Logger.log('Email dispatch error for ' + email + ': ' + mailErr);
  }
  
  return true;
}

/**
 * Updates Portal_Sync_Status and Welcome_Email_Status for a matching email in the sheet.
 */
function updateRowStatusForEmail(sheet, email, syncStatus, emailStatus) {
  try {
    if (!sheet || !email) return;
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    
    var headerMap = getHeaderMap(sheet);
    var syncCol = getOrCreateColumn(sheet, 'Portal_Sync_Status');
    var emailCol = getOrCreateColumn(sheet, 'Welcome_Email_Status');
    
    var emailColIndex = -1;
    for (var h in headerMap) {
      if (h.indexOf('email') !== -1 || h.indexOf('mail id') !== -1) {
        emailColIndex = headerMap[h];
        break;
      }
    }
    if (emailColIndex === -1) emailColIndex = 2; // Default column B
    
    var emailValues = sheet.getRange(2, emailColIndex, lastRow - 1, 1).getValues();
    var cleanTarget = String(email).trim().toLowerCase();
    
    for (var i = emailValues.length - 1; i >= 0; i--) {
      if (String(emailValues[i][0]).trim().toLowerCase() === cleanTarget) {
        var rowNum = i + 2;
        var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
        if (syncStatus) sheet.getRange(rowNum, syncCol).setValue(syncStatus);
        if (emailStatus) sheet.getRange(rowNum, emailCol).setValue(emailStatus + ' (' + timestamp + ' IST)');
        break;
      }
    }
  } catch (e) {
    Logger.log('updateRowStatusForEmail error: ' + e);
  }
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
 * 1-Click batch sync directly from Google Forms.
 * Use when this script is running inside Google Forms.
 */
function syncAllFormResponses() {
  try {
    var form = FormApp.getActiveForm();
    if (!form) {
      Logger.log('syncAllFormResponses: FormApp.getActiveForm() is null. Run syncAllUnsyncedRows in Google Sheets instead.');
      return;
    }
    
    var responses = form.getResponses();
    var count = 0;
    Logger.log('Found ' + responses.length + ' total responses in Google Form.');
    
    for (var i = 0; i < responses.length; i++) {
      var record = extractRecordFromFormResponse(responses[i]);
      var ok = processParticipantRecord(record);
      if (ok) count++;
      Utilities.sleep(300); // polite rate limit
    }
    
    var msg = 'Batch sync completed: ' + count + ' form submission(s) processed.';
    Logger.log(msg);
    try {
      FormApp.getUi().alert(msg);
    } catch (e) {}
  } catch (err) {
    Logger.log('syncAllFormResponses error: ' + err);
  }
}

/**
 * 1-Click batch sync of all unsynced rows in the spreadsheet.
 */
function syncAllUnsyncedRows() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    var msg = 'Could not locate active Google Spreadsheet.\n\nIf this script is running inside Google Forms, you can:\n1. Run "syncAllFormResponses" instead, OR\n2. Set SPREADSHEET_ID_OR_URL at top of script.';
    Logger.log(msg);
    try {
      SpreadsheetApp.getUi().alert(msg);
    } catch (e) {
      try { FormApp.getUi().alert(msg); } catch (fe) {}
    }
    return;
  }
  
  var sheet = ss.getSheetByName('Form Responses 1') || ss.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    try {
      SpreadsheetApp.getUi().alert('No data found in sheet.');
    } catch (e) {}
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
  
  var resultMsg = 'Batch sync completed: ' + count + ' row(s) processed.';
  Logger.log(resultMsg);
  try {
    SpreadsheetApp.getUi().alert(resultMsg);
  } catch (e) {}
}

/**
 * 1-Click batch dispatch for any missing welcome emails in the spreadsheet.
 */
function sendMissingWelcomeEmails() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    Logger.log('sendMissingWelcomeEmails: Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('Form Responses 1') || ss.getSheets()[0];
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
  
  var resultMsg = 'Email dispatch completed: ' + count + ' welcome email(s) dispatched.';
  Logger.log(resultMsg);
  try {
    SpreadsheetApp.getUi().alert(resultMsg);
  } catch (e) {}
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
    SpreadsheetApp.getUi().alert('Test Email Sent!\n\nA sample confirmation email has been dispatched to ' + testEmail + '.\nPlease check your Gmail Inbox.');
  } catch (e) {
    try {
      FormApp.getUi().alert('Test Email Sent!\n\nA sample confirmation email has been dispatched to ' + testEmail + '.\nPlease check your Gmail Inbox.');
    } catch (fe) {}
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
      var ss = getTargetSpreadsheet();
      if (ss) {
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
      }
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

// ============================================================================
// ON-CAMPUS GENERAL OFFLINE PASS (₹99) EMAIL CAMPAIGN
// ============================================================================

/**
 * 1. Automatically creates and formats the 'General_Pass_Recipients' tab.
 */
function setupGeneralPassRecipientsSheet() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    try {
      SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    } catch (e) {}
    return;
  }
  
  var sheet = ss.getSheetByName('General_Pass_Recipients');
  if (!sheet) {
    sheet = ss.insertSheet('General_Pass_Recipients');
    sheet.appendRow([
      'Email',
      'Full Name',
      'Institution',
      'Phone',
      'Role',
      'Pass_Email_Status'
    ]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#6C151E').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert(
      'Sheet "General_Pass_Recipients" created successfully!\n\n' +
      'Next Step: Open "C:\\Users\\sahgy\\Downloads\\non_hackathon_pass_recipients.csv", copy the recipient data, and paste it into this sheet. Then click:\n\n' +
      'Qiskit Fall Fest 2026 -> 3. Start General Pass Email Campaign'
    );
  } else {
    SpreadsheetApp.getUi().alert('Sheet "General_Pass_Recipients" already exists.');
  }
}

/**
 * 2. Dispatches a single test copy of the General Offline Pass email to sahgyan9@gmail.com.
 */
function sendTestGeneralPassEmail() {
  var testEmail = 'sahgyan9@gmail.com';
  try {
    sendGeneralPassAnnouncementEmail(testEmail, 'Gyan Kumar Sah (Test Mode)');
    SpreadsheetApp.getUi().alert('Test pass email successfully dispatched to ' + testEmail + '!\nPlease check your inbox.');
  } catch (err) {
    SpreadsheetApp.getUi().alert('Failed to send test email: ' + err.toString());
  }
}

/**
 * 3. Batched campaign dispatcher with safety quota check and deduplication.
 */
function startGeneralPassEmailCampaign() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('General_Pass_Recipients');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please run "1. Setup General_Pass_Recipients Sheet" first.');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('The sheet "General_Pass_Recipients" has no recipient rows. Please paste the recipient data from your Downloads folder first.');
    return;
  }
  
  var quotaRemaining = MailApp.getRemainingDailyQuota();
  if (quotaRemaining < 5) {
    SpreadsheetApp.getUi().alert('Daily Gmail sending quota reached (' + quotaRemaining + ' left). Please try again tomorrow.');
    return;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var sentCount = 0;
  var skippedCount = 0;
  
  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var email = String(data[i][0]).trim().toLowerCase();
    var name = String(data[i][1]).trim() || 'Participant';
    var currentStatus = String(data[i][5] || '').trim();
    
    if (!email || email.indexOf('@') === -1) {
      sheet.getRange(rowNum, 6).setValue('SKIPPED (Invalid Email)');
      continue;
    }
    
    // Deduplication check: Never re-send to anyone already marked SENT
    if (currentStatus.indexOf('SENT') !== -1) {
      skippedCount++;
      continue;
    }
    
    if (MailApp.getRemainingDailyQuota() <= 2) {
      Logger.log('Quota limit hit during batch. Stopping cleanly.');
      break;
    }
    
    try {
      sendGeneralPassAnnouncementEmail(email, name);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.getRange(rowNum, 6).setValue('SENT (' + timestamp + ' IST)');
      sentCount++;
      Utilities.sleep(1000); // Respect Google Workspace mail rate limit
    } catch (mailErr) {
      sheet.getRange(rowNum, 6).setValue('ERROR: ' + mailErr.toString().slice(0, 100));
    }
  }
  
  var summary = 'Campaign run completed!\n\n' +
    'Successfully Dispatched: ' + sentCount + '\n' +
    'Skipped (Already Sent): ' + skippedCount + '\n' +
    'Daily Quota Remaining: ' + MailApp.getRemainingDailyQuota();
  
  Logger.log(summary);
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * 4. Master HTML email builder and dispatcher for the General Offline Pass (₹99).
 * Exact visual synchronization with the official registration email template.
 */
function sendGeneralPassAnnouncementEmail(recipientEmail, participantName) {
  var subject = 'IBM Qiskit Fall Fest 2026 — On-Campus Attendance Pass (26–30 Oct)';
  
  var htmlBody = '<!DOCTYPE html>'
    + '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">'
    + '<head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style type="text/css">body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; } body { margin: 0; padding: 0; width: 100% !important; background-color: #f5efea; }</style>'
    + '</head>'
    + '<body style="margin:0;padding:24px 12px;background-color:#f5efea;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#231f20;line-height:1.65;">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;margin:0 auto;background-color:#ffffff;border:1px solid #e4dacb;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(124,20,21,0.06);">'
    + '<tr><td style="padding:0;background-color:#faf7f2;text-align:center;">'
    + '<img src="https://www.qffsrmap2026.com/brand/qiskit-fall-fest-banner.png" alt="IBM Qiskit Fall Fest 2026 — Partner Plus Host at SRM University-AP" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;outline:none;">'
    + '</td></tr>'
    + '<tr><td style="background-color:#7c1415;padding:10px 24px;text-align:center;">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-family:\'Georgia\',\'Times New Roman\',serif;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#fdf8f0;font-weight:bold;text-align:center;">'
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · ON-CAMPUS PASS REGISTRATION'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="padding:32px 36px 36px 36px;">'
    + '<p style="margin:0 0 16px 0;font-size:16px;color:#231f20;font-weight:bold;">Dear ' + participantName + ',</p>'
    + '<p style="margin:0 0 14px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'The online masterclasses, quizzes, and competition submissions for <strong>Partner Plus IBM Qiskit Fall Fest 2026 at SRM University-AP</strong> are concluding.'
    + '</p>'
    + '<p style="margin:0 0 24px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'We are now preparing for the flagship physical on-campus festival, taking place from <strong>Monday, 26 October through Friday, 30 October 2026</strong> at SRM University-AP. To attend keynote sessions by IBM Quantum researchers, hands-on masterclasses, the Industry Tech Expo, and student networking arenas, attendees can now secure their <strong>General Offline Pass (&#8377;99)</strong>.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f4;border:1px solid #dfcfb9;border-top:4px solid #7c1415;border-radius:8px;margin:24px 0 28px 0;"><tr>'
    + '<td style="padding:26px 24px;text-align:center;">'
    + '<div style="display:inline-block;background-color:#faefe0;border:1px solid #d9be97;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#7c1415;margin-bottom:12px;">Official On-Campus Attendance Pass</div>'
    + '<h2 style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:22px;color:#7c1415;font-weight:bold;line-height:1.3;">Claim Your General Offline Pass — &#8377;99</h2>'
    + '<p style="margin:0 0 6px 0;font-size:14px;color:#554c4a;">5 Full Days of Campus Access · Keynotes · Technical Workshops · Industry Tech Expo · Arcade</p>'
    + '<p style="margin:0 0 20px 0;font-size:14px;color:#7c1415;font-weight:bold;">Festival Dates: 26–30 October 2026 · Main Campus, SRM University-AP</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>'
    + '<td align="center" style="border-radius:6px;background-color:#7c1415;">'
    + '<a href="https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;border:1px solid #630e10;">Pay &#8377;99 on University Gateway &rarr;</a>'
    + '</td></tr></table>'
    + '<p style="margin:16px 0 0 0;font-size:12px;color:#7d726e;">Direct Gateway link: <a href="https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026" style="color:#7c1415;text-decoration:underline;">SRM University-AP Easebuzz Payment Portal</a></p>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border-left:4px solid #b97e3e;border-radius:0 6px 6px 0;margin:0 0 32px 0;"><tr>'
    + '<td style="padding:14px 18px;font-size:13.5px;color:#4f443b;line-height:1.6;">'
    + '<strong style="color:#7c1415;">Important Scope Notice:</strong> This pass provides comprehensive access to general festival events, keynote sessions, and open workshops. It does not include catering/lunch packages or entry into the competitive Hackathon Phase 2 sprint (which requires Phase 1 qualification). Hackathon Phase 1 participants will receive separate instructions following Phase 1 evaluation.'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 24px 0;"><tr><td style="border-bottom:1px solid #ebd9c2;"></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:21px;color:#7c1415;font-weight:bold;">What Your General Pass (&#8377;99) Unlocks</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:18px;"></div>'
    + '<p style="margin:0 0 16px 0;font-size:14.5px;color:#4f4645;line-height:1.65;">The &#8377;99 General Offline Pass enables full in-person participation across five days of quantum science, industry exhibits, and interactive challenges:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 26px 0;">'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 12px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Campus Access</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">5 Full Festival Days</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Access to all open festival venues and exhibition zones at SRM University-AP (26–30 Oct).</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 12px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Technical Learning</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">IBM Keynotes &amp; Workshops</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Distinguished research talks by IBM Quantum scientists and hands-on masterclasses.</div>'
    + '</td></tr></table></td></tr>'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Ecosystem &amp; Innovation</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Industry Tech Expo</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Quantum Startup Pitch showcase, hardware demos, and expert networking.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 0 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Interactive Arena</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Games &amp; Quantum Debate</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">QChess, QEscapes, The Great Quantum Debate, and official certificate of attendance.</div>'
    + '</td></tr></table></td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px 0;"><tr><td style="border-bottom:1px solid #ebd9c2;"></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:21px;color:#7c1415;font-weight:bold;">How to Claim Your Digital Gate Badge</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<p style="margin:0 0 14px 0;font-size:14.5px;color:#4f4645;line-height:1.65;">Because pass fees are processed through SRM University-AP&apos;s central gateway, follow these steps to instantly pair your payment with your attendee profile and receive your digital badge:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:18px 20px;margin:0 0 32px 0;">'
    + '<tr><td style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#b97e3e;padding-bottom:12px;">Pass Issuance Protocol</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 1:</strong> Complete the &#8377;99 fee on the central <a href="https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026" target="_blank" style="color:#7c1415;font-weight:bold;">Easebuzz Payment Portal</a>. Download your PDF receipt upon payment success.</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 2:</strong> Visit <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning</a> and sign in with Google.</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 3:</strong> At the top of your dashboard, upload your downloaded Easebuzz receipt (PDF or screenshot) and confirm your <strong>Easebuzz Transaction ID</strong> (shown on line 4 of your receipt, e.g. <code>E26101518BKHN3</code>).</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 4:</strong> Your <strong>Official Digital Gate Pass with Security QR Code</strong> will be generated immediately. Click <strong>&quot;Download Pass (PNG)&quot;</strong> to save it to your phone gallery for fast-track entry at the campus gate.</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f5;border:1px solid #e4dacb;border-radius:8px;padding:18px 20px;margin:0 0 32px 0;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Accommodation Assistance</div>'
    + '<h3 style="margin:0 0 6px 0;font-size:16px;color:#231f20;font-weight:bold;">Travelling from Outside Vijayawada / Guntur?</h3>'
    + '<p style="margin:0;font-size:14px;color:#4f4645;line-height:1.6;">Participants traveling to SRM University-AP can stay in verified paying-guest (PG) accommodation near the campus. The organizing team will assist you in arranging a place at approximately <strong>&#8377;500 per person</strong>. Please coordinate with the team in our official WhatsApp Community.</p>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:20px;margin:0 0 32px 0;"><tr><td>'
    + '<h3 style="margin:0 0 6px 0;font-size:16px;color:#7c1415;font-weight:bold;">Official Participant Support &amp; Updates</h3>'
    + '<p style="margin:0 0 14px 0;font-size:14px;color:#4f443b;line-height:1.6;">Join our verified WhatsApp Community for live festival announcements, speaker schedules, campus directions, and direct coordinator contact:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#2a6a43;border-radius:6px;">'
    + '<a href="https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW" target="_blank" style="display:inline-block;padding:11px 22px;font-size:13.5px;font-weight:bold;color:#ffffff;text-decoration:none;">Join Official WhatsApp Community &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
    + '<p style="margin:0 0 14px 0;font-size:14.5px;color:#3d3635;line-height:1.7;">We look forward to welcoming you to the SRM University-AP campus for five days of deep-tech exploration, industry networking, and quantum computation.</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 10px 0;"><tr><td style="border-left:3px solid #7c1415;padding-left:14px;">'
    + '<p style="margin:0;font-size:14.5px;color:#231f20;line-height:1.5;">Best regards,<br><strong>Organizing Committee</strong><br>IBM Qiskit Fall Fest 2026<br>Department of Physics &amp; School of Engineering and Sciences<br>SRM University-AP</p>'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:22px 36px;text-align:center;">'
    + '<p style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:13px;color:#7c1415;font-weight:bold;">Partner Plus IBM Qiskit Fall Fest 2026</p>'
    + '<p style="margin:0 0 10px 0;font-size:12px;color:#6b625b;">SRM University-AP, Neerukonda, Mangalagiri Mandal, Andhra Pradesh 522240</p>'
    + '<p style="margin:0;font-size:12px;color:#857a73;">Learning Portal: <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning</a> &nbsp;·&nbsp; Festival Schedule: <a href="https://www.qffsrmap2026.com/schedule" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/schedule</a> &nbsp;·&nbsp; Contact: <a href="mailto:qiskitfallfest@srmap.edu.in" style="color:#7c1415;text-decoration:underline;">qiskitfallfest@srmap.edu.in</a></p>'
    + '</td></tr></table></body></html>';

  GmailApp.sendEmail(recipientEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: 'Qiskit Fall Fest 2026'
  });
}

