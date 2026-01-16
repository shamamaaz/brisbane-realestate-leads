# Agency Portal Quick Start

## 🚀 Accessing the Dashboard

### URL
```
http://localhost:4200/agency-dashboard
```

## 📊 Dashboard Components

### 1. Statistics Cards (Top)
- **New**: Red card showing count of new leads
- **Contacted**: Yellow card showing leads already contacted
- **Scheduled**: Blue card showing scheduled appointments
- **Closed**: Green card showing completed deals

These update in real-time when you change lead status.

---

## 🔍 Filtering Leads

### Search Box
Type to search by:
- Homeowner name (e.g., "John Smith")
- Phone number (e.g., "0412345678")
- Property address (e.g., "Queen Street")

**Example:** Type "Brisbane" to find all properties in Brisbane

### Status Filter
Dropdown menu with options:
- All Statuses (default)
- New
- Contacted
- Scheduled
- Closed

**Example:** Select "New" to see only new uncontacted leads

### Property Type Filter
Dropdown menu with options:
- All Types (default)
- House
- Apartment
- Unit

**Example:** Select "House" to see only house properties

### Reset Button
Clears all filters and shows all leads again

---

## 📝 Lead Table

### Columns
| Column | Content |
|--------|---------|
| ID | Lead ID number |
| Homeowner | Name of property owner |
| Phone | Contact phone number |
| Property | Full property address |
| Type | Property type (House/Apartment/Unit) |
| Status | Current lead status with badge |
| Actions | Buttons to update status |

### Action Buttons
Smart buttons that only show relevant transitions:

- **Mark Contacted** (Yellow)
  - Shown when status is NOT "Contacted"
  - Click to mark lead as contacted

- **Mark Scheduled** (Blue)
  - Shown when status is NOT "Scheduled"
  - Click to schedule appointment

- **Mark Closed** (Green)
  - Shown when status is NOT "Closed"
  - Click to close the deal

**Example:** For a lead with status "New":
- Shows: Mark Contacted, Mark Scheduled, Mark Closed
- For a lead with status "Contacted":
- Shows: Mark Scheduled, Mark Closed (not Mark Contacted)

---

## 💡 Tips & Tricks

### Finding Hot Leads
1. Filter by "New" status
2. Check recent ones at the top
3. Prioritize contacting them

### Tracking Progress
1. See stats cards update in real-time
2. Watch "Contacted" count increase
3. Monitor "Scheduled" appointments
4. Celebrate when leads close

### Bulk Status Updates (Multiple Leads)
1. Filter to show specific leads
2. Update each one by clicking buttons
3. Stats update automatically

### Combining Filters
Example workflow:
1. Set Status to "New"
2. Set Property Type to "House"
3. Search "Brisbane"
4. Result: All new house leads in Brisbane
5. Click "Reset" to start over

---

## ⚡ Performance Tips

### For Large Lead Lists (100+)
1. Use filters to narrow down
2. Search by specific text
3. Filter by property type
4. Filter by status

### Sorting
- Leads are automatically sorted newest first
- Most recent submissions appear at top

---

## 🔄 Status Workflow Example

```
Step 1: New Lead Arrives
├─ Status: "New"
├─ You see it in red statistics card
└─ Listed in table with all action buttons

Step 2: Contact Homeowner
├─ Click "Mark Contacted" button
├─ Status changes to "Contacted"
├─ Red stats decrease, yellow stats increase
└─ "Mark Contacted" button disappears

Step 3: Schedule Appointment
├─ After conversation, click "Mark Scheduled"
├─ Status changes to "Scheduled"
├─ Blue stats increase
└─ "Mark Scheduled" button disappears

Step 4: Close Deal
├─ After property sells, click "Mark Closed"
├─ Status changes to "Closed"
├─ Green stats increase
└─ All action buttons disappear
```

---

## ⚠️ Common Issues

### Dashboard Shows No Leads
**Solution:**
1. Make sure backend API is running on port 3000
2. Check that leads exist in database
3. Try refreshing the page
4. Check browser console for errors

### Status Update Not Working
**Solution:**
1. Check internet connection
2. Verify backend is responding
3. Refresh and try again
4. Check if lead still exists

### Filter Not Showing Results
**Solution:**
1. Click "Reset" to clear filters
2. Check if any leads match filter criteria
3. Combine filters logically
4. Verify spelling in search box

### Page Slow or Unresponsive
**Solution:**
1. Close extra browser tabs
2. Clear browser cache
3. Refresh the page
4. Restart backend if needed

---

## 🎯 Common Tasks

### Task: Find All New Leads in Brisbane
```
1. Set Status filter to "New"
2. Type "Brisbane" in search box
3. Result: All new leads in Brisbane
```

### Task: Update Multiple Leads to "Contacted"
```
1. Filter by Status = "New"
2. Find first lead
3. Click "Mark Contacted"
4. Repeat for each lead
5. Watch "Contacted" count increase
```

### Task: See Only Houses (No Apartments)
```
1. Set Property Type filter to "House"
2. View only house properties
3. Click Reset to see all types again
```

### Task: Monitor Progress Today
```
1. Open dashboard at start of day
2. Note the stats (e.g., 5 New, 2 Contacted)
3. Throughout day, update leads
4. See stats change in real-time
5. End of day: You'll see your progress!
```

---

## 📱 Mobile View

The dashboard is fully responsive:
- **Mobile (< 768px)**
  - Stats stack vertically
  - Table scrolls horizontally
  - Touch-friendly buttons
  
- **Tablet (768px - 1023px)**
  - Stats in 2-column grid
  - Table compact view
  
- **Desktop (1024px+)**
  - Stats in 4-column grid
  - Full table view

---

## 🎨 Status Colors Quick Reference

| Status | Color | What It Means |
|--------|-------|---------------|
| 🔴 New | Red | Uncontacted lead |
| 🟡 Contacted | Yellow | Initial contact made |
| 🔵 Scheduled | Blue | Appointment booked |
| 🟢 Closed | Green | Deal completed |

---

## 💾 Data Persistence

- All status updates are saved to database
- Refresh page = data persists
- Changes visible to other agents in real-time
- History tracked with timestamps

---

## 🔐 Access Control

**Current:** Dashboard shows all leads
**Future:** Will be role-based and territory-based

---

## 📞 Need Help?

1. Check the main [AGENCY_PORTAL_GUIDE.md](./AGENCY_PORTAL_GUIDE.md)
2. Review browser console errors (F12)
3. Verify backend is running: `curl http://localhost:3000/api/leads`

---

**Happy Lead Managing!** 🎉
