// src/app/components/new-project/new-project.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-project',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-project.html',
  styleUrl: './new-project.css'
})
export class NewProject implements OnChanges, OnInit {
  beamId: number | null = null;
  projectTitle: string = '';

  @Input() visible = false;
  @Input() editingProject: { id: number; title: string; owner: string; lastModified: string } | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<{ title: string }>();
  @Output() projectUpdated = new EventEmitter<{ id: number; title: string }>();

  @ViewChild('projectForm') projectForm?: ElementRef;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (this.editingProject) {
      const storedId = localStorage.getItem('beamId');
      if (storedId) {
        this.beamId = Number(storedId);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingProject']) {
      const currentProject = changes['editingProject'].currentValue;
      this.projectTitle = currentProject ? currentProject.title : '';
    }
  }

  saveProject(): void {
    const trimmedTitle = this.projectTitle.trim();
    if (!trimmedTitle) return;

    // Si es edición, solo emitimos el evento de actualización
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

    // Para creación no mandamos ID
    const beam = {
      projectName: trimmedTitle,
      status: true,
      lastDate: new Date().toISOString(),
      beamLength: 10,
      e: null,
      i: null,
      userId,
      supports: [{ type: 'FIXED', position: null }],
      pointLoads: [{ magnitude: null, position: null }],
      pointMoments: [{ magnitude: null, position: null }],
      distributedLoads: [{ startMagnitude: null, endMagnitude: null, startPosition: null, endPosition: null }]
    };

    this.http.post<any>('http://localhost:8080/api/beams', beam).subscribe({
      next: (res) => {
        console.log('✅ Viga creada:', res);
        localStorage.setItem('beamId', res.id.toString());
        localStorage.setItem('beamData', JSON.stringify(res));
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
