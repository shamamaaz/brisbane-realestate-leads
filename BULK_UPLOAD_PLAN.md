# Bulk Lead Upload - Implementation Plan

## 📋 Overview

The Bulk Upload feature allows agencies to upload multiple leads at once via CSV/Excel files instead of entering them individually. This is essential for:

- Importing legacy lead data
- Bulk uploading from marketing campaigns
- Integrating with CRM exports
- Onboarding large datasets

---

## 🎯 Phase: Not Yet Implemented

This feature is planned for Phase 2. Here's the complete implementation guide for when you're ready to build it.

---

## 📊 CSV File Format

### Expected Format
```csv
homeownerName,homeownerEmail,homeownerPhone,propertyAddress,propertyType,preferredAgency,preferredContactTime
John Smith,john@example.com,0412345678,123 Queen St Brisbane QLD 4000,house,ABC Real Estate,Evenings
Jane Doe,jane@example.com,0499999999,456 King Ave Brisbane QLD 4001,apartment,XYZ Realty,Mornings
```

### Column Requirements

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| homeownerName | ✅ Yes | Text | John Smith |
| homeownerEmail | ✅ Yes | Email | john@example.com |
| homeownerPhone | ✅ Yes | AU Phone | 0412345678 |
| propertyAddress | ✅ Yes | Text | 123 Queen St, Brisbane |
| propertyType | ✅ Yes | house/apartment/unit | house |
| preferredAgency | ❌ No | Text | ABC Real Estate |
| preferredContactTime | ❌ No | Text | Evenings 5-8pm |

---

## 🎨 Frontend: Bulk Upload Component

### Create Component Structure
```bash
ng generate component components/bulk-upload/bulk-upload
# Creates:
# - bulk-upload.component.ts
# - bulk-upload.component.html
# - bulk-upload.component.scss
```

### bulk-upload.component.ts
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent {
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadMessage = '';
  uploadError = '';
  successCount = 0;
  errorCount = 0;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadLeads() {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = '';

    this.http.post<any>(
      'http://localhost:3000/api/leads/bulk',
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: (event: any) => {
        if (event.type === 4) {
          // Upload complete
          this.isUploading = false;
          this.successCount = event.body.successCount;
          this.errorCount = event.body.errorCount;
          this.uploadMessage = 
            `Upload complete! ${this.successCount} leads added, ${this.errorCount} failed.`;
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadError = err.error?.message || 'Upload failed';
      }
    });
  }
}
```

### bulk-upload.component.html
```html
<div class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-2xl font-bold mb-4">Bulk Upload Leads</h2>
  
  <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
    <h3 class="font-semibold mb-2">Instructions</h3>
    <ul class="list-disc list-inside text-sm">
      <li>Download the CSV template</li>
      <li>Fill in your lead data</li>
      <li>Select the file below</li>
      <li>Click Upload</li>
    </ul>
  </div>

  <!-- Success Message -->
  <div *ngIf="uploadMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
    {{ uploadMessage }}
  </div>

  <!-- Error Message -->
  <div *ngIf="uploadError" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    {{ uploadError }}
  </div>

  <!-- File Input -->
  <div class="mb-4">
    <input
      type="file"
      accept=".csv,.xlsx,.xls"
      (change)="onFileSelected($event)"
      [disabled]="isUploading"
      class="block w-full"
    />
    <p class="text-sm text-gray-500 mt-2">Supported: CSV, XLSX, XLS</p>
  </div>

  <!-- Progress Bar -->
  <div *ngIf="isUploading" class="mb-4">
    <div class="w-full bg-gray-200 rounded h-2">
      <div
        class="bg-blue-600 h-2 rounded transition-all"
        [style.width.%]="uploadProgress"
      ></div>
    </div>
    <p class="text-sm text-gray-600 mt-2">Uploading: {{ uploadProgress }}%</p>
  </div>

  <!-- Upload Button -->
  <button
    (click)="uploadLeads()"
    [disabled]="isUploading || !selectedFile"
    class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {{ isUploading ? 'Uploading...' : 'Upload Leads' }}
  </button>

  <!-- Results -->
  <div *ngIf="uploadMessage" class="mt-6 p-4 bg-gray-50 rounded">
    <h3 class="font-semibold mb-2">Results:</h3>
    <p class="text-green-600">✓ {{ successCount }} leads added</p>
    <p *ngIf="errorCount > 0" class="text-red-600">✗ {{ errorCount }} failed</p>
  </div>
</div>
```

---

## 🔧 Backend: Bulk Upload Endpoint

### Create Upload Service
```typescript
// src/leads/upload/upload.service.ts

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import * as csv from 'csv-parse';
import * as xlsx from 'xlsx';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
  ) {}

  async processCsvFile(file: Express.Multer.File): Promise<any> {
    const input = file.buffer.toString('utf-8');
    
    return new Promise((resolve, reject) => {
      csv.parse(input, { columns: true }, async (err, records) => {
        if (err) reject(err);

        const results = await this.importLeads(records);
        resolve(results);
      });
    });
  }

  async processExcelFile(file: Express.Multer.File): Promise<any> {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = xlsx.utils.sheet_to_json(worksheet);

    return this.importLeads(records);
  }

  private async importLeads(records: any[]): Promise<any> {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        const lead = this.leadRepo.create({
          homeownerName: record.homeownerName,
          homeownerEmail: record.homeownerEmail,
          homeownerPhone: record.homeownerPhone,
          propertyAddress: record.propertyAddress,
          propertyType: record.propertyType,
          preferredAgency: record.preferredAgency,
          preferredContactTime: record.preferredContactTime,
          status: 'New',
        });

        await this.leadRepo.save(lead);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          row: record,
          error: error.message
        });
      }
    }

    return {
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
```

### Add Upload Endpoint to Controller
```typescript
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('bulk')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadLeads(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const extension = file.originalname.split('.').pop();

    if (extension === 'csv') {
      return this.uploadService.processCsvFile(file);
    } else if (['xlsx', 'xls'].includes(extension)) {
      return this.uploadService.processExcelFile(file);
    } else {
      throw new BadRequestException('Unsupported file format');
    }
  }
}
```

---

## 📊 CSV Template Download

### Endpoint
```
GET /api/leads/template
```

### Response
```csv
homeownerName,homeownerEmail,homeownerPhone,propertyAddress,propertyType,preferredAgency,preferredContactTime
Example Name,example@email.com,0412345678,123 Street Name Suburb QLD 4000,house,Agency Name,Mornings 9am-12pm
```

---

## 🔄 Data Validation Rules

### Each Lead Must Have
- ✅ homeownerName (non-empty)
- ✅ homeownerEmail (valid email format)
- ✅ homeownerPhone (valid AU phone)
- ✅ propertyAddress (non-empty)
- ✅ propertyType (house/apartment/unit)

### Optional Fields
- ❌ preferredAgency (any text)
- ❌ preferredContactTime (any text)

### Validation Steps
1. Check required fields present
2. Validate email format
3. Validate phone format (AU)
4. Check property type is valid
5. Normalize phone numbers
6. Remove duplicates by email

---

## 📈 Error Handling

### Common Errors
```
Error: Invalid email format
Solution: Provide valid email address

Error: Invalid phone number
Solution: Use format like 0412345678 or +61412345678

Error: Property type must be house/apartment/unit
Solution: Use one of the three valid types

Error: Required field missing
Solution: Ensure all required columns are filled
```

### Error Report
```json
{
  "successCount": 95,
  "errorCount": 5,
  "errors": [
    {
      "row": { "homeownerName": "John", ... },
      "error": "Invalid email format"
    }
  ]
}
```

---

## 🎯 Integration Steps

### 1. Add to Agency Dashboard
```html
<!-- In agency-dashboard.component.html -->
<div class="mt-8">
  <app-bulk-upload (uploadComplete)="onUploadComplete($event)"></app-bulk-upload>
</div>
```

### 2. Update App Module
```typescript
// app.module.ts
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';

@NgModule({
  declarations: [
    // ...
    BulkUploadComponent
  ]
})
export class AppModule { }
```

### 3. Install Dependencies
```bash
# Backend
npm install csv-parse xlsx

# Frontend (already have HttpClientModule)
```

---

## 📊 Performance Considerations

### Large File Uploads
- Chunk large files (1000 leads per request)
- Show progress updates
- Implement retry logic

### Database Impact
- Batch inserts for performance
- Transaction support for rollback
- Index on email for duplicate checking

### Rate Limiting
- Limit uploads to 5000 per hour
- Prevent abuse
- Throttle database queries

---

## 🧪 Testing

### Frontend Test
```typescript
it('should upload CSV file', () => {
  const file = new File(['content'], 'leads.csv', { type: 'text/csv' });
  component.selectedFile = file;
  component.uploadLeads();
  expect(component.isUploading).toBe(true);
});
```

### Backend Test
```typescript
it('should import leads from CSV', async () => {
  const result = await uploadService.processCsvFile(mockFile);
  expect(result.successCount).toBeGreaterThan(0);
});
```

---

## 🚀 Implementation Checklist

- [ ] Create bulk-upload component
- [ ] Create upload service backend
- [ ] Add file upload endpoint
- [ ] Implement CSV parsing
- [ ] Implement Excel parsing
- [ ] Add validation logic
- [ ] Add error handling
- [ ] Create template download
- [ ] Add to agency dashboard
- [ ] Test with sample data
- [ ] Add progress tracking
- [ ] Document process
- [ ] Create user guide

---

## 📚 Related Files to Create

```
frontend/
├── src/app/components/
│   └── bulk-upload/
│       ├── bulk-upload.component.ts
│       ├── bulk-upload.component.html
│       └── bulk-upload.component.scss

backend/
├── src/leads/
│   ├── upload/
│   │   ├── upload.service.ts
│   │   ├── upload.controller.ts
│   │   └── bulk-upload.dto.ts
│   ├── leads.controller.ts (update)
│   └── leads.module.ts (update)
```

---

## 🎓 Sample CSV for Testing

```csv
homeownerName,homeownerEmail,homeownerPhone,propertyAddress,propertyType,preferredAgency,preferredContactTime
John Smith,john.smith@example.com,0412345678,123 Queen Street Brisbane QLD 4000,house,ABC Real Estate,Evenings 5-8pm
Jane Doe,jane.doe@example.com,0423456789,456 King Avenue Brisbane QLD 4001,apartment,XYZ Realty,Mornings 9am-12pm
Bob Johnson,bob.j@example.com,0434567890,789 George Street Brisbane QLD 4002,unit,Premier Agents,Afternoons
Alice Williams,alice.w@example.com,0445678901,321 Victoria Street Brisbane QLD 4003,house,,Weekends
Charlie Brown,charlie.b@example.com,0456789012,654 Edward Street Brisbane QLD 4004,apartment,Gold Coast Real Estate,Flexible
```

---

## 📞 When Ready to Implement

1. Review this guide thoroughly
2. Create the component structure
3. Implement backend upload logic
4. Add database validation
5. Test with sample CSV
6. Integrate with dashboard
7. Add error handling
8. Create user documentation

---

**Ready to build bulk uploads when you are!** 🚀

This implementation will allow agencies to efficiently import large volumes of leads, significantly improving workflow for high-volume operations.
