# 🔧 Como Compilar Contratos AdTargeting e AdAuction

## ⚠️ Problema Atual

O Nargo está compilando apenas o `PrivateVoting` do `main.nr`. Os contratos `AdTargeting` e `AdAuction` estão em arquivos separados mas não estão sendo compilados automaticamente.

## 🔍 Verificar Status

```bash
cd packages/aztec/contracts

# Ver quais contratos existem
ls -la src/*.nr

# Ver quais foram compilados
ls -la target/*.json

# Ver quais artifacts foram gerados
ls -la src/artifacts/
```

## ✅ Solução: Compilar Manualmente (Por Enquanto)

Como os contratos estão em arquivos separados, você pode:

### Opção 1: Usar o contrato que já compila (PrivateVoting como exemplo)

Por enquanto, você pode testar o fluxo completo usando o PrivateVoting como exemplo e depois adaptar para AdTargeting/AdAuction quando eles compilarem.

### Opção 2: Mover contratos para main.nr (Temporário)

Você pode temporariamente copiar os contratos para o `main.nr` para testar, mas isso não é ideal.

### Opção 3: Criar Nargo.toml separados (Recomendado para Produção)

Criar packages separados para cada contrato, mas isso é mais complexo.

## 🚀 Workaround: Testar com Mocks Primeiro

Enquanto os contratos não compilam, você pode:

1. **Testar SDK em modo LOCAL** (já funciona!):
   ```bash
   cd packages/sdk
   bun run example:local
   ```

2. **Quando sandbox estiver rodando**, testar conexão:
   ```bash
   # Verificar se sandbox responde
   curl http://localhost:8080/status
   ```

3. **Deploy apenas quando artifacts estiverem prontos**

## 📋 Checklist

- [ ] Contratos existem: `ls -la src/*.nr`
- [ ] Contratos compilam: `yarn compile`
- [ ] Artifacts gerados: `yarn codegen`
- [ ] Artifacts existem: `ls -la src/artifacts/AdTargeting.ts`
- [ ] Deploy funciona: `yarn deploy-prevdl`

## 🔧 Próximos Passos

1. Verificar por que Nargo não compila AdTargeting/AdAuction
2. Ajustar Nargo.toml se necessário
3. Ou criar estrutura de packages separados

