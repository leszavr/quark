# Threat Model (STRIDE)

- **S**poofing: JWT подделка → цифровая подпись
- **T**ampering: изменение события → хеш
- **R**epudiation: отрицание действия → аудит
- **I**nformation disclosure: утечка → шифрование
- **D**enial of service: flood → rate limiting
- **E**levation of privilege: → RBAC