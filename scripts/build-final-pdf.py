from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "entrega-final-fase3.pdf"


def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#5B6472"))
    canvas.drawString(18 * mm, 10 * mm, "FIAP - Tech Challenge - Fase 3")
    canvas.drawRightString(192 * mm, 10 * mm, f"Página {document.page}")
    canvas.restoreState()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=31, textColor=colors.HexColor("#102A43"), alignment=TA_CENTER, spaceAfter=16))
    styles.add(ParagraphStyle(name="Section", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=colors.HexColor("#0B7285"), spaceBefore=12, spaceAfter=9))
    styles.add(ParagraphStyle(name="Subsection", parent=styles["Heading2"], fontSize=12, leading=15, textColor=colors.HexColor("#102A43"), spaceBefore=8, spaceAfter=5))
    styles.add(ParagraphStyle(name="BodyClean", parent=styles["BodyText"], fontSize=9.5, leading=13.5, textColor=colors.HexColor("#243B53"), spaceAfter=6))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=8, leading=11, textColor=colors.HexColor("#486581")))
    styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontSize=9.5, leading=13.5, leftIndent=8, rightIndent=8, borderColor=colors.HexColor("#F59F00"), borderWidth=1, borderPadding=8, backColor=colors.HexColor("#FFF9DB"), spaceBefore=8, spaceAfter=10))

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=18 * mm, bottomMargin=18 * mm, title="Entrega Final - Tech Challenge Fase 3", author="Grupo FIAP 15SOAT")
    story = []
    story += [Spacer(1, 42 * mm), Paragraph("Tech Challenge", styles["CoverTitle"]), Paragraph("Fase 3 - Arquitetura Cloud, Segurança e Observabilidade", styles["CoverTitle"]), Spacer(1, 12 * mm), Paragraph("Sistema de gestão de oficina mecânica", ParagraphStyle(name="CoverSub", parent=styles["Heading2"], alignment=TA_CENTER, textColor=colors.HexColor("#486581"))), Spacer(1, 44 * mm)]
    cover = Table([["AWS", "Amazon EKS", "RDS PostgreSQL", "Datadog"], ["API Gateway", "Lambda/JWT", "Terraform", "GitHub Actions"]], colWidths=[40 * mm] * 4, rowHeights=[14 * mm, 14 * mm])
    cover.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B7285")), ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#D9F0F2")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#102A43")), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9FB3C8"))]))
    story += [cover, PageBreak()]

    def section(title): story.append(Paragraph(title, styles["Section"]))
    def body(text): story.append(Paragraph(text, styles["BodyClean"]))
    def bullets(items):
        for item in items: story.append(Paragraph(f"• {item}", styles["BodyClean"]))

    section("1. Visão executiva")
    body("A solução foi separada em quatro repositórios e implantada na AWS, na região us-east-1. O desenho combina API Gateway, autenticação serverless por CPF, JWT RS256, Lambda Authorizer, API stateless no Amazon EKS, banco PostgreSQL gerenciado no RDS e observabilidade centralizada no Datadog.")
    story.append(Paragraph("Ambiente acadêmico: conta AWS 982623100545 no AWS Academy Learner Lab. As credenciais são temporárias e os recursos estão limitados pelas permissões do LabRole. Antes de cada demonstração, as credenciais dos GitHub Environments e controllers do cluster precisam ser renovadas.", styles["Callout"]))

    section("2. Repositórios públicos")
    repos = [["Responsabilidade", "URL"], ["API", "github.com/maypinheiro/oficina-api"], ["Autenticação", "github.com/maypinheiro/oficina-auth-function"], ["Kubernetes/observabilidade", "github.com/maypinheiro/oficina-k8s-infra"], ["Banco gerenciado", "github.com/maypinheiro/oficina-database-infra"]]
    table = Table(repos, colWidths=[48 * mm, 112 * mm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#102A43")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BCCCDC")), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4F8")]), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("FONTSIZE", (0, 0), (-1, -1), 8.5), ("LEADING", (0, 0), (-1, -1), 11), ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6)]))
    story += [table]

    section("3. Arquitetura implantada")
    bullets(["API Gateway HTTP API como ponto público de entrada.", "Lambda de autenticação consulta cliente ativo no RDS e emite JWT RS256.", "Lambda Authorizer valida assinatura, issuer, audience e expiração.", "Rotas privadas seguem por VPC Link e Network Load Balancer interno até a API no EKS.", "RDS PostgreSQL permanece em sub-redes privadas; Secrets Manager armazena credenciais e chaves.", "Datadog recebe métricas, logs JSON e traces da API, Kubernetes e Functions."])

    section("4. Ambiente e endpoints")
    endpoint_rows = [["Item", "Valor"], ["Ambiente", "Homologação (hml)"], ["Região", "us-east-1"], ["API Gateway", "https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com"], ["Swagger", "https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com/docs"]]
    et = Table(endpoint_rows, colWidths=[42 * mm, 118 * mm], repeatRows=1)
    et.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B7285")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BCCCDC")), ("FONTSIZE", (0, 0), (-1, -1), 8), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4F8")])]))
    story += [et]

    section("5. Evidências de execução")
    body("Provisionamento EKS/controllers: github.com/maypinheiro/oficina-k8s-infra/actions/runs/34616729840")
    body("Deploy e aceite JWT/API privada: github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925")
    bullets(["Cliente ativo autenticado e JWT emitido sem exposição do token nos logs.", "Lambda Authorizer aceitou o token e liberou GET /clientes.", "API Gateway, VPC Link, NLB interno e targets do EKS responderam com sucesso.", "Terraform, testes automatizados, build, deploy e artefatos concluíram em verde.", "Migration controlada e seed idempotente de homologação foram executados."])

    section("6. Segurança")
    bullets(["JWT assimétrico RS256 e autenticação administrativa separada.", "Banco e NLB privados; apenas o Gateway é a borda pública.", "Secrets Manager para banco, assinatura e integração Datadog.", "Logs removem CPF completo, JWT, chaves e credenciais.", "Imagens imutáveis no ECR, usuário não-root e capabilities removidas nos containers."])

    section("7. Escalabilidade e disponibilidade")
    bullets(["API stateless no EKS com duas réplicas iniciais.", "HPA autoscaling/v2 entre 2 e 6 réplicas por CPU e memória.", "PodDisruptionBudget e rolling update sem indisponibilidade planejada.", "Readiness e liveness probes em /health.", "RDS gerenciado e migrations executadas antes do rollout."])

    section("8. Observabilidade")
    bullets(["Dashboards versionados para API, Kubernetes e indicadores de negócio.", "Logs estruturados em JSON com correlationId e traceId.", "APM e traces HTTP/PostgreSQL, além de métricas DogStatsD.", "Monitores para disponibilidade, erros, latência, falhas de OS e saturação do HPA.", "Runbook versionado para diagnóstico, mitigação e rollback."])

    section("9. Checklist de requisitos")
    checks = [["Requisito", "Situação"], ["Cloud pública e dois ambientes", "Codificado; hml validado"], ["Banco gerenciado privado", "Implementado e validado"], ["Function serverless por CPF/JWT", "Implementado e validado"], ["API protegida por Gateway/Authorizer", "Implementado e validado"], ["Kubernetes cloud e HPA", "Implementado; falta captura do scaling"], ["CI e qualidade", "Implementado e validado"], ["CD homolog/prod", "Funcional, mas gatilho ainda manual"], ["Datadog: logs, métricas e traces", "Implementado; falta evidência no vídeo"], ["RFCs, ADRs e diagramas", "Implementado"], ["Main protegida", "Confirmado nos quatro repos"], ["soat-architecture", "Read confirmado nos quatro repos"], ["Vídeo de até 15 minutos", "Pendente de gravação/publicação"], ["URL do vídeo no PDF", "Pendente"]]
    ct = Table(checks, colWidths=[94 * mm, 66 * mm], repeatRows=1)
    ct.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#102A43")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BCCCDC")), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4F8")]), ("FONTSIZE", (0, 0), (-1, -1), 8.5), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [ct]

    story.append(KeepTogether([
        Paragraph("10. Pendências para submissão", styles["Section"]),
        Paragraph("• Gravar e publicar o vídeo no YouTube ou Vimeo, público ou não listado.", styles["BodyClean"]),
        Paragraph("• Adicionar a URL do vídeo e regenerar este PDF.", styles["BodyClean"]),
        Paragraph("• Capturar no vídeo os cenários negativos, ciclo completo da OS, alerta Datadog e reação do HPA.", styles["BodyClean"]),
        Paragraph("• Automatizar o CD após CI de homolog e main; manter aprovação do environment de produção.", styles["BodyClean"]),
        Paragraph("• Renovar a sessão AWS Academy e repetir o E2E antes da gravação.", styles["BodyClean"]),
    ]))

    section("11. Roteiro cronometrado do vídeo")
    timeline = [["Tempo", "Demonstração"], ["0:00-1:30", "Arquitetura e quatro repositórios"], ["1:30-3:30", "CPF, JWT e cenários negativos"], ["3:30-5:00", "Authorizer e API privada"], ["5:00-7:30", "Abertura e ciclo da OS"], ["7:30-9:30", "CI/CD, Terraform e deploy"], ["9:30-11:00", "EKS, pods e HPA"], ["11:00-13:30", "Datadog, logs, traces e alerta"], ["13:30-15:00", "Documentação, checklist e conclusão"]]
    tt = Table(timeline, colWidths=[30 * mm, 130 * mm], repeatRows=1)
    tt.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B7285")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BCCCDC")), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4F8")]), ("FONTSIZE", (0, 0), (-1, -1), 8.5), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [tt, Spacer(1, 8 * mm), Paragraph("Documento gerado em 11/09/2026. Atualizar a data e a URL do vídeo antes da submissão definitiva.", styles["Small"])]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
