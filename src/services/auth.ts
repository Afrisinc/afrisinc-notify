import getApiClient from "./apiClient";


export const loginService = async (params) => {
    const { data } = await getApiClient().post('/oauth/exchange', {code: params.code})
    return data;
 };