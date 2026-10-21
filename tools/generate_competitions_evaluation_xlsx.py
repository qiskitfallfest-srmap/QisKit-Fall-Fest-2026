import os
import requests
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json'
}

IST_TZ = timezone(timedelta(hours=5, minutes=30))

def fetch_all(table, select='*'):
    rows = []
    limit = 1000
    offset = 0
    while True:
        r = requests.get(f'{SUPABASE_URL}/rest/v1/{table}?select={select}&limit={limit}&offset={offset}', headers=HEADERS)
        if r.status_code != 200:
            print(f'Error fetching {table}: {r.status_code} - {r.text}')
            break
        data = r.json()
        if not data:
            break
        rows.extend(data)
        if len(data) < limit:
            break
        offset += limit
    return rows

def fetch_auth_users():
    auth_map = {}
    url = f'{SUPABASE_URL}/auth/v1/admin/users?per_page=1000'
    r = requests.get(url, headers=HEADERS)
    if r.status_code == 200:
        for u in r.json().get('users', []):
            email = (u.get('email') or '').strip().lower()
            meta = u.get('user_metadata', {})
            full_name = meta.get('full_name') or meta.get('name')
            if email and full_name:
                auth_map[email] = full_name
    return auth_map

def classify_format(url):
    u = (url or '').lower()
    if 'youtube.com/shorts' in u or 'youtu.be' in u:
        return 'YouTube Short'
    if 'youtube.com' in u:
        return 'YouTube Video'
    if 'instagram.com' in u:
        return 'Instagram Reel'
    if 'drive.google.com' in u:
        return 'Google Drive'
    if 'canva.com' in u or 'canva.link' in u:
        return 'Canva Presentation'
    if 'linkedin.com' in u or 'lnkd.in' in u:
        return 'LinkedIn Post'
    if '.pdf' in u:
        return 'PDF Document'
    if '.docx' in u or '.doc' in u:
        return 'Word Document'
    if 'supabase.co' in u:
        return 'Direct Upload'
    return 'External Link'

def format_date_ist(ts_str):
    if not ts_str:
        return ''
    try:
        dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00')).astimezone(IST_TZ)
        return dt.strftime('%d-%b-%Y %I:%M %p')
    except Exception:
        return str(ts_str)

def map_status_to_verdict(eval_obj):
    if not eval_obj:
        return 'Under Review'
    status = (eval_obj.get('status') or '').lower()
    is_next = eval_obj.get('is_next_round', False)
    if status in ('winner', 'finalist'):
        return 'Amazing'
    if status == 'shortlisted' or is_next:
        return 'Shortlist'
    if status == 'rejected':
        return 'Reject'
    if status == 'under_review':
        return 'Under Review'
    return 'Under Review'

def build_evaluation_workbook(output_path='QFF2026_Online_Competitions_Evaluation_Master.xlsx'):
    print('1. Fetching data from Supabase...')
    submissions = fetch_all('competition_submissions', '*')
    print(f'   Fetched {len(submissions)} competition submissions')

    allowed = fetch_all('allowed_emails', 'email,full_name')
    allowed_map = {a['email'].strip().lower(): (a.get('full_name') or '').strip() for a in allowed if a.get('email')}

    registrations = fetch_all('registrations', 'email,name,institution,phone')
    reg_map = {r['email'].strip().lower(): r for r in registrations if r.get('email')}

    evals = fetch_all('submission_evaluations', '*')
    eval_map = {ev['target_id']: ev for ev in evals if ev.get('target_id')}

    auth_map = fetch_auth_users()

    print('2. Processing and enriching submissions...')
    enriched = []
    for s in submissions:
        email = (s.get('email') or '').strip().lower()
        sub_id = s.get('id')
        ev = eval_map.get(sub_id)
        reg = reg_map.get(email, {})
        
        # Name resolution: registrations -> allowed_emails -> auth_users -> email fallback
        name = reg.get('name') or allowed_map.get(email) or auth_map.get(email)
        if not name:
            username = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            name = username

        # Institution resolution
        inst = reg.get('institution')
        if not inst:
            if '@srmap.edu.in' in email:
                inst = 'SRM University-AP'
            else:
                inst = 'External University / College'

        phone = reg.get('phone') or ''

        # Comments extraction
        comment_texts = []
        if ev and ev.get('comments'):
            for c in ev['comments']:
                evaluator = c.get('evaluator_name') or 'Evaluator'
                txt = c.get('text', '')
                if txt:
                    comment_texts.append(f'[{evaluator}]: {txt}')
        notes_str = '\n'.join(comment_texts)

        evaluator_name = ''
        if ev:
            evaluator_name = ev.get('last_evaluated_by_name') or ev.get('downloaded_by') or ''

        score_val = ev.get('score') if ev else None
        verdict_val = map_status_to_verdict(ev)

        enriched.append({
            'id': sub_id,
            'competition_type': s.get('competition_type'),
            'verdict': verdict_val,
            'score': score_val if score_val is not None else '',
            'name': name,
            'email': email,
            'institution': inst,
            'phone': phone,
            'title': s.get('submission_title') or '',
            'url': s.get('submission_url') or '',
            'format': classify_format(s.get('submission_url')),
            'submitted_at_ist': format_date_ist(s.get('submitted_at')),
            'evaluator': evaluator_name,
            'evaluator_comments': notes_str,
            'participant_notes': s.get('notes') or '',
            'submitted_at_raw': s.get('submitted_at') or ''
        })

    # Sort chronological
    enriched.sort(key=lambda x: x['submitted_at_raw'], reverse=True)

    reels_list = [s for s in enriched if s['competition_type'] == 'reels']
    poster_list = [s for s in enriched if s['competition_type'] == 'poster']
    essay_list = [s for s in enriched if s['competition_type'] == 'essay']

    print(f'   Tech Reels: {len(reels_list)}')
    print(f'   Digital Poster: {len(poster_list)}')
    print(f'   Technical Essay: {len(essay_list)}')

    wb = openpyxl.Workbook()
    # remove default sheet
    default_sheet = wb.active

    # Styling definitions
    font_family = 'Segoe UI'
    header_fill = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid') # Slate 900
    header_font = Font(name=font_family, size=11, bold=True, color='FFFFFF')
    
    subhead_fill = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid') # Slate 100
    subhead_font = Font(name=font_family, size=10, bold=True, color='334155')

    body_font = Font(name=font_family, size=10, color='0F172A')
    bold_body_font = Font(name=font_family, size=10, bold=True, color='0F172A')
    link_font = Font(name=font_family, size=10, color='0284C7', underline='single', bold=True)
    mono_font = Font(name='Consolas', size=9, color='475569')

    thin_border_side = Side(border_style='thin', color='E2E8F0')
    border_all = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    thick_bottom = Border(bottom=Side(border_style='medium', color='0F172A'))

    # Conditional Formatting fills
    fill_amazing = PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid') # Emerald 100
    font_amazing = Font(name=font_family, size=10, bold=True, color='065F46')
    fill_shortlist = PatternFill(start_color='E0F2FE', end_color='E0F2FE', fill_type='solid') # Sky 100
    font_shortlist = Font(name=font_family, size=10, bold=True, color='0369A1')
    fill_reject = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid') # Red 100
    font_reject = Font(name=font_family, size=10, bold=True, color='991B1B')
    fill_review = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid') # Amber 100
    font_review = Font(name=font_family, size=10, bold=True, color='92400E')

    # =========================================================================
    # SHEET 1: Summary & Evaluation Dashboard
    # =========================================================================
    print('3. Generating Summary & Evaluation Dashboard...')
    ws_dash = wb.create_sheet(title='Executive Summary')
    ws_dash.views.sheetView[0].showGridLines = True

    # Title block
    ws_dash.merge_cells('A1:G1')
    t_cell = ws_dash['A1']
    t_cell.value = 'Qiskit Fall Fest 2026 · Online Creative Competitions Evaluation Master'
    t_cell.font = Font(name=font_family, size=16, bold=True, color='0F172A')
    t_cell.alignment = Alignment(vertical='center')
    ws_dash.row_dimensions[1].height = 32

    ws_dash.merge_cells('A2:G2')
    sub_cell = ws_dash['A2']
    sub_cell.value = 'Official Review Workbook for Tech Reels (Day 1), Digital Poster (Day 2), and Technical Essay (Day 3)'
    sub_cell.font = Font(name=font_family, size=11, color='64748B')
    sub_cell.alignment = Alignment(vertical='center')
    ws_dash.row_dimensions[2].height = 20

    # Summary Table Headers
    ws_dash.cell(row=4, column=1, value='Category Track').font = header_font
    ws_dash.cell(row=4, column=1).fill = header_fill
    ws_dash.cell(row=4, column=1).alignment = Alignment(horizontal='left', vertical='center')

    headers_summary = ['Total Entries', 'Amazing (Top Tier)', 'Shortlist (Pass)', 'Reject (Eliminated)', 'Under Review', 'Sheet Link']
    for idx, h in enumerate(headers_summary, start=2):
        c = ws_dash.cell(row=4, column=idx, value=h)
        c.font = header_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal='center' if idx < 7 else 'left', vertical='center')

    ws_dash.row_dimensions[4].height = 26

    # Summary Table Rows (dynamic formulas pointing to competition sheets!)
    categories = [
        ('Tech Reels (Day 1)', 'Tech Reels', len(reels_list)),
        ('Digital Poster (Day 2)', 'Digital Poster', len(poster_list)),
        ('Technical Essay (Day 3)', 'Technical Essay', len(essay_list)),
    ]

    for row_idx, (cat_label, sheet_name, count) in enumerate(categories, start=5):
        ws_dash.row_dimensions[row_idx].height = 24
        # Category label
        c = ws_dash.cell(row=row_idx, column=1, value=cat_label)
        c.font = bold_body_font
        c.border = border_all
        
        # Total
        c = ws_dash.cell(row=row_idx, column=2, value=count)
        c.font = bold_body_font
        c.alignment = Alignment(horizontal='center')
        c.border = border_all

        # Formulas for Amazing, Shortlist, Reject, Under Review
        # Column B in competition sheets is Verdict
        for col_offset, verdict_term, fill_color, font_color in [
            (3, 'Amazing', fill_amazing, font_amazing),
            (4, 'Shortlist', fill_shortlist, font_shortlist),
            (5, 'Reject', fill_reject, font_reject),
            (6, 'Under Review', fill_review, font_review),
        ]:
            cell = ws_dash.cell(row=row_idx, column=col_offset)
            cell.value = f"=COUNTIF('{sheet_name}'!B$5:B$200, \"{verdict_term}\")"
            cell.font = font_color
            cell.fill = fill_color
            cell.alignment = Alignment(horizontal='center')
            cell.border = border_all

        # Jump link
        link_cell = ws_dash.cell(row=row_idx, column=7, value=f'Go to {sheet_name}')
        link_cell.hyperlink = f"#'{sheet_name}'!A1"
        link_cell.font = link_font
        link_cell.border = border_all

    # Summary Totals Row
    ws_dash.row_dimensions[8].height = 26
    c = ws_dash.cell(row=8, column=1, value='Total All Tracks')
    c.font = Font(name=font_family, size=11, bold=True, color='0F172A')
    c.fill = subhead_fill
    c.border = border_all

    for col_idx in range(2, 7):
        c = ws_dash.cell(row=8, column=col_idx)
        c.value = f"=SUM({get_column_letter(col_idx)}5:{get_column_letter(col_idx)}7)"
        c.font = Font(name=font_family, size=11, bold=True, color='0F172A')
        c.fill = subhead_fill
        c.alignment = Alignment(horizontal='center')
        c.border = border_all

    ws_dash.cell(row=8, column=7, value='').fill = subhead_fill
    ws_dash.cell(row=8, column=7).border = border_all

    # Instructions Block
    ws_dash.cell(row=11, column=1, value='Decision Workflow & Scoring Guide').font = Font(name=font_family, size=13, bold=True, color='0F172A')
    
    guide_items = [
        ('Amazing', 'Awarded to exceptional submissions with pristine technical accuracy, novel insight, high creativity, and immaculate execution. High priority candidates for 1st, 2nd, and 3rd place cash awards / IBM Swag.', fill_amazing, font_amazing),
        ('Shortlist', 'Solid submissions meeting all track rules and demonstrating clear quantum concepts. Qualifies for the secondary finalist review round.', fill_shortlist, font_shortlist),
        ('Reject', 'Incomplete, broken/inaccessible links, completely off-topic entries, generic AI hallucinations without substance, or duplicate/plagiarized material.', fill_reject, font_reject),
        ('Under Review', 'Default state. Used when a submission is awaiting review, needs discussion among faculty/leads, or waiting for link access permissions.', fill_review, font_review),
    ]

    for g_idx, (verdict_name, desc, g_fill, g_font) in enumerate(guide_items, start=13):
        ws_dash.row_dimensions[g_idx].height = 24
        badge_cell = ws_dash.cell(row=g_idx, column=1, value=verdict_name)
        badge_cell.fill = g_fill
        badge_cell.font = g_font
        badge_cell.alignment = Alignment(horizontal='center', vertical='center')
        badge_cell.border = border_all

        desc_cell = ws_dash.cell(row=g_idx, column=2, value=desc)
        desc_cell.font = body_font
        desc_cell.alignment = Alignment(vertical='center')
        ws_dash.merge_cells(start_row=g_idx, start_column=2, end_row=g_idx, end_column=7)
        for c_i in range(2, 8):
            ws_dash.cell(row=g_idx, column=c_i).border = border_all

    # Rubrics Section
    ws_dash.cell(row=19, column=1, value='Evaluation Rubrics By Competition').font = Font(name=font_family, size=13, bold=True, color='0F172A')
    
    rubrics = [
        ('Tech Reels', '1. Quantum Concept Accuracy (30 pts)  ·  2. Visual/Audio Clarity & Hook (30 pts)  ·  3. Storytelling & Simplicity (20 pts)  ·  4. Qiskit/Festival Alignment (20 pts)'),
        ('Digital Poster', '1. Information Design & Readability (30 pts)  ·  2. Technical Depth & Quantum Rigor (30 pts)  ·  3. Visual Balance & Original Diagrams (25 pts)  ·  4. Structure & Citations (15 pts)'),
        ('Technical Essay', '1. Academic Depth & Scientific Accuracy (35 pts)  ·  2. Thesis Clarity & Argumentation (25 pts)  ·  3. Citation Quality & Research Integrity (20 pts)  ·  4. Writing Quality & Organization (20 pts)'),
    ]

    for r_idx, (r_name, r_desc) in enumerate(rubrics, start=21):
        ws_dash.row_dimensions[r_idx].height = 24
        c1 = ws_dash.cell(row=r_idx, column=1, value=r_name)
        c1.font = bold_body_font
        c1.fill = subhead_fill
        c1.border = border_all
        c1.alignment = Alignment(horizontal='left', vertical='center')

        c2 = ws_dash.cell(row=r_idx, column=2, value=r_desc)
        c2.font = body_font
        c2.alignment = Alignment(vertical='center')
        ws_dash.merge_cells(start_row=r_idx, start_column=2, end_row=r_idx, end_column=7)
        for c_i in range(2, 8):
            ws_dash.cell(row=r_idx, column=c_i).border = border_all

    ws_dash.column_dimensions['A'].width = 24
    ws_dash.column_dimensions['B'].width = 16
    ws_dash.column_dimensions['C'].width = 20
    ws_dash.column_dimensions['D'].width = 22
    ws_dash.column_dimensions['E'].width = 18
    ws_dash.column_dimensions['F'].width = 20
    ws_dash.column_dimensions['G'].width = 22

    # =========================================================================
    # COMPETITION SHEETS
    # =========================================================================
    columns_spec = [
        ('S.No', 7, 'center'),
        ('Verdict', 18, 'center'),
        ('Score (0-100)', 14, 'center'),
        ('Participant Name', 28, 'left'),
        ('Email Address', 30, 'left'),
        ('Direct Link', 20, 'center'),
        ('Submission Title / Topic', 36, 'left'),
        ('Format / Platform', 18, 'center'),
        ('Institution / College', 26, 'left'),
        ('Phone', 15, 'center'),
        ('Raw Link (Full URL)', 35, 'left'),
        ('Submission Time (IST)', 22, 'center'),
        ('Evaluator Name', 22, 'left'),
        ('Evaluator Comments & Notes', 42, 'left'),
        ('Participant Notes', 22, 'left'),
        ('Submission ID', 38, 'left'),
    ]

    def populate_competition_sheet(ws, title, rows_data):
        ws.views.sheetView[0].showGridLines = True
        
        # Title header
        ws.merge_cells('A1:P1')
        title_cell = ws['A1']
        title_cell.value = f'Qiskit Fall Fest 2026 — {title}'
        title_cell.font = Font(name=font_family, size=14, bold=True, color='0F172A')
        title_cell.alignment = Alignment(vertical='center')
        ws.row_dimensions[1].height = 28

        # Quick stats row
        ws.merge_cells('A2:P2')
        stats_cell = ws['A2']
        stats_cell.value = f'Total Submissions: {len(rows_data)}  |  Interactive Verdict Dropdown in Column B  |  Links in Column F point directly to assets'
        stats_cell.font = Font(name=font_family, size=10, color='475569')
        stats_cell.alignment = Alignment(vertical='center')
        ws.row_dimensions[2].height = 18

        # Empty row 3
        ws.row_dimensions[3].height = 6

        # Header row 4
        ws.row_dimensions[4].height = 28
        for col_idx, (col_name, col_width, align) in enumerate(columns_spec, start=1):
            cell = ws.cell(row=4, column=col_idx, value=col_name)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal=align, vertical='center', wrap_text=True)
            cell.border = border_all
            ws.column_dimensions[get_column_letter(col_idx)].width = col_width

        # Data rows
        start_row = 5
        for idx, row_item in enumerate(rows_data, start=1):
            current_row = start_row + idx - 1
            ws.row_dimensions[current_row].height = 22

            # Col 1: S.No
            c1 = ws.cell(row=current_row, column=1, value=idx)
            c1.font = mono_font
            c1.alignment = Alignment(horizontal='center', vertical='center')
            c1.border = border_all

            # Col 2: Verdict
            c2 = ws.cell(row=current_row, column=2, value=row_item['verdict'])
            c2.font = bold_body_font
            c2.alignment = Alignment(horizontal='center', vertical='center')
            c2.border = border_all

            # Col 3: Score
            c3 = ws.cell(row=current_row, column=3, value=row_item['score'])
            c3.font = bold_body_font
            c3.alignment = Alignment(horizontal='center', vertical='center')
            c3.border = border_all

            # Col 4: Name
            c4 = ws.cell(row=current_row, column=4, value=row_item['name'])
            c4.font = bold_body_font
            c4.alignment = Alignment(horizontal='left', vertical='center')
            c4.border = border_all

            # Col 5: Email
            c5 = ws.cell(row=current_row, column=5, value=row_item['email'])
            c5.font = body_font
            c5.alignment = Alignment(horizontal='left', vertical='center')
            c5.border = border_all

            # Col 6: Direct Link
            c6 = ws.cell(row=current_row, column=6, value='Open Submission')
            c6.hyperlink = row_item['url']
            c6.font = link_font
            c6.alignment = Alignment(horizontal='center', vertical='center')
            c6.border = border_all

            # Col 7: Title
            c7 = ws.cell(row=current_row, column=7, value=row_item['title'])
            c7.font = body_font
            c7.alignment = Alignment(horizontal='left', vertical='center')
            c7.border = border_all

            # Col 8: Format
            c8 = ws.cell(row=current_row, column=8, value=row_item['format'])
            c8.font = mono_font
            c8.alignment = Alignment(horizontal='center', vertical='center')
            c8.border = border_all

            # Col 9: Institution
            c9 = ws.cell(row=current_row, column=9, value=row_item['institution'])
            c9.font = body_font
            c9.alignment = Alignment(horizontal='left', vertical='center')
            c9.border = border_all

            # Col 10: Phone
            c10 = ws.cell(row=current_row, column=10, value=row_item['phone'])
            c10.font = mono_font
            c10.alignment = Alignment(horizontal='center', vertical='center')
            c10.border = border_all

            # Col 11: Raw URL
            c11 = ws.cell(row=current_row, column=11, value=row_item['url'])
            c11.font = mono_font
            c11.alignment = Alignment(horizontal='left', vertical='center')
            c11.border = border_all

            # Col 12: Submitted At
            c12 = ws.cell(row=current_row, column=12, value=row_item['submitted_at_ist'])
            c12.font = mono_font
            c12.alignment = Alignment(horizontal='center', vertical='center')
            c12.border = border_all

            # Col 13: Evaluator
            c13 = ws.cell(row=current_row, column=13, value=row_item['evaluator'])
            c13.font = body_font
            c13.alignment = Alignment(horizontal='left', vertical='center')
            c13.border = border_all

            # Col 14: Comments
            c14 = ws.cell(row=current_row, column=14, value=row_item['evaluator_comments'])
            c14.font = body_font
            c14.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
            c14.border = border_all

            # Col 15: Participant Notes
            c15 = ws.cell(row=current_row, column=15, value=row_item['participant_notes'])
            c15.font = body_font
            c15.alignment = Alignment(horizontal='left', vertical='center')
            c15.border = border_all

            # Col 16: ID
            c16 = ws.cell(row=current_row, column=16, value=row_item['id'])
            c16.font = mono_font
            c16.alignment = Alignment(horizontal='left', vertical='center')
            c16.border = border_all

        # Freeze panes so headers and identification stay locked: freeze at row 5, col 5 (A, B, C, D locked: S.No, Verdict, Score, Name)
        ws.freeze_panes = 'E5'

        # AutoFilter on headers
        last_data_row = start_row + len(rows_data) - 1
        ws.auto_filter.ref = f'A4:P{last_data_row}'

        # Add Data Validation for Verdict column (Col B)
        max_row = max(start_row + len(rows_data) + 10, 100)
        dv = DataValidation(type='list', formula1='"Amazing,Shortlist,Reject,Under Review"', allow_blank=True)
        dv.error = 'Your entry is not in the list'
        dv.errorTitle = 'Invalid Verdict'
        dv.prompt = 'Select Verdict'
        dv.promptTitle = 'Decision'
        ws.add_data_validation(dv)
        dv.add(f'B5:B{max_row}')

        # Add Conditional Formatting rules for Col B
        range_str = f'B5:B{max_row}'
        ws.conditional_formatting.add(range_str, CellIsRule(operator='equal', formula=['"Amazing"'], fill=fill_amazing, font=font_amazing))
        ws.conditional_formatting.add(range_str, CellIsRule(operator='equal', formula=['"Shortlist"'], fill=fill_shortlist, font=font_shortlist))
        ws.conditional_formatting.add(range_str, CellIsRule(operator='equal', formula=['"Reject"'], fill=fill_reject, font=font_reject))
        ws.conditional_formatting.add(range_str, CellIsRule(operator='equal', formula=['"Under Review"'], fill=fill_review, font=font_review))

    print('4. Generating Tech Reels sheet...')
    ws_reels = wb.create_sheet(title='Tech Reels')
    populate_competition_sheet(ws_reels, 'Day 1: Tech Reels Submissions', reels_list)

    print('5. Generating Digital Poster sheet...')
    ws_poster = wb.create_sheet(title='Digital Poster')
    populate_competition_sheet(ws_poster, 'Day 2: Digital Poster Submissions', poster_list)

    print('6. Generating Technical Essay sheet...')
    ws_essay = wb.create_sheet(title='Technical Essay')
    populate_competition_sheet(ws_essay, 'Day 3: Technical Essay Submissions', essay_list)

    print('7. Generating All Submissions Master sheet...')
    ws_all = wb.create_sheet(title='All Submissions Master')
    # For All Submissions, add Category column after S.No
    all_spec = [
        ('S.No', 7, 'center'),
        ('Category', 16, 'center'),
        ('Verdict', 18, 'center'),
        ('Score (0-100)', 14, 'center'),
        ('Participant Name', 28, 'left'),
        ('Email Address', 30, 'left'),
        ('Direct Link', 20, 'center'),
        ('Submission Title / Topic', 36, 'left'),
        ('Format / Platform', 18, 'center'),
        ('Institution / College', 26, 'left'),
        ('Phone', 15, 'center'),
        ('Raw Link (Full URL)', 35, 'left'),
        ('Submission Time (IST)', 22, 'center'),
        ('Evaluator Name', 22, 'left'),
        ('Evaluator Comments & Notes', 42, 'left'),
        ('Participant Notes', 22, 'left'),
        ('Submission ID', 38, 'left'),
    ]

    ws_all.views.sheetView[0].showGridLines = True
    ws_all.merge_cells('A1:Q1')
    ws_all['A1'].value = 'Qiskit Fall Fest 2026 — All 175 Creative Competition Submissions'
    ws_all['A1'].font = Font(name=font_family, size=14, bold=True, color='0F172A')
    ws_all['A1'].alignment = Alignment(vertical='center')
    ws_all.row_dimensions[1].height = 28

    ws_all.row_dimensions[4].height = 28
    for col_idx, (col_name, col_width, align) in enumerate(all_spec, start=1):
        cell = ws_all.cell(row=4, column=col_idx, value=col_name)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal=align, vertical='center', wrap_text=True)
        cell.border = border_all
        ws_all.column_dimensions[get_column_letter(col_idx)].width = col_width

    category_labels = {
        'reels': 'Tech Reels',
        'poster': 'Digital Poster',
        'essay': 'Technical Essay'
    }

    start_row = 5
    for idx, row_item in enumerate(enriched, start=1):
        cur_row = start_row + idx - 1
        ws_all.row_dimensions[cur_row].height = 22

        ws_all.cell(row=cur_row, column=1, value=idx).font = mono_font
        ws_all.cell(row=cur_row, column=1).alignment = Alignment(horizontal='center', vertical='center')
        ws_all.cell(row=cur_row, column=1).border = border_all

        cat_badge = category_labels.get(row_item['competition_type'], row_item['competition_type'])
        c_cat = ws_all.cell(row=cur_row, column=2, value=cat_badge)
        c_cat.font = bold_body_font
        c_cat.alignment = Alignment(horizontal='center', vertical='center')
        c_cat.border = border_all

        c_v = ws_all.cell(row=cur_row, column=3, value=row_item['verdict'])
        c_v.font = bold_body_font
        c_v.alignment = Alignment(horizontal='center', vertical='center')
        c_v.border = border_all

        c_sc = ws_all.cell(row=cur_row, column=4, value=row_item['score'])
        c_sc.font = bold_body_font
        c_sc.alignment = Alignment(horizontal='center', vertical='center')
        c_sc.border = border_all

        c_nm = ws_all.cell(row=cur_row, column=5, value=row_item['name'])
        c_nm.font = bold_body_font
        c_nm.alignment = Alignment(horizontal='left', vertical='center')
        c_nm.border = border_all

        c_em = ws_all.cell(row=cur_row, column=6, value=row_item['email'])
        c_em.font = body_font
        c_em.alignment = Alignment(horizontal='left', vertical='center')
        c_em.border = border_all

        c_lnk = ws_all.cell(row=cur_row, column=7, value='Open Submission')
        c_lnk.hyperlink = row_item['url']
        c_lnk.font = link_font
        c_lnk.alignment = Alignment(horizontal='center', vertical='center')
        c_lnk.border = border_all

        c_tit = ws_all.cell(row=cur_row, column=8, value=row_item['title'])
        c_tit.font = body_font
        c_tit.alignment = Alignment(horizontal='left', vertical='center')
        c_tit.border = border_all

        c_fmt = ws_all.cell(row=cur_row, column=9, value=row_item['format'])
        c_fmt.font = mono_font
        c_fmt.alignment = Alignment(horizontal='center', vertical='center')
        c_fmt.border = border_all

        c_in = ws_all.cell(row=cur_row, column=10, value=row_item['institution'])
        c_in.font = body_font
        c_in.alignment = Alignment(horizontal='left', vertical='center')
        c_in.border = border_all

        c_ph = ws_all.cell(row=cur_row, column=11, value=row_item['phone'])
        c_ph.font = mono_font
        c_ph.alignment = Alignment(horizontal='center', vertical='center')
        c_ph.border = border_all

        c_raw = ws_all.cell(row=cur_row, column=12, value=row_item['url'])
        c_raw.font = mono_font
        c_raw.alignment = Alignment(horizontal='left', vertical='center')
        c_raw.border = border_all

        c_tm = ws_all.cell(row=cur_row, column=13, value=row_item['submitted_at_ist'])
        c_tm.font = mono_font
        c_tm.alignment = Alignment(horizontal='center', vertical='center')
        c_tm.border = border_all

        c_ev = ws_all.cell(row=cur_row, column=14, value=row_item['evaluator'])
        c_ev.font = body_font
        c_ev.alignment = Alignment(horizontal='left', vertical='center')
        c_ev.border = border_all

        c_cm = ws_all.cell(row=cur_row, column=15, value=row_item['evaluator_comments'])
        c_cm.font = body_font
        c_cm.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
        c_cm.border = border_all

        c_nt = ws_all.cell(row=cur_row, column=16, value=row_item['participant_notes'])
        c_nt.font = body_font
        c_nt.alignment = Alignment(horizontal='left', vertical='center')
        c_nt.border = border_all

        c_id = ws_all.cell(row=cur_row, column=17, value=row_item['id'])
        c_id.font = mono_font
        c_id.alignment = Alignment(horizontal='left', vertical='center')
        c_id.border = border_all

    ws_all.freeze_panes = 'F5'

    # AutoFilter on Master sheet
    last_all_row = start_row + len(enriched) - 1
    ws_all.auto_filter.ref = f'A4:Q{last_all_row}'

    # Data validation for Col C in Master
    max_all_row = max(start_row + len(enriched) + 10, 200)
    dv_all = DataValidation(type='list', formula1='"Amazing,Shortlist,Reject,Under Review"', allow_blank=True)
    ws_all.add_data_validation(dv_all)
    dv_all.add(f'C5:C{max_all_row}')

    ws_all.conditional_formatting.add(f'C5:C{max_all_row}', CellIsRule(operator='equal', formula=['"Amazing"'], fill=fill_amazing, font=font_amazing))
    ws_all.conditional_formatting.add(f'C5:C{max_all_row}', CellIsRule(operator='equal', formula=['"Shortlist"'], fill=fill_shortlist, font=font_shortlist))
    ws_all.conditional_formatting.add(f'C5:C{max_all_row}', CellIsRule(operator='equal', formula=['"Reject"'], fill=fill_reject, font=font_reject))
    ws_all.conditional_formatting.add(f'C5:C{max_all_row}', CellIsRule(operator='equal', formula=['"Under Review"'], fill=fill_review, font=font_review))

    # Remove initial default sheet
    wb.remove(default_sheet)

    print(f'8. Saving workbook to {output_path}...')
    wb.save(output_path)

    # Never copy this workbook into public/: it holds participant emails and jury verdicts
    print(f'   Workbook successfully generated and saved to: {output_path}')
    return output_path

if __name__ == '__main__':
    build_evaluation_workbook()
