

## Plan: Fix Navigation & Admin Experience

I'll implement a complete navigation overhaul:

### **Phase 1: Rename & Restructure Dashboard Navigation**
1. **On Main Dashboard (`src/pages/Index.tsx`):**
   - Rename "Settings" button to **"Admin Panel"** with a Shield icon
   - Keep the same destination (`/biopage/admin/dashboard-settings`)

2. **On Admin Panel (`src/pages/AdminDashboardSettings.tsx`):**
   - Rename page title from "Dashboard Settings" to **"Admin Panel"**
   - Rename subtitle to "Manage BioHub system settings and tools"
   - **Add Video Upload** to the tools section (it's currently missing!)
   - Separate into clear sections:
     - **Tools** (Link Generator, PIN Management, Documentation, Video Upload)
     - **Settings** (Hero Image, Clear Stats, Refresh Stats)

### **Phase 2: Fix Back Button Inconsistency**
3. **Standardize all admin pages:**
   - Link Generator: Back → Admin Panel (keep as is)
   - PIN Management: Back → Admin Panel (change from `/biopage`)
   - Documentation: Back → Admin Panel
   - Video Upload: Back → Admin Panel
   - Edit Gym: Back → Dashboard (keep as is, but add breadcrumb)
   - Analytics: Back → Dashboard (keep as is, but add breadcrumb)

### **Phase 3: Add Breadcrumb Navigation**
4. **Create a reusable Breadcrumb component** that shows:
   - `Dashboard > Admin Panel > Link Generator`
   - `Dashboard > Edit: Capital Gymnastics`
   - Makes it clear where you are at all times

### **Files to Modify:**
- `src/pages/Index.tsx` - Rename Settings button
- `src/pages/AdminDashboardSettings.tsx` - Rename page, add Video Upload link, reorganize
- `src/pages/AdminPinManagement.tsx` - Fix back button destination
- `src/pages/AdminVideoUpload.tsx` - Add back button
- `src/pages/AdminLinkGenerator.tsx` - Already correct
- Create `src/components/AdminBreadcrumb.tsx` - New reusable component

### **Result:**
- Clear "Admin Panel" access from dashboard
- All admin tools accessible from one place
- Consistent navigation across all pages
- Users never get lost

