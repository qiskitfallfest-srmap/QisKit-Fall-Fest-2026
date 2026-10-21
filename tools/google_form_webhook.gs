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
        .addItem('4. Setup "Hackathon_Repo_Reminder" Sheet', 'setupHackathonRepoReminderSheet')
        .addItem('5. Send Test Hackathon Reminder to sahgyan9@gmail.com', 'sendTestHackathonRepoReminderEmail')
        .addItem('6. Start Hackathon Repo Reminder Campaign', 'startHackathonRepoReminderCampaign')
        .addSeparator()
        .addItem('7. Setup "Certificate_Recipients" Sheet', 'setupCertificateRecipientsSheet')
        .addItem('8. Send Test Certificate Email to sahgyan9@gmail.com', 'sendTestCertificateEmail')
        .addItem('9. Start Certificate Campaign (5/5 Qualified Only - 220 students)', 'startQualifiedOnlyCertificateCampaign')
        .addItem('10. Start Certificate Campaign (All Recipients)', 'startCertificateEmailCampaign')
        .addSeparator()
        .addItem('11. Setup "Hackathon_Finalists_Recipients" Sheet', 'setupHackathonFinalistsSheet')
        .addItem('12. Send Test Finalist Email to sahgyan9@gmail.com', 'sendTestHackathonFinalistEmail')
        .addItem('13. Start Hackathon Finalists Email Campaign', 'startHackathonFinalistsEmailCampaign')
        .addSeparator()
        .addItem('14. Setup "Payment_Reminder_Recipients" Sheet', 'setupPaymentReminderSheet')
        .addItem('15. Send Test Payment Reminder to sahgyan9@gmail.com', 'sendTestPaymentReminderEmail')
        .addItem('16. Start Hackathon Payment Reminder Campaign', 'startPaymentReminderEmailCampaign')
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
    + '<a href="https://www.qffsrmap2026.com/learning" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;border:1px solid #630e10;">Claim Pass on Official Portal &rarr;</a>'
    + '</td></tr></table>'
    + '<p style="margin:16px 0 0 0;font-size:12px;color:#7d726e;">Direct Portal link: <a href="https://www.qffsrmap2026.com/learning" style="color:#7c1415;text-decoration:underline;">https://www.qffsrmap2026.com/learning</a></p>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border-left:4px solid #b97e3e;border-radius:0 6px 6px 0;margin:0 0 32px 0;"><tr>'
    + '<td style="padding:16px 20px;font-size:13.5px;color:#4f443b;line-height:1.65;">'
    + '<div style="font-weight:bold;color:#7c1415;margin-bottom:6px;font-size:14px;">Important Scope &amp; Exclusions Notice:</div>'
    + 'The <strong>&#8377;99 General Offline Pass</strong> grants full campus entry to keynote talks, workshops, tech expo exhibits, debates, and open games for all 5 days. It <strong>does NOT include</strong>:'
    + '<ul style="margin:8px 0 8px 18px;padding:0;">'
    + '<li>Participation in competitive flagship tracks: <strong>Hackathon Phase 2</strong>, <strong>Quantum Startup Pitch</strong>, or <strong>QCTF (Quantum Capture the Flag)</strong>.</li>'
    + '<li>The <strong>5-day special lunch</strong> and daily refreshment servings.</li>'
    + '</ul>'
    + 'These competitive flagship tracks and meals are strictly reserved for the <strong>&#8377;499 All-Access Flagship Pass</strong> (for Phase 2 shortlisted hackathon teams and qualified finalists). Hackathon Phase 1 participants will receive separate instructions following Phase 1 evaluation.'
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
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Hardware demonstrations, exhibition showcases, and expert networking.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 0 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Interactive Arena</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Games &amp; Quantum Debate</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">QChess, QEscapes, The Great Quantum Debate, and official certificate of attendance.</div>'
    + '</td></tr></table></td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border:1px solid #e7dcce;border-radius:8px;overflow:hidden;margin:4px 0 28px 0;font-size:13px;">'
    + '<tr style="background-color:#7c1415;color:#ffffff;">'
    + '<th style="padding:10px 14px;text-align:left;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;">Festival Feature / Track</th>'
    + '<th style="padding:10px 10px;text-align:center;font-size:12px;width:30%;letter-spacing:0.6px;text-transform:uppercase;">General Pass (&#8377;99)</th>'
    + '<th style="padding:10px 10px;text-align:center;font-size:12px;width:30%;background-color:#5a0e10;letter-spacing:0.6px;text-transform:uppercase;">Flagship Pass (&#8377;499)</th>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;">'
    + '<td style="padding:9px 14px;color:#231f20;">5 Full Days Campus &amp; Venue Access</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;background-color:#fcfaf7;">'
    + '<td style="padding:9px 14px;color:#231f20;">IBM Talks, Workshops &amp; Tech Expo</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;">'
    + '<td style="padding:9px 14px;color:#231f20;">Quantum Reference Center Tour</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;background-color:#fcfaf7;">'
    + '<td style="padding:9px 14px;color:#231f20;">Quantum Arcade, QChess &amp; Debate</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;">'
    + '<td style="padding:9px 14px;color:#231f20;">Hackathon Phase 2 (24-hr sprint)</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#b91c1c;font-weight:bold;">Not Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Shortlisted Only</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;background-color:#fcfaf7;">'
    + '<td style="padding:9px 14px;color:#231f20;">Quantum Startup Pitch &amp; QCTF</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#b91c1c;font-weight:bold;">Not Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:9px 14px;color:#231f20;">5-Day Special Lunch &amp; Snacks</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#b91c1c;font-weight:bold;">Not Included</td>'
    + '<td style="padding:9px 10px;text-align:center;color:#047857;font-weight:bold;">Included</td>'
    + '</tr>'
    + '</table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px 0;"><tr><td style="border-bottom:1px solid #ebd9c2;"></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:21px;color:#7c1415;font-weight:bold;">How to Claim Your Digital Gate Badge</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<p style="margin:0 0 14px 0;font-size:14.5px;color:#4f4645;line-height:1.65;">Follow these straightforward steps on our learning portal to complete your registration, pair your payment receipt, and generate your personalized entry badge:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:18px 20px;margin:0 0 32px 0;">'
    + '<tr><td style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#b97e3e;padding-bottom:12px;">Pass Issuance Protocol</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 1:</strong> Visit <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning</a> and sign in with Google.</td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 2:</strong> In the <strong>&quot;On-Campus Festival Pass&quot;</strong> hero card at the top, click <strong>&quot;Pay &#8377;99 on University Gateway&quot;</strong> to open SRM University-AP&apos;s Easebuzz portal. Complete payment and download your receipt.</td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 3:</strong> Return to the pass card, enter your <strong>Easebuzz Transaction ID</strong> (e.g. <code>E26101518BKHN3</code>), and upload your receipt screenshot or PDF.</td></tr>'
    + '<tr><td style="padding:8px 0 0 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 4:</strong> Your <strong>Official Digital Gate Pass with Security QR Code</strong> will be generated immediately. Click <strong>&quot;Download Pass (PNG)&quot;</strong> to save it to your phone for rapid admission at campus entrance gates.</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f5fa;border:1px solid #bfdbfe;border-left:4px solid #1e40af;border-radius:8px;padding:20px;margin:0 0 32px 0;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1e40af;margin-bottom:4px;">Cannot Attend In Person? (Online Alternative)</div>'
    + '<h3 style="margin:0 0 8px 0;font-size:16px;color:#1e3a8a;font-weight:bold;">Claim Your Verified Masterclass Certificate (&#8377;99)</h3>'
    + '<p style="margin:0 0 12px 0;font-size:14px;color:#1e293b;line-height:1.6;">If you are located outside Vijayawada / Guntur or cannot travel to SRM University-AP in person, you can still earn the official <strong>Verified Certificate of Course Completion</strong> co-certified by IBM Quantum and SRM University-AP.</p>'
    + '<ul style="margin:0 0 14px 0;padding-left:20px;font-size:13.5px;color:#334155;line-height:1.6;">'
    + '<li><strong>Curriculum Requirement:</strong> Complete all 5 recorded masterclasses and pass the concept check quizzes on <a href="https://www.qffsrmap2026.com/learning?certificate=true" target="_blank" style="color:#1e40af;font-weight:bold;">qffsrmap2026.com/learning?certificate=true</a>.</li>'
    + '<li><strong>Delivery Preference:</strong> In the certificate modal, select <strong>&quot;Receive by email&quot;</strong> for direct high-resolution digitally signed PDF dispatch to your inbox, or collect in person at the valedictory ceremony.</li>'
    + '<li><strong>Independent Purchase Note:</strong> The General Offline Pass (campus gate admission) and the Masterclass Certificate are separate purchases. Each purchase requires its own distinct Easebuzz Transaction ID (cannot share or duplicate IDs).</li>'
    + '</ul>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#1e40af;border-radius:6px;">'
    + '<a href="https://www.qffsrmap2026.com/learning?certificate=true" target="_blank" style="display:inline-block;padding:10px 20px;font-size:13px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;text-transform:uppercase;letter-spacing:0.6px;">Learn More &amp; Claim Certificate &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
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

// ============================================================================
// HACKATHON PHASE 1 REPO SUBMISSION REMINDER EMAIL CAMPAIGN
// ============================================================================

/**
 * 4. Automatically creates and formats the 'Hackathon_Repo_Reminder' tab.
 */
function setupHackathonRepoReminderSheet() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    try {
      SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    } catch (e) {}
    return;
  }
  
  var sheet = ss.getSheetByName('Hackathon_Repo_Reminder');
  if (!sheet) {
    sheet = ss.insertSheet('Hackathon_Repo_Reminder');
    sheet.appendRow([
      'Participant Name',
      'Email',
      'Role',
      'Team Name',
      'Vertical',
      'Problem Statement ID',
      'Repo Status',
      'Submitted Repo URL',
      'Reminder_Status'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#7c1415').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert(
      'Sheet "Hackathon_Repo_Reminder" created successfully!\n\n' +
      'Next Step: Open "C:\\Users\\sahgy\\Downloads\\all_hackathon_participants.csv", copy the rows, and paste them into this sheet (Columns A to H). Then click:\n\n' +
      'Qiskit Fall Fest 2026 -> 6. Start Hackathon Repo Reminder Campaign'
    );
  } else {
    SpreadsheetApp.getUi().alert('Sheet "Hackathon_Repo_Reminder" already exists.');
  }
}

/**
 * 5. Dispatches a single test copy of the Hackathon Repo Reminder email to sahgyan9@gmail.com.
 */
function sendTestHackathonRepoReminderEmail() {
  var testEmail = 'sahgyan9@gmail.com';
  try {
    sendHackathonRepoReminderEmail(
      testEmail,
      'Gyan Kumar Sah (Test)',
      'Quantum Builders (Test Team)',
      'Quantum Machine Learning',
      'PS-Q1'
    );
    SpreadsheetApp.getUi().alert('Test hackathon reminder successfully dispatched to ' + testEmail + '!\nPlease check your inbox.');
  } catch (err) {
    SpreadsheetApp.getUi().alert('Failed to send test email: ' + err.toString());
  }
}

/**
 * 6. Batched campaign dispatcher for all hackathon participants with safety quota check.
 */
function startHackathonRepoReminderCampaign() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('Hackathon_Repo_Reminder');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please run "4. Setup Hackathon_Repo_Reminder Sheet" first.');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('The sheet "Hackathon_Repo_Reminder" has no recipient rows. Please paste the recipient data from your Downloads folder first.');
    return;
  }
  
  var quotaRemaining = MailApp.getRemainingDailyQuota();
  if (quotaRemaining < 5) {
    SpreadsheetApp.getUi().alert('Daily Gmail sending quota reached (' + quotaRemaining + ' left). Please try again tomorrow.');
    return;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var sentCount = 0;
  var skippedCount = 0;
  
  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var name = String(data[i][0]).trim() || 'Innovator';
    var email = String(data[i][1]).trim().toLowerCase();
    var role = String(data[i][2]).trim();
    var teamName = String(data[i][3]).trim() || 'Your Team';
    var vertical = String(data[i][4]).trim() || 'Quantum Computing';
    var problemId = String(data[i][5]).trim() || 'Phase 1';
    var repoStatus = String(data[i][6] || '').trim();
    var repoUrl = String(data[i][7] || '').trim();
    var currentStatus = String(data[i][8] || '').trim();
    
    if (!email || email.indexOf('@') === -1) {
      sheet.getRange(rowNum, 9).setValue('SKIPPED (Invalid Email)');
      continue;
    }
    
    // Deduplication check: Never re-send to anyone already marked SENT
    if (currentStatus.indexOf('SENT') !== -1) {
      skippedCount++;
      continue;
    }
    
    if (MailApp.getRemainingDailyQuota() <= 2) {
      Logger.log('Quota limit reached during batch. Stopping cleanly.');
      break;
    }
    
    try {
      sendHackathonRepoReminderEmail(email, name, teamName, vertical, problemId);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.getRange(rowNum, 9).setValue('SENT (' + timestamp + ' IST)');
      sentCount++;
      Utilities.sleep(1000); // Polite rate limit
    } catch (mailErr) {
      sheet.getRange(rowNum, 9).setValue('ERROR: ' + mailErr.toString().slice(0, 100));
    }
  }
  
  var summary = 'Hackathon Reminder Campaign completed!\n\n' +
    'Successfully Dispatched: ' + sentCount + '\n' +
    'Skipped (Already Sent): ' + skippedCount + '\n' +
    'Daily Quota Remaining: ' + MailApp.getRemainingDailyQuota();
  
  Logger.log(summary);
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * 7. Master HTML email builder for Hackathon Phase 1 Repo Reminder.
 */
function sendHackathonRepoReminderEmail(recipientEmail, participantName, teamName, vertical, problemStatementId) {
  var subject = 'IBM Qiskit Fall Fest 2026 — Action Required: Hackathon Phase 1 Submission & Public Repo Check (Tonight 11:59 PM IST)';
  
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
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · HACKATHON PHASE 1 SUBMISSION &amp; REPO CHECK'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="padding:32px 36px 36px 36px;">'
    + '<p style="margin:0 0 16px 0;font-size:16px;color:#231f20;font-weight:bold;">Dear ' + participantName + ' (Team: ' + teamName + '),</p>'
    + '<p style="margin:0 0 14px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'The online submission window for <strong>Phase 1 of the Flagship Quantum Hackathon</strong> at Partner Plus IBM Qiskit Fall Fest 2026 closes <strong>tonight, Saturday, 17 October 2026 at 11:59 PM IST</strong>.'
    + '</p>'
    + '<p style="margin:0 0 24px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'Whether your team has already submitted or is putting the finishing touches on your solution, please read this notification carefully to ensure your work is evaluated by our academic and IBM review panel.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f4;border:1px solid #dfcfb9;border-top:4px solid #7c1415;border-radius:8px;margin:24px 0 28px 0;"><tr>'
    + '<td style="padding:26px 24px;text-align:center;">'
    + '<div style="display:inline-block;background-color:#faefe0;border:1px solid #d9be97;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#7c1415;margin-bottom:12px;">Final Hours · Phase 1 Submission Arena</div>'
    + '<h2 style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:22px;color:#7c1415;font-weight:bold;line-height:1.3;">Repository Submission &amp; Verification</h2>'
    + '<p style="margin:0 0 6px 0;font-size:14px;color:#554c4a;">Qualify for Phase 2 On-Campus Shortlisting · &#8377;1,00,000+ Prize Pool · Industry Internships</p>'
    + '<p style="margin:0 0 20px 0;font-size:14.5px;color:#7c1415;font-weight:bold;">Final Deadline: Tonight · Saturday, 17 October 2026 · 11:59 PM IST</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>'
    + '<td align="center" style="border-radius:6px;background-color:#7c1415;">'
    + '<a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;border:1px solid #630e10;">Open Hackathon Arena &rarr;</a>'
    + '</td></tr></table>'
    + '<p style="margin:16px 0 0 0;font-size:12px;color:#7d726e;">Direct link: <a href="https://www.qffsrmap2026.com/learning/hackathon" style="color:#7c1415;text-decoration:underline;">https://www.qffsrmap2026.com/learning/hackathon</a></p>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px 0;">'
    + '<tr><td style="padding-bottom:16px;">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f7f3;border:1px solid #c2e0cf;border-left:4px solid #1e7e45;border-radius:8px;padding:18px 20px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1e7e45;margin-bottom:4px;">Already Submitted? (Critical Public Visibility Check)</div>'
    + '<div style="font-size:16px;font-weight:bold;color:#1e7e45;margin-bottom:8px;">Ensure Your Repository is Set to &quot;Public&quot;</div>'
    + '<p style="margin:0 0 10px 0;font-size:14px;color:#2c4033;line-height:1.6;">Several submitted repositories are currently set to <strong>Private</strong>. If your repository is private, our evaluation panel cannot open your code and will receive a <code>404 Not Found</code> error.</p>'
    + '<ul style="margin:0 0 8px 0;padding-left:20px;font-size:13.5px;color:#2c4033;line-height:1.6;">'
    + '<li><strong>The Incognito Test:</strong> Open your repository link in an <strong>Incognito / Private browser tab</strong> (while logged out of GitHub/GitLab). If you can view your code and README without logging in, your repo is properly public.</li>'
    + '<li><strong>Latest Commits Pushed?</strong> Ensure all your circuits, code, and documentation are committed and pushed to your remote <code>main</code> branch before midnight.</li>'
    + '<li><strong>Updates Allowed:</strong> You can edit your submitted repository URL or notes on the arena anytime before 11:59 PM IST tonight.</li>'
    + '</ul></td></tr></table></td></tr>'
    + '<tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fdf6ed;border:1px solid #f0d5b5;border-left:4px solid #b97e3e;border-radius:8px;padding:18px 20px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Yet to Submit? (Action Mandatory)</div>'
    + '<div style="font-size:16px;font-weight:bold;color:#7c1415;margin-bottom:8px;">Submit Your Repository Link Before 11:59 PM IST</div>'
    + '<p style="margin:0 0 10px 0;font-size:14px;color:#4f3d2a;line-height:1.6;">To be considered for the Phase 2 on-campus hackathon, prize pool of &#8377;1,00,000+, and certificates of achievement, your team must submit your repository URL on the Hackathon Arena tonight.</p>'
    + '<ul style="margin:0;padding-left:20px;font-size:13.5px;color:#4f3d2a;line-height:1.6;">'
    + '<li><strong>Any Teammate Can Submit:</strong> Either the Team Leader or any accepted Team Member can submit the repository link on behalf of the whole team.</li>'
    + '<li><strong>Host on Git:</strong> Upload your code to a public <strong>GitHub</strong>, <strong>GitLab</strong>, or <strong>Hugging Face</strong> repository.</li>'
    + '<li><strong>Submit Link:</strong> Go to <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning/hackathon</a>, paste your public repo URL, and click &quot;Submit Repository&quot;.</li>'
    + '</ul></td></tr></table></td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;"><tr><td style="border-bottom:1px solid #ebd9c2;"></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:20px;color:#7c1415;font-weight:bold;">Evaluation Rubric &amp; Repository Checklist</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:18px 20px;margin:0 0 28px 0;">'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">1. Comprehensive README.md:</strong> Problem statement overview, proposed quantum architecture, choice of algorithms (VQE, QAOA, QSVM, Grover, etc.), and team members&apos; contributions.</td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">2. Working Circuit Code &amp; Notebooks:</strong> Clean Python files (<code>.py</code>) or well-documented Jupyter notebooks (<code>.ipynb</code>) containing Qiskit circuit implementations, simulation outputs, and result charts.</td></tr>'
    + '<tr><td style="padding:8px 0 0 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">3. Reproducibility:</strong> Dependencies file (<code>requirements.txt</code> or environment specs) and clear setup steps so evaluators can run your code.</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:20px;margin:0 0 32px 0;"><tr><td>'
    + '<h3 style="margin:0 0 6px 0;font-size:16px;color:#7c1415;font-weight:bold;">Need Assistance or Encountering Submission Errors?</h3>'
    + '<p style="margin:0 0 14px 0;font-size:14px;color:#4f443b;line-height:1.6;">Our technical committee and student organizers are active on WhatsApp to assist with team rosters, submission glitches, and public repository checks:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#2a6a43;border-radius:6px;">'
    + '<a href="https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW" target="_blank" style="display:inline-block;padding:11px 22px;font-size:13.5px;font-weight:bold;color:#ffffff;text-decoration:none;">Join Official WhatsApp Community &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
    + '<p style="margin:0 0 14px 0;font-size:14.5px;color:#3d3635;line-height:1.7;">Shortlisted Phase 1 teams will be announced on the portal and invited to the 24-hour physical on-campus Hackathon Phase 2 on <strong>27–28 October 2026</strong> at SRM University-AP.</p>'
    + '<p style="margin:0 0 26px 0;font-size:14.5px;color:#3d3635;line-height:1.7;">We encourage every participant to double-check their repository access tonight. Best of luck with your submissions!</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 10px 0;"><tr><td style="border-left:3px solid #7c1415;padding-left:14px;">'
    + '<p style="margin:0;font-size:14.5px;color:#231f20;line-height:1.5;">Best regards,<br><strong>Hackathon Technical Committee</strong><br>Partner Plus IBM Qiskit Fall Fest 2026<br>Department of Computer Science &amp; Engineering<br>SRM University-AP</p>'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:22px 36px;text-align:center;">'
    + '<p style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:13px;color:#7c1415;font-weight:bold;">Partner Plus IBM Qiskit Fall Fest 2026</p>'
    + '<p style="margin:0 0 10px 0;font-size:12px;color:#6b625b;">Department of Computer Science &amp; Engineering, SRM University-AP</p>'
    + '<p style="margin:0;font-size:12px;color:#857a73;">Hackathon Arena: <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning/hackathon</a> &nbsp;·&nbsp; Learning Portal: <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning</a></p>'
    + '</td></tr></table></body></html>';
  
  GmailApp.sendEmail(recipientEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: 'Qiskit Fall Fest 2026'
  });
}

// ============================================================================
// VERIFIED MASTERCLASS CERTIFICATE (₹99) EMAIL CAMPAIGN
// ============================================================================

/**
 * 7. Automatically creates and formats the 'Certificate_Recipients' tab.
 */
function setupCertificateRecipientsSheet() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    try {
      SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    } catch (e) {}
    return;
  }
  
  var sheet = ss.getSheetByName('Certificate_Recipients');
  if (!sheet) {
    sheet = ss.insertSheet('Certificate_Recipients');
    sheet.appendRow([
      'Email',
      'Full Name',
      'Institution',
      'Phone',
      'Quizzes_Passed',
      'Certificate_Email_Status'
    ]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#7c1415').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert(
      'Sheet "Certificate_Recipients" created successfully!\n\n' +
      'RECOMMENDED: For the 220 pre-qualified students, open:\n' +
      '"C:\\Users\\sahgy\\Downloads\\certificate_recipients_qualified_220.csv"\n\n' +
      'Copy the recipient rows and paste them into this sheet (Columns A to F). Then click:\n' +
      'Qiskit Fall Fest 2026 -> 9. Start Certificate Campaign (5/5 Qualified Only - 220 students)'
    );
  } else {
    SpreadsheetApp.getUi().alert('Sheet "Certificate_Recipients" already exists.');
  }
}

/**
 * 8. Dispatches a single test copy of the Certificate Announcement email to sahgyan9@gmail.com.
 */
function sendTestCertificateEmail() {
  var testEmail = 'sahgyan9@gmail.com';
  try {
    sendCertificateAnnouncementEmail(
      testEmail,
      'Gyan Kumar Sah (Test Mode)',
      '5/5 (Qualified)'
    );
    SpreadsheetApp.getUi().alert('Test certificate announcement email successfully dispatched to ' + testEmail + '!\nPlease check your inbox.');
  } catch (err) {
    SpreadsheetApp.getUi().alert('Failed to send test email: ' + err.toString());
  }
}

/**
 * 9. Batched campaign dispatcher ONLY for pre-qualified students (5/5 or 6/5 quizzes passed).
 * Recommended first run: Consumes exactly ~220 email quota with 100% conversion readiness.
 */
function startQualifiedOnlyCertificateCampaign() {
  executeCertificateEmailCampaign(true);
}

/**
 * 10. Batched campaign dispatcher for ALL students in the Certificate_Recipients sheet.
 */
function startCertificateEmailCampaign() {
  executeCertificateEmailCampaign(false);
}

function executeCertificateEmailCampaign(qualifiedOnly) {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('Certificate_Recipients');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please run "7. Setup Certificate_Recipients Sheet" first.');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('The sheet "Certificate_Recipients" has no recipient rows. Please paste the recipient data from your Downloads folder first.');
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
  var nonQualifiedSkipped = 0;
  
  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var email = String(data[i][0]).trim().toLowerCase();
    var rawName = String(data[i][1]).trim();
    var quizzesPassed = String(data[i][4] || '').trim();
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

    var isQualified = quizzesPassed.indexOf('Qualified') !== -1 ||
                      quizzesPassed.indexOf('5/5') !== -1 ||
                      quizzesPassed.indexOf('6/5') !== -1 ||
                      quizzesPassed.indexOf('6/6') !== -1;

    if (qualifiedOnly && !isQualified) {
      nonQualifiedSkipped++;
      continue;
    }
    
    if (MailApp.getRemainingDailyQuota() <= 2) {
      Logger.log('Quota limit hit during batch. Stopping cleanly.');
      break;
    }

    var cleanName = rawName;
    if (!cleanName || /^\d/.test(cleanName) || cleanName.length < 2) {
      cleanName = 'Participant';
    }
    
    try {
      sendCertificateAnnouncementEmail(email, cleanName, quizzesPassed);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.getRange(rowNum, 6).setValue('SENT (' + timestamp + ' IST)');
      sentCount++;
      Utilities.sleep(1000); // Respect Google Workspace mail rate limit
    } catch (mailErr) {
      sheet.getRange(rowNum, 6).setValue('ERROR: ' + mailErr.toString().slice(0, 100));
    }
  }
  
  var summary = 'Certificate Campaign (' + (qualifiedOnly ? '5/5 Qualified Only' : 'All Recipients') + ') run completed!\n\n' +
    'Successfully Dispatched: ' + sentCount + '\n' +
    'Skipped (Already Sent): ' + skippedCount + '\n' +
    (qualifiedOnly ? ('Skipped (In Progress / Unstarted): ' + nonQualifiedSkipped + '\n') : '') +
    'Daily Quota Remaining: ' + MailApp.getRemainingDailyQuota();
  
  Logger.log(summary);
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * Master HTML email builder for the Verified Masterclass Certificate (₹99).
 */
function sendCertificateAnnouncementEmail(recipientEmail, participantName, quizzesPassed) {
  var isQualified = String(quizzesPassed || '').indexOf('Qualified') !== -1 ||
                    String(quizzesPassed || '').indexOf('5/5') !== -1 ||
                    String(quizzesPassed || '').indexOf('6/6') !== -1;

  var subject = isQualified
    ? 'IBM Qiskit Fall Fest 2026 — You are Qualified to Claim Your Verified Course Certificate'
    : 'IBM Qiskit Fall Fest 2026 — Masterclass Completion & Verified Academic Certificate (₹99)';

  var statusBox = '';
  if (isQualified) {
    statusBox = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:16px 20px;margin:20px 0 28px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#16a34a;margin-bottom:4px;">Curriculum Status: Pre-Qualified</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#166534;margin-bottom:6px;">All Quizzes Passed (' + (quizzesPassed || '5/5') + ')</div>'
      + '<p style="margin:0;font-size:14px;color:#14532d;line-height:1.6;">Our records indicate that you have successfully completed all required curriculum sessions and quizzes. You can proceed directly to verify your payment and generate your official credential immediately.</p>'
      + '</td></tr></table>';
  } else {
    var progressLabel = quizzesPassed ? quizzesPassed : 'In Progress';
    statusBox = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #d97706;border-radius:8px;padding:16px 20px;margin:20px 0 28px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#d97706;margin-bottom:4px;">Curriculum Progress Track</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#92400e;margin-bottom:6px;">Quizzes Passed: ' + progressLabel + ' (Requirement: 5/5)</div>'
      + '<p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;">You can watch any remaining recorded masterclasses and complete the short concept check quizzes on the portal at your own pace. Once all 5 are marked passed, your certificate unlock will activate automatically.</p>'
      + '</td></tr></table>';
  }

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
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · VERIFIED COURSE COMPLETION CERTIFICATE'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="padding:32px 36px 36px 36px;">'
    + '<p style="margin:0 0 16px 0;font-size:16px;color:#231f20;font-weight:bold;">Dear ' + participantName + ',</p>'
    + '<p style="margin:0 0 14px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'Thank you for participating in <strong>Partner Plus IBM Qiskit Fall Fest 2026</strong> at SRM University-AP. With the conclusion of our online masterclasses and challenge tracks, all enrolled participants are invited to complete their curriculum requirements and claim their official <strong>Verified Certificate of Course Completion</strong>.'
    + '</p>'
    + statusBox
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f4;border:1px solid #dfcfb9;border-top:4px solid #7c1415;border-radius:8px;margin:0 0 28px 0;"><tr>'
    + '<td style="padding:26px 24px;text-align:center;">'
    + '<div style="display:inline-block;background-color:#faefe0;border:1px solid #d9be97;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#7c1415;margin-bottom:12px;">Official IBM &amp; SRM University-AP Credential</div>'
    + '<h2 style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:22px;color:#7c1415;font-weight:bold;line-height:1.3;">Verified Certificate of Course Completion — &#8377;99</h2>'
    + '<p style="margin:0 0 6px 0;font-size:14px;color:#554c4a;">Co-Certified Credential · SHA-256 Tamper-Proof Hash · Unique Serial Identifier · Public Verification Link</p>'
    + '<p style="margin:0 0 20px 0;font-size:14px;color:#7c1415;font-weight:bold;">Available via In-Person Valedictory Hand-Over OR High-Resolution Email Dispatch</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>'
    + '<td align="center" style="border-radius:6px;background-color:#7c1415;">'
    + '<a href="https://www.qffsrmap2026.com/learning?certificate=true" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;border:1px solid #630e10;">Claim Certificate on Learning Portal &rarr;</a>'
    + '</td></tr></table>'
    + '<p style="margin:16px 0 0 0;font-size:12px;color:#7d726e;">Direct portal link: <a href="https://www.qffsrmap2026.com/learning?certificate=true" style="color:#7c1415;text-decoration:underline;">https://www.qffsrmap2026.com/learning?certificate=true</a></p>'
    + '</td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:20px;color:#7c1415;font-weight:bold;">Credential Specifications &amp; Inclusions</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:18px;"></div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 26px 0;">'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 12px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Academic Authority</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Dual Institutional Co-Certification</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Jointly conferred by IBM Quantum / Qiskit Fall Fest and School of Engineering and Sciences, SRM University-AP.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 12px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Security &amp; Integrity</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">SHA-256 Cryptographic Hash</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Canonical serial number (<code>QFF26-MCL-202610-XXXX</code>) and tamper-proof verification hash stored immutably in Supabase.</div>'
    + '</td></tr></table></td></tr>'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Public URL</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Permanent Verification Page</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Shareable 24/7 link on LinkedIn, GitHub, and resumes for instant recruiter and admissions verification.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 0 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Delivery Options</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Ceremony Hand-Over or Email</div>'
    + '<div style="font-size:13.5px;color:#554c4a;line-height:1.5;">Collect in person at the valedictory ceremony on 30 October, or receive digitally signed PDF by email.</div>'
    + '</td></tr></table></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:20px;color:#7c1415;font-weight:bold;">Curriculum Sessions Covered</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border:1px solid #e7dcce;border-radius:8px;overflow:hidden;margin:0 0 28px 0;font-size:13px;">'
    + '<tr style="background-color:#7c1415;color:#ffffff;">'
    + '<th style="padding:10px 14px;text-align:left;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;">Session ID</th>'
    + '<th style="padding:10px 14px;text-align:left;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;">Topic &amp; Domain Focus</th>'
    + '<th style="padding:10px 14px;text-align:left;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;">Distinguished Speaker(s)</th>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;">'
    + '<td style="padding:11px 14px;font-weight:bold;color:#7c1415;vertical-align:top;">Session 1</td>'
    + '<td style="padding:11px 14px;color:#231f20;vertical-align:top;"><strong>Introduction to Qiskit &amp; Quantum Computing</strong><br><span style="font-size:12px;color:#6b625b;">Part 1 &amp; 2: Qiskit SDK &amp; Quantum Foundations<br>Part 3: Quantum Material</span></td>'
    + '<td style="padding:11px 14px;color:#334155;vertical-align:top;"><strong>Raghav Singla</strong> (Application Developer, IBM)<br><strong>Jayakumar Vaithiyashankar</strong> (Founder / CEO, Anuthantra)<br><strong>Dr. Jagrati Dwivedi</strong> (QMD Foundation, NQM at IIT Delhi)</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;background-color:#fcfaf7;">'
    + '<td style="padding:11px 14px;font-weight:bold;color:#7c1415;vertical-align:top;">Session 3</td>'
    + '<td style="padding:11px 14px;color:#231f20;vertical-align:top;"><strong>Qubit Connectivity &amp; Architecture</strong></td>'
    + '<td style="padding:11px 14px;color:#334155;vertical-align:top;"><strong>Karthikganesh Durai</strong> (Associate Director - Business Analysis at NTT DATA)</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;">'
    + '<td style="padding:11px 14px;font-weight:bold;color:#7c1415;vertical-align:top;">Session 4</td>'
    + '<td style="padding:11px 14px;color:#231f20;vertical-align:top;"><strong>Quantum Sensing &amp; Quantum Optics</strong><br><span style="font-size:12px;color:#6b625b;">Session 4A: Quantum Sensing<br>Session 4B: Quantum Optics</span></td>'
    + '<td style="padding:11px 14px;color:#334155;vertical-align:top;"><strong>Prof. Durga B Rao Dasari</strong> (Director Quantum Software Division at Qbit Force)<br><strong>Dr. Gangi Reddy Salla</strong> (Associate Professor, SRM University-AP)</td>'
    + '</tr>'
    + '<tr style="border-bottom:1px solid #f0e6db;background-color:#fcfaf7;">'
    + '<td style="padding:11px 14px;font-weight:bold;color:#7c1415;vertical-align:top;">Session 5</td>'
    + '<td style="padding:11px 14px;color:#231f20;vertical-align:top;"><strong>Quantum Machine Learning</strong></td>'
    + '<td style="padding:11px 14px;color:#334155;vertical-align:top;"><strong>Jay Shah</strong> (Senior Quantum Machine Learning Engineer, BQP)</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:11px 14px;font-weight:bold;color:#7c1415;vertical-align:top;">Session 6</td>'
    + '<td style="padding:11px 14px;color:#231f20;vertical-align:top;"><strong>Quantum Cyber Security / Cryptography</strong></td>'
    + '<td style="padding:11px 14px;color:#334155;vertical-align:top;"><strong>Dr. Sazzad Ali Biswas</strong> (Assistant Professor, SRM University-AP)</td>'
    + '</tr>'
    + '</table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:20px;color:#7c1415;font-weight:bold;">How to Claim Your Verified Certificate</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:18px 20px;margin:0 0 32px 0;">'
    + '<tr><td style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#b97e3e;padding-bottom:12px;">Certificate Issuance Protocol</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 1:</strong> Visit <a href="https://www.qffsrmap2026.com/learning?certificate=true" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning?certificate=true</a> and sign in with Google.</td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 2:</strong> Under <strong>&quot;Curriculum Sessions&quot;</strong>, ensure all 5 lecture videos are completed and quizzes passed (minimum 75% score; unlimited retakes).</td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px;color:#3d3635;line-height:1.6;border-bottom:1px solid #eee4d7;"><strong style="color:#7c1415;">Step 3:</strong> Click the <strong>&quot;Claim Verified Certificate&quot;</strong> button, select your delivery preference (<strong>Ceremony</strong> or <strong>Email</strong>), and click <strong>&quot;Pay &#8377;99 on University Gateway&quot;</strong> to open SRM University-AP\'s Easebuzz portal. Complete payment and download your receipt.</td></tr>'
    + '<tr><td style="padding:8px 0 0 0;font-size:14px;color:#3d3635;line-height:1.6;"><strong style="color:#7c1415;">Step 4:</strong> Enter your <strong>Easebuzz Transaction ID</strong> (e.g. <code>E26101518BKHN3</code>) and upload your payment receipt screenshot or PDF. Once confirmed, your official certificate will be minted and available for download.</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border-left:4px solid #b97e3e;border-radius:0 6px 6px 0;margin:0 0 32px 0;"><tr>'
    + '<td style="padding:16px 20px;font-size:13.5px;color:#4f443b;line-height:1.65;">'
    + '<div style="font-weight:bold;color:#7c1415;margin-bottom:6px;font-size:14px;">Important Scope &amp; Fee Integrity Notice:</div>'
    + 'Online participation in all masterclasses, quizzes, and competitions is <strong>100% FREE</strong>. The <strong>&#8377;99 fee</strong> is strictly an optional verification and certificate issuance charge. Please note that the <strong>General Offline Pass (&#8377;99)</strong> and the <strong>Masterclass Certificate (&#8377;99)</strong> are two distinct purchases. Each purchase requires its own separate Easebuzz transaction ID (one transaction ID covers exactly one purchase, enforced by university database rules).'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:20px;margin:0 0 32px 0;"><tr><td>'
    + '<h3 style="margin:0 0 6px 0;font-size:16px;color:#7c1415;font-weight:bold;">Official Participant Support &amp; Community</h3>'
    + '<p style="margin:0 0 14px 0;font-size:14px;color:#4f443b;line-height:1.6;">For questions regarding quiz evaluations, transaction verification, or certificate delivery, join our verified WhatsApp Community or email the academic committee:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#2a6a43;border-radius:6px;">'
    + '<a href="https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW" target="_blank" style="display:inline-block;padding:11px 22px;font-size:13.5px;font-weight:bold;color:#ffffff;text-decoration:none;">Join Official WhatsApp Community &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
    + '<p style="margin:0 0 14px 0;font-size:14.5px;color:#3d3635;line-height:1.7;">Congratulations on your dedication to mastering quantum computing with IBM Qiskit and SRM University-AP.</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 10px 0;"><tr><td style="border-left:3px solid #7c1415;padding-left:14px;">'
    + '<p style="margin:0;font-size:14.5px;color:#231f20;line-height:1.5;">Best regards,<br><strong>Academic Certification Committee</strong><br>Partner Plus IBM Qiskit Fall Fest 2026<br>Department of Physics &amp; School of Engineering and Sciences<br>SRM University-AP</p>'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:22px 36px;text-align:center;">'
    + '<p style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:13px;color:#7c1415;font-weight:bold;">Partner Plus IBM Qiskit Fall Fest 2026</p>'
    + '<p style="margin:0 0 10px 0;font-size:12px;color:#6b625b;">Department of Physics &amp; School of Engineering and Sciences, SRM University-AP</p>'
    + '<p style="margin:0;font-size:12px;color:#857a73;">Learning Portal: <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning</a> &nbsp;·&nbsp; Certificate Verification: <a href="https://www.qffsrmap2026.com/verify-certificate" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/verify-certificate</a> &nbsp;·&nbsp; Contact: <a href="mailto:qiskitfallfest@srmap.edu.in" style="color:#7c1415;text-decoration:underline;">qiskitfallfest@srmap.edu.in</a></p>'
    + '</td></tr></table></body></html>';

  GmailApp.sendEmail(recipientEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: 'Qiskit Fall Fest 2026'
  });
}

// ============================================================================
// HACKATHON PHASE 1 SHORTLISTED FINALISTS EMAIL CAMPAIGN
// ============================================================================

/**
 * 11. Automatically creates and formats the 'Hackathon_Finalists_Recipients' tab.
 */
function setupHackathonFinalistsSheet() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    try {
      SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    } catch (e) {}
    return;
  }
  
  var sheet = ss.getSheetByName('Hackathon_Finalists_Recipients');
  if (!sheet) {
    sheet = ss.insertSheet('Hackathon_Finalists_Recipients');
    sheet.appendRow([
      'Email',
      'Full Name',
      'Role',
      'Team Name',
      'Category',
      'Desk',
      'Track',
      'Institution',
      'Score',
      'Offer_Status',
      'Finalist_Email_Status'
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#7c1415').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert(
      'Sheet "Hackathon_Finalists_Recipients" created successfully!\n\n' +
      'Next Step: Open "C:\\Users\\sahgy\\Downloads\\hackathon_backend_65_teams_276_members.csv", copy the recipient data (Columns A to J), and paste it into this sheet. Then click:\n\n' +
      'Qiskit Fall Fest 2026 -> 13. Start Hackathon Finalists Email Campaign'
    );
  } else {
    SpreadsheetApp.getUi().alert('Sheet "Hackathon_Finalists_Recipients" already exists.');
  }
}

/**
 * 12. Dispatches a single test copy of the Hackathon Finalist email to sahgyan9@gmail.com.
 */
function sendTestHackathonFinalistEmail() {
  var testEmail = 'sahgyan9@gmail.com';
  try {
    sendHackathonFinalistEmail(
      testEmail,
      'Gyan Kumar Sah (Test)',
      'Team Leader',
      'Qspark',
      'External',
      'Desk EXT-01',
      'Quantum Optimization',
      'University College of Engineering Narasaraopet - JNTUK',
      '98.2',
      'invited'
    );
    SpreadsheetApp.getUi().alert('Test Hackathon Finalist email successfully dispatched to ' + testEmail + '!\nPlease check your inbox.');
  } catch (err) {
    SpreadsheetApp.getUi().alert('Failed to send test email: ' + err.toString());
  }
}

/**
 * 13. Batched campaign dispatcher for all shortlisted hackathon finalists with safety quota check.
 * Dynamically resolves columns from sheet headers (compatible with 10 or 12 column CSV imports).
 * Targets all invited and accepted participants while automatically skipping declined offers.
 */
function startHackathonFinalistsEmailCampaign() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('Hackathon_Finalists_Recipients') || ss.getActiveSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please open or create the "Hackathon_Finalists_Recipients" sheet first.');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('The active sheet has no recipient rows. Please paste the recipient data from your Downloads folder first.');
    return;
  }
  
  var headerMap = getHeaderMap(sheet);
  
  // Dynamically resolve columns (1-based index)
  var colEmail = headerMap['email'] || 1;
  var colName = headerMap['full name'] || headerMap['name'] || 2;
  var colRole = headerMap['role'] || 3;
  var colTeam = headerMap['team name'] || headerMap['team'] || 4;
  var colCat = headerMap['category'] || 5;
  var colDesk = headerMap['desk'] || 6;
  var colTrack = headerMap['track'] || 7;
  var colInst = headerMap['institution'] || headerMap['college'] || 8;
  var colScore = headerMap['score'] || 9;
  var colOfferStatus = headerMap['offer_status'] || headerMap['offer status'] || -1;
  var colMemberStatus = headerMap['member_status'] || headerMap['member status'] || -1;
  var statusCol = getOrCreateColumn(sheet, 'Finalist_Email_Status');
  
  // Smart auto-detection guardrail:
  // If Column J header was labeled 'Finalist_Email_Status' but row 2 contains 'invited' or 'accepted',
  // automatically re-label Column J to 'Offer_Status' and create 'Finalist_Email_Status' in Column K.
  if (colOfferStatus === -1 && lastRow >= 2) {
    var sampleVal = String(sheet.getRange(2, statusCol).getValue() || '').trim().toLowerCase();
    if (sampleVal === 'invited' || sampleVal === 'accepted' || sampleVal === 'declined') {
      colOfferStatus = statusCol;
      sheet.getRange(1, statusCol).setValue('Offer_Status');
      statusCol = getOrCreateColumn(sheet, 'Finalist_Email_Status');
    }
  }
  
  var quotaRemaining = MailApp.getRemainingDailyQuota();
  if (quotaRemaining < 5) {
    SpreadsheetApp.getUi().alert('Daily Gmail sending quota reached (' + quotaRemaining + ' left). Please try again tomorrow.');
    return;
  }
  
  var lastCol = sheet.getLastColumn();
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var sentCount = 0;
  var skippedCount = 0;
  var declinedCount = 0;
  
  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var row = data[i];
    
    var email = String(row[colEmail - 1] || '').trim().toLowerCase();
    var name = String(row[colName - 1] || '').trim() || 'Innovator';
    var role = String(row[colRole - 1] || '').trim() || 'Team Member';
    var teamName = String(row[colTeam - 1] || '').trim() || 'Your Team';
    var category = String(row[colCat - 1] || '').trim() || 'Auditorium Finalist';
    var desk = String(row[colDesk - 1] || '').trim() || 'Phase 2 Finalist';
    var track = String(row[colTrack - 1] || '').trim() || 'Quantum Computing';
    var institution = String(row[colInst - 1] || '').trim() || 'SRM University-AP';
    var score = String(row[colScore - 1] || '').trim() || 'Evaluated';
    
    var offerStatus = colOfferStatus !== -1 ? String(row[colOfferStatus - 1] || '').trim().toLowerCase() : '';
    var memberStatus = colMemberStatus !== -1 ? String(row[colMemberStatus - 1] || '').trim().toLowerCase() : '';
    var currentStatus = String(row[statusCol - 1] || '').trim();
    
    if (!email || email.indexOf('@') === -1) {
      sheet.getRange(rowNum, statusCol).setValue('SKIPPED (Invalid Email)');
      continue;
    }
    
    // Deduplication check: Never re-send to anyone already marked SENT
    if (currentStatus.indexOf('SENT') !== -1) {
      skippedCount++;
      continue;
    }
    
    // Skip explicitly declined teams or members
    if (offerStatus === 'declined' || memberStatus === 'declined') {
      sheet.getRange(rowNum, statusCol).setValue('SKIPPED (Offer/Member Declined)');
      declinedCount++;
      continue;
    }
    
    if (MailApp.getRemainingDailyQuota() <= 2) {
      Logger.log('Quota limit reached during batch. Stopping cleanly.');
      break;
    }
    
    try {
      sendHackathonFinalistEmail(email, name, role, teamName, category, desk, track, institution, score, offerStatus);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      sheet.getRange(rowNum, statusCol).setValue('SENT (' + timestamp + ' IST)');
      sentCount++;
      Utilities.sleep(1000); // Polite rate limit
    } catch (mailErr) {
      sheet.getRange(rowNum, statusCol).setValue('ERROR: ' + mailErr.toString().slice(0, 100));
    }
  }
  
  var summary = 'Hackathon Finalists Campaign run completed!\n\n' +
    'Successfully Dispatched: ' + sentCount + '\n' +
    'Skipped (Already Sent): ' + skippedCount + '\n' +
    'Skipped (Declined): ' + declinedCount + '\n' +
    'Daily Quota Remaining: ' + MailApp.getRemainingDailyQuota();
  
  Logger.log(summary);
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * 14. Master HTML email builder for Hackathon Phase 1 Shortlisted Finalists.
 * Structured as an Official Selection Notice & Academic Letter of Selection for colleges and faculty.
 */
function sendHackathonFinalistEmail(recipientEmail, participantName, role, teamName, category, desk, track, institution, score, offerStatus) {
  var subject = 'IBM Qiskit Fall Fest 2026 — Official Selection Letter: Hackathon Phase 2 On-Campus Finals (28–29 Oct)';
  
  var isLeader = (String(role).toLowerCase().indexOf('leader') !== -1);
  var isAccepted = (String(offerStatus).toLowerCase() === 'accepted');
  
  var statusBadgeText = isAccepted ? 'CONFIRMED SELECTION · PHASE 2 DESK ACTIVE' : 'OFFICIAL SELECTION · PHASE 2 INVITATION ACTIVE';
  var statusBadgeColor = isAccepted ? '#1e7e45' : '#7c1415';
  
  var roleNoticeHtml = '';
  if (isLeader) {
    if (isAccepted) {
      roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f7f3;border:1px solid #c2e0cf;border-left:4px solid #1e7e45;border-radius:8px;padding:18px 20px;margin:0 0 28px 0;">'
        + '<tr><td>'
        + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1e7e45;margin-bottom:4px;">Action Status · Team Leader Update</div>'
        + '<div style="font-size:15.5px;font-weight:bold;color:#1e7e45;margin-bottom:8px;">Phase 2 Invitation Accepted &middot; Coordinate Passes</div>'
        + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#2c4033;line-height:1.65;">'
        + 'Your team has formally accepted the Phase 2 Invitation on the portal. Please ensure all your teammates log in to <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#1e7e45;font-weight:bold;">qffsrmap2026.com/learning/hackathon</a> and submit their &#8377;499 Flagship Pass receipt.'
        + '</p>'
        + '<p style="margin:0;font-size:13px;color:#2c4033;line-height:1.6;">'
        + '<strong>Leader Final Step:</strong> You will submit your own pass receipt last, which locks in your team\'s confirmed auditorium desk.'
        + '</p>'
        + '</td></tr></table>';
    } else {
      roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f7f3;border:1px solid #c2e0cf;border-left:4px solid #1e7e45;border-radius:8px;padding:18px 20px;margin:0 0 28px 0;">'
        + '<tr><td>'
        + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1e7e45;margin-bottom:4px;">Action Mandatory · Team Leader Responsibility</div>'
        + '<div style="font-size:15.5px;font-weight:bold;color:#1e7e45;margin-bottom:8px;">Step 1: Accept Phase 2 Invitation on Behalf of Your Team</div>'
        + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#2c4033;line-height:1.65;">'
        + 'As Team Leader, your invitation deadline has been extended until <strong>10:36 PM IST tonight (19 October 2026)</strong>. Sign into <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#1e7e45;font-weight:bold;">qffsrmap2026.com/learning/hackathon</a> and click <strong>"Accept Phase 2 Invitation"</strong>.'
        + '</p>'
        + '<p style="margin:0;font-size:13px;color:#2c4033;line-height:1.6;">'
        + 'This locks in your team\'s willingness to attend and unlocks the Flagship Pass checkout for your teammates.'
        + '</p>'
        + '</td></tr></table>';
    }
  } else {
    roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fdf6ed;border:1px solid #f0d5b5;border-left:4px solid #b97e3e;border-radius:8px;padding:18px 20px;margin:0 0 28px 0;">'
      + '<tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Action Required · Team Member Instruction</div>'
      + '<div style="font-size:15.5px;font-weight:bold;color:#7c1415;margin-bottom:8px;">Complete Your Flagship Pass on the Arena</div>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4f3d2a;line-height:1.65;">'
      + 'Log in to your portal dashboard at <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning/hackathon</a> using your registered Google email (' + recipientEmail + ') to complete and submit your &#8377;499 Flagship Pass.'
      + '</p>'
      + '<p style="margin:0;font-size:13px;color:#4f3d2a;line-height:1.6;">'
      + 'Your submission instantly updates your team\'s checklist. Coordinate with your Team Leader to ensure full roster verification.'
      + '</p>'
      + '</td></tr></table>';
  }

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
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · OFFICIAL SELECTION LETTER &amp; FINALIST INVITATION'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="padding:32px 36px 36px 36px;">'
    + '<p style="margin:0 0 16px 0;font-size:16px;color:#231f20;font-weight:bold;">Dear ' + participantName + ' (' + role + ' · Team: ' + teamName + '),</p>'
    + '<p style="margin:0 0 14px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'Congratulations! Following the comprehensive evaluation of <strong>129 competing teams across India</strong> by our academic jury and IBM review panel, your team has officially qualified and been selected as an <strong>Auditorium Finalist</strong> for Phase 2 of the Flagship Quantum Hackathon at <strong>Partner Plus IBM Qiskit Fall Fest 2026</strong>.'
    + '</p>'
    + '<p style="margin:0 0 22px 0;font-size:15px;color:#3d3635;line-height:1.7;">'
    + 'Your algorithm architecture, quantum circuit implementations, and technical documentation ranked among the top submissions nationwide. You are invited to compete in person at SRM University-AP during the 24-hour physical sprint for a total prize pool exceeding <strong>&#8377;1,00,000+</strong> and industrial internship opportunities.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;overflow:hidden;margin:0 0 24px 0;">'
    + '<tr style="background-color:#f3eae0;border-bottom:1px solid #e7dcce;">'
    + '<td colspan="2" style="padding:11px 18px;font-family:\'Georgia\',serif;font-size:13px;font-weight:bold;color:#7c1415;letter-spacing:0.8px;text-transform:uppercase;">Official Academic Selection Letter &amp; Finalist Dossier</td>'
    + '</tr>'
    + '<tr>'
    + '<td width="38%" style="padding:10px 18px;font-size:13px;color:#6b625b;border-bottom:1px solid #ebd9c2;font-weight:600;">Candidate Name:</td>'
    + '<td width="62%" style="padding:10px 18px;font-size:13.5px;color:#231f20;border-bottom:1px solid #ebd9c2;font-weight:bold;">' + participantName + ' (' + role + ')</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:10px 18px;font-size:13px;color:#6b625b;border-bottom:1px solid #ebd9c2;font-weight:600;">Selected Team Name:</td>'
    + '<td style="padding:10px 18px;font-size:13.5px;color:#7c1415;border-bottom:1px solid #ebd9c2;font-weight:bold;">' + teamName + '</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:10px 18px;font-size:13px;color:#6b625b;border-bottom:1px solid #ebd9c2;font-weight:600;">Official Qualification:</td>'
    + '<td style="padding:10px 18px;font-size:13px;color:#1e7e45;border-bottom:1px solid #ebd9c2;font-weight:bold;">Selected as Auditorium Finalist (' + category + ')</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:10px 18px;font-size:13px;color:#6b625b;border-bottom:1px solid #ebd9c2;font-weight:600;">Allocated Workstation:</td>'
    + '<td style="padding:10px 18px;font-size:13.5px;color:#7c1415;border-bottom:1px solid #ebd9c2;font-weight:bold;font-family:monospace;">' + desk + '</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:10px 18px;font-size:13px;color:#6b625b;border-bottom:1px solid #ebd9c2;font-weight:600;">Domain / Technical Track:</td>'
    + '<td style="padding:10px 18px;font-size:13px;color:#231f20;border-bottom:1px solid #ebd9c2;font-weight:600;">' + track + '</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:10px 18px;font-size:13px;color:#6b625b;font-weight:600;">Institution / College:</td>'
    + '<td style="padding:10px 18px;font-size:13.5px;color:#231f20;font-weight:600;">' + institution + '</td>'
    + '</tr>'
    + '</table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fcf9f4;border:1px solid #dfcfb9;border-top:4px solid #7c1415;border-radius:8px;margin:0 0 28px 0;"><tr>'
    + '<td style="padding:24px 22px;text-align:center;">'
    + '<div style="display:inline-block;background-color:#faefe0;border:1px solid #d9be97;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:' + statusBadgeColor + ';margin-bottom:10px;">' + statusBadgeText + '</div>'
    + '<h2 style="margin:0 0 8px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:22px;color:#7c1415;font-weight:bold;line-height:1.3;">Enter Hackathon Arena &amp; Confirm Desk</h2>'
    + '<p style="margin:0 0 6px 0;font-size:14px;color:#554c4a;">24-Hour Physical Sprint · SRM University-AP · &#8377;1,00,000+ Prize Pool · Industry Internships</p>'
    + '<p style="margin:0 0 8px 0;font-size:14px;color:#7c1415;font-weight:bold;">Hackathon Dates: 28 &amp; 29 October 2026 · Auditorium X-Lab</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px auto;background-color:#faefe0;border:1px solid #d9be97;border-radius:6px;"><tr>'
    + '<td style="padding:8px 16px;font-size:13px;color:#630e10;font-weight:bold;">Gate Entry &amp; Registration: 9:00 AM – 11:00 AM strictly (entry closes at 11:00 AM)</td>'
    + '</tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>'
    + '<td align="center" style="border-radius:6px;background-color:#7c1415;">'
    + '<a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.8px;text-transform:uppercase;border:1px solid #630e10;">Open Hackathon Arena &rarr;</a>'
    + '</td></tr></table>'
    + '<p style="margin:14px 0 0 0;font-size:12px;color:#7d726e;">Sign in with "Continue with Google" using: <strong style="color:#7c1415;">' + recipientEmail + '</strong></p>'
    + '</td></tr></table>'
    + roleNoticeHtml
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 22px 0;"><tr><td style="border-bottom:1px solid #ebd9c2;"></td></tr></table>'
    + '<h2 style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:20px;color:#7c1415;font-weight:bold;">Phase 2 Operational Protocol &amp; Inclusions</h2>'
    + '<div style="width:40px;height:2px;background-color:#b97e3e;margin-bottom:16px;"></div>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 12px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Hackathon Physical Sprint</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">28 &amp; 29 October 2026</div>'
    + '<div style="font-size:13px;color:#554c4a;line-height:1.55;">24-hour physical sprint in the Auditorium X-Lab with dedicated team desk, high-speed power strips, Gigabit Wi-Fi, and live IBM mentorship.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 12px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Campus Arrival &amp; Check-In</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">9:00 AM – 11:00 AM Strictly</div>'
    + '<div style="font-size:13px;color:#554c4a;line-height:1.55;">Registration desks and entry gates open strictly between 9:00 AM and 11:00 AM. After 11:00 AM the gate closes. Please arrive strictly on time if you plan to attend on that day.</div>'
    + '</td></tr></table></td></tr>'
    + '<tr><td width="50%" valign="top" style="padding:0 8px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Industry Co-Design</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">Problem Statement Refinement</div>'
    + '<div style="font-size:13px;color:#554c4a;line-height:1.55;">We are refining problem statements with our industry partner. While specific problem statements may be updated, the underlying quantum processor topology and architectures you worked with in Phase 1 remain the same.</div>'
    + '</td></tr></table></td>'
    + '<td width="50%" valign="top" style="padding:0 0 0 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf7f2;border:1px solid #e7dcce;border-radius:8px;padding:14px 16px;"><tr><td>'
    + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Outstation Logistics &amp; Accommodation</div>'
    + '<div style="font-size:14.5px;font-weight:bold;color:#231f20;margin-bottom:6px;">PG Assistance (~&#8377;500/day)</div>'
    + '<div style="font-size:13px;color:#554c4a;line-height:1.55;">Verified student PG accommodation arranged near campus by our hospitality team. Coordinate bookings and logistics assistance directly via the official WhatsApp Community.</div>'
    + '</td></tr></table></td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border-left:4px solid #7c1415;border-radius:0 6px 6px 0;margin:0 0 28px 0;"><tr>'
    + '<td style="padding:16px 20px;font-size:13.5px;color:#4f443b;line-height:1.65;">'
    + '<div style="font-weight:bold;color:#7c1415;margin-bottom:6px;font-size:14px;">All-Access Flagship Pass Privileges (&#8377;499 per member):</div>'
    + 'All shortlisted hackathon finalists must purchase the <strong>All-Access Flagship Pass (&#8377;499 per member)</strong> on the portal. Your pass includes:'
    + '<ul style="margin:8px 0 8px 18px;padding:0;">'
    + '<li><strong>Flagship Hackathon Phase 2:</strong> 24-hr physical sprint on <strong>28 &amp; 29 October</strong> with dedicated auditorium seating and IBM judging.</li>'
    + '<li><strong>Quantum Capture The Flag (QCTF):</strong> Full entry to the flagship cybersecurity competition on <strong>27 October</strong>.</li>'
    + '<li><strong>Quantum Startup Pitch Fest:</strong> Present your prototype and pitch directly to venture investors and incubation leaders.</li>'
    + '<li><strong>5-Day Catered Dining:</strong> Catered lunches and twice-daily refreshments across all five days (26–30 October).</li>'
    + '<li><strong>Daily Campus Entry:</strong> 9:00 AM – 11:00 AM strictly (registration desks close at 11:00 AM sharp).</li>'
    + '<li><strong>Do NOT purchase the &#8377;99 General Pass:</strong> The &#8377;99 pass is strictly for non-hackathon visitors and excludes sprint seating, QCTF, Pitch Fest, and meals.</li>'
    + '<li><strong>Easebuzz Single Payment Rule:</strong> One Easebuzz transaction ID covers exactly one pass purchase. Each teammate must make their own payment and upload their distinct receipt.</li>'
    + '</ul>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:20px;margin:0 0 30px 0;"><tr><td>'
    + '<h3 style="margin:0 0 6px 0;font-size:16px;color:#7c1415;font-weight:bold;">Official Finalists WhatsApp Community</h3>'
    + '<p style="margin:0 0 14px 0;font-size:13.5px;color:#4f443b;line-height:1.6;">'
    + 'Join our dedicated WhatsApp Community for instant coordination regarding PG accommodation, campus arrival directions, desk seating plans, and direct contact with track coordinators:'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#2a6a43;border-radius:6px;">'
    + '<a href="https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW" target="_blank" style="display:inline-block;padding:11px 22px;font-size:13.5px;font-weight:bold;color:#ffffff;text-decoration:none;">Join WhatsApp Community &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
    + '<p style="margin:0 0 16px 0;font-size:14.5px;color:#3d3635;line-height:1.7;">'
    + 'We look forward to seeing your team build on campus and present your solutions to our IBM and industry panel on 28–29 October. Congratulations once again on earning your place among the top quantum finalists in India.'
    + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 10px 0;"><tr><td style="border-left:3px solid #7c1415;padding-left:14px;">'
    + '<p style="margin:0;font-size:14.5px;color:#231f20;line-height:1.5;">Best regards,<br><strong>Hackathon Technical Committee &amp; Organizing Board</strong><br>Partner Plus IBM Qiskit Fall Fest 2026<br>Department of Computer Science &amp; Engineering<br>School of Engineering and Sciences, SRM University-AP</p>'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:22px 36px;text-align:center;">'
    + '<p style="margin:0 0 6px 0;font-family:\'Georgia\',\'Times New Roman\',serif;font-size:13px;color:#7c1415;font-weight:bold;">Partner Plus IBM Qiskit Fall Fest 2026</p>'
    + '<p style="margin:0 0 10px 0;font-size:12px;color:#6b625b;">SRM University-AP, Neerukonda, Mangalagiri Mandal, Andhra Pradesh 522240</p>'
    + '<p style="margin:0;font-size:12px;color:#857a73;">Hackathon Arena: <a href="https://www.qffsrmap2026.com/learning/hackathon" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning/hackathon</a> &nbsp;·&nbsp; Learning Portal: <a href="https://www.qffsrmap2026.com/learning" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning</a> &nbsp;·&nbsp; Contact: <a href="mailto:qiskitfallfest@srmap.edu.in" style="color:#7c1415;text-decoration:underline;">qiskitfallfest@srmap.edu.in</a></p>'
    + '</td></tr></table></body></html>';

  GmailApp.sendEmail(recipientEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: 'Qiskit Fall Fest 2026'
  });
}



// ============================================================================
// HACKATHON PHASE 2 PAYMENT REMINDER EMAIL CAMPAIGN
// ============================================================================

/**
 * 14. Automatically creates and formats the 'Payment_Reminder_Recipients' tab.
 */
function setupPaymentReminderSheet() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    try {
      SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    } catch (e) {}
    return;
  }
  
  var sheet = ss.getSheetByName('Payment_Reminder_Recipients');
  if (!sheet) {
    sheet = ss.insertSheet('Payment_Reminder_Recipients');
    sheet.appendRow([
      'Email',
      'Full Name',
      'Role',
      'Team Name',
      'Offer_Status',
      'Track',
      'Deadline',
      'Payment_Status',
      'Reminder_Category',
      'Email_Status'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#7c1415').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert(
      'Sheet "Payment_Reminder_Recipients" created successfully!\n\n' +
      'Next Step: Open "tools/payment_reminder_recipients.csv", copy the 99 recipient rows, and paste them into this sheet. Then click:\n\n' +
      'Qiskit Fall Fest 2026 -> 16. Start Hackathon Payment Reminder Campaign'
    );
  } else {
    SpreadsheetApp.getUi().alert('Sheet "Payment_Reminder_Recipients" already exists.');
  }
}

/**
 * 15. Dispatches a single test payment reminder email to sahgyan9@gmail.com.
 */
function sendTestPaymentReminderEmail() {
  var testEmail = 'sahgyan9@gmail.com';
  try {
    sendPaymentReminderEmail(
      testEmail,
      'Gyan Kumar Sah (Test)',
      'leader',
      'IgniteNova',
      'team_lead',
      '22 Oct 2026, 11:59 PM IST'
    );
    SpreadsheetApp.getUi().alert('Test Payment Reminder email successfully dispatched to ' + testEmail + '!\nPlease check your inbox.');
  } catch (err) {
    SpreadsheetApp.getUi().alert('Failed to send test email: ' + err.toString());
  }
}

/**
 * 16. Batched campaign dispatcher for the payment reminder cohort (99 recipients).
 */
function startPaymentReminderEmailCampaign() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert('Could not locate active Google Spreadsheet.');
    return;
  }
  
  var sheet = ss.getSheetByName('Payment_Reminder_Recipients') || ss.getActiveSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please open or create the "Payment_Reminder_Recipients" sheet first.');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('The active sheet has no recipient rows. Please paste the recipient data from tools/payment_reminder_recipients.csv first.');
    return;
  }
  
  var headerMap = getHeaderMap(sheet);
  var colEmail = headerMap['email'] || 1;
  var colName = headerMap['full name'] || headerMap['name'] || 2;
  var colRole = headerMap['role'] || 3;
  var colTeam = headerMap['team name'] || headerMap['team'] || 4;
  var colDeadline = headerMap['deadline'] || 7;
  var colCategory = headerMap['reminder_category'] || headerMap['category'] || 9;
  var colStatus = headerMap['email_status'] || 10;
  
  var dataRange = sheet.getRange(2, 1, lastRow - 1, Math.max(colStatus, 10));
  var values = dataRange.getValues();
  
  var remainingQuota = 0;
  try {
    remainingQuota = MailApp.getRemainingDailyQuota();
  } catch (e) {
    remainingQuota = 100;
  }
  
  var toProcess = 0;
  for (var i = 0; i < values.length; i++) {
    var status = String(values[i][colStatus - 1] || '').trim();
    if (!status || status.indexOf('Sent') === -1) {
      toProcess++;
    }
  }
  
  if (toProcess === 0) {
    SpreadsheetApp.getUi().alert('All recipients in this sheet have already been emailed.');
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    'Confirm Payment Reminder Email Campaign',
    'Found ' + toProcess + ' pending recipients.\n' +
    'Your remaining Gmail daily quota: ' + remainingQuota + ' emails.\n\n' +
    'Do you want to begin dispatching?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return;
  
  var sentCount = 0;
  var errorCount = 0;
  
  for (var j = 0; j < values.length; j++) {
    var currentStatus = String(values[j][colStatus - 1] || '').trim();
    if (currentStatus && currentStatus.indexOf('Sent') !== -1) continue;
    
    var email = String(values[j][colEmail - 1] || '').trim();
    var name = String(values[j][colName - 1] || '').trim() || email.split('@')[0];
    var role = String(values[j][colRole - 1] || '').trim() || 'member';
    var teamName = String(values[j][colTeam - 1] || '').trim();
    var deadline = String(values[j][colDeadline - 1] || '').trim() || '22 Oct 2026, 11:59 PM IST';
    var category = String(values[j][colCategory - 1] || '').trim() || 'unpaid_member';
    
    if (!email || email.indexOf('@') === -1) {
      sheet.getRange(j + 2, colStatus).setValue('Skipped: Invalid Email').setBackground('#fde8e8');
      continue;
    }
    
    try {
      sendPaymentReminderEmail(email, name, role, teamName, category, deadline);
      sheet.getRange(j + 2, colStatus).setValue('Sent at ' + new Date().toLocaleTimeString()).setBackground('#e6f4ea');
      sentCount++;
      Utilities.sleep(400); // safety throttle
    } catch (err) {
      sheet.getRange(j + 2, colStatus).setValue('Error: ' + err.toString().slice(0, 80)).setBackground('#fce8e6');
      errorCount++;
    }
  }
  
  SpreadsheetApp.getUi().alert(
    'Campaign Complete!\n\n' +
    'Successfully sent: ' + sentCount + '\n' +
    'Errors: ' + errorCount
  );
}

/**
 * Dispatches a single formatted payment reminder email via GmailApp.
 */
function sendPaymentReminderEmail(recipientEmail, participantName, role, teamName, category, deadline) {
  var portalUrl = 'https://www.qffsrmap2026.com/learning#campus-pass';
  var arenaUrl = 'https://www.qffsrmap2026.com/learning/hackathon';
  var whatsappUrl = 'https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW';
  
  var roleNoticeHtml = '';
  var subject = '';
  
  if (category === 'team_lead') {
    subject = 'Urgent: Team ' + teamName + ' Phase 2 Payment Window Extended to 22 Oct (11:59 PM IST)';
    roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fdf5f5;border:1px solid #e8b8bb;border-left:4px solid #7c1415;border-radius:8px;padding:18px 20px;margin:0 0 24px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#7c1415;margin-bottom:4px;">Team Leader Responsibility</div>'
      + '<div style="font-size:15px;font-weight:bold;color:#7c1415;margin-bottom:8px;">Coordinate Team Receipts &amp; Finalize Confirmed Desk</div>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4a1d20;line-height:1.65;">'
      + 'Your team <strong>' + teamName + '</strong>\'s payment window has been extended to <strong>' + deadline + '</strong>.'
      + '</p>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4a1d20;line-height:1.65;">'
      + '<strong>Next Action:</strong> Ensure all your teammates sign into <a href="' + portalUrl + '" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning#campus-pass</a> and submit their &#8377;499 Flagship Pass receipt.'
      + '</p>'
      + '<p style="margin:0;font-size:13px;color:#4a1d20;line-height:1.6;">'
      + '<strong>Leader Final Step:</strong> You will submit your own pass receipt last, which locks in your team\'s confirmed auditorium desk for the 24-hour sprint.'
      + '</p>'
      + '</td></tr></table>';
  } else if (category === 'paid_member_waiting_for_team') {
    subject = 'Receipt Confirmed: Team ' + teamName + ' Phase 2 Sprint | Qiskit Fall Fest 2026';
    roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f7f3;border:1px solid #c2e0cf;border-left:4px solid #1e7e45;border-radius:8px;padding:18px 20px;margin:0 0 24px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1e7e45;margin-bottom:4px;">Teammate · Payment Received</div>'
      + '<div style="font-size:15px;font-weight:bold;color:#1e7e45;margin-bottom:8px;">Your Receipt is Submitted · Nudge Your Teammates</div>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#2c4033;line-height:1.65;">'
      + 'We have received your &#8377;499 Flagship Pass receipt for <strong>Team ' + teamName + '</strong>. Thank you!'
      + '</p>'
      + '<p style="margin:0;font-size:13px;color:#2c4033;line-height:1.6;">'
      + 'Your team\'s payment window is open until <strong>' + deadline + '</strong>. Please remind your remaining teammates to submit their receipts so your team leader can complete the final confirmation.'
      + '</p>'
      + '</td></tr></table>';
  } else if (category === 'confirmed_team_unpaid_member') {
    subject = 'Action Required: Your INR 499 Flagship Pass for Team ' + teamName + ' | Qiskit Fall Fest 2026';
    roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fdf6ed;border:1px solid #f0d5b5;border-left:4px solid #b97e3e;border-radius:8px;padding:18px 20px;margin:0 0 24px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Action Required · Newly Added Finalist</div>'
      + '<div style="font-size:15px;font-weight:bold;color:#7c1415;margin-bottom:8px;">Submit Your &#8377;499 Flagship Pass Receipt</div>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4f3d2a;line-height:1.65;">'
      + 'You were recently added to <strong>Team ' + teamName + '</strong> for the onsite finals! Your team desk is confirmed, but your individual attendee pass is pending.'
      + '</p>'
      + '<p style="margin:0;font-size:13px;color:#4f3d2a;line-height:1.6;">'
      + 'Please sign in to <a href="' + portalUrl + '" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning#campus-pass</a> before <strong>' + deadline + '</strong> to pay &#8377;499 on Easebuzz (Diamond Pass) and upload your receipt.'
      + '</p>'
      + '</td></tr></table>';
  } else {
    subject = 'Action Required: Your INR 499 Flagship Pass for Team ' + teamName + ' | Qiskit Fall Fest 2026';
    roleNoticeHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fdf6ed;border:1px solid #f0d5b5;border-left:4px solid #b97e3e;border-radius:8px;padding:18px 20px;margin:0 0 24px 0;"><tr><td>'
      + '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b97e3e;margin-bottom:4px;">Action Required · Team Member</div>'
      + '<div style="font-size:15px;font-weight:bold;color:#7c1415;margin-bottom:8px;">Submit Your &#8377;499 Flagship Pass on the Portal</div>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4f3d2a;line-height:1.65;">'
      + 'Your team <strong>' + teamName + '</strong> is an official finalist for Phase 2 at SRM University-AP!'
      + '</p>'
      + '<p style="margin:0 0 10px 0;font-size:13.5px;color:#4f3d2a;line-height:1.65;">'
      + 'Your payment window has been extended to <strong>' + deadline + '</strong>. Each team member must pay &#8377;499 individually on Easebuzz and submit their receipt on the portal.'
      + '</p>'
      + '<p style="margin:0;font-size:13px;color:#4f3d2a;line-height:1.6;">'
      + 'Log into <a href="' + portalUrl + '" target="_blank" style="color:#7c1415;font-weight:bold;">qffsrmap2026.com/learning#campus-pass</a> using your registered Google account (' + recipientEmail + ') to complete payment.'
      + '</p>'
      + '</td></tr></table>';
  }

  var htmlBody = '<!DOCTYPE html>'
    + '<html lang="en">'
    + '<head><meta charset="UTF-8"><style type="text/css">body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } img { border: 0; outline: none; } body { margin: 0; padding: 24px 12px; background-color: #f5efea; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #231f20; line-height: 1.65; }</style></head>'
    + '<body>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:660px;margin:0 auto;background-color:#ffffff;border:1px solid #e4dacb;border-radius:12px;overflow:hidden;">'
    + '<tr><td style="background-color:#faf7f2;text-align:center;">'
    + '<img src="https://www.qffsrmap2026.com/brand/qiskit-fall-fest-banner.png" alt="IBM Qiskit Fall Fest 2026" width="660" style="display:block;width:100%;max-width:660px;height:auto;border:0;">'
    + '</td></tr>'
    + '<tr><td style="background-color:#7c1415;padding:12px 24px;text-align:center;color:#fdf8f0;font-family:\'Georgia\',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">'
    + 'IBM PARTNER PLUS · SRM UNIVERSITY-AP · FLAGSHIP HACKATHON ARENA'
    + '</td></tr>'
    + '<tr><td style="padding:32px 32px 36px 32px;">'
    + '<p style="margin:0 0 14px 0;font-size:16px;font-weight:bold;color:#231f20;">Dear ' + participantName + ' (' + (role.charAt(0).toUpperCase() + role.slice(1)) + ' · Team: ' + teamName + '),</p>'
    + roleNoticeHtml
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border-left:4px solid #7c1415;border-radius:0 6px 6px 0;padding:16px 20px;margin:0 0 24px 0;"><tr><td>'
    + '<div style="font-weight:bold;color:#7c1415;margin-bottom:6px;font-size:14px;">All-Access Flagship Pass Privileges (&#8377;499 per member):</div>'
    + '<ul style="margin:8px 0 8px 18px;padding:0;font-size:13.5px;color:#4f443b;line-height:1.6;">'
    + '<li><strong>24-Hour Physical Sprint:</strong> Auditorium X-Lab on <strong>28 &amp; 29 October</strong> with dedicated seating and live IBM mentoring.</li>'
    + '<li><strong>Quantum Capture The Flag (QCTF):</strong> Full entry to the flagship cybersecurity competition on <strong>27 October</strong>.</li>'
    + '<li><strong>Quantum Startup Pitch Fest:</strong> Pitch your working prototype to venture investors and incubation leaders.</li>'
    + '<li><strong>5-Day Catered Dining:</strong> Catered lunches and twice-daily refreshments across all five days (26–30 October).</li>'
    + '<li><strong>Daily Campus Entry:</strong> 9:00 AM – 11:00 AM registration desks at SRM University-AP.</li>'
    + '<li><strong>Do NOT purchase the &#8377;99 General Pass:</strong> The &#8377;99 pass is strictly for non-hackathon visitors and excludes sprint seating, QCTF, Pitch Fest, and meals.</li>'
    + '</ul>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 28px auto;"><tr><td style="background-color:#7c1415;border-radius:6px;text-align:center;">'
    + '<a href="' + portalUrl + '" target="_blank" style="display:inline-block;padding:12px 26px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Open Flagship Pass Portal &rarr;</a>'
    + '</td></tr></table>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fbf7ef;border:1px solid #e1d3bf;border-radius:8px;padding:18px;margin:0 0 24px 0;"><tr><td>'
    + '<h4 style="margin:0 0 6px 0;font-size:14.5px;color:#7c1415;font-weight:bold;">Finalists WhatsApp Community</h4>'
    + '<p style="margin:0 0 12px 0;font-size:13px;color:#4f443b;line-height:1.5;">Join our coordination community for PG accommodation guidance near campus (approx. &#8377;500/night), arrival directions, and desk seating charts:</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#2a6a43;border-radius:5px;">'
    + '<a href="' + whatsappUrl + '" target="_blank" style="display:inline-block;padding:9px 18px;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;">Join Finalists WhatsApp &rarr;</a>'
    + '</td></tr></table></td></tr></table>'
    + '<p style="margin:0 0 16px 0;font-size:14px;color:#3d3635;line-height:1.6;">We look forward to seeing <strong>Team ' + teamName + '</strong> build on campus and present your solutions to our IBM and industry panel on 28–29 October.</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr><td style="border-left:3px solid #7c1415;padding-left:12px;">'
    + '<p style="margin:0;font-size:13.5px;color:#231f20;line-height:1.5;">Best regards,<br><strong>Hackathon Technical Committee &amp; Organizing Board</strong><br>Partner Plus IBM Qiskit Fall Fest 2026<br>School of Engineering and Sciences, SRM University-AP</p>'
    + '</td></tr></table></td></tr>'
    + '<tr><td style="background-color:#faf7f2;border-top:1px solid #ebd9c2;padding:20px 32px;text-align:center;font-size:12px;color:#857a73;">'
    + 'Hackathon Arena: <a href="' + arenaUrl + '" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning/hackathon</a> &nbsp;·&nbsp; Pass Portal: <a href="' + portalUrl + '" target="_blank" style="color:#7c1415;text-decoration:underline;">qffsrmap2026.com/learning#campus-pass</a><br>'
    + 'SRM University-AP, Neerukonda, Mangalagiri Mandal, Andhra Pradesh 522240'
    + '</td></tr></table></body></html>';

  GmailApp.sendEmail(recipientEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: 'Qiskit Fall Fest 2026'
  });
}
