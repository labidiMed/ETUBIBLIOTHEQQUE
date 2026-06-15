import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-students',
  imports: [CommonModule, MaterialModule],
  templateUrl: './students.component.html',
  standalone: true,
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  editingId: number | null = null;

  // Gestion des états : chargement, erreur
  loading: boolean = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadStudents();
  }

  get form() {
    return this.studentForm.controls;
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.studentService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.students = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = this.getServerErrorMessage(err);
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.studentForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    const student: Student = this.studentForm.value;
    const request$ = this.editingId
      ? this.studentService.update(this.editingId, student)
      : this.studentService.create(student);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetForm();
          this.loadStudents();
        },
        error: (err) => {
          this.errorMessage = this.getServerErrorMessage(err);
          this.loading = false;
        }
      });
  }

  onEdit(student: Student): void {
    this.editingId = student.id ?? null;
    this.submitted = false;
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
  }

  onDelete(student: Student): void {
    if (student.id == null) {
      return;
    }
    if (!confirm(`Supprimer l'étudiant ${student.firstName} ${student.lastName} ?`)) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadStudents(),
        error: (err) => {
          this.errorMessage = this.getServerErrorMessage(err);
          this.loading = false;
        }
      });
  }

  resetForm(): void {
    this.editingId = null;
    this.submitted = false;
    this.studentForm.reset();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getServerErrorMessage(err: any): string {
    if (err?.status === 401) {
      return 'Session expirée ou non authentifié. Veuillez vous reconnecter.';
    }
    if (err?.error) {
      if (typeof err.error === 'string') {
        try {
          return JSON.parse(err.error).message ?? err.error;
        } catch {
          return err.error;
        }
      }
      return err.error.message ?? JSON.stringify(err.error);
    }
    return `Erreur serveur (${err?.status ?? 'inconnue'})`;
  }
}
