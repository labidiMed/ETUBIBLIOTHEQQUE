import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('ajoute l\'en-tete Authorization quand un token est present', () => {
    authService.setToken('jwt');

    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt');
    req.flush([]);
  });

  it('n\'ajoute pas d\'en-tete quand il n\'y a pas de token', () => {
    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
