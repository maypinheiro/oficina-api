SELECT status, COUNT(*) AS total
FROM "OrdemDeServico"
WHERE "numeroOs" LIKE 'OS-SEED-%'
GROUP BY status
ORDER BY status;

SELECT
  p.nome,
  p."estoqueMinimo",
  e."quantidadeDisponivel",
  e."quantidadeReservada",
  CASE
    WHEN e."quantidadeDisponivel" <= p."estoqueMinimo" THEN 'ESTOQUE BAIXO'
    ELSE 'ESTOQUE OK'
  END AS alerta
FROM "Peca" p
JOIN "Estoque" e ON e."pecaId" = p.id
WHERE p.id IN (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000502'
)
ORDER BY p.nome;

SELECT
  s.nome,
  COUNT(*) FILTER (WHERE fim."dataHora" IS NOT NULL AND inicio."dataHora" IS NOT NULL) AS execucoes_com_tempo,
  ROUND(AVG(EXTRACT(EPOCH FROM (fim."dataHora" - inicio."dataHora")) / 3600) FILTER (WHERE fim."dataHora" IS NOT NULL AND inicio."dataHora" IS NOT NULL), 2) AS media_horas
FROM "Servico" s
LEFT JOIN "OrcamentoServico" os ON os."servicoId" = s.id
LEFT JOIN "Orcamento" o ON o.id = os."orcamentoId"
LEFT JOIN "OrdemDeServico" ordem ON ordem.id = o."ordemServicoId"
LEFT JOIN "HistoricoStatusOS" inicio ON inicio."ordemServicoId" = ordem.id AND inicio.status = 'EM_EXECUCAO'
LEFT JOIN "HistoricoStatusOS" fim ON fim."ordemServicoId" = ordem.id AND fim.status = 'FINALIZADA'
GROUP BY s.nome
ORDER BY s.nome;
