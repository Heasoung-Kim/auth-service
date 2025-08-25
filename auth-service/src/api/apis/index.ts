import type { AxiosInstance, AxiosRequestConfig } from 'axios'

import { apiFetch } from '@api/modules/request';

class APIInstance {
  request(path: string, init?: RequestInit) {
    return apiFetch(path, init);
  }
}

export default APIInstance
