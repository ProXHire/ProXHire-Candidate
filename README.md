# ProXHire — Candidate & Student Portal (`candidate.proxhire.in`)

Official Student and Candidate registration & career dashboard for **ProXHire — India's Ultimate Career Bridge**.
Designed for deployment on the dedicated subdomain **`candidate.proxhire.in`**.

---

## 🏛 Architecture & Multi-Subdomain Topology

The ProXHire platform operates as a cohesive multi-portal ecosystem:

- **`candidate.proxhire.in` (`proxy-candidate`)**: Student & Job Seeker Onboarding (6 Steps) + Career Dashboard (Port 3003 / 5177)
- **`Employer.proxhire.in` (`proxy-employer`)**: Recruiter & Company Registration (5 Steps) + Recruitment Dashboard (Port 3002 / 5175)
- **`proxhire.in` (`proxy-hire`)**: Main Discovery & Marketing Portal (Port 3000)
- **`admin.proxhire.in` (`proxy-admin`)**: Super Admin & Verification Operations Dashboard (Port 3001)
- **`api.proxhire.in` (`proxy-backend`)**: Unified RESTful API & Prisma Database

### DNS & Vercel Deployment
To connect `candidate.proxhire.in`:
1. In Vercel Project Settings for `proxy-candidate`, assign custom domain `candidate.proxhire.in`.
2. In your DNS provider (e.g. Cloudflare / Route53 / GoDaddy):
   - **Type**: `CNAME`
   - **Name**: `candidate`
   - **Target**: `cname.vercel-dns.com`

---

## 🎨 The 7 Screens Implemented (Pixel-Perfect from `Candidate/` Designs)

### 1. Step 1: Experience Selection (`ProXHire Career Onboarding Interface.png`)
- **Left Hero Panel**: Brand logo (*"INDIA'S ULTIMATE CAREER BRIDGE"*), headline *"One Profile. Limitless Opportunities."*, 4 value pillars, and bottom script signature *"Shape What's Next"*.
- **Right Form Body**: Stepper (Step 1 active), *"Let's get started"* headline.
- Two interactive cards:
  - **I am a Fresher**: Academic mortarboard graduation cap on a 3D pedestal, subtitle *"I am a student or recent graduate and do not have any prior work experience."*, and tags (`Students`, `Recent Graduates`, `No Experience`).
  - **I have work experience**: Modern briefcase on a 3D pedestal, subtitle *"I have worked in a company before and have relevant work experience."*, and tags (`Professionals`, `Experienced`, `Career Switch`).

### 2. Step 2: Basic Account Details (`Monochrome Career Signup Interface.png`)
- Form inputs: Full Name, Email ID, Mobile Number (+91 country code), PAN Number, Password & Confirm Password with visibility toggles.
- Dynamic password strength meter (4 bar indicator).
- **Pre-BGV Consent Card**: Checkbox with info tooltip and clickable *"View Pre-BGV Notice"* modal dialog.
- Terms & Conditions and Privacy Policy agreement checkbox.

### 3. Step 3: Resume, Education & Skills (`ProXHire Resume Profile Interface.png`)
- **Resume Card**: Drag & drop upload box (supporting PDF, DOC, DOCX, RTF up to 2MB) and *"Create Resume"* builder trigger.
- **Profile Introduction Card**: Profile Tagline / Professional Summary textarea with live character counter (`0 / 300`).
- **Education Details**: Empty state with graduation cap icon and `+ Add Education` modal dialog.
- **Key Skills**: Empty state with star icon, `+ Add Skill` modal dialog, and removable skill badges.

### 4. Step 4: Employment, Projects & Career Profile (`Monochrome Candidate Career Profile UI.png`)
- **Employment Details**: Experience history empty state and `+ Add Experience` modal dialog.
- **Projects**: Academic & personal project empty state and `+ Add Project` modal dialog.
- **Career Profile Card**: Preferred Role, Industry, Department, and Employment Type dropdowns.
- **Job Preferences Card**: Preferred Locations, Work Type (`Remote`, `Hybrid`, `On-site`), Preferred Shifts, and Expected CTC annual range.

### 5. Step 5: Personal Details & Additional Information (`proXHire Personal Details Onboarding Interface.png`)
- **4-Quadrant Layout**:
  1. *Personal Details*: Date of Birth, Nationality, Gender, Category, Marital Status, Work Permit.
  2. *Address Details*: Address Line 1, Address Line 2, City, State, PIN Code.
  3. *Diversity & Inclusion (Optional)*: Disability status, Career gap, Government experience, Relocation willingness.
  4. *Online Presence*: LinkedIn, GitHub, Portfolio / Website URLs.
- **Achievements & Certifications (Optional)**: Full-width bottom dropzone with `+ Add Achievement / Certification` modal dialog.

### 6. Step 6: Review Your Profile (`ProXHire Profile Review Dashboard.png`)
- Accordion list with direct `Edit` triggers for:
  1. *Experience Type*
  2. *Basic Account Details*
  3. *Resume, Education & Skills*
  4. *Employment, Projects & Career Profile*
  5. *Personal Details & Additional Information*
- **Final Confirmation**: Shield icon with verification notice and checkbox: `[x] I confirm and complete my registration`.
- Celebratory confetti burst upon completion.

### 7. Screen 7: Candidate Dashboard (`Monochrome Job Portal Dashboard.png`)
- **Navbar**: Brand header, active Dashboard tab, Find Jobs, Applications, Saved Jobs, Messages, Career Resources dropdown, Notification bell, and Profile avatar pill (*"SK" - Sree Kumar*).
- **Welcome Hero Banner**: Modern dark brutalist architectural graphic, *"Welcome back, Sree Kumar"*, search input with *"Search Jobs →"*, and right badge *"EXPLORE 10,000+ Job Opportunities Across India"*.
- **Complete Your Profile Widget**: 75% circular progress ring, checklist items, and *"Complete Profile →"* button.
- **4 KPI Metric Cards**: Matching Jobs (`24`), Applications (`8`), Saved Jobs (`12`), Interviews (`3`).
- **Recommended Jobs Grid**: Infosys, TCS, Accenture cards with role, location, work type tags, experience, bookmarking, and interactive *"View Details"* modal with 1-click apply.
- **Recent Applications Table**: Status badges for `Under Review`, `Shortlisted`, `Applied`.
- **Quick Actions 2x2 Grid** & **Career Resources List**.

---

## 🚀 Running Locally

```bash
cd proxy-candidate
npm install
npm run dev
```

Server runs on:
`http://localhost:5177/` (or port 5176 / 3003)

### Instant Screen Navigation:
- **Step 1**: `http://localhost:5177/?step=1`
- **Step 2**: `http://localhost:5177/?step=2`
- **Step 3**: `http://localhost:5177/?step=3`
- **Step 4**: `http://localhost:5177/?step=4`
- **Step 5**: `http://localhost:5177/?step=5`
- **Step 6**: `http://localhost:5177/?step=6`
- **Dashboard**: `http://localhost:5177/?view=dashboard`
