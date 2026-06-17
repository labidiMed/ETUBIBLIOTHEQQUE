import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register envoie un POST vers /api/register avec le bon corps', () => {
    const user = { firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'pwd' };

    service.register(user).subscribe();

    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({});
  });

  it('login envoie un POST vers /api/login et retourne le token (texte)', () => {
    let result: string | undefined;

    service.login({ login: 'jdoe', password: 'pwd' }).subscribe(token => (result = token));

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('jwt-token');

    expect(result).toBe('jwt-token');
  });
});
