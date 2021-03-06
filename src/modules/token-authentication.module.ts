/**
 * This module is used to attach an Authorization header to the request
 *
 * Created January 18th, 2018
 * @author: ywarezk
 * @version: 0.0.1
 * @copyright: Nerdeez Ltd
 * @licence: MIT
 */

import * as Cookies from '../utils/cookies';
import {IOptionsCsrfModule, IOptionsTokenAuthenticationModule, TokenStorages} from '../interfaces/ioptions';
import {NgModule, ModuleWithProviders, InjectionToken} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpHeaders, HttpParams, HTTP_INTERCEPTORS} from '@angular/common/http';
import {DecorateRequestInterceptor} from '../services/interceptors/decorate-request.interceptor';

export const OPTIONS = new InjectionToken<IOptionsTokenAuthenticationModule>('OPTIONS');

export function initialize(options: IOptionsTokenAuthenticationModule): DecorateRequestInterceptor {
    let token: string | null | undefined = '';
    if (typeof window !== 'undefined') {
        switch (options.tokenStoredIn) {
            case TokenStorages.localStorage:
                token = localStorage ? localStorage.getItem(options.tokenKeyName as string) : '';
                break;
            case TokenStorages.sessionStorage:
                token = sessionStorage ? sessionStorage.getItem(options.tokenKeyName as string) : '';
                break;
            case TokenStorages.cookies:
                token = Cookies ? Cookies.get(options.tokenKeyName as string) : '';
                break;
            default:
                token = '';
        }
    }
    if (!token) {
        token = '';
    }
    const moduleOptions: {[key: string]: string} = {};
    moduleOptions[options.tokenHeader ? options.tokenHeader : 'Authorization']
        = options.tokenHeaderPrefix ?  options.tokenHeaderPrefix + token : 'Token ' + token;
    return new DecorateRequestInterceptor(new HttpHeaders(moduleOptions), new HttpParams());
}

@NgModule({
    imports: [CommonModule],
})
export class TokenAuthenticationModule {
  static withOptions(options: IOptionsTokenAuthenticationModule = {
    tokenStoredIn: TokenStorages.localStorage,
    tokenKeyName: 'token',
    tokenHeader: 'Authorization',
    tokenHeaderPrefix: 'Token '
  }): ModuleWithProviders {

    return {
        ngModule: TokenAuthenticationModule,
        providers: [
            {provide: OPTIONS, useValue: options},
            {
                provide: HTTP_INTERCEPTORS,
                deps: [OPTIONS],
                useFactory: initialize,
                multi: true
            }
        ]
    };
  }
}
