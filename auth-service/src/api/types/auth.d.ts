export interface AccessTokenResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // 만료 시간 (초)
}

export interface SimpleResponse {
  message: string;
}
