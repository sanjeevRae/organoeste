Build a complete Next.js version of **https://www.organoeste.com.br/**.

### Main goal

Recreate the website with the **same overall visual style, layout, content, section structure, typography, spacing, colors, imagery, animations, and responsive behavior** as the reference website.

Do not make a generic redesign. The result should feel like the same website, but implemented properly as a modern Next.js application.

### Technology

* Next.js
* TypeScript
* Tailwind CSS if already configured; otherwise use clean CSS modules/global CSS where appropriate
* Responsive design for desktop, tablet, and mobile
* Reusable React components
* Optimized images using Next.js image handling where possible
* Keep the code clean and maintainable

### First: analyze the reference

Before writing code, inspect the complete reference website:

**https://www.organoeste.com.br/**

Understand and reproduce:

* Header/navigation
* Hero section
* All text/content
* Section order
* Images and visual assets
* Backgrounds
* Colors
* Typography
* Buttons
* Cards
* Forms
* Icons
* Animations
* Hover effects
* Scroll effects
* Mobile navigation
* Footer

Do not skip sections simply because they are visually complex.

### Content

Use the **same publicly visible content and wording from the reference website**, including headings, descriptions, CTA text, navigation labels, contact information, and other relevant copy.

Keep the original Portuguese content rather than translating it.

Do not invent replacement content when the original content can be obtained from the reference site.

### Design

Pay close attention to visual details:

* Exact section spacing
* Font sizes and weights
* Maximum content widths
* Image aspect ratios
* Border radii
* Button shapes
* Background transitions
* Text alignment
* Desktop/mobile layouts
* Overlapping elements
* Decorative elements
* Section heights

The page should visually match the reference as closely as reasonably possible.

### Components

Break the page into reusable components, for example:

* Header
* Hero
* Solutions/Services
* Organic waste collection section
* Composting/bioconversion section
* Fertilizer/product section
* Clients/partners section
* City/business CTA section
* Process/technology section
* Contact/lead form
* Footer

Use the actual sections discovered on the reference website rather than blindly following these names.

### Images and assets

Inspect the reference site for available images, videos, SVGs, icons, and other assets.

Use the closest original/publicly available assets where legally and technically appropriate.

If an asset cannot be retrieved, create a clearly named placeholder and keep the layout intact rather than breaking the design.

Do not use random stock images that substantially change the appearance.

### Animations

Recreate important animations and interactions from the reference, including:

* Scroll-based animations
* Fade/slide effects
* Image transitions
* Hover states
* Navigation interactions
* Any visible entrance animations

Keep animations smooth and lightweight.

### Responsive behavior

The website must work properly at:

* 1440px+
* 1280px
* 1024px
* 768px
* 480px
* 375px

Do not simply shrink the desktop version.

Inspect how the original website rearranges content on mobile and reproduce that behavior.

### Code quality

Avoid putting the entire website into one huge `page.tsx`.

Use reusable components and keep data/content separated where practical.

Avoid unnecessary dependencies.

Do not introduce complicated libraries when CSS/React can handle the interaction.

Make sure:

* `npm run build` succeeds
* No TypeScript errors
* No console errors
* No broken images
* No broken links
* No horizontal overflow on mobile
* All buttons have appropriate behavior
* Forms have proper validation/UI states

### Important

Do
