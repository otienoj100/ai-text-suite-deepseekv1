# AI Text Suite

A modern, elegant web application featuring three powerful AI-powered text processing tools in one unified dashboard.

## Features

### Text Redactor
Rewrite your text in different tones and dialects:
- Choose between Formal and Informal tones
- Select American or British English dialect
- Real-time word count with 700-word limit
- Copy and download functionality
- Example text for quick testing

### Text Summarizer
Condense long text into concise summaries:
- Three summary length options: Short, Medium, Detailed
- Optional bullet point formatting
- Compression ratio tracking
- Summary history with recent items
- Download summaries as text files

### Blog Generator
Create engaging blog posts with AI:
- Customizable topic and target word count
- Four tone options: Professional, Casual, Humorous, Technical
- Four audience levels: General, Business, Technical, Beginners
- Advanced customization options for structure
- Pre-made templates: How-to Guide, Listicle, Product Review, Opinion Piece
- Multiple export formats (Text, Markdown)

## Design Highlights

- **Glassmorphism**: Modern frosted glass card design with backdrop blur
- **Gradient Background**: Beautiful blue to purple to pink gradient
- **Dark/Light Mode**: Full theme support with persistent preference
- **Responsive Design**: Mobile-first approach that works on all devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Intuitive Navigation**: Pill-button app switcher in the header

## Technical Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: shadcn/ui foundation
- **State Management**: React Context API
- **Animations**: Tailwind CSS animations with custom keyframes
- **Icons**: Lucide React

## Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Main page component
├── globals.css               # Global styles and design tokens
├── api/
│   ├── redact/route.ts       # Text redaction API
│   ├── summarize/route.ts    # Text summarization API
│   └── blog/route.ts         # Blog generation API
components/
├── Header.tsx                # Navigation header
├── Footer.tsx                # Footer component
├── Toast.tsx                 # Toast notification system
└── apps/
    ├── TextRedactor.tsx      # Redactor app component
    ├── TextSummarizer.tsx    # Summarizer app component
    └── BlogGenerator.tsx     # Blog generator app component
contexts/
└── AppContext.tsx            # Global app state management
hooks/
└── useKeyboardShortcuts.ts   # Keyboard shortcut utility
```

## Features Overview

### Theme System
- Automatic light/dark mode detection
- Manual theme toggle in header
- Persistent theme preference in localStorage
- Smooth transitions between themes

### App State
- Current app selection persists on refresh
- Theme preference is saved locally
- Toast notifications for all user actions
- Real-time validation and feedback

### Responsive Layout
- **Mobile**: Stacked vertical layout, full-width buttons
- **Tablet**: Two-column layout where appropriate
- **Desktop**: Full grid layout with optimal spacing

## API Routes

All API routes are located in `app/api/`:

- `POST /api/redact` - Redact text with tone and dialect
- `POST /api/summarize` - Summarize text with length control
- `POST /api/blog` - Generate blog post with customization

## Customization

### Colors
Edit the CSS custom properties in `app/globals.css`:
```css
--primary: 252 80% 60%;      /* Blue */
--secondary: 270 50% 50%;    /* Purple */
--accent: 300 100% 70%;      /* Pink */
```

### Typography
Font configuration in `app/layout.tsx`:
```tsx
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
```

## Future Enhancements

- Real OpenAI API integration
- User authentication and accounts
- Advanced analytics dashboard
- Saved documents and history
- Collaboration features
- API key management
- Custom branding options
- Export to multiple formats (PDF, DOCX)
- Real-time collaboration
- Batch processing

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized images and lazy loading
- CSS-in-JS with minimal overhead
- Efficient component rendering
- Debounced input handlers
- Minimal external dependencies

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

## License

MIT License - Feel free to use this project for personal and commercial purposes.

## Support

For issues and questions, please open an issue in the repository or contact the development team.

---

Built with care using modern web technologies. Enjoy creating amazing content!
