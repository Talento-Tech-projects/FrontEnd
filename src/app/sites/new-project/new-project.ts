import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
export class NewProject implements OnChanges {

  constructor(private http: HttpClient, private router: Router) {}

  @Input() visible: boolean = false;
  @Input() editingProject: { id: number, title: string, owner: string, lastModified: string } | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<{ title: string }>();
  @Output() projectUpdated = new EventEmitter<{ id: number, title: string }>();

  @ViewChild('projectForm') projectForm: ElementRef | undefined;
  projectTitle: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingProject']) {
      const currentProject = changes['editingProject'].currentValue;
      this.projectTitle = currentProject ? currentProject.title : '';
    }
  }

  saveProject(): void {
    const trimmedTitle = this.projectTitle.trim();
    if (!trimmedTitle) return;

    if (this.editingProject) {
      this.projectUpdated.emit({ id: this.editingProject.id, title: trimmedTitle });
      this.close.emit();
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      console.warn('⚠️ Usuario no autenticado.');
      return;
    }

    const beam = {
      status: true,
      lastDate: new Date().toISOString(),
      beamLength: 10,
      E: 200000,
      I: 5000,
      userId,
      supports: [{ type: 'FIXED', position: 0 }],
      pointLoads: [{ magnitude: 100, position: 4 }],
      pointMoments: [{ magnitude: 50, position: 6 }],
      distributedLoads: [{ startMagnitude: 20, endMagnitude: 30, startPosition: 2, endPosition: 8 }]
    };

    this.http.post<any>('http://localhost:8080/api/beams', beam).subscribe({
      next: (res) => {
        console.log('✅ Viga creada:', res);
        localStorage.setItem('beamId', res.id.toString());
        this.close.emit();
        this.router.navigate(['/beam-analysis']);
      },
      error: (err) => {
        console.error('❌ Error al crear viga:', err);
      }
    });
  }

  onClose(): void {
    this.projectTitle = '';
    this.close.emit();
  }
}
