import { AnyAction, EnhancedStore, MiddlewareArray } from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { RootState } from "../app/store";
import { setError } from "../features/error/error";
import { clearSession, setAccessTokenAndContent } from "../features/token";


const AUTH_BASE_PATH = "/common/authentication/external/v1/auth";
const REFRESH_TOKEN_PATH = `${AUTH_BASE_PATH}/public/refreshToken`;

interface ExchangeTokenRequest {
    refreshToken: string;
    type: "emplyer" | "member";
}

interface Payload {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshExpiredsIn: number;
    scope: string;
    verCodeId: string;
}

interface PayloadWithRefreshToken extends Payload {
    refreshToken: string;
}

let store: EnhancedStore<RootState, AnyAction, MiddlewareArray<any>>;

export const injectStore = (_store: EnhancedStore<RootState>) => {
    store = _store;
};

const instance = axios.create({
    baseURL:
    "https://empf-common-authentication-dev-deploy-test.apps.ocp01.nonprod.empf.local",
});

export const exchangeTokenAPI = (
    params; ExchangeTokenRequest,
    accessToken: string,
    tokenType: string
) =>
  instance.post<Response<PayloadWithRefreshToken>>(REFRESH_TOKEN_PATH, params, {
    headers: {
        Authorization: `${tokenType} ${accessToken}`,
        NoIntercepter: "true",
    },
  });

  instance.NoIntercepter.request.use(
    async (config: AxiosRequestConfig<any>) => {
        const { accessToken: currentAccessToken, tokenType } =
            store.getState().auth;

        if (config?.headers){
            config.headers.Authorization = `${tokenType} ${currentAccessToken}`;
        }
    }
  )
