// @see: https://www.prettier.cn

module.exports = {
  // 최대 줄 길이 지정
  printWidth: 130,
  // 탭 너비 (공백 수)
  tabWidth: 2,
  // 탭 대신 공백 사용 (true: 탭, false: 공백)
  useTabs: false,
  // 세미콜론 사용 여부 (true: 사용, false: 미사용)
  semi: true,
  // 따옴표 사용 (true: 작은따옴표, false: 큰따옴표)
  singleQuote: false,
  // 객체 리터럴의 속성 이름을 따옴표로 묶을지 여부 "<as-needed|consistent|preserve>"
  quoteProps: "as-needed",
  // JSX에서 작은따옴표 사용 여부 (true: 작은따옴표, false: 큰따옴표)
  jsxSingleQuote: false,
  // 여러 줄인 경우 후행 쉼표 사용 여부 "<none|es5|all>"
  trailingComma: "none",
  // 객체나 배열의 괄호 사이에 공백 추가 여부 "{ foo: bar }" (true: 추가, false: 미추가)
  bracketSpacing: true,
  // 여러 줄 요소의 닫는 괄호를 마지막 줄의 끝이 아닌 독립적인 줄에 위치시킬지 여부 (true: 같은 줄, false: 다른 줄)
  bracketSameLine: false,
  // (x) => {} 화살표 함수의 인수가 하나인 경우 괄호 사용 여부 (avoid: 생략, always: 생략하지 않음)
  arrowParens: "avoid",
  // 특정 주석이 파일 맨 위에 있는지 여부 (true: 필요, false: 불필요)
  requirePragma: false,
  // 파일 맨 위에 Prettier를 사용하여 포맷된 것임을 나타내는 특수 주석 삽입 여부
  insertPragma: false,
  // 텍스트 줄바꿈 처리 방식 지정
  proseWrap: "preserve",
  // HTML에서 공백 처리 방식 지정 "css" - CSS 표시 속성의 기본값을 따름, "strict" - 공백이 민감한 것으로 간주, "ignore" - 공백이 민감하지 않은 것으로 간주
  htmlWhitespaceSensitivity: "css",
  // Vue 단일 파일 컴포넌트에서 <script>와 <style> 태그 내의 코드 들여쓰기 방식
  vueIndentScriptAndStyle: false,
  // 줄 바꿈 문자 사용 (auto, lf, crlf, cr 중 선택)
  endOfLine: "auto",
  // 코드 시작과 끝에 적용되는 문자 오프셋을 사용하여 지정된 범위 내에서만 포맷 가능
  rangeStart: 0,
  rangeEnd: Infinity
};
