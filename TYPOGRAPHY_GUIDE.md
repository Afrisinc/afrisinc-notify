# Typography Guide - Reusable Heading & Text Styles

This guide explains how to use the new reusable heading and text CSS classes defined in `src/index.css`. These classes provide consistent typography across the entire application without repeating styles.

## 📋 Table of Contents

- [Heading Styles](#heading-styles)
- [Text Styles](#text-styles)
- [Usage Examples](#usage-examples)
- [Color Variants](#color-variants)
- [Best Practices](#best-practices)

---

## Heading Styles

Use these heading classes on any HTML element (not limited to `<h1>-<h6>` tags).

### `heading-hero`

**Purpose:** Large display headings for hero sections, page titles, and main announcements.

**Specifications:**
- Font Size: `text-4xl` (mobile) → `text-5xl` (tablet) → `text-6xl` (desktop)
- Font Weight: `bold`
- Letter Spacing: `tracking-tight`
- Line Height: `leading-[1.1]`

**Example:**
```jsx
<h1 className="heading-hero mb-6 animate-fade-up">
  Building the Future of Technology
</h1>
```

**Use Cases:**
- Page hero sections
- Main landing page titles
- Large announcements
- Feature highlights

---

### `heading-section`

**Purpose:** Section headers that divide main content areas.

**Specifications:**
- Font Size: `text-3xl` (mobile) → `text-4xl` (desktop)
- Font Weight: `bold`
- Letter Spacing: `tracking-tight`
- Line Height: `leading-[1.15]`

**Example:**
```jsx
<h2 className="heading-section mb-6">
  A Unified Ecosystem of <span className="text-gradient-primary">Innovation</span>
</h2>
```

**Use Cases:**
- Section headers (About, Services, etc.)
- Feature section titles
- Category headings
- Main content divisions

---

### `heading-subsection`

**Purpose:** Medium-sized headings for subsections, cards, and component titles.

**Specifications:**
- Font Size: `text-xl` (mobile) → `text-2xl` (desktop)
- Font Weight: `semibold`
- Letter Spacing: `tracking-tight`
- Line Height: `leading-[1.2]`

**Example:**
```jsx
<h3 className="heading-subsection mb-3">
  Afrisinc Media
</h3>
```

**Use Cases:**
- Service/product titles
- Card headers
- Feature headings
- Subsection titles

---

### `heading-label`

**Purpose:** Small headings for labels, tags, and minor headings.

**Specifications:**
- Font Size: `text-lg`
- Font Weight: `semibold`
- Line Height: `leading-[1.3]`

**Example:**
```jsx
<h4 className="heading-label mb-2">
  Vision
</h4>
```

**Use Cases:**
- Value proposition titles
- Small card headers
- Label headings
- Metadata titles

---

## Text Styles

Use these text classes on any HTML element (not limited to `<p>` tags).

### `text-body`

**Purpose:** Standard body text for main content.

**Specifications:**
- Font Size: `text-base`
- Line Height: `leading-relaxed`
- Color: `text-foreground`

**Example:**
```jsx
<p className="text-body">
  Afrisinc is a multi-department parent company pioneering innovation across technology, media, digital products, and global services.
</p>
```

**Use Cases:**
- Paragraph content
- Main body text
- Default text styling
- Standard descriptions

---

### `text-subtitle`

**Purpose:** Introductions and subtitle text, slightly larger than body.

**Specifications:**
- Font Size: `text-lg`
- Line Height: `leading-relaxed`
- Color: `text-foreground`

**Example:**
```jsx
<p className="text-subtitle mb-4">
  Introduction text or hero subtitle goes here.
</p>
```

**Use Cases:**
- Section introductions
- Hero subtitles
- Featured text
- Larger body text

---

### `text-accent`

**Purpose:** Emphasized or highlighted text with increased font weight.

**Specifications:**
- Font Size: `text-base`
- Font Weight: `semibold`
- Line Height: `leading-relaxed`
- Color: `text-foreground`

**Example:**
```jsx
<span className="text-accent">Key point or emphasis</span>
```

**Use Cases:**
- Emphasized words or phrases
- Important statistics
- Highlighted information
- Call-to-action text

---

### `text-secondary`

**Purpose:** Secondary or muted text for less important information.

**Specifications:**
- Font Size: `text-base`
- Line Height: `leading-relaxed`
- Color: `text-muted-foreground`

**Example:**
```jsx
<p className="text-secondary">
  Additional information or helper text.
</p>
```

**Use Cases:**
- Helper text
- Descriptions under headings
- Secondary information
- Metadata or tags
- Form labels

---

## Usage Examples

### Complete Section Example

```jsx
export const ExampleSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="heading-section mb-6 text-center">
          Our Mission
        </h2>

        {/* Section Intro */}
        <p className="text-subtitle text-center max-w-2xl mx-auto mb-12">
          Empowering businesses and individuals through innovative solutions.
        </p>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id}>
              {/* Card Title */}
              <h3 className="heading-subsection mb-3">
                {item.title}
              </h3>

              {/* Card Description */}
              <p className="text-body mb-4">
                {item.description}
              </p>

              {/* Secondary Info */}
              <p className="text-secondary text-sm">
                {item.metadata}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## Color Variants

All heading and text styles use the default color system. To apply different colors, combine with color classes:

```jsx
{/* White text on colored background */}
<h2 className="heading-section text-white">Title</h2>

{/* Primary color */}
<p className="text-body text-primary">Important text</p>

{/* Gradient text */}
<h1 className="heading-hero text-gradient-primary">
  Gradient Heading
</h1>

{/* Custom color */}
<p className="text-subtitle text-forest">Forest green text</p>
```

---

## Responsive Considerations

All heading styles are fully responsive and adjust font sizes based on breakpoints:

- **Mobile First:** Base size applies to mobile
- **`md:` (768px):** Medium screens
- **`lg:` (1024px):** Large screens

**Example:**
```jsx
{/* heading-hero scales: 4xl → 5xl → 6xl */}
<h1 className="heading-hero">
  Responsive Title
</h1>
```

---

## Best Practices

✅ **Do:**

- Use semantic HTML elements with the appropriate classes
- Combine heading classes with spacing utilities (`mb-4`, `mt-6`, etc.)
- Use color variants to match your design system
- Apply animation classes to headings when needed
- Use `text-secondary` for helper text and descriptions

❌ **Don't:**

- Repeat inline styles that match these classes
- Create new custom heading classes without updating this guide
- Mix multiple text style classes on the same element
- Use text classes on heading elements without semantic meaning

---

## Migrating Existing Code

### Before (Inline Styles)
```jsx
<h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-[1.15] mb-6">
  Our Services
</h2>

<p className="text-lg leading-relaxed text-foreground mb-4">
  Description text goes here.
</p>
```

### After (Using Reusable Classes)
```jsx
<h2 className="heading-section mb-6">
  Our Services
</h2>

<p className="text-subtitle mb-4">
  Description text goes here.
</p>
```

---

## Customization

If you need to create variations of these styles for specific use cases, consider:

1. **Adding to the existing classes** (if it's a common pattern)
2. **Using modifier utilities** like colors, spacing, or animations
3. **Creating new classes only if necessary** (update this guide)

To add new styles, edit `src/index.css` in the `@layer components` section and update this guide.

---

## Questions or Feedback?

If you have suggestions for new heading/text styles or improvements, please:
1. Create an issue with the suggested style
2. Provide use cases for the new style
3. Update this guide if approved

---

**Last Updated:** March 2026
**Maintained by:** Design System Team
