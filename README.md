# DHARSHAN S — Cinematic Editable ECE Portfolio Platform

A full-stack, Netflix-inspired original dark cinematic portfolio experience built for **DHARSHAN S** (Electronics & Communication Engineering).

## Key Features

- **Cinematic Opening Sequence & 3D Camera Transitions**: Near-black obsidian environment with crimson/purple atmospheric lighting, subtle particle field, tilted 3D perspective interface panels, blur-to-sharp scroll reveals, and reduced-motion accessibility mode.
- **Identity-Locked Animated Digital Portrait**: Renders your real uploaded photo onto a high-DPI HTML5 canvas with natural skin-sampled blinking, subtle breathing anchor motion, eye specular catchlight, gentle idle/pointer 2.5D perspective motion, and sweeping rim lighting—with zero face replacement or identity drift.
- **Complete Editable Sections**:
  - Home / Hero Identity
  - About Me Dossier (CGPA, semester, register no, summary, target roles)
  - Education Timeline (expandable 3D cards)
  - Skill Universe (10 initial categories + search & filter)
  - Project Showcase (full-screen cinema modal with images, videos, problem/solution/contribution, hardware/software stack)
  - Internships Timeline
  - Certifications Gallery (supports JPG, JPEG, PNG, PDF with full-screen modal & PDF viewer)
  - Achievements, Hackathons, Workshops, Training, Awards & Industry Events
  - Contact & Social Links
- **Private Admin Studio & Reusable Media Library (`/admin`)**:
  - Password-protected authentication (initial password: `dharshan@2026`, changeable in Website Settings)
  - Full Add / Edit / Delete / Reorder / Hide-Show / Save / Cancel across all 13 Admin sections
  - Reusable Media Library with upload, preview, in-place replace (auto-updating references), delete, and "Use in Section" assignment
  - Interactive facial anchor calibration for your animated digital portrait
  - JSON backup export and default restore

## Running Locally

```bash
# Development mode (runs Express backend on :4000 and Vite client on :5173)
npm run dev

# Or build and serve production bundle on http://localhost:4000
npm run build
npm start
```

Data is persisted automatically in `data/portfolio.json`, authentication config in `data/auth.json`, and uploaded media files in `uploads/`.
