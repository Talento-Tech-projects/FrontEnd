import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-project',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './new-project.html',
  styleUrl: './new-project.css'
})
export class NewProject implements OnChanges{
  @Input() visible: boolean = false;
  @Input() editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<{ title: string }>();
  @Output() projectUpdated = new EventEmitter<{ id: number, title: string }>();
  
  @ViewChild('projectForm') projectForm: ElementRef | undefined;
  projectTitle: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'editingProject' input property has changed.
    if (changes['editingProject']) {
      const currentProject = changes['editingProject'].currentValue;
      
      if (currentProject) {
        // If a project object is passed in, it means we are in "edit" mode.
        // Pre-fill the form with the project's title.
        this.projectTitle = currentProject.title;
      } else {
        // If the value is null, it means we are in "create" mode.
        // Clear the form.
        this.projectTitle = '';
      }
    }
  }

  // Function to handle the form submission
  saveProject(): void {
    if (this.projectTitle.trim()) {
      if (this.editingProject) {
        // If we have an editing project, emit the update event
        this.projectUpdated.emit({ id: this.editingProject.id, title: this.projectTitle.trim() });
      } else {
        // Otherwise, emit the create event
        this.projectCreated.emit({ title: this.projectTitle.trim() });
      }
      
      this.projectTitle = '';
      this.close.emit();
    }
  }

  // Function to close the modal     
  onClose(): void {
    // Reset the form input
    this.projectTitle = '';
    // Emit the close event
    this.close.emit();
  }
}
