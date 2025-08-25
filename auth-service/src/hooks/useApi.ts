/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, type Ref } from 'vue'

import { AxiosResponse } from 'axios'

import { errorMsg } from '@/api/modules/api-utils'

interface RequestConfig<TResponse = null> {
  /** 실행 유효성 검사 */
  rules?: (() => boolean)[]

  /**
   * 리퀘스트 실행 전 호출되는 콜백 (전처리 단계로 사용)
   * @param datas - API 요청 데이터
   */
  onBeforeRequest?: (...datas: any) => void
  /**
   * 리퀘스트 성공 시 호출되는 콜백
   * @param data - API 요청의 응답 데이터
   */
  onSuccess?: (data: TResponse) => void

  /**
   * 리퀘스트 실패 시 호출되는 콜백
   * @param data - API 요청의 응답 데이터
   */
  onFailure?: (error: unknown) => void

  /** 성공여부와 관련없이 리퀘스트 완료 시 호출되는 콜백 */
  onComplete?: () => void
}

/** 리퀘스트 실행 함수 */
type ExecuteFunction<T extends (...args: any) => any> = (...params: Parameters<T>) => void

/** 현재 리퀘스트의 로딩 상태 */
type IsLoading = Ref<boolean>

/** 리스폰스 데이터를 저장하는 ref */
type Data<T> = Ref<T | undefined>

type ExtractDataType<T> = T extends Promise<AxiosResponse<infer Data>> ? Data : never

const useApi = <T extends (...params: any[]) => Promise<any>>(
  apiFunction: T,
  options: RequestConfig<ExtractDataType<ReturnType<T>>>
): [ExecuteFunction<T>, IsLoading, Data<ExtractDataType<ReturnType<T>>>] => {
  const { rules, onBeforeRequest, onSuccess, onFailure, onComplete } = options || {}

  const data: Data<ExtractDataType<ReturnType<T>>> = ref()
  const isLoading = ref<boolean>(true)

  const execute: ExecuteFunction<T> = async (...params) => {
    try {
      if (rules?.some(rule => !rule())) return

      isLoading.value = true
      if (onBeforeRequest) onBeforeRequest(...params)

      const res = await apiFunction(...params)

      data.value = res.data

      if (onSuccess) onSuccess(res.data)
    } catch (error: any) {
      devLog('error', error) // 1. 에러 로깅
      errorMsg(error) // 2. error 메시지 출력
      if (onFailure) onFailure(error) // 3. onFailure (실패 로직) 실행
    } finally {
      isLoading.value = false
      if (onComplete) onComplete()
    }
  }

  isLoading.value = false

  return [execute, isLoading, data]
}

export default useApi
