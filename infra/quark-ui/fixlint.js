// fixlint.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasModifications = false;

  // Обрабатываем только стрелочные компоненты: const Name = () => { ... }
  root
    .find(j.VariableDeclarator)
    .filter(path => {
      const name = path.node.id?.name;
      const init = path.node.init;
      return name && /^[A-Z]/.test(name) && j.ArrowFunctionExpression.check(init);
    })
    .forEach(compPath => {
      const arrowFunc = compPath.node.init;
      const body = arrowFunc.body;

      // Убедимся, что тело — блок { ... }, а не одно выражение
      if (!j.BlockStatement.check(body)) {
        arrowFunc.body = j.blockStatement([j.returnStatement(body)]);
      }

      const blockBody = arrowFunc.body.body;
      const hookCallsInCallbacks = [];

      // Ищем все ArrowFunctionExpression внутри компонента (колбэки)
      compPath
        .find(j.ArrowFunctionExpression)
        .forEach(cbPath => {
          // Пропускаем сам компонент (корневую функцию)
          if (cbPath === compPath.get('init')) return;

          // Ищем useColorModeValue внутри колбэка
          cbPath
            .find(j.CallExpression, { callee: { name: 'useColorModeValue' } })
            .forEach(hookPath => {
              hookCallsInCallbacks.push({ hookPath, cbPath });
            });
        });

      if (hookCallsInCallbacks.length === 0) return;

      // Генерируем уникальные переменные
      const declarations = [];
      const replacements = [];

      hookCallsInCallbacks.forEach(({ hookPath }, idx) => {
        const varName = `colorModeValue_${idx}`;
        declarations.push(
          j.variableDeclaration('const', [
            j.variableDeclarator(j.identifier(varName), hookPath.node)
          ])
        );
        replacements.push({ hookPath, varName });
      });

      // Вставляем в начало тела компонента
      blockBody.unshift(...declarations);

      // Заменяем вызовы на переменные
      replacements.forEach(({ hookPath, varName }) => {
        j(hookPath).replaceWith(j.identifier(varName));
      });

      hasModifications = true;
    });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
}
