# Hrok HR Dashboard – Complete User Guide

Hrok is an intelligent HR dashboard built with **Next.js** that helps you manage candidates, job postings, upload resumes in bulk, run AI-powered screening, and chat with an AI assistant about your hiring pipeline. This guide walks you through every screen and feature so you can use them confidently.

---

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Jobs Management](#jobs-management)
4. [Applicants Management](#applicants-management)
5. [Job Applicants Page](#job-applicants-page)
6. [Manual List & Bulk Upload](#manual-list--bulk-upload)
7. [Analysis & AI Screening](#analysis--ai-screening)
8. [AI Shortlist Details](#ai-shortlist-details)
9. [AI Chat Assistant](#ai-chat-assistant)
10. [Navigation & Sidebar](#navigation--sidebar)
11. [File Formats & Upload Instructions](#file-formats--upload-instructions)

---

## Getting Started

### Installation & Setup

1. **Clone the repository** and navigate to the project folder
2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```
3. **Set your API endpoint** by creating a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://umurava-jaq4.onrender.com
   ```
   This tells the frontend where to find the Hrok backend API.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser** and go to `http://localhost:3000` to start using Hrok

### What You'll See on First Visit

When you first open Hrok, you'll land on the **Dashboard** page. The app shows a sleek, modern interface with a dark sidebar on the left (on desktop) and a top navigation area. Your screen will display four big metric cards showing live counts of jobs, applicants, imported candidates, and AI-selected candidates. Below that are two main tables and a sidebar widget showing recent activity. Everything updates in real time as you add candidates and jobs.

---

## Dashboard Overview

The Dashboard is your home screen—a quick snapshot of your entire hiring operation. Think of it as your hiring command center.

### What You See on the Dashboard

**Top metrics (four colorful cards):**
- **Total Jobs:** Count of all job openings you've created (live count)
- **Total Applicants:** Total number of candidates across all jobs (live count)
- **Imported Applicants:** Candidates brought in via CSV, Excel, JSON, or resume uploads (not manually typed) (live count)
- **Selected by AI:** Candidates who passed AI screening and were marked as "Selected" (live count)

Each metric card displays a green "live" indicator, showing that Hrok is actively connecting to your backend and updating counts.

**Job Overview Table (left side, main area):**
This table lists your recent jobs (limited to the 8 most recent). For each job, you can see:
- **Job Role:** The job title (e.g., "Senior Backend Developer")
- **Company Name:** Actually the department or team hiring for this role
- **Applicants:** How many people have applied to this job
- **Seniority Level:** Required experience (e.g., "3+ years") or "Not specified"

Hover over rows to highlight them and get a subtle effect that tells you the row is interactive.

**Recent Applicants Table (left side, below jobs):**
This shows your 8 most recently added candidates. For each, you see:
- **Applicants:** The person's full name
- **Job Role:** The first job they applied for (or "Unassigned")
- **Experience:** Their most recent job title from their experience history
- **Skills:** Their top two skills, comma-separated

**AI Shortlist Card (right side):**
This is a live feed of the top 5 candidates ranked by AI across all screenings. Each candidate row shows:
- **Avatar with initials:** Two-letter initials of the candidate (blue background)
- **Candidate name and role:** Full name and their job role
- **Match percentage:** AI's confidence score (e.g., "92%") in a green badge

If no AI screening has been run yet, this card shows a message: "No AI screening results available yet."

**Recent Manual List Card (right side, below shortlist):**
Lists the 6 most recent candidates imported from file uploads (CSV, Excel, JSON, or resumes). Each entry shows:
- A file icon and the person's name
- The import source in parentheses (e.g., "Resume PDF" or "CSV Upload")

Hover over an entry to reveal a download button (for future use).

### What You Can Do on the Dashboard

- **Search:** Use the search bar at the top to find applicants or jobs by name
- **View live updates:** All metric cards refresh automatically when data changes on the backend
- **Navigate to detail pages:** Click on a job or applicant item to view more details (the table rows are clickable links)
- **Access other pages:** Use the sidebar (or hamburger menu on mobile) to jump to Jobs, Applicants, or other sections

### How the Dashboard Loads

When the page first opens, you'll see skeleton loaders (gray placeholder boxes) for a moment while the app fetches data from the backend. Once data arrives, the real content replaces the placeholders. If the backend is unreachable, you'll see an error message at the top asking you to try again.

---

## Jobs Management

The **Jobs** page lets you view all your job postings, create new ones, upload multiple jobs at once from a file, and run AI screening on candidates for each job.

### Navigating the Jobs Page

**Top section (header):**
- **Left side:** "Jobs Management" title and a short description
- **Search bar:** Find jobs by title, department, or location
- **Refresh button:** Manually reload the job list

**Filter buttons (below header):**
- **All Jobs:** Shows every job (default view)
- **Open:** Shows only jobs marked as "open" and accepting applications
- **Closed:** Shows only jobs marked as "closed" (no longer accepting applications)

**Action buttons (top right):**
- **Bulk Upload:** Opens a modal to upload multiple jobs from a JSON or spreadsheet file
- **Create Job:** Opens a form to manually create a new job one at a time
- **Refresh:** Manually pull the latest data from the backend

### Job Cards (Grid Layout)

Each job appears as a card in a **3-column grid** (on large screens; fewer columns on tablets). Each card shows:

**Job title and status:**
- Large job title at the top
- A green "Open" badge (if accepting applications) or red "Closed" badge (if not)

**Job details:**
- Department, location, and required experience
- Job description (if provided)
- Required skills (as blue pills/tags)
- Preferred skills (as purple pills/tags)

**Quick stats (bottom of card):**
- **Applicants count:** Number of people who have applied
- **AI Shortlist count:** Number of candidates marked "Selected" by AI screening
- **Posted date:** When this job was created

**Action buttons on each card:**
- **View Details:** Opens a modal with the full job description, responsibilities, education requirements, and skill lists
- **View Applicants:** Takes you to the "Job Applicants" page for this job (shows all candidates who applied)
- **Run AI Shortlist:** Starts the AI screening process and redirects you to the "AI Shortlist Details" page
- **Delete:** Removes the job (with a confirmation dialog)

### Creating a New Job

Clicking **"Create Job"** opens a modal form. Fill in:

- **Job Title** (required): e.g., "Senior Software Engineer"
- **Department**: e.g., "Engineering"
- **Location**: e.g., "Remote" or "New York, NY"
- **Minimum Years Experience**: Number, e.g., "3"
- **Description**: Multi-line text describing the role and responsibilities
- **Required Skills** (comma-separated): e.g., "React, Node.js, MongoDB"
- **Preferred Skills** (comma-separated): e.g., "Docker, AWS, TypeScript"
- **Job is open for applications**: Checkbox (if checked, the job is "Open"; if unchecked, it's "Closed")

Click **"Create Job"** to save. If successful, the page refreshes and your new job appears in the grid.

### Bulk Uploading Jobs

Clicking **"Bulk Upload"** opens a modal where you can:

1. **Choose upload format:**
   - JSON file
   - CSV file
   - Excel (XLS/XLSX) file

2. **Select your file** by clicking a drop zone or dragging/dropping the file

3. **See visual feedback** once a file is selected (file name appears in the upload area)

4. Click **"Upload & Import"** to send the file to the backend

After upload, the page lists all jobs that were successfully added or imported. You'll see a success or error message.

### Viewing Job Details

Click **"View Details"** on any job card to open a modal showing:
- Location and department
- Years of experience required
- Full job description
- Detailed skill requirements (required vs. preferred)
- Responsibilities (if provided)
- Education requirements (if provided)

You can close this modal by clicking the X or clicking outside the modal.

### Empty State

If no jobs match your current filters, you'll see a large card in the center of the page saying:
- "No jobs found"
- Either "Try adjusting your search" (if searching) or "Create your first job posting" (if no jobs exist)
- A **"Create Job"** button for quick access

---

## Applicants Management

The **Applicants** page displays all candidates across all jobs in one searchable, filterable list. This is your master roster of everyone in your hiring pipeline.

### Navigating the Applicants Page

**Top section:**
- **Large title:** "All Applicants" and a description
- **Search bar:** Find candidates by name or email
- **Filter buttons:** (Not visible by default but can be toggled)

**Action buttons (top right):**
- **Create New:** Opens a modal to manually add a single candidate
- **Link to Job:** Opens a modal to link an existing candidate to a job
- **Bulk Upload:** Opens a modal to upload candidates from a file (JSON, CSV, Excel, or resume PDF/DOC)
- **Refresh:** Reload the candidate list

### Candidate Cards (Grid or List Layout)

Each candidate appears as a card with:

**Candidate avatar and basic info:**
- Circular avatar with name initials (first letters of first and last name)
- Full name (clickable for a detailed view)
- Email address
- Location (if provided)

**Status badge:**
- Colored indicator showing their application status: "Applied", "Screened", "Shortlisted", or "Rejected"

**Quick info (if available):**
- Top 2 skills (as blue tags)
- Most recent job role
- Source where they came from (e.g., "Resume Upload", "CSV Upload", "External API", or "Manual")

**Action buttons on each card:**
- **View Details:** Opens a large modal with the candidate's full profile (see "View Applicant Details" below)
- **Update Status:** Opens a modal to change the application status
- **Delete:** Removes the candidate (with confirmation)

### Creating a New Candidate Manually

Click **"Create New"** to open a form. Fill in:

**Basic info (required):**
- **First Name**
- **Last Name**
- **Email**

**Optional profile fields:**
- **Headline:** e.g., "Senior Product Manager"
- **Location:** e.g., "San Francisco, CA"
- **Bio:** A brief paragraph about them
- **Skills** (comma-separated): e.g., "Product Strategy, Data Analysis, Python"
- **Experience** (format: "Job Title | Company"): e.g., "Senior PM | Apple" (one per line)
- **Education** (format: "Degree | Institution"): e.g., "MBA | Stanford" (one per line)
- **Projects** (comma-separated): e.g., "Mobile App Alpha, API Gateway"
- **LinkedIn URL:** Link to their LinkedIn profile
- **GitHub URL:** Link to their GitHub profile
- **Link to Job (optional):** Select which job this candidate is applying for
- **Link to Multiple Jobs (optional):** Hold Ctrl/Cmd to select more than one job

Click **"Create Applicant"** to save. The candidate appears in your list immediately.

### Bulk Uploading Candidates

Click **"Bulk Upload"** to open a modal. Choose the upload type:

- **JSON:** Upload a JSON file with candidate objects
- **CSV/XLSX:** Upload a spreadsheet with candidate rows
- **Resume:** Upload a PDF or Word document; Hrok's AI will parse it and extract candidate info

You can optionally link all uploaded candidates to a job from a dropdown. Click **"Upload & Import"** to send the file. After upload, you'll see a success/error message and the number of candidates imported.

### Linking a Candidate to a Job

Click **"Link to Job"** to open a modal where you can:
1. Select an existing candidate from a dropdown
2. Select a job
3. Click **"Link Applicant"** to create the connection

The candidate now appears in that job's applicant list.

### Viewing Candidate Details

Click **"View Details"** on any candidate card (or click their name) to open a large modal showing their full profile:

- **Avatar and name** (large text)
- **Headline** (if set)
- **Email and phone** (if provided)
- **Location** (if provided)
- **Bio** (if set)
- **Skills** (as tags with proficiency levels if available)
- **Experience history** (job title, company, dates, description)
- **Education** (degree, institution, field of study)
- **Projects** (names and descriptions)
- **Languages** (if provided)
- **Certifications** (if provided)
- **Social links** (LinkedIn, GitHub, Portfolio) as clickable links
- **Availability** (employment type preference: Full-time, Part-time, etc.)
- **Job applications** (list of jobs they've applied for, with status for each—Applied, Screened, Shortlisted, Rejected)
- **Source** (where they came from: Manual, Resume, CSV, API, etc.)

Close the modal by clicking the X or outside the modal.

### Filtering & Searching

- **Search bar:** Type a candidate's name or email to narrow results instantly
- **Filter by status:** (If available) Click status buttons to show only candidates with a specific application status

### Empty State

If no candidates are in the system, you'll see:
- A large card saying "No applicants yet"
- A prompt to create your first applicant
- A **"Create New"** button for quick access

---

## Job Applicants Page

The **Job Applicants** page shows all candidates who have applied to a single, specific job. It's like a filtered view of the Applicants page, but scoped to one job.

### Navigating to Job Applicants

You can reach this page by:
- Clicking **"View Applicants"** on a job card in the Jobs page
- Clicking a job link from the dashboard tables

### Page Layout

**Top section (job header):**
- **Job title and status badge:** Large job title with "Open" or "Closed" status
- **Job info:** Department, location, experience requirements
- **Action buttons:**
  - **AI Analytics:** Takes you to AI screening for this job (if not already run)
  - **Link Applicant:** Opens a modal to add an existing candidate to this job
  - **Refresh:** Reload the applicant list

**Status filter cards:**
Five clickable cards showing counts:
- **All:** Total applicants
- **Applied:** Candidates with "Applied" status
- **Screened:** Candidates AI has screened
- **Shortlisted:** Candidates marked as "Selected"
- **Rejected:** Candidates marked as "Reject"

Click any card to filter the list to show only that status.

**Search bar:** Find applicants by name or email

**Applicant cards (list):**
Each card shows the candidate's:
- Avatar with initials
- Full name and email
- Headline (if set)
- Status badge (with an icon)
- Top skills (as blue tags)
- Experience summary
- Application date
- Refresh button to update status

**Action on each card:**
Click the refresh icon to open a modal to update the applicant's status (Applied → Screened → Shortlisted → Rejected).

### Linking a New Applicant to This Job

Click **"Link Applicant"** to open a modal with:
- A searchable dropdown of all candidates not yet linked to this job
- Click a candidate to select them
- Click **"Link Applicant"** to confirm

The candidate now appears in this job's applicant list.

### Empty State

If no applicants for this job:
- Large card saying "No applicants found"
- A **"Link Applicant"** button to add the first one

---

## Manual List & Bulk Upload

The **Manual List** page (titled "Manual List & Bulk Upload") is your data import hub. It's where you upload candidates (resumes, spreadsheets, JSON) and jobs from files, view statistics on past uploads, and see the history of all imports.

### Page Layout

**Top section (header):**
- **Page title and description**
- **Refresh button:** Reload all upload history and statistics

**Statistics cards (6 cards):**
Showing live backend data:
- **Total Uploads:** Cumulative count of all upload attempts
- **Successful:** Uploads that completed without errors
- **Failed:** Uploads that encountered errors
- **Candidates Added:** Total candidates created from uploads
- **Jobs Added:** Total jobs created from uploads
- **Success Rate (%):** Percentage of uploads that succeeded

**Charts (optional, if available):**
Two charts may appear below stats (if your backend provides historical data):
- **Upload Activity (Last 7 Days):** An area chart showing daily upload counts over the past week
- **Uploads by Type:** A pie chart breaking down uploads by type (Candidates JSON, Resume, CSV, etc.)

**Upload Cards Grid:**

The page displays four upload cards for candidates:

1. **Candidates JSON**
   - Accepts `.json` files
   - Description: "Upload JSON file with candidates array. Supports NDJSON, comments, trailing commas."
   - Optional job selector dropdown
   - Drag/drop upload area

2. **Candidates Spreadsheet**
   - Accepts `.csv`, `.xls`, `.xlsx` files
   - Description: "Upload CSV, XLS, or XLSX. Columns: firstName, lastName, email, skills, etc."
   - Optional job selector dropdown
   - Drag/drop upload area

3. **Resume Upload**
   - Accepts `.pdf`, `.doc`, `.docx` files
   - Description: "Upload PDF, DOC, DOCX. AI parses and creates candidate profile automatically."
   - Optional job selector dropdown
   - Drag/drop upload area

4. **Reparse Candidate**
   - Accepts `.pdf`, `.doc`, `.docx` files
   - Description: "Upload new document for existing candidate to refresh parsed profile."
   - **Candidate selector dropdown** (instead of job selector)
   - Drag/drop upload area

Two upload cards for jobs:

5. **Jobs JSON**
   - Accepts `.json` files
   - Description: "Upload JSON file with jobs array."
   - No job selector (uploads jobs globally)

6. **Jobs Spreadsheet**
   - Accepts `.csv`, `.xls`, `.xlsx` files
   - Description: "Upload CSV, XLS, or XLSX. Columns: title, department, location, etc."
   - No job selector

### How to Upload

For each card:
1. Click the card or drag a file onto it
2. Select a file from your computer
3. (Optional) Select a job to link all uploads to that job
4. Click **"Upload & Import"** (or the upload button)
5. Wait for the upload to complete
6. See a success message with the number of items imported
7. The page refreshes and updated stats appear

### Upload History Section

Below the upload cards, you'll see a list of all past uploads:

Each row shows:
- **File name:** The uploaded file's name
- **File type:** The format (JSON, Spreadsheet, Resume, etc.)
- **Upload date/time:** When it was uploaded
- **Status:** Green checkmark for success or red X for failed
- **Count:** How many items were uploaded (e.g., "5 candidates", "1 resume parsed")
- **Message:** Additional details (e.g., "Successfully uploaded 3 candidates")

You can scroll through the list to see your upload history over time.

### Format Instructions (Bottom)

A blue banner at the very bottom shows:
- **Supported file formats** (JSON, CSV, XLS, XLSX, PDF, DOC, DOCX)
- **Example JSON format** for candidates and jobs
- **CSV column headers** for candidates and jobs

Refer to this section when preparing your files.

### Empty State

If you've never uploaded anything:
- The history section shows "No Upload History"
- A prompt to "Upload your first file"
- A cloud upload icon

---

## Analysis & AI Screening

The **Analysis** page displays a summary of all AI screening results (past analyses) and allows you to run a new AI screening operation on any job.

### Navigating the Analysis Page

**Top section (header):**
- **Page title:** "Analysis" 
- **Description:** "Run AI analyses on your jobs and review ranked candidates"
- **Action buttons:**
  - **Refresh:** Reload all screening data
  - **New Analysis:** Opens a modal to run AI screening on a selected job

**Sidebar (on the right, desktop):**
Shows a list of all past screening operations. Click one to see its results (or the main area below displays the most recent).

### Analysis Summary Cards

Below the header, you see cards summarizing past screening operations:

Each card shows:
- **Job title and department**
- **Date/time the screening was run**
- **Status badge:** "AI Powered (Gemini)" if using AI, "Fallback Mode (Local)" if using a fallback algorithm
- **Top candidates preview:** Brief text listing the top-ranked candidates
- **Action buttons:** "View Details" and "Delete"

Click a card to expand its details.

### Running a New AI Screening

Click **"New Analysis"** to open a modal form:

1. **Select a job** (required dropdown)
2. **Top N candidates** (optional number field, default 10): How many top candidates to rank
3. **Custom prompt** (optional text field): Add special criteria for the AI (e.g., "Prioritize startup experience")
4. Click **"Run AI Screening"** to start

The page redirects to the **"AI Shortlist Details"** page for that job, where you'll see the results in real time.

### Empty State

If no screening has been run on any job:
- A message says "No screening results yet"
- A prompt to "Run your first analysis"
- A **"New Analysis"** button

---

## AI Shortlist Details

The **AI Shortlist Details** page (or "Analyse" page) shows the detailed results of an AI screening operation for a specific job. It ranks candidates from best to worst match.

### Navigating to Shortlist Details

You reach this page by:
- Clicking **"Run AI Shortlist"** on a job card in the Jobs page
- Clicking **"View Details"** on a screening summary in the Analysis page
- Navigating directly via a job's AI action

### Page Layout

**Top section:**
- **Job name and department**
- **Refresh button**
- **Custom analysis button** (to run a new analysis with different settings)

**Top candidates preview cards:**
Five quick-reference cards showing the top 5 ranked candidates:
- Candidate name and initials
- Current status (Applied, Screened, Shortlisted, etc.)
- Rank number (#1, #2, etc.)
- Match score (AI confidence %)

**Full ranking list (main section):**
A detailed list of all candidates ranked by AI for this job, ordered by score (highest to lowest).

### Ranked Candidate Card Details

Each candidate card shows:

**Card header:**
- **Rank badge:** "#1", "#2", etc., in a medal-colored circle (gold for 1st, silver for 2nd, bronze for 3rd)
- **Candidate name and email**
- **Decision badge:** "Selected", "Consider", or "Reject" with a color (green, yellow, or red)
- **Location** (if available)
- **Score circle:** A large circular progress indicator showing the match percentage (0-100%)

**Explanation:**
A one-line summary of why the AI ranked this candidate highly or lowly.

**Quick tags:**
- **Strengths** (green tags with checkmarks): Key reasons the AI liked this candidate (e.g., "Strong React skills", "Leadership experience")
- **Concerns** (red tags with X marks): Potential issues the AI flagged (e.g., "No AWS experience", "Short tenure at last job")

**AI Confidence indicator:**
A small bar and percentage showing how confident the AI is in this ranking (0-100%).

**"Show Details" button:**
Click to expand the card and see:
- **Detailed Scores:** Breakdowns of skill score, experience score, education score, project score, and overall score
- **Full Strengths:** Complete list of identified strengths
- **Full Concerns:** Complete list of identified concerns
- **Weaknesses:** Specific gaps in the candidate's profile
- **Missing Requirements:** Skills or qualifications the job requires but the candidate lacks
- **Confidence:** Overall AI confidence in this ranking

**AI Model badge:**
A small badge indicating if this was powered by Google Gemini AI (if available) or a local fallback model.

### Actions on Ranked Candidates

- **View Full Profile:** Click the candidate's name to open their detailed profile (same as in the Applicants page)
- **Update Status:** Some cards have a button to change the candidate's application status
- **Export:** (If available) Download the ranking as a report

### Filtering & Sorting

- **Decision filter:** (If available) Show only "Selected", "Consider", or "Reject" candidates
- **Score filter:** (If available) Show candidates above a certain match score threshold
- **Search:** (If available) Find a candidate by name

### Empty State

If no candidates have been ranked for this job:
- A message saying "No candidates ranked yet"
- A prompt to "Run AI screening" for this job

---

## AI Chat Assistant

The **Chat** page is a conversational interface with an AI assistant fully trained on your hiring data. You can ask it questions about candidates, jobs, screening results, trends, and hiring strategies.

### Navigating the Chat Page

**Left sidebar (Chat History):**
Displays a list of all your past conversations (chat sessions). 

Each session entry shows:
- **Conversation title** (auto-generated from your first message or custom-named)
- **Date** (e.g., "Today", "Yesterday", "3 days ago")
- **Job context badge** (if the chat is linked to a specific job)

**Features on each session:**
- Click to switch to that conversation
- Hover to reveal rename and delete buttons
- Delete a conversation to remove it permanently

**"New Chat" button:**
Starts a fresh conversation.

**Sidebar footer:**
Shows "AI Assistant powered by Gemini" if available, or "AI Assistant powered by Local Model" if using a fallback.

### Main Chat Area

**Top header:**
- **Toggle sidebar button** (to show/hide chat history)
- **AI title and current conversation name**
- **Job selector dropdown** (optional): Choose a job to add context to this conversation

**Messages area (center):**
A scrolling list of all messages in the current conversation, alternating between:

**User messages (your prompts):**
- Blue bubble on the right side
- White text
- Your question or command

**AI responses (assistant replies):**
- Gray/white bubble on the left side
- Black text
- The AI's answer, which can include:
  - Plain text explanations
  - Formatted lists (if the AI provides bullet points or numbered steps)
  - **Charts and visualizations:** The AI can embed bar charts, pie charts, or line graphs directly in its response (e.g., "Here's a breakdown of candidate skills by department" with an embedded pie chart)
  - Markdown formatting (bold, italics, links)

**Message actions:**
Hover over the AI's response to reveal:
- **Copy button:** Copy the response text to your clipboard
- **Regenerate button:** Ask the AI to re-answer the same question

**Suggested prompts (empty chat):**
When you start a new conversation, the AI displays four suggested questions:
- "Show me top candidates for this job"
- "What are the common skills among applicants?"
- "Summarize the hiring pipeline"
- "Suggest interview questions for top candidates"

Click any suggestion to send it immediately.

### Input Area (Bottom)

**Large text input field:**
- Placeholder: "Ask AI about candidates, jobs, or recruitment..."
- Auto-expands as you type (up to a limit)
- Supports multi-line input (press Shift+Enter for a new line; just Enter sends the message)

**Send button:**
- Large button on the right with a paper plane icon
- Disabled if the input is empty or the AI is still responding

**Disclaimer:**
Below the input: "AI may generate inaccurate information. Always verify critical decisions."

### Example Conversations

**Example 1: Candidate overview**
- **You:** "Show me the top 5 candidates for the Senior Engineer role"
- **AI:** Lists the top 5 candidates with their match scores, key skills, and strengths, plus an embedded bar chart showing their match scores side-by-side

**Example 2: Skills analysis**
- **You:** "What are the most common skills among all applicants?"
- **AI:** Provides a text summary and an embedded pie chart showing the distribution of skills across all candidates

**Example 3: Strategic question**
- **You:** "We're focusing on hiring people with machine learning experience. How many of our current shortlisted candidates have ML skills?"
- **AI:** Analyzes your shortlist and reports back with exact counts, names, and recommendations

### Managing Chat Conversations

**Switching conversations:**
Click any session in the left sidebar to load that conversation.

**Renaming a conversation:**
Hover over a session title in the sidebar, click the three-dot menu, and select "Rename". Type a new name and press Enter.

**Deleting a conversation:**
Hover over a session, click the three-dot menu, and select "Delete". Confirm in the dialog that appears.

**Starting a new chat:**
Click the **"New Chat"** button at the top of the sidebar. A fresh conversation window opens.

### Job Context

If you select a job from the **"Job selector dropdown"** at the top of the chat area, the AI will provide answers specific to that job. For example:
- "Show me candidates who applied to this job"
- "What skills are most important for this role?"
- "How does our applicant pool match the job requirements?"

---

## Navigation & Sidebar

The app has two main navigation areas: a **main sidebar** (on the left, on desktop) and a **chat sidebar** (on the right, on the Chat page only).

### Main Sidebar (Left)

**Always visible on desktop; hidden on mobile (use the hamburger menu to toggle).**

**Logo section at the top:**
- "Hrok HR Dashboard" logo and branding
- "Intelligence Suite" tagline

**Navigation menu items (in order):**
1. **Dashboard** — Home screen with metrics and overview
2. **Jobs** — Job posting management
3. **Applicants** — Master list of all candidates
4. **Manual List** — Bulk upload and import hub
5. **Analysis** — AI screening results summary
6. **Chat** — AI assistant conversations

Each menu item shows:
- An icon on the left
- The page name
- A small status line (e.g., "Current section", "Open this section")

**Active state:** The current page is highlighted with a cyan/blue gradient background and a bright left border.

**Footer (bottom of sidebar):**
- A green pulsing dot indicating "AI Assistant Active"
- A note: "Use Analysis and Shortlist to review live candidate rankings from the backend."

### Mobile Navigation

On mobile (phones and small tablets):
- The sidebar is hidden by default
- A **hamburger menu button** (three horizontal lines) appears in the header of each page
- Click the hamburger to slide the sidebar in from the left (with a dark overlay behind it)
- Click the overlay or X button to close the sidebar

### Chat Sidebar (Right, on Chat Page Only)

Visible on desktop; toggleable with a button on mobile.

**Header:**
- "Chat History" title
- **"New Chat"** button (create a new conversation)

**Session list:**
All past conversations, ordered by most recent first.

**Each session entry shows:**
- Session title
- Last updated date
- Optional "Job Context" badge
- Hover to reveal rename/delete buttons

**Footer:**
- "AI Assistant powered by Gemini" (or fallback model info)

---

## File Formats & Upload Instructions

### JSON Format for Candidates

**Single candidate object (basic):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "headline": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "skills": [
    { "name": "React", "level": "Advanced" },
    { "name": "Node.js", "level": "Advanced" }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Senior Developer",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31"
    }
  ],
  "education": [
    {
      "institution": "Stanford University",
      "degree": "Bachelor of Science",
      "field": "Computer Science"
    }
  ]
}
```

**Candidates array (bulk):**
```json
{
  "candidates": [
    { /* candidate 1 */ },
    { /* candidate 2 */ }
  ]
}
```

### CSV Format for Candidates

**Column headers:**
```
firstName, lastName, email, headline, location, skills, experience, education, projects, linkedin, github, portfolio
```

**Example row:**
```
John, Doe, john@example.com, Senior Software Engineer, San Francisco CA, React | Node.js | MongoDB, CTO at StartupX | Dev at TechCorp, BS Comp Sci Stanford, E-commerce Platform | API Gateway, https://linkedin.com/in/johndoe, https://github.com/johndoe, https://johndoe.dev
```

Note: Multi-value fields (skills, experience) use pipe (|) as separator; complex objects should also be pipe-separated.

### JSON Format for Jobs

**Single job object:**
```json
{
  "title": "Senior Backend Developer",
  "department": "Engineering",
  "location": "Remote",
  "description": "We are looking for an experienced backend engineer...",
  "requiredSkills": ["Node.js", "MongoDB", "Docker"],
  "preferredSkills": ["Kubernetes", "AWS", "GraphQL"],
  "minYearsExperience": 5,
  "isOpen": true
}
```

**Jobs array (bulk):**
```json
{
  "jobs": [
    { /* job 1 */ },
    { /* job 2 */ }
  ]
}
```

### CSV Format for Jobs

**Column headers:**
```
title, department, location, description, requiredSkills, preferredSkills, minYearsExperience, isOpen
```

**Example row:**
```
Senior Backend Developer, Engineering, Remote, We are seeking a backend engineer..., Node.js | MongoDB | Docker, Kubernetes | AWS | GraphQL, 5, true
```

### Resume Upload (PDF/DOC/DOCX)

Simply upload a single resume file. The AI will parse it automatically and create a candidate profile with extracted information (name, email, skills, experience, education, etc.).

To **reparse** an existing candidate:
- Go to the **Manual List** page
- Use the "Reparse Candidate" upload card
- Select the candidate to update
- Upload a new resume file
- The candidate's profile will be updated with info from the new file

---

## Troubleshooting & Common Questions

### The app shows "API connection error"

- Ensure the `NEXT_PUBLIC_API_BASE_URL` environment variable is set correctly in your `.env.local` file
- Verify the backend API is running and accessible at that URL
- Check your internet connection
- Try refreshing the page (Ctrl+R or Cmd+R)

### Files won't upload

- Ensure your file format matches the accepted types (JSON, CSV, XLSX for bulk uploads; PDF/DOC/DOCX for resumes)
- Check the file size (very large files may timeout)
- Ensure the file contains valid data in the expected format (see "File Formats" section above)
- Try uploading again; if the error persists, check the backend logs

### AI Chat is not responding

- The backend AI service might be temporarily unavailable
- Try a different question or wait a moment and try again
- If using a job context, ensure the job is fully configured
- Check for typos or unclear phrasing in your prompt

### Candidates or jobs not appearing after upload

- Refresh the page after a successful upload
- Check the upload history to confirm the upload succeeded
- Ensure the file contained valid data in the correct format
- Try uploading a smaller test file to verify the upload process

### Charts not displaying in Chat

- The AI response may not have included visualization data
- Try asking the question differently (e.g., "Show me a chart of candidate skills")
- Some analytics questions may not generate charts if the data isn't suited to visualization

---

## Best Practices

1. **Regularly refresh:** Use the Refresh button on each page to pull the latest data from the backend
2. **Organize jobs:** Group similar job postings by department or role to make management easier
3. **Bulk upload:** For large candidate batches, always use bulk upload (JSON or CSV) instead of manually adding one by one
4. **Use AI Screening:** Run AI screening on your jobs to quickly rank candidates and identify top matches
5. **Chat with AI:** Use the AI assistant to ask strategic questions about your hiring pipeline
6. **Review high-confidence matches:** Focus your interview efforts on candidates ranked highly by AI (90%+ match score)
7. **Backup your data:** Periodically export your candidate and job data for backup purposes
8. **Keep profiles updated:** When you get new information about a candidate, use the Reparse feature to keep their profile current

---

## Summary

Hrok is a powerful, modern HR tool that combines **data management** (uploading and organizing candidates and jobs), **AI-powered screening** (ranking candidates automatically), and **intelligent chat** (asking questions about your hiring pipeline) into one sleek interface.

By following this guide:
- You now understand every page, feature, and action available
- You can confidently navigate the app and perform all major tasks
- You know how to upload data in the correct formats
- You can leverage AI to make smarter hiring decisions faster

Start with the **Dashboard** to get a quick overview of your pipeline, then use **Jobs** and **Applicants** to build your candidate pool. Run **AI Screening** to rank candidates, and use the **Chat** assistant to gain strategic insights. Upload new candidates and jobs regularly using the **Manual List** page. Happy hiring!
