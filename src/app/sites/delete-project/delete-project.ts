import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-project',
  imports: [CommonModule],
  templateUrl: './delete-project.html',
  styleUrl: './delete-project.css'
})
export class DeleteProject {

  @Input() visible: boolean = false;

  @Input() projectId: number | null = null;

  @Output() confirm = new EventEmitter<number>();

  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (this.projectId !== null) {
      this.confirm.emit(this.projectId);
    }
    this.onCancel(); 
  }


  onCancel(): void {
    this.visible = false; 
    this.projectId = null; 
    this.cancel.emit(); 
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

}
