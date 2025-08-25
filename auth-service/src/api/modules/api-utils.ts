import { ElMessage } from "element-plus";
import axios, { AxiosError, AxiosResponse } from "axios";

export function errorMsg(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if(axiosError.response) {
      const response: AxiosResponse = axiosError.response;

      const statusCode = response.status;
      const errorMsg = response.data.message || '알 수 없는 오류가 발생했습니다'

      if(statusCode === 400) {
        ElMessage.error(`잘못된 요청: ${errorMsg}`);
      } else if(statusCode === 401) {
        ElMessage.error(`인증이 필요합니다.`);
      } else if(statusCode === 403) {
        ElMessage.error(`접근 권한이 없습니다.`)
      } else if(statusCode === 404) {
        ElMessage.error(`요청한 리소스를 찾을 수 없습니다.`)
      } else if(statusCode === 500) {
        ElMessage.error(`서버 오류가 발생했습니다.`)
      } else {
        ElMessage.error(errorMsg);
      }
    } else {
      ElMessage.error(`네트워크 오류가 발생했습니다.`)
    }
  } else {
    const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    ElMessage.error(errorMsg);
  }
}
