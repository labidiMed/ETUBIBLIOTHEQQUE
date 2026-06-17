import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StudentsComponent } from './students.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let studentServiceMock: { findAll: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  let authServiceMock: { logout: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const student: Student = { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' };

  beforeEach(async () => {
    studentServiceMock = {
      findAll: jest.fn().mockReturnValue(of([student])),
      create: jest.fn().mockReturnValue(of(student)),
      update: jest.fn().mockReturnValue(of(student)),
      delete: jest.fn().mockReturnValue(of(undefined)),
    };
    authServiceMock = { logout: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit -> charge la liste
  });

  it('should create et charge la liste a l\'init', () => {
    expect(component).toBeTruthy();
    expect(studentServiceMock.findAll).toHaveBeenCalled();
    expect(component.students).toEqual([student]);
  });

  it('le formulaire est invalide vide et valide une fois rempli', () => {
    expect(component.studentForm.valid).toBe(false);
    component.studentForm.setValue({ firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' });
    expect(component.studentForm.valid).toBe(true);
  });

  it('onSubmit cree un etudiant quand on n\'est pas en edition', () => {
    component.studentForm.setValue({ firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' });

    component.onSubmit();

    expect(studentServiceMock.create).toHaveBeenCalled();
  });

  it('onSubmit met a jour quand on est en edition', () => {
    component.onEdit(student); // editingId = 1 + remplit le formulaire

    component.onSubmit();

    expect(studentServiceMock.update).toHaveBeenCalledWith(1, expect.anything());
  });

  it('onSubmit ne fait rien si le formulaire est invalide', () => {
    component.onSubmit();
    expect(studentServiceMock.create).not.toHaveBeenCalled();
  });

  it('onEdit remplit le formulaire avec l\'etudiant', () => {
    component.onEdit(student);
    expect(component.editingId).toBe(1);
    expect(component.studentForm.get('firstName')?.value).toBe('Marie');
  });

  it('onDelete supprime apres confirmation', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.onDelete(student);
    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
  });

  it('onDelete ne supprime pas si l\'utilisateur annule', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.onDelete(student);
    expect(studentServiceMock.delete).not.toHaveBeenCalled();
  });

  it('logout deconnecte et redirige vers /login', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('erreur 401 au chargement : message de session expiree', () => {
    studentServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 401 })));

    component.loadStudents();

    expect(component.errorMessage).toContain('Session');
  });

  it('erreur au chargement (corps texte) : message brut', () => {
    studentServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 400, error: 'Erreur X' })));

    component.loadStudents();

    expect(component.errorMessage).toBe('Erreur X');
  });

  it('erreur au chargement (corps objet) : message extrait', () => {
    studentServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 400, error: { message: 'Erreur objet' } })));

    component.loadStudents();

    expect(component.errorMessage).toBe('Erreur objet');
  });

  it('erreur au chargement (sans corps) : message serveur generique', () => {
    studentServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 500 })));

    component.loadStudents();

    expect(component.errorMessage).toContain('Erreur serveur');
  });

  it('erreur lors de la creation : renseigne errorMessage', () => {
    studentServiceMock.create.mockReturnValue(throwError(() => ({ status: 400, error: 'Invalide' })));
    component.studentForm.setValue({ firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalide');
  });

  it('erreur sans status ni corps : message inconnu', () => {
    studentServiceMock.findAll.mockReturnValue(throwError(() => ({})));

    component.loadStudents();

    expect(component.errorMessage).toContain('inconnue');
  });

  it('onDelete ne fait rien si l\'etudiant n\'a pas d\'id', () => {
    const sansId: Student = { firstName: 'X', lastName: 'Y', email: 'x@y.fr' };
    component.onDelete(sansId);
    expect(studentServiceMock.delete).not.toHaveBeenCalled();
  });

  it('onEdit avec un etudiant sans id met editingId a null', () => {
    component.onEdit({ firstName: 'X', lastName: 'Y', email: 'x@y.fr' });
    expect(component.editingId).toBeNull();
  });
});
