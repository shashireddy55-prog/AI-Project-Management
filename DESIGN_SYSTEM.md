# Projify AI - Unified Design System

## 🎨 Color Palette (Strictly Enforced)

All screens, modals, windows, and components MUST use these exact colors:

### Primary Colors
```css
--text-primary: #000000        /* All primary text */
--primary-dark: #14213D         /* Buttons, headers, primary actions */
--accent-orange: #FCA311        /* Icons, highlights, accents */
--bg-light-gray: #E5E5E5        /* Borders, dividers */
--bg-white: #FFFFFF             /* Backgrounds, cards */
--bg-off-white: #F5F5F5         /* Secondary backgrounds */
--bg-sidebar: #FAFAFA           /* Sidebar backgrounds */
```

### Usage Guidelines

| Element | Color | Example |
|---------|-------|---------|
| **Headers** | `#14213D` | Modal headers, page headers |
| **Body Text** | `#000000` | All readable text |
| **Icons** | `#FCA311` | All icons and symbol highlights |
| **Buttons (Primary)** | `#14213D` | Save, Submit, Create actions |
| **Buttons (Secondary)** | Outlined with `#14213D` | Cancel, Close |
| **Accent Buttons** | `#FCA311` | AI features, special actions |
| **Borders** | `#E5E5E5` | Card borders, dividers |
| **Backgrounds** | `#FFFFFF` | Main content areas |
| **Alt Backgrounds** | `#F5F5F5` or `#FAFAFA` | Sidebars, sections |

---

## 🧩 Unified Components

### 1. UnifiedModal
**Purpose:** All modal dialogs across the application

**Usage:**
```tsx
import { UnifiedModal } from './components/UnifiedModal';
import { Layers } from 'lucide-react';

<UnifiedModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Edit Epic"
  icon={<Layers className="w-6 h-6" />}
  size="lg" // sm, md, lg, xl, full
  actions={
    <>
      <UnifiedButton variant="secondary" onClick={onClose}>
        Cancel
      </UnifiedButton>
      <UnifiedButton variant="primary" onClick={onSave}>
        Save Changes
      </UnifiedButton>
    </>
  }
>
  {/* Your content here */}
</UnifiedModal>
```

**Features:**
- ✅ Consistent header with dark background (#14213D)
- ✅ Icon badge with accent color (#FCA311)
- ✅ Footer action bar with light gray background (#F5F5F5)
- ✅ Smooth animations
- ✅ Loading state support

---

### 2. UnifiedButton
**Purpose:** All clickable actions

**Variants:**
```tsx
import { UnifiedButton, UnifiedIconButton, UnifiedButtonGroup } from './components/UnifiedButtons';

// Primary - #14213D background
<UnifiedButton variant="primary" icon={<Save />}>
  Save Changes
</UnifiedButton>

// Secondary - Outlined with #14213D
<UnifiedButton variant="secondary" icon={<X />}>
  Cancel
</UnifiedButton>

// Accent - #FCA311 background (AI features)
<UnifiedButton variant="accent" icon={<Sparkles />}>
  Generate with AI
</UnifiedButton>

// Destructive - Red (delete actions)
<UnifiedButton variant="destructive" icon={<Trash2 />}>
  Delete
</UnifiedButton>

// Icon Button
<UnifiedIconButton 
  icon={<Edit2 />} 
  variant="ghost" 
  tooltip="Edit item"
/>

// Button Group
<UnifiedButtonGroup
  buttons={[
    { label: 'Save', onClick: onSave, variant: 'primary' },
    { label: 'Cancel', onClick: onCancel, variant: 'secondary' }
  ]}
/>
```

---

### 3. UnifiedForm Components
**Purpose:** All form inputs for consistency

```tsx
import { 
  UnifiedField, 
  UnifiedInput, 
  UnifiedTextarea, 
  UnifiedSelect,
  UnifiedFormGrid,
  UnifiedSection 
} from './components/UnifiedForm';

// Form Field with Label
<UnifiedField 
  label="Epic Title" 
  icon={<Layers />}
  required
  error={errors.title}
>
  <UnifiedInput 
    value={title} 
    onChange={setTitle}
    placeholder="Enter title..."
  />
</UnifiedField>

// Textarea
<UnifiedField label="Description">
  <UnifiedTextarea 
    value={description} 
    onChange={setDescription}
    rows={6}
  />
</UnifiedField>

// Select Dropdown
<UnifiedField label="Status" icon={<Flag />}>
  <UnifiedSelect
    value={status}
    onChange={setStatus}
    options={[
      { value: 'TODO', label: 'To Do' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'DONE', label: 'Done' }
    ]}
  />
</UnifiedField>

// Form Grid Layout
<UnifiedFormGrid columns={2}>
  <UnifiedField label="Start Date">
    <UnifiedInput type="date" value={startDate} onChange={setStartDate} />
  </UnifiedField>
  <UnifiedField label="End Date">
    <UnifiedInput type="date" value={endDate} onChange={setEndDate} />
  </UnifiedField>
</UnifiedFormGrid>

// Form Section
<UnifiedSection title="Details" icon={<FileText />}>
  {/* Form fields here */}
</UnifiedSection>
```

---

### 4. UnifiedPanel Components
**Purpose:** Cards, stats, tabs, and empty states

```tsx
import { 
  UnifiedPanel, 
  UnifiedStatsCard, 
  UnifiedTabsPanel,
  UnifiedEmptyState 
} from './components/UnifiedPanel';

// Standard Panel
<UnifiedPanel 
  title="Project Details" 
  icon={<FolderKanban />}
  actions={
    <UnifiedButton size="sm">Edit</UnifiedButton>
  }
>
  {/* Content */}
</UnifiedPanel>

// Highlighted Panel (with accent border)
<UnifiedPanel variant="highlighted">
  {/* Important content */}
</UnifiedPanel>

// Stats Card
<UnifiedStatsCard
  icon={<Users />}
  label="Total Users"
  value="1,234"
  trend={{ value: "+12%", isPositive: true }}
  onClick={() => navigate('/users')}
/>

// Tabs
<UnifiedTabsPanel
  tabs={[
    { 
      id: 'details', 
      label: 'Details', 
      icon: <FileText />,
      content: <DetailsView />
    },
    { 
      id: 'comments', 
      label: 'Comments', 
      icon: <MessageSquare />,
      badge: 5,
      content: <CommentsView />
    }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Empty State
<UnifiedEmptyState
  icon={<Inbox />}
  title="No tickets yet"
  description="Create your first ticket to get started"
  action={{
    label: "Create Ticket",
    onClick: () => setShowCreateModal(true)
  }}
/>
```

---

### 5. UnifiedHeader Components
**Purpose:** Page headers, section headers, list headers

```tsx
import { 
  UnifiedPageHeader, 
  UnifiedSectionHeader,
  UnifiedListHeader 
} from './components/UnifiedHeader';

// Page Header (top of every screen)
<UnifiedPageHeader
  title="Workspace Settings"
  subtitle="Manage your workspace configuration"
  icon={<Settings />}
  breadcrumbs={[
    { label: 'Home', onClick: () => navigate('/') },
    { label: 'Workspaces', onClick: () => navigate('/workspaces') },
    { label: 'Settings' }
  ]}
  onBack={() => navigate(-1)}
  actions={
    <>
      <UnifiedButton variant="accent" icon={<Sparkles />}>
        AI Assistant
      </UnifiedButton>
      <UnifiedButton variant="primary" icon={<Save />}>
        Save Changes
      </UnifiedButton>
    </>
  }
/>

// Section Header (within a page)
<UnifiedSectionHeader
  title="General Settings"
  icon={<Settings />}
  badge="5 items"
  description="Configure basic workspace settings"
  actions={
    <UnifiedButton size="sm">Add Field</UnifiedButton>
  }
/>

// List Header (for tables/lists)
<UnifiedListHeader
  title="All Tickets"
  count={42}
  icon={<Ticket />}
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  filters={
    <>
      <UnifiedSelect 
        value={filter} 
        onChange={setFilter}
        options={filterOptions}
      />
    </>
  }
  actions={
    <UnifiedButton variant="primary" icon={<Plus />}>
      Create Ticket
    </UnifiedButton>
  }
/>
```

---

## 📐 Layout Patterns

### Standard Modal Layout
```
┌─────────────────────────────────────┐
│ Header (#14213D background)        │
│ [Icon] Title              [X]       │
├─────────────────────────────────────┤
│                                     │
│  Content Area (#FFFFFF)             │
│                                     │
│  - Form fields                      │
│  - Tabs                             │
│  - Lists                            │
│                                     │
├─────────────────────────────────────┤
│ Footer (#F5F5F5)                    │
│            [Cancel] [Save]          │
└─────────────────────────────────────┘
```

### Standard Page Layout
```
┌─────────────────────────────────────┐
│ Page Header                         │
│ [←] [Icon] Title                    │
│ Breadcrumbs                         │
│                      [Actions]      │
├─────────────────────────────────────┤
│                                     │
│  Main Content                       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │  Panel   │  │  Panel   │       │
│  └──────────┘  └──────────┘       │
│                                     │
└─────────────────────────────────────┘
```

### Two-Column Detail View
```
┌─────────────────────┬───────────────┐
│                     │               │
│  Main Content       │   Sidebar     │
│  (#FFFFFF)          │   (#FAFAFA)   │
│                     │               │
│  - Details          │   - Status    │
│  - Description      │   - Priority  │
│  - Comments         │   - Assignee  │
│                     │   - Dates     │
│                     │               │
└─────────────────────┴───────────────┘
```

---

## 🎯 Implementation Checklist

When creating ANY new screen/modal/window:

- [ ] Use `UnifiedModal` for all dialogs
- [ ] Use `UnifiedButton` for all buttons (correct variant)
- [ ] Use `UnifiedPageHeader` for screen headers
- [ ] Use `UnifiedForm` components for all inputs
- [ ] Use `UnifiedPanel` for cards/sections
- [ ] Verify all colors match the palette:
  - [ ] Text is `#000000`
  - [ ] Headers are `#14213D`
  - [ ] Icons are `#FCA311`
  - [ ] Borders are `#E5E5E5`
  - [ ] Backgrounds are `#FFFFFF`, `#F5F5F5`, or `#FAFAFA`
- [ ] Add smooth transitions/animations
- [ ] Include loading states
- [ ] Handle empty states with `UnifiedEmptyState`
- [ ] Ensure responsive design

---

## 🚀 Quick Start Templates

### Modal Template
```tsx
export function MyFeatureModal({ isOpen, onClose }: Props) {
  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Feature"
      icon={<Icon />}
      size="lg"
      actions={
        <>
          <UnifiedButton variant="secondary" onClick={onClose}>
            Cancel
          </UnifiedButton>
          <UnifiedButton variant="primary" onClick={onSave}>
            Save
          </UnifiedButton>
        </>
      }
    >
      <UnifiedFormGrid columns={2}>
        <UnifiedField label="Field 1" required>
          <UnifiedInput value={value1} onChange={setValue1} />
        </UnifiedField>
        <UnifiedField label="Field 2">
          <UnifiedInput value={value2} onChange={setValue2} />
        </UnifiedField>
      </UnifiedFormGrid>
    </UnifiedModal>
  );
}
```

### Page Template
```tsx
export function MyFeaturePage() {
  return (
    <div>
      <UnifiedPageHeader
        title="My Feature"
        icon={<Icon />}
        onBack={() => navigate(-1)}
        actions={
          <UnifiedButton variant="primary">
            Create New
          </UnifiedButton>
        }
      />
      
      <div className="p-6">
        <UnifiedPanel title="Section 1" icon={<Icon />}>
          {/* Content */}
        </UnifiedPanel>
      </div>
    </div>
  );
}
```

---

## ✅ Migration Guide

To update existing components:

1. **Replace standard modals:**
   ```tsx
   // OLD
   <div className="fixed inset-0...">
     <Card>
       <CardHeader>...</CardHeader>
       <CardContent>...</CardContent>
     </Card>
   </div>
   
   // NEW
   <UnifiedModal isOpen={...} onClose={...} title="...">
     {/* content */}
   </UnifiedModal>
   ```

2. **Replace buttons:**
   ```tsx
   // OLD
   <Button onClick={...}>Save</Button>
   
   // NEW
   <UnifiedButton variant="primary" onClick={...}>
     Save
   </UnifiedButton>
   ```

3. **Replace form inputs:**
   ```tsx
   // OLD
   <Label>Title</Label>
   <Input value={...} onChange={...} />
   
   // NEW
   <UnifiedField label="Title" required>
     <UnifiedInput value={...} onChange={...} />
   </UnifiedField>
   ```

---

## 📱 Responsive Design

All unified components are responsive by default:
- Mobile: Single column layouts
- Tablet: Two-column layouts
- Desktop: Multi-column layouts

Use `UnifiedFormGrid` with column counts that adapt:
```tsx
<UnifiedFormGrid columns={2}> {/* 1 col on mobile, 2 on desktop */}
```

---

## 🎨 Custom Styling

While the design system enforces consistency, you can extend:

```tsx
<UnifiedButton 
  variant="primary" 
  className="extra-custom-class"
>
  Custom Button
</UnifiedButton>
```

**Note:** Only add custom classes for spacing/positioning, NOT colors!

---

## 📋 Components Catalog

| Component | Purpose | File |
|-----------|---------|------|
| UnifiedModal | All dialogs/modals | `/src/app/components/UnifiedModal.tsx` |
| UnifiedButton | All buttons | `/src/app/components/UnifiedButtons.tsx` |
| UnifiedForm | Form inputs | `/src/app/components/UnifiedForm.tsx` |
| UnifiedPanel | Cards/panels | `/src/app/components/UnifiedPanel.tsx` |
| UnifiedHeader | Headers | `/src/app/components/UnifiedHeader.tsx` |

---

## 🔍 Examples in Codebase

**See these files for implementation examples:**
- ✅ `/src/app/components/TicketDetailModal.tsx` - Full modal with tabs
- ✅ `/src/app/components/EditEpicModal.tsx` - Form modal
- ✅ More being migrated...

---

**Remember:** EVERY new feature, screen, modal, or window MUST use these unified components with the exact color scheme. No exceptions!
