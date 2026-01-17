/**
 * 認証関連の型変換ユーティリティ
 * LoginResponseからUser型への変換ロジックを一元化
 */

import { LoginResponse } from '../types/auth';
import { User } from '../types/api/user';

/**
 * LoginResponseをUser型に変換する
 * @param loginResponse バックエンドからのLoginResponse
 * @returns User型のオブジェクト
 */
export function transformLoginResponseToUser(loginResponse: LoginResponse): User {
  return {
    id: loginResponse.userId,
    email: loginResponse.email,
    name: loginResponse.name,
    kana: '', // LoginResponseにはkanaが含まれていないため空文字
    role: loginResponse.role,
    storeIds: loginResponse.storeIds || [], // LoginResponseからstoreIdsを取得、ない場合は空配列
    active: true, // LoginResponseにはactiveが含まれていないためtrueと仮定
    createdAt: '',
  };
}
