import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css']
})
export class Signin {
  signinForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();

    if (this.signinForm.valid) {
      const { email, password } = this.signinForm.value;

      this.http.post('http://localhost:8080/api/users/login', { email, password }).subscribe({
        next: (res) => {
          console.log('✅ Sesión iniciada', res);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('❌ Error al iniciar sesión', err);
        }
      });
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }
}
