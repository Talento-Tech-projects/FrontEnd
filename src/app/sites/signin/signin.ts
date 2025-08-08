import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

interface UserResponse {
  id: number;
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css']
})
export class Signin {
  signinForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();

    if (this.signinForm.valid) {
      const { email, password } = this.signinForm.value;

      this.http.post<UserResponse>('http://localhost:8080/api/users/login', { email, password })
        .subscribe({
          next: (res) => {
            if (res && res.id && res.userEmail) {
              localStorage.setItem('userEmail', res.userEmail);
              localStorage.setItem('userId', res.id.toString());
              localStorage.setItem('userName', res.userName);

              console.log('✅ Sesión iniciada:', res);
              this.router.navigate(['/projects']);
            } else {
              console.warn('⚠️ Datos de usuario incompletos en la respuesta:', res);
            }
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