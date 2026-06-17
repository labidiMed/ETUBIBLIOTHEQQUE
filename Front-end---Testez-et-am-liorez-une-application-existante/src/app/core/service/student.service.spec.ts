import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;
  const student: Student = { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll fait un GET /api/students et retourne la liste', () => {
    let result: Student[] | undefined;

    service.findAll().subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush([student]);

    expect(result).toEqual([student]);
  });

  it('findById fait un GET /api/students/1', () => {
    service.findById(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);
  });

  it('create fait un POST /api/students avec le bon corps', () => {
    service.create(student).subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(student);
    req.flush(student);
  });

  it('update fait un PUT /api/students/1', () => {
    service.update(1, student).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(student);
    req.flush(student);
  });

  it('delete fait un DELETE /api/students/1', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
