/**
 * test for my modules
 * will try and create a module that includes all my modules and test
 * the interceptors are working
 *
 * Created January 18th, 2018
 * @author: ywarezk
 * @version: 0.0.1
 * @copyright: Nerdeez Ltd
 * @licence: MIT
 */

import {TestBed, inject} from '@angular/core/testing';
import {CsrfModule} from './csrf.module';
import {TokenAuthenticationModule} from './token-authentication.module';
import {DecorateRequestModule} from './decorate-request.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpRequest} from '@angular/common/http';
import * as Cookies from '../utils/cookies';
import {TokenStorages} from "../";

describe('Modules', () => {

    describe('General modules init', () => {
        localStorage.setItem('token', 'hello world');
        Cookies.set('XSRF-TOKEN', 'wat');

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    CsrfModule.withOptions(),
                    TokenAuthenticationModule.withOptions(),
                    DecorateRequestModule.withOptions({
                        headers: {'foo': 'bar'},
                        params: {format: 'json'},
                        url: 'https://www.google.com'
                    })
                ]
            });
        });

        it(
            'expects a GET request',
            inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
                http
                    .get('/data')
                    .subscribe();
                const req = httpMock.expectOne((request: HttpRequest<any>) => {
                    return request.headers.get('Authorization') === 'Token hello world' &&
                        request.headers.get('X-XSRF-TOKEN') === 'wat' &&
                        request.headers.get('foo') === 'bar' &&
                        request.params.get('format') === 'json' &&
                        request.url === 'https://www.google.com/data';
                });
                req.flush({});
                httpMock.verify();
            })
        );
    });

    describe('Bugeez test case', () => {
        Cookies.set('XSRF-TOKEN', 'wat');
        Cookies.set('betaToken', 'hello token');

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    CsrfModule.withOptions(),
                    TokenAuthenticationModule.withOptions({
                      tokenStoredIn: TokenStorages.cookies,
                      tokenKeyName: 'betaToken'
                    }),
                    DecorateRequestModule.withOptions({
                      params: {format: 'json'},
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      url: 'https://www.nerdeez.com'
                    })
                ]
            });
        });

        it(
            'expects a GET request',
            inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
                http
                    .get('data')
                    .subscribe();
                const req = httpMock.expectOne((request: HttpRequest<any>) => {
                    return request.headers.get('Authorization') === 'Token hello token' &&
                        request.headers.get('X-XSRF-TOKEN') === 'wat' &&
                        request.params.get('format') === 'json' &&
                        request.url === 'https://www.nerdeez.com/data';
                });
                req.flush({});
                httpMock.verify();
            })
        );
    });

    describe('no headers', () => {
        Cookies.set('XSRF-TOKEN', 'wat');
        Cookies.set('betaToken', 'hello token');

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    DecorateRequestModule.withOptions({
                      params: {format: 'json'},
                      url: 'https://www.nerdeez.com'
                    })
                ]
            });
        });

        it(
            'expects a GET request',
            inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
                http
                    .get('data')
                    .subscribe();
                const req = httpMock.expectOne((request: HttpRequest<any>) => {
                    return request.params.get('format') === 'json' &&
                        request.url === 'https://www.nerdeez.com/data';
                });
                req.flush({});
                httpMock.verify();
            })
        );
    });

    describe('no headers', () => {
        Cookies.set('csrftoken', 'wat');
        Cookies.set('betaToken', 'hello token');

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    CsrfModule.withOptions({
                        cookieName: 'csrftoken'
                    })
                ]
            });
        });

        it(
            'expects a GET request',
            inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
                http
                    .get('data')
                    .subscribe();
                const req = httpMock.expectOne((request: HttpRequest<any>) => {
                    return request.headers.get('X-XSRF-TOKEN') === 'wat';
                });
                req.flush({});
                httpMock.verify();
            })
        );
    });

    describe('params as string', () => {

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    DecorateRequestModule.withOptions({
                        params: '?format=json'
                    })
                ]
            })
        });

        it(
            'should add the format=json to the params of the request',
            inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
                http
                    .get('data')
                    .subscribe();
                const req = httpMock.expectOne((request: HttpRequest<any>) => {
                    return request.params.get('format') === 'json';
                });
                req.flush({});
                httpMock.verify();
        }));
    });

});
