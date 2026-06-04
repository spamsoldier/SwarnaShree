# Zinzuwadia Jewellers Website — Content Management Guides

## Folder Structure

```
zinzuwadia-jewellers-website/
│
├── index.html                  ← Main website file (open this in browser)
│
├── content/
│   └── banners/
│       ├── banner-1.jpg        ← Hero slide 1 image (replace to update)
│       ├── banner-2.jpg        ← Hero slide 2 image
│       ├── banner-3.jpg        ← Hero slide 3 image
│       ├── collection-bloom.jpg
│       ├── collection-celestial.jpg
│       ├── collection-riwayat.jpg
│       └── collection-bridal.jpg
│
├── assets/
│   └── products/               ← Drop product photos here
│       └── ring-01.jpg etc.
│
├── data/
│   ├── banners.json            ← Hero slider settings (edit in Notepad/VS Code)
│   ├── products.csv            ← Product catalog (open & edit in Excel)
│   └── collections.csv         ← Collections (open & edit in Excel)
│
└── HOW-TO-UPDATE.md            ← This file
```

---

## How to Update Content

### 1. Changing Hero Banner Images

**Quick swap:** Replace the image files in `content/banners/`:
- `banner-1.jpg` → Hero slide 1
- `banner-2.jpg` → Hero slide 2
- `banner-3.jpg` → Hero slide 3

**Best image specs:** 1920×1080px or larger, JPG format, under 800KB

**To change the text on banners**, edit `data/banners.json`:

```json
[
  {
    "id": 1,
    "collection": "New Collection",     ← Small label at top
    "title": "Bloom",                   ← Large hero title
    "subtitle": "Your tagline here",    ← Subtitle text
    "cta_text": "Book an Appointment",  ← Button text (keep this)
    "image": "content/banners/banner-1.jpg",
    "text_color": "light"
  }
]
```

Add more slides by adding more `{ }` blocks separated by commas.

---

### 2. Adding / Editing Products (Excel)

Open `data/products.csv` in **Microsoft Excel** or **Google Sheets**.

| Column | What it does |
|--------|-------------|
| `id` | Unique number (1, 2, 3...) |
| `name` | Product name shown on card |
| `collection` | Which collection it belongs to |
| `category` | Filter category: `Rings`, `Necklaces`, `Earrings`, `Bracelets`, `Hair & Head` |
| `price` | Price display string e.g. `₹45,000` |
| `description` | Short description under price |
| `image` | Path to image: `assets/products/ring-01.jpg` |
| `featured` | `true` or `false` |
| `new_arrival` | `true` = shows "New" badge |

**To add a product:**
1. Add a new row at the bottom
2. Fill all columns
3. Place the product photo in `assets/products/`
4. Save the CSV (File → Save As → CSV UTF-8)

**To remove a product:** Delete the entire row, save.

**Image tips:**
- Use square or portrait (3:4) images, minimum 600×800px
- JPG format, under 300KB per image
- Name files clearly: `ring-bloom-01.jpg`

---

### 3. Adding / Editing Collections (Excel)

Open `data/collections.csv` in Excel.

| Column | What it does |
|--------|-------------|
| `id` | Unique number |
| `name` | Collection name |
| `tagline` | Short tagline on card |
| `description` | Longer description (used in editorial section) |
| `image` | Path: `content/banners/collection-bloom.jpg` |
| `display_order` | 1, 2, 3, 4... (controls grid order) |

---

### 4. Changing Footer / Static Text

Open `index.html` in any text editor (Notepad, VS Code).

Search for the section you want to edit:
- Footer tagline: search `Fine Jewellery. Enduring Stories.`
- About text in Heritage section: search `guardian of fine jewellery`
- Editorial body text: search `master craftsmen`

---

### 5. Connecting the Appointment Form

Currently the form shows a success message without actually sending data.

To receive real submissions, add **Formspree** (free):

1. Go to https://formspree.io and create a free account
2. Create a new form → get your form endpoint URL
3. Open `js/main.js`, find this line:
   ```js
   // Show success
   modalFormInner.style.display = 'none';
   ```
4. Replace the form submission block with:
   ```js
   const formData = new FormData(appointmentForm);
   await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     method: 'POST',
     body: formData,
     headers: { 'Accept': 'application/json' }
   });
   modalFormInner.style.display = 'none';
   modalSuccess.removeAttribute('hidden');
   ```

---

### 6. Opening the Website

**Option A — Direct (works for viewing only, CSV data may not load):**
Double-click `index.html` → opens in browser

**Option B — With live server (recommended, all features work):**

If you have VS Code installed:
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Site opens at `http://localhost:5500`

If you have Python:
```
cd zinzuwadia-jewellers-website
python -m http.server 5500
```
Then open `http://localhost:5500`

> **Note:** When opened directly as a file (`file://`), the site uses built-in demo data. To load from your CSV files, use a live server.

---

### 7. Deploying Online

**Netlify (recommended, free):**
1. Go to https://netlify.com
2. Drag and drop the entire project folder onto the deploy area
3. Your site is live instantly with a free URL

**GitHub Pages:** Push the folder to a GitHub repo and enable Pages in settings.

---

## Color Reference

| Name | Hex Code | Used For |
|------|----------|----------|
| Rouge Cherry | `#88051E` | Primary brand, buttons, accents |
| Velet Cherry | `#620100` | Hover states, dark accents |
| Cloud Dancer | `#F2EDDE` | Backgrounds, cream sections |
| Cherry Black | `#191311` | Header, footer, dark sections |
| Silver | `#C8C8C8` | Borders, subtle dividers |

---

*For technical help, contact your web developer.*
