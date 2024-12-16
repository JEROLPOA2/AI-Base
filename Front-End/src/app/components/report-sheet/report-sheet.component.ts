import { Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component'; // Importar el menú
import { ReportService } from '../../services/ReportService/report.service';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-report-sheet',
  standalone: true,
  
  imports: [
    CommonModule, 
    ButtonModule, 
    FormsModule,
    TableModule, 
    ReportDialogComponent],

  templateUrl: './report-sheet.component.html',
  styleUrls: ['./report-sheet.component.scss'],
})
export class ReportSheetComponent implements OnDestroy {

  @ViewChild('captureElement') captureElement!: ElementRef;

  title: string = '';
  description: string = '';

  rows: any[] = [
    { columns: [{ hasContent: false }, { hasContent: false }] },
  ];


  isMenuVisible: boolean = false;
  selectedContent: any = null;
  


  private subscriptions: Subscription = new Subscription();

  constructor(private reportService: ReportService) {
    
    this.subscriptions.add(
      this.reportService.getTableDataToDisplay$().subscribe((tableData) => {
        if (tableData) {
          this.updateCellContent(this.selectedContent.rowIndex, this.selectedContent.colIndex, tableData);
        }
      })
    );

    this.subscriptions.add(
      this.reportService.getImageToDisplay$().subscribe((imageData) => {
        if (imageData) {
          this.updateCellContent(this.selectedContent.rowIndex, this.selectedContent.colIndex, imageData);
        }
      })
    );
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  showMenu(rowIndex: number, colIndex: number) {
    this.isMenuVisible = true;
    this.selectedContent = { rowIndex, colIndex };
  }


  hideMenu() {
    this.isMenuVisible = false;
    this.selectedContent = null;
  }


  addRow() {
    this.rows.push({ columns: [{ hasContent: false }, { hasContent: false }] });
  }


  private updateCellContent(rowIndex: number, colIndex: number, content: any) {
    
    const cell = this.rows[rowIndex].columns[colIndex];
    cell.hasContent = true;
    cell.content = content;

    if (colIndex === 1) {
      this.addRow();
    }
  }


  isTable(content: any): boolean {
    return Array.isArray(content) && content.length > 0 && typeof content[0] === 'object';
  }


  isImage(content: any): boolean {
    return typeof content === 'string' && content.startsWith('iVBOR');
  }


  isText(content: any): boolean {
    return content?.type === 'text';
  }


  getKeys(row: any): string[] {
    return Object.keys(row);
  }


  writeContent(rowIndex: number, colIndex: number) {
    const cell = this.rows[rowIndex].columns[colIndex];
    this.updateCellContent(rowIndex, colIndex, { type: 'text', value: '' });
  }

  saveAsImage(): void {
    
    if (this.captureElement) {
      
      const element = this.captureElement.nativeElement;
      const rect = element.getBoundingClientRect();

      html2canvas(element, {
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: true,

      }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'report.png';
        link.click();
      });

    }
  }

}
