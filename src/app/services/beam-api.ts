import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- INTERFACES: El "contrato" de datos con la API ---
// Es una buena práctica tenerlas aquí o en un archivo separado (ej. models.ts)
export enum SupportTypeAPI { PINNED = "PINNED", FIXED = "FIXED", ROLLER = "ROLLER" }
export interface SupportIn { type: SupportTypeAPI; position: number; }
export interface PointLoadIn { magnitude: number; position: number; }
export interface PointMomentIn { magnitude: number; position: number; }
export interface DistributedLoadIn { start_magnitude: number; end_magnitude: number; start_position: number; end_position: number; }
export interface SolverResultsOut { reactions: { [key: string]: { Fx: number; Fy: number; Mz: number; } }; shear_diagram: {x:number, y:number}[]; moment_diagram: {x:number, y:number}[]; deflection_diagram: {x:number, y:number}[]; }
export interface BeamModelIn { length: number; E: number; I: number; supports: SupportIn[]; point_loads: PointLoadIn[]; point_moments: PointMomentIn[]; distributed_loads: DistributedLoadIn[]; }


@Injectable({
  providedIn: 'root' // <-- Esto hace que el servicio esté disponible en toda la app
})
export class BeamApiService {

  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000'; // La URL de la API vive aquí

  constructor() { }

  /**
   * Llama a la API para resolver el análisis de la viga.
   * @param payload El modelo de la viga con sus cargas y apoyos.
   * @returns Un Observable con los resultados del análisis.
   */
  public solveBeam(payload: BeamModelIn): Observable<SolverResultsOut> {
    // La única responsabilidad de este método es hacer la llamada POST y devolver el Observable.
    return this.http.post<SolverResultsOut>(`${this.apiUrl}/api/v1/solve`, payload);
  }
}