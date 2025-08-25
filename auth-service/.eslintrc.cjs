/** @type import('eslint').Config */
module.exports = {
  root: false,
  env: {
    browser: true, // 브라우저 환경에서 실행
    node: true, // Node.js 환경에서 실행
    es6: true // ES6 환경에서 실행
  },
  // 지정된 구문 분석기로 문법을 해석하는 방법을 지정합니다.
  parser: 'vue-eslint-parser',
  // parserOptions보다 우선순위가 낮은 구문 분석 설정
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true
    }
  },
  // 기존 규칙을 상속받아 사용합니다.
  extends: ['plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  /**
   * "off" 또는 0    ==>  규칙을 비활성화
   * "warn" 또는 1   ==>  경고로 규칙을 활성화 (코드 실행에는 영향을 주지 않음)
   * "error" 또는 2  ==>  에러로 규칙을 활성화 (발생 시 코드 실행이 중단됨)
   */
  rules: {
    // eslint (http://eslint.cn/docs/rules)
    'no-var': 'error', // var 키워드 대신 let 또는 const 사용 권장
    'no-multiple-empty-lines': ['error', { max: 3 }], // 여러 개의 빈 줄을 허용하지 않음
    'prefer-const': 'off', // 초기 할당 이후 재할당되지 않는 변수에는 const 사용 권장
    'no-use-before-define': 'off', // 정의되기 전에 변수 사용하는 것을 허용

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'off', // 사용되지 않는 변수 선언 금지
    '@typescript-eslint/prefer-ts-expect-error': 'error', // @ts-expect-error 사용 금지
    '@typescript-eslint/ban-ts-comment': 'error', // @ts-<directive> 주석 사용 또는 요구 금지
    '@typescript-eslint/no-inferrable-types': 'off', // 쉽게 유추할 수 있는 명시적 타입은 불필요한 긴 코드를 생성할 수 있음
    '@typescript-eslint/no-namespace': 'off', // 사용자 정의 TypeScript 모듈 및 네임스페이스 사용 금지
    '@typescript-eslint/no-explicit-any': 'off', // any 타입 사용 금지
    '@typescript-eslint/ban-types': 'off', // 특정 타입 사용 금지
    '@typescript-eslint/no-var-requires': 'off', // require() 함수를 사용하여 모듈 가져오는 것 허용
    '@typescript-eslint/no-empty-function': 'off', // 빈 함수 허용
    '@typescript-eslint/no-non-null-assertion': 'off', // 후위 연산자 비-널 단언(!) 사용 금지
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',

    // vue (https://eslint.vuejs.org/rules)
    'vue/valid-v-model': 'off',
    'vue/script-setup-uses-vars': 'error', // <script setup>에서 사용되는 변수가 <template>에서 사용되지 않도록 방지, no-unused-vars 규칙이 활성화되어야만 유효함
    'vue/v-slot-style': 'error', // v-slot 지시자 스타일을 강제로 지정
    'vue/no-mutating-props': 'off', // 컴포넌트 prop 변경 금지
    'vue/custom-event-name-casing': 'off', // 사용자 정의 이벤트 이름에 대소문자 규칙 강제
    'vue/html-closing-bracket-newline': 'off', // 태그의 오른쪽 괄호 전에 줄 바꿈을 요구하거나 금지
    'vue/attribute-hyphenation': 'off', // 템플릿에서 사용자 정의 컴포넌트에 대해 속성 이름 스타일 강제: my-prop="prop"
    'vue/attributes-order': 'off', // vue api 사용 순서 강제
    'vue/no-v-html': 'off', // v-html 사용 금지
    'vue/require-default-prop': 'off', // 각 prop이 필수일 때 기본값 제공을 요구
    'vue/return-in-emits-validator': 'off',
    'vue/multi-word-component-names': 'off', // 컴포넌트 이름을 항상 "-"로 연결된 단어로 요구
    'vue/block-order': [
      'error',
      {
        order: ['script', 'template', 'style']
      }
    ],
    'vue/v-on-event-hyphenation': [
      'error' | 'never',
      {
        autofix: false,
        ignore: []
      }
    ]
  }
}
